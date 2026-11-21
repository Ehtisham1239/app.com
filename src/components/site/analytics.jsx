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
    let adapter, cancelled = false, idle, loadWait = false;
    const start = () => {
      if (cancelled) return;
      adapter = createAnalyticsController(window, config);
      controller.current = adapter;
      adapter.setConsent(true);
      adapter.pageView(window.location.href);
      // Metrics reported before the tags started (TTFB, FCP) are sent now.
      pending.current.splice(0).forEach((metric) => adapter.webVital(metric));
    };
    // Owner decisions, 18–19 Nov 2026: every visitor is tracked with no wait for an interaction,
    // but the tags start once the page has loaded and the browser is idle (at most 2 s later).
    // Starting them during the first paint pushed mobile Total Blocking Time from ~250 ms to
    // ~1,600 ms (Lighthouse CI, #326). If the visitor leaves first, the tags start at once.
    const schedule = () => {
      if (idle !== undefined || cancelled) return;
      idle = "requestIdleCallback" in window ? window.requestIdleCallback(start, { timeout: 2000 }) : window.setTimeout(start, 1);
    };
    const leaving = () => { if (document.visibilityState === "hidden" && !adapter) { unschedule(); start(); } };
    const unschedule = () => {
      if (idle !== undefined) ("cancelIdleCallback" in window ? window.cancelIdleCallback(idle) : window.clearTimeout(idle));
      idle = undefined;
    };
    if (document.readyState === "complete") schedule(); else { loadWait = true; window.addEventListener("load", schedule, { once: true }); }
    document.addEventListener("visibilitychange", leaving);
    return () => {
      cancelled = true;
      if (loadWait) window.removeEventListener("load", schedule);
      document.removeEventListener("visibilitychange", leaving);
      unschedule();
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
