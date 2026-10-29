"use client";
import { useEffect, useState } from "react";
import { PricingCards } from "@/components/site/pricing-cards";
import { LOCATIONS } from "@/lib/locations";
import { COUNTRY_CURRENCY, FX_SOURCE } from "@/lib/fx";

// `explicit` is true when the URL already chose a currency; otherwise the visitor's
// country preselects one. Rates come from the server (`fx`); without them, unpriced
// currencies show a quote request instead of a converted figure.
export function CurrencyPricing({ plans, defaultCurrency = "USD", explicit = false, fx = null }) {
  const currencies = [...new Set([...LOCATIONS.map((c) => c.currency), ...Object.values(COUNTRY_CURRENCY), ...plans.flatMap((p) => p.prices.map((x) => x.currency))])]
    .filter((code) => code === "USD" || plans.some((p) => p.prices.some((x) => x.currency === code)) || !fx || fx.rates?.[code])
    .sort();
  const [currency, setCurrency] = useState(currencies.includes(defaultCurrency) ? defaultCurrency : "USD");
  useEffect(() => {
    if (explicit) return undefined;
    const controller = new AbortController();
    fetch("/api/geo", { signal: controller.signal, cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((geo) => { if (geo?.currency && currencies.includes(geo.currency)) setCurrency(geo.currency); })
      .catch(() => {});
    return () => controller.abort();
    // Run once on load; the visitor's later choice is not overridden.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div>
      <label className="mb-6 flex flex-wrap items-center gap-3 font-semibold text-mushaf-900">Display currency<select value={currency} onChange={(e) => setCurrency(e.target.value)} className="input w-auto" aria-label="Display currency">{currencies.map((code) => <option key={code} value={code}>{code}</option>)}</select></label>
      <PricingCards plans={plans} currency={currency} fx={fx} />
      <p className="mt-5 text-sm text-ink-soft">
        {fx
          ? <>Prices marked ≈ are converted from US dollars at the latest daily exchange rate{fx.updated ? ` (${fx.updated})` : ""}, for guidance only. Rates by <a className="underline" href={FX_SOURCE.url} target="_blank" rel="noopener noreferrer">{FX_SOURCE.name}</a>. The coordinator confirms your fee and the currency you pay in before you enrol.</>
          : "Only approved prices are shown. If a price is unavailable in your currency, ask the college for a quote."}
      </p>
    </div>
  );
}
