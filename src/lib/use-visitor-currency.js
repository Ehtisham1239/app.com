"use client";
import { useEffect, useRef, useState } from "react";
import { currencyForTimeZone } from "@/lib/fx";

let pendingVisitorGeo;

function getVisitorGeo() {
  pendingVisitorGeo ??= fetch("/api/geo", { cache: "no-store" })
    .then((response) => (response.ok ? response.json() : null))
    .finally(() => { pendingVisitorGeo = undefined; });
  return pendingVisitorGeo;
}

// Starts from USD (or the given default). On load, a ?currency= in the URL wins;
// otherwise it switches once to the currency for the visitor's country. A later manual
// choice is kept. Reading the URL here (not on the server) keeps /pricing static and fast.
export function useVisitorCurrency(options, defaultCurrency = "USD", explicit = false) {
  const manualChoice = useRef(false);
  const [currency, setCurrency] = useState(options.includes(defaultCurrency) ? defaultCurrency : "USD");
  useEffect(() => {
    if (explicit) return undefined;
    const fromUrl = String(new URLSearchParams(window.location.search).get("currency") || "").toUpperCase();
    if (options.includes(fromUrl)) {
      let canceled = false;
      queueMicrotask(() => { if (!canceled && !manualChoice.current) setCurrency(fromUrl); });
      return () => { canceled = true; };
    }
    let canceled = false;
    const apply = (value) => { if (!canceled && !manualChoice.current && value && options.includes(value)) setCurrency(value); };
    const fromTimeZone = () => {
      try { return currencyForTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone); } catch { return null; }
    };
    // The host's visitor-country header wins; without one (Hostinger), the browser time zone decides.
    getVisitorGeo()
      .then((geo) => apply(geo?.country ? geo.currency : fromTimeZone()))
      .catch(() => apply(fromTimeZone()));
    return () => { canceled = true; };
    // Run once on load so the visitor's later choice is not overridden.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return [currency, (value) => {
    manualChoice.current = true;
    setCurrency(value);
  }];
}
