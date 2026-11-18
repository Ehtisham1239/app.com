"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useReportWebVitals } from "next/web-vitals";
import { ANALYTICS_CONSENT_KEY, clearAnalyticsCookies, createAnalyticsController, isAnalyticsHost } from "@/lib/analytics";

// Cookieless GA4 (owner decision, 26 Oct 2026): no banner or preference button.
// client_storage "none" means nothing is written to the device; analytics
// storage is granted so hits reach GA4 reports. Ad storage is never granted.
// Older _ga cookies and saved banner choices are removed on load.
export function WebsiteAnalytics({ config }) {
  const { enabled, ga4Id } = config;
  const pathname = usePathname();
  const controller = useRef(null);
  const pending = useRef([]);
  useEffect(() => {
    if (!enabled || !config.cookieless || config.mode === "off" || !isAnalyticsHost(window.location.hostname)) return;
    clearAnalyticsCookies(window);
    try { window.localStorage.removeItem(ANALYTICS_CONSENT_KEY); } catch { /* storage blocked */ }
    let adapter, cancelled = false;
    const start = () => {
      if (cancelled) return;
      adapter = createAnalyticsController(window, config);
      controller.current = adapter;
      adapter.setConsent(true);
      adapter.pageView(window.location.href);
      // Metrics reported before the tags started (TTFB, FCP) are sent now.
      pending.current.splice(0).forEach((metric) => adapter.webVital(metric));
    };
    // Owner request, 18 Nov 2026: tags load straight away on every page (no wait for interaction).
    start();
    return () => {
      cancelled = true;
      adapter?.destroy(); controller.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ga4Id, config.gtmId]);
  useEffect(() => { controller.current?.pageView(pathname); }, [pathname]);
  // Real-visit Core Web Vitals go to GA4 as LCP / INP / CLS / FCP / TTFB events.
  const reportWebVital = useCallback((metric) => {
    if (controller.current) controller.current.webVital(metric);
    else if (pending.current.length < 10) pending.current.push(metric);
  }, []);
  useReportWebVitals(reportWebVital);
  return null;
}
