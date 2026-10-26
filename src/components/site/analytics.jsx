"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { ANALYTICS_CONSENT_KEY, clearAnalyticsCookies, createAnalyticsController } from "@/lib/analytics";

// Cookieless GA4: no banner or preference button. Nothing is stored on the
// visitor's device; older _ga cookies and saved choices from the banner era are removed.
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
  return null;
}
