"use client";
import { PricingCards } from "@/components/site/pricing-cards";
import { LOCATIONS } from "@/lib/locations";
import { currencyOptions, FX_SOURCE } from "@/lib/fx";
import { useVisitorCurrency } from "@/lib/use-visitor-currency";

// `explicit` is true when the URL already chose a currency; otherwise the visitor's
// country preselects one. Rates come from the server (`fx`); without them, unpriced
// currencies show a quote request instead of a converted figure.
export function CurrencyPricing({ plans, defaultCurrency = "USD", explicit = false, fx = null }) {
  const currencies = currencyOptions(plans, fx, LOCATIONS.map((c) => c.currency));
  const [currency, setCurrency] = useVisitorCurrency(currencies, defaultCurrency, explicit);
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
