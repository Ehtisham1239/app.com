"use client";
import { useEffect, useRef, useState } from "react";

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
    const controller = new AbortController();
    fetch("/api/geo", { signal: controller.signal, cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((geo) => { if (!controller.signal.aborted && !manualChoice.current && geo?.currency && options.includes(geo.currency)) setCurrency(geo.currency); })
      .catch(() => {});
    return () => controller.abort();
    // Run once on load so the visitor's later choice is not overridden.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return [currency, (value) => {
    manualChoice.current = true;
    setCurrency(value);
  }];
}
