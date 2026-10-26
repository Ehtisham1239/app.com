"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ANALYTICS_CONSENT_EVENT, ANALYTICS_CONSENT_KEY, clearAnalyticsCookies, createAnalyticsController, readAnalyticsConsent, saveAnalyticsConsent } from "@/lib/analytics";

const subscribe = callback => {
  const storage = event => { if (event.key === ANALYTICS_CONSENT_KEY) { delete window.__oqcAnalyticsConsent; callback(); } };
  window.addEventListener(ANALYTICS_CONSENT_EVENT, callback); window.addEventListener("storage", storage);
  return () => { window.removeEventListener(ANALYTICS_CONSENT_EVENT, callback); window.removeEventListener("storage", storage); };
};
const snapshot = () => readAnalyticsConsent(window);
const serverSnapshot = () => null;

export function WebsiteAnalytics({ config }) {
  const { enabled, mode, ga4Id, gtmId } = config;
  const pathname = usePathname();
  const consent = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const controller = useRef(null);
  useEffect(() => {
    if (!enabled) return;
    const existing = document.getElementById("oqc-google-analytics");
    const source = mode === "gtm" ? `https://www.googletagmanager.com/gtm.js?id=${gtmId}` : `https://www.googletagmanager.com/gtag/js?id=${ga4Id}`;
    if (existing && existing.src !== source) { window.location.reload(); return; }
    const adapter = createAnalyticsController(window, { enabled, mode, ga4Id, gtmId }); controller.current = adapter;
    return () => { adapter.destroy(); controller.current = null; };
  }, [enabled, mode, ga4Id, gtmId]);
  useEffect(() => {
    controller.current?.setConsent(consent === "granted");
    controller.current?.pageView(pathname);
  }, [consent, pathname, enabled, mode, ga4Id, gtmId]);

  if (!enabled) return null;
  const choose = value => {
    const revoke = consent === "granted" && value === "denied";
    if (revoke) { controller.current?.setConsent(false); clearAnalyticsCookies(window); }
    saveAnalyticsConsent(window, value); setSettingsOpen(false);
    // A fresh document removes already-loaded vendor code after revocation.
    if (revoke) window.location.reload();
  };
  return (
    <>
      {consent === null || settingsOpen ? (
        <section aria-label="Analytics preferences" className="fixed inset-x-3 bottom-[max(.75rem,env(safe-area-inset-bottom))] z-[45] mx-auto max-h-[calc(100svh-2rem)] max-w-xl overflow-y-auto rounded-2xl border border-leaf-100 bg-white p-4 text-ink shadow-xl sm:p-6">
          <h2 className="text-lg font-semibold">Optional website analytics</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">Optional Google Analytics helps us understand visits and enquiries. Advertising stays off. <Link href="/privacy-policy#optional-analytics" className="underline underline-offset-4">Privacy details</Link></p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button type="button" className="btn btn-outline min-h-11 text-sm" onClick={() => choose("denied")}>Reject analytics</button>
            <button type="button" className="btn btn-primary min-h-11 text-sm" onClick={() => choose("granted")}>Allow analytics</button>
          </div>
          {consent !== null && <button type="button" className="mt-3 inline-flex min-h-11 items-center text-sm underline" onClick={() => setSettingsOpen(false)}>Close preferences</button>}
        </section>
      ) : <button type="button" className="fixed bottom-3 left-3 z-40 min-h-11 rounded-full border border-leaf-100 bg-white px-4 py-2 text-xs font-medium text-leaf-700 shadow-sm" onClick={() => setSettingsOpen(true)}>Analytics preferences</button>}
    </>
  );
}
