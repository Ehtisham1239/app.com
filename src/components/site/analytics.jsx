"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { ANALYTICS_CONSENT_KEY, clearAnalyticsCookies, createAnalyticsController } from "@/lib/analytics";

// Storage-denied GA4: no banner or preference button in the current site mode.
// Remove older GA cookies/choices; never grant Google analytics or ad storage.
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
