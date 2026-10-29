// Fee comparison helpers. Estimates only: the coordinator confirms the
// number of classes in a billing month and the final payable amount.

export const SIBLING_DISCOUNT = 0.15;
// A rough month for comparison. Real billing months can hold more or fewer classes.
export const WEEKS_PER_MONTH = 4;

export function planPrice(plan, currency = "USD") {
  return (plan?.prices || []).find((p) => p.currency === currency)?.amount_minor ?? null;
}

// Approximate cost of one class, in minor units, for a monthly plan.
export function perClassEstimate(plan, currency = "USD") {
  const monthly = planPrice(plan, currency);
  const perWeek = Number(plan?.classes_per_week);
  if (monthly === null || plan?.billing_period !== "monthly" || !(perWeek > 0)) return null;
  return Math.round(monthly / (perWeek * WEEKS_PER_MONTH));
}

// First learner pays the full fee; each additional child from the same family
// receives the sibling discount.
export function familyMonthlyEstimate(monthlyMinor, learners) {
  const n = Math.max(1, Math.min(10, Math.floor(Number(learners) || 1)));
  if (monthlyMinor === null || monthlyMinor === undefined) return null;
  const extra = Math.round(monthlyMinor * (1 - SIBLING_DISCOUNT));
  return { learners: n, total: monthlyMinor + extra * (n - 1), saving: (monthlyMinor - extra) * (n - 1) };
}
