"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useReportWebVitals } from "next/web-vitals";
import { ANALYTICS_CONSENT_KEY, clearAnalyticsCookies, createAnalyticsController, hasAdClickId, isAnalyticsHost } from "@/lib/analytics";

// Cookieless GA4 (owner decision, 26 Oct 2026): no banner or preference button.
// client_storage "none" means no analytics cookie is written to the device; analytics
// storage is granted so hits reach GA4 reports. Google Ads measurement cookies are
// allowed since 18 Nov 2026 (owner decision); ad personalisation stays denied.
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
    let adapter, cancelled = false, idle;
    const start = () => {
      if (cancelled) return;
      adapter = createAnalyticsController(window, config);
      controller.current = adapter;
      adapter.setConsent(true);
      adapter.pageView(window.location.href);
      // Metrics reported before the tags started (TTFB, FCP) are sent now.
      pending.current.splice(0).forEach((metric) => adapter.webVital(metric));
    };
    // Tag Manager's start-up is the main long task, so wait for the visitor's
    // first interaction or 4 s after load, whichever comes first.
    const EVENTS = ["pointerdown", "keydown", "touchstart", "scroll"];
    let timer;
    const go = () => {
      EVENTS.forEach((name) => window.removeEventListener(name, go));
      window.clearTimeout(timer);
      if (idle === undefined) idle = "requestIdleCallback" in window ? window.requestIdleCallback(start, { timeout: 1500 }) : window.setTimeout(start, 200);
    };
    const schedule = () => { timer = window.setTimeout(go, 4000); };
    EVENTS.forEach((name) => window.addEventListener(name, go, { once: true, passive: true }));
    // An ad-click landing starts at once: the conversion linker must store the click ID
    // before the visitor follows a link and the URL loses it.
    let immediate;
    if (hasAdClickId(window.location.search)) {
      EVENTS.forEach((name) => window.removeEventListener(name, go));
      idle = null; // Blocks the interaction path; start() runs on the next task.
      immediate = window.setTimeout(start, 0);
    } else if (document.readyState === "complete") schedule(); else window.addEventListener("load", schedule, { once: true });
    return () => {
      cancelled = true;
      EVENTS.forEach((name) => window.removeEventListener(name, go));
      window.clearTimeout(timer);
      window.clearTimeout(immediate);
      window.removeEventListener("load", schedule);
      if (idle !== undefined && idle !== null) ("cancelIdleCallback" in window ? window.cancelIdleCallback(idle) : window.clearTimeout(idle));
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
