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
    if (!enabled || !config.cookieless || config.mode !== "ga4") return;
    clearAnalyticsCookies(window);
    try { window.localStorage.removeItem(ANALYTICS_CONSENT_KEY); } catch { /* storage blocked */ }
    const adapter = createAnalyticsController(window, config);
    controller.current = adapter;
    adapter.setConsent(true);
    adapter.pageView(window.location.href);
    return () => { adapter.destroy(); controller.current = null; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ga4Id]);
  useEffect(() => { controller.current?.pageView(pathname); }, [pathname]);
  // Real-visit Core Web Vitals go to GA4 as LCP / INP / CLS / FCP / TTFB events.
  useReportWebVitals((metric) => { controller.current?.webVital(metric); });
  return null;
}
