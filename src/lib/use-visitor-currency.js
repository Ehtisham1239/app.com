"use client";
import { useEffect, useState } from "react";

// Starts from the URL's currency (or USD) and, unless the URL chose one, switches
// once to the currency for the visitor's country. A later manual choice is kept.
export function useVisitorCurrency(options, defaultCurrency = "USD", explicit = false) {
  const [currency, setCurrency] = useState(options.includes(defaultCurrency) ? defaultCurrency : "USD");
  useEffect(() => {
    if (explicit) return undefined;
    const controller = new AbortController();
    fetch("/api/geo", { signal: controller.signal, cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((geo) => { if (geo?.currency && options.includes(geo.currency)) setCurrency(geo.currency); })
      .catch(() => {});
    return () => controller.abort();
    // Run once on load so the visitor's later choice is not overridden.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return [currency, setCurrency];
}
