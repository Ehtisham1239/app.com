"use client";
import { useState } from "react";
import { PricingCards } from "@/components/site/pricing-cards";
import { LOCATIONS } from "@/lib/locations";
export function CurrencyPricing({ plans }) {
  const [currency, setCurrency] = useState("USD");
  const currencies = [...new Set([...LOCATIONS.map((c) => c.currency), ...plans.flatMap((p) => p.prices.map((x) => x.currency))])].sort();
  return <div><label className="mb-6 flex flex-wrap items-center gap-3 font-semibold text-mushaf-900">Display currency<select value={currency} onChange={(e) => setCurrency(e.target.value)} className="input w-auto" aria-label="Display currency">{currencies.map((code) => <option key={code} value={code}>{code}</option>)}</select></label><PricingCards plans={plans} currency={currency} /><p className="mt-5 text-sm text-ink-soft">Only approved prices are shown. If a price is unavailable in your currency, ask the college for a quote. No automatic currency conversions are used.</p></div>;
}
