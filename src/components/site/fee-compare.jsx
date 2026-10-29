"use client";
import { useState } from "react";
import Link from "next/link";
import { formatMoney } from "@/lib/format";
import { isTrialEligible } from "@/lib/trial-eligibility";
import { familyMonthlyEstimate, SIBLING_DISCOUNT, WEEKS_PER_MONTH } from "@/lib/fee-estimate";
import { currencyOptions, displayPrice } from "@/lib/fx";
import { LOCATIONS } from "@/lib/locations";
import { useVisitorCurrency } from "@/lib/use-visitor-currency";

// Side-by-side plan comparison plus a family fee estimator, built only from the
// published plans. Amounts follow the chosen currency; converted ones carry "≈".
export function FeeCompare({ plans, fx = null, defaultCurrency = "USD", explicit = false }) {
  const all = Array.isArray(plans) ? plans : [];
  const currencies = currencyOptions(all, fx, LOCATIONS.map((c) => c.currency));
  const [currency, setCurrency] = useVisitorCurrency(currencies, defaultCurrency, explicit);
  const priced = all.map((p) => ({ plan: p, price: displayPrice(p.prices, currency, fx) })).filter((row) => row.price);
  const [planId, setPlanId] = useState(all.find((p) => p.is_featured)?.id ?? all[0]?.id);
  const [learners, setLearners] = useState(2);
  if (!all.length) return null;
  const money = (price, minor) => `${price.approximate ? "≈ " : ""}${formatMoney(minor, price.currency)}`;
  const selectedRow = priced.find((row) => row.plan.id === planId) ?? priced[0];
  const estimate = selectedRow ? familyMonthlyEstimate(selectedRow.price.amount_minor, learners) : null;
  const perClass = (row) => (row.plan.billing_period === "monthly" && row.plan.classes_per_week > 0 ? Math.round(row.price.amount_minor / (row.plan.classes_per_week * WEEKS_PER_MONTH)) : null);
  const anyApprox = priced.some((row) => row.price.approximate);

  return (
    <div>
      <label className="mb-6 flex flex-wrap items-center gap-3 font-semibold text-mushaf-900">Show fees in
        <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="input w-auto" aria-label="Comparison currency">{currencies.map((code) => <option key={code} value={code}>{code}</option>)}</select>
      </label>
      {!priced.length ? (
        <p className="surface p-6 text-ink-soft">Fees in {currency} are available on request. <Link className="font-semibold text-leaf-700 underline" href={`/free-trial?currency=${currency}`}>Ask for a {currency} quote</Link>.</p>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <div className="surface overflow-hidden">
            <div className="border-b border-line bg-leaf-50/70 px-5 py-4">
              <h3 className="font-sans text-lg font-bold text-mushaf-900">Compare every plan</h3>
              <p className="mt-1 text-sm text-ink-soft">All lessons are live and one-to-one. {anyApprox ? `Amounts marked ≈ are converted from US dollars at today’s rate.` : `Fees shown in ${currency}.`}</p>
            </div>
            <div className="overflow-x-auto" role="region" aria-label="Plan comparison" tabIndex={0}>
              <table className="w-full min-w-[34rem] text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-ink-soft">
                  <tr>
                    <th scope="col" className="px-5 py-3 font-semibold">Plan</th>
                    <th scope="col" className="px-3 py-3 font-semibold">Lessons</th>
                    <th scope="col" className="px-3 py-3 font-semibold">Monthly fee</th>
                    <th scope="col" className="px-3 py-3 font-semibold">≈ Per class</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Free trial</th>
                  </tr>
                </thead>
                <tbody>
                  {priced.map((row) => (
                    <tr key={row.plan.id} className={`border-t border-line ${row.plan.is_featured ? "bg-gold-50/60" : ""}`}>
                      <th scope="row" className="px-5 py-3.5 font-semibold text-mushaf-900">
                        {row.plan.name}
                        {row.plan.is_featured && <span className="ml-2 rounded-full bg-leaf-700 px-2 py-0.5 text-[0.68rem] font-bold uppercase tracking-wide text-white">Popular</span>}
                        {row.plan.course_type && <span className="block text-xs font-normal text-ink-soft">{row.plan.course_type}</span>}
                      </th>
                      <td className="px-3 py-3.5 text-ink">{row.plan.classes_per_week} × {row.plan.duration_min} min / week</td>
                      <td className="px-3 py-3.5 font-bold text-mushaf-900">{money(row.price, row.price.amount_minor)}</td>
                      <td className="px-3 py-3.5 text-ink">{perClass(row) === null ? "—" : formatMoney(perClass(row), currency)}</td>
                      <td className="px-5 py-3.5">{isTrialEligible(row.plan) ? <span className="font-semibold text-leaf-700">3 days</span> : <span className="text-ink-soft">Not included</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="border-t border-line px-5 py-3 text-xs text-ink-soft">Per-class figures are estimates based on a {WEEKS_PER_MONTH}-week month. The coordinator confirms the number of classes in your billing month, the final amount and the currency you pay in.</p>
          </div>

          <div className="surface p-5 sm:p-6">
            <h3 className="font-sans text-lg font-bold text-mushaf-900">Family fee estimator</h3>
            <p className="mt-1 text-sm text-ink-soft">Each additional child from the same family receives {Math.round(SIBLING_DISCOUNT * 100)}% off.</p>
            <label htmlFor="fee-plan" className="field-label mt-5">Plan</label>
            <select id="fee-plan" className="input" value={selectedRow.plan.id} onChange={(e) => setPlanId(e.target.value)}>
              {priced.map((row) => <option key={row.plan.id} value={row.plan.id}>{row.plan.name} — {money(row.price, row.price.amount_minor)} / month</option>)}
            </select>
            <fieldset className="mt-5">
              <legend className="field-label">Number of learners</legend>
              <div className="mt-1 flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" aria-pressed={learners === n} onClick={() => setLearners(n)}
                    className={`size-11 rounded-full border text-base font-semibold transition-colors ${learners === n ? "border-leaf-700 bg-leaf-700 text-white" : "border-line bg-white text-mushaf-900 hover:border-leaf-700"}`}>{n}</button>
                ))}
              </div>
            </fieldset>
            <div className="mt-6 rounded-2xl bg-leaf-50 p-4" aria-live="polite">
              <p className="text-sm text-ink-soft">Estimated monthly total</p>
              <p className="mt-1 font-display text-3xl font-bold text-mushaf-900">{money(selectedRow.price, estimate?.total)}</p>
              {estimate?.saving > 0 && <p className="mt-1 text-sm font-semibold text-leaf-700">You save {money(selectedRow.price, estimate.saving)} a month with the sibling discount</p>}
            </div>
            <Link href={`/free-trial?${new URLSearchParams({ plan: selectedRow.plan.id, currency })}`} className="btn btn-primary mt-5 w-full">
              {isTrialEligible(selectedRow.plan) ? "Book a free trial for this plan" : "Ask about this plan"}
            </Link>
            <p className="mt-3 text-xs text-ink-soft">An estimate, not a quote. Confirm the plan, currency and total with the coordinator before enrolling.</p>
          </div>
        </div>
      )}
    </div>
  );
}
