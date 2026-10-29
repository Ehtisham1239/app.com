"use client";
import { useState } from "react";
import Link from "next/link";
import { formatMoney } from "@/lib/format";
import { isTrialEligible } from "@/lib/trial-eligibility";
import { familyMonthlyEstimate, perClassEstimate, planPrice, SIBLING_DISCOUNT, WEEKS_PER_MONTH } from "@/lib/fee-estimate";

const CURRENCY = "USD";

// Side-by-side plan comparison plus a family fee estimator, built only from the published plans.
export function FeeCompare({ plans }) {
  const list = (Array.isArray(plans) ? plans : []).filter((p) => planPrice(p, CURRENCY) !== null);
  const [planId, setPlanId] = useState(list.find((p) => p.is_featured)?.id ?? list[0]?.id);
  const [learners, setLearners] = useState(2);
  if (!list.length) return null;
  const selected = list.find((p) => p.id === planId) ?? list[0];
  const estimate = familyMonthlyEstimate(planPrice(selected, CURRENCY), learners);

  return (
    <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
      <div className="surface overflow-hidden">
        <div className="border-b border-line bg-leaf-50/70 px-5 py-4">
          <h3 className="font-sans text-lg font-bold text-mushaf-900">Compare every plan</h3>
          <p className="mt-1 text-sm text-ink-soft">All lessons are live and one-to-one. Fees shown in US dollars; choose a currency in the packages above to see approximate local prices.</p>
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
              {list.map((p) => (
                <tr key={p.id} className={`border-t border-line ${p.is_featured ? "bg-gold-50/60" : ""}`}>
                  <th scope="row" className="px-5 py-3.5 font-semibold text-mushaf-900">
                    {p.name}
                    {p.is_featured && <span className="ml-2 rounded-full bg-leaf-700 px-2 py-0.5 text-[0.68rem] font-bold uppercase tracking-wide text-white">Popular</span>}
                    {p.course_type && <span className="block text-xs font-normal text-ink-soft">{p.course_type}</span>}
                  </th>
                  <td className="px-3 py-3.5 text-ink">{p.classes_per_week} × {p.duration_min} min / week</td>
                  <td className="px-3 py-3.5 font-bold text-mushaf-900">{formatMoney(planPrice(p, CURRENCY), CURRENCY)}</td>
                  <td className="px-3 py-3.5 text-ink">{formatMoney(perClassEstimate(p, CURRENCY), CURRENCY)}</td>
                  <td className="px-5 py-3.5">{isTrialEligible(p) ? <span className="font-semibold text-leaf-700">3 days</span> : <span className="text-ink-soft">Not included</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="border-t border-line px-5 py-3 text-xs text-ink-soft">Per-class figures are estimates based on a {WEEKS_PER_MONTH}-week month. The coordinator confirms the number of classes in your billing month and the final amount.</p>
      </div>

      <div className="surface p-5 sm:p-6">
        <h3 className="font-sans text-lg font-bold text-mushaf-900">Family fee estimator</h3>
        <p className="mt-1 text-sm text-ink-soft">Each additional child from the same family receives {Math.round(SIBLING_DISCOUNT * 100)}% off.</p>
        <label htmlFor="fee-plan" className="field-label mt-5">Plan</label>
        <select id="fee-plan" className="input" value={selected.id} onChange={(e) => setPlanId(e.target.value)}>
          {list.map((p) => <option key={p.id} value={p.id}>{p.name} — {formatMoney(planPrice(p, CURRENCY), CURRENCY)} / month</option>)}
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
          <p className="mt-1 font-display text-3xl font-bold text-mushaf-900">{formatMoney(estimate?.total, CURRENCY)}</p>
          {estimate?.saving > 0 && <p className="mt-1 text-sm font-semibold text-leaf-700">You save {formatMoney(estimate.saving, CURRENCY)} a month with the sibling discount</p>}
        </div>
        <Link href={`/free-trial?${new URLSearchParams({ plan: selected.id, currency: CURRENCY })}`} className="btn btn-primary mt-5 w-full">
          {isTrialEligible(selected) ? "Book a free trial for this plan" : "Ask about this plan"}
        </Link>
        <p className="mt-3 text-xs text-ink-soft">An estimate, not a quote. Confirm the plan, currency and total with the coordinator before enrolling.</p>
      </div>
    </div>
  );
}
