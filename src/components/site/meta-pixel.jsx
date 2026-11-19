"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { isAnalyticsHost } from "@/lib/analytics";
import { createMetaPixelController, readMetaPixelConsent, saveMetaPixelConsent } from "@/lib/meta-pixel";

// Consent-gated Meta Pixel (owner decision, 19 Nov 2026). Only the production host is tracked.
// Reopen the choice from anywhere with: window.dispatchEvent(new Event("oqc:open-marketing-preferences")).
export function MetaPixel({ pixelId }) {
  const controller = useRef(null);
  const [ask, setAsk] = useState(false);
  useEffect(() => {
    if (!pixelId || !isAnalyticsHost(window.location.hostname)) return;
    controller.current = createMetaPixelController(window, pixelId);
    const saved = readMetaPixelConsent(window);
    if (saved === "granted") controller.current.grant();
    const timer = saved === null ? window.setTimeout(() => setAsk(true), 0) : undefined;
    const reopen = () => setAsk(true);
    window.addEventListener("oqc:open-marketing-preferences", reopen);
    return () => { window.clearTimeout(timer); window.removeEventListener("oqc:open-marketing-preferences", reopen); controller.current?.revoke(); controller.current = null; };
  }, [pixelId]);
  if (!ask) return null;
  const choose = (value) => {
    saveMetaPixelConsent(window, value);
    if (value === "granted") controller.current?.grant(); else controller.current?.revoke();
    setAsk(false);
  };
  return (
    <section aria-label="Marketing cookies" className="fixed inset-x-0 bottom-0 z-[70] border-t border-[#0D4A1C]/20 bg-white p-4 shadow-lg sm:left-auto sm:right-4 sm:bottom-4 sm:max-w-sm sm:rounded-xl sm:border">
      <p className="text-sm text-slate-800">
        May we use Meta (Facebook and Instagram) marketing cookies to measure our ads? Without them the site works the same.{" "}
        <Link href="/privacy-policy" className="font-medium text-[#0C6C0C] underline">Privacy policy</Link>
      </p>
      <div className="mt-3 flex gap-2">
        <button type="button" onClick={() => choose("granted")} className="rounded-lg bg-[#0C6C0C] px-4 py-2 text-sm font-semibold text-white">Accept</button>
        <button type="button" onClick={() => choose("denied")} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800">Decline</button>
      </div>
    </section>
  );
}
