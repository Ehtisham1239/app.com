"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useReportWebVitals } from "next/web-vitals";
import { ANALYTICS_CONSENT_KEY, clearAnalyticsCookies, createAnalyticsController } from "@/lib/analytics";

// Cookieless GA4 (owner decision, 26 Oct 2026): no banner or preference button.
// client_storage "none" means nothing is written to the device; analytics
// storage is granted so hits reach GA4 reports. Ad storage is never granted.
// Older _ga cookies and saved banner choices are removed on load.
export function WebsiteAnalytics({ config }) {
  const { enabled, ga4Id } = config;
  const pathname = usePathname();
  const controller = useRef(null);
  useEffect(() => {
    if (!enabled || !config.cookieless || config.mode === "off") return;
    clearAnalyticsCookies(window);
    try { window.localStorage.removeItem(ANALYTICS_CONSENT_KEY); } catch { /* storage blocked */ }
    let adapter, cancelled = false, idle;
    // Start after the page has loaded and the main thread is idle, so tag code
    // never competes with the first paint or the hero image.
    const start = () => {
      if (cancelled) return;
      adapter = createAnalyticsController(window, config);
      controller.current = adapter;
      adapter.setConsent(true);
      adapter.pageView(window.location.href);
    };
    const schedule = () => { idle = "requestIdleCallback" in window ? window.requestIdleCallback(start, { timeout: 2500 }) : window.setTimeout(start, 1200); };
    if (document.readyState === "complete") schedule(); else window.addEventListener("load", schedule, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener("load", schedule);
      if (idle !== undefined) ("cancelIdleCallback" in window ? window.cancelIdleCallback(idle) : window.clearTimeout(idle));
      adapter?.destroy(); controller.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ga4Id, config.gtmId]);
  useEffect(() => { controller.current?.pageView(pathname); }, [pathname]);
  // Real-visit Core Web Vitals go to GA4 as LCP / INP / CLS / FCP / TTFB events.
  useReportWebVitals((metric) => { controller.current?.webVital(metric); });
  return null;
}
