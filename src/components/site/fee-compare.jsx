"use client";
import { useState } from "react";
import Link from "next/link";
import { formatMoney } from "@/lib/format";
import { isTrialEligible } from "@/lib/trial-eligibility";
import { familyMonthlyEstimate, WEEKS_PER_MONTH } from "@/lib/fee-estimate";
import { currencyOptions, displayPrice } from "@/lib/fx";
import { useVisitorCurrency } from "@/lib/use-visitor-currency";

// Side-by-side plan comparison plus a family fee estimator, built only from the
// published plans. Amounts follow the chosen currency; converted ones carry "≈".
export function FeeCompare({ plans, fx = null, defaultCurrency = "USD", explicit = false, familyDiscount = null }) {
  const all = Array.isArray(plans) ? plans : [];
  const currencies = currencyOptions(all, fx);
  const [currency, setCurrency] = useVisitorCurrency(currencies, defaultCurrency, explicit);
  const priced = all.map((p) => ({ plan: p, price: displayPrice(p.prices, currency, fx) })).filter((row) => row.price);
  const [planId, setPlanId] = useState(all.find((p) => p.is_featured)?.id ?? all[0]?.id);
  const [learners, setLearners] = useState(2);
  const [discountApplied, setDiscountApplied] = useState(true);
  if (!all.length) return null;
  const money = (price, minor) => `${price.approximate ? "≈ " : ""}${formatMoney(minor, price.currency)}`;
  const selectedRow = priced.find((row) => row.plan.id === planId) ?? priced[0];
  const discountEnabled = Boolean(familyDiscount?.enabled && Number(familyDiscount?.percent) > 0);
  const eligiblePlanIds = Array.isArray(familyDiscount?.eligible_plan_ids) ? familyDiscount.eligible_plan_ids : [];
  const planEligible = Boolean(selectedRow && (!eligiblePlanIds.length || eligiblePlanIds.includes(selectedRow.plan.id)) && selectedRow.plan.billing_period === (familyDiscount?.billing_period || "monthly"));
  const appliedPercent = discountEnabled && planEligible && discountApplied && learners > 1 ? Number(familyDiscount.percent) : 0;
  const estimate = selectedRow ? familyMonthlyEstimate(selectedRow.price.amount_minor, learners, appliedPercent, Number(familyDiscount?.max_learners) || 5) : null;
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
              <p className="mt-1 text-sm text-ink-soft">All lessons are live and one-to-one. {anyApprox ? `Amounts marked ≈ are converted from US dollars at the latest available exchange rate.` : `Fees shown in ${currency}.`}</p>
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
            <h3 className="font-sans text-lg font-bold text-mushaf-900">Multi-learner fee estimator</h3>
            <p className="mt-1 text-sm text-ink-soft">Estimate your family’s combined monthly fee. The first learner pays the published fee; eligible additional siblings receive the backend-approved discount.</p>
            <label htmlFor="fee-plan" className="field-label mt-5">Plan</label>
            <select id="fee-plan" className="input" value={selectedRow.plan.id} onChange={(e) => setPlanId(e.target.value)}>
              {priced.map((row) => <option key={row.plan.id} value={row.plan.id}>{row.plan.name} — {money(row.price, row.price.amount_minor)} / month</option>)}
            </select>
            <fieldset className="mt-5">
              <legend className="field-label">Number of learners</legend>
              <div className="mt-1 flex gap-2">
                {Array.from({ length: Math.max(1, Math.min(5, Number(familyDiscount?.max_learners) || 5)) }, (_, i) => i + 1).map((n) => (
                  <button key={n} type="button" aria-pressed={learners === n} onClick={() => setLearners(n)}
                    className={`size-11 rounded-full border text-base font-semibold transition-colors ${learners === n ? "border-leaf-700 bg-leaf-700 text-white" : "border-line bg-white text-mushaf-900 hover:border-leaf-700"}`}>{n}</button>
                ))}
              </div>
            </fieldset>
            {discountEnabled && planEligible && learners > 1 && (
              <button type="button" onClick={() => setDiscountApplied((value) => !value)}
                aria-pressed={discountApplied}
                className={`mt-5 flex w-full items-center justify-between gap-3 rounded-2xl border-2 px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A04A] ${discountApplied ? "border-[#C5A04A] bg-[#fff9e9] text-[#164735]" : "border-line bg-white text-mushaf-900 hover:border-[#C5A04A]"}`}>
                <span><span className="block text-sm font-bold">{discountApplied ? "Sibling discount applied" : "Apply sibling discount"}</span><span className="mt-0.5 block text-xs text-ink-soft">{Number(familyDiscount.percent)}% off each additional child</span></span>
                <span className="rounded-full bg-[#0B4935] px-3 py-1.5 text-xs font-bold text-white">{discountApplied ? "Applied" : "Apply"}</span>
              </button>
            )}
            <div className="mt-5 rounded-2xl bg-leaf-50 p-4" aria-live="polite">
              <p className="text-sm text-ink-soft">Estimated monthly total</p>
              <p className="mt-1 font-display text-3xl font-bold text-mushaf-900">{money(selectedRow.price, estimate?.total)}</p>
              {estimate?.saving > 0 && <p className="mt-1 text-sm font-semibold text-leaf-700">You save {money(selectedRow.price, estimate.saving)} per month with the sibling discount</p>}
              {learners > 1 && discountEnabled && !planEligible && <p className="mt-1 text-xs text-ink-soft">This discount is not configured for the selected plan.</p>}
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
