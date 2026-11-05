// Fee comparison helpers. Estimates only: the coordinator confirms the
// number of classes in a billing month and the final payable amount.

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

// First learner pays the published fee; each additional learner receives the
// backend-configured sibling discount. Amounts are rounded in currency minor units.
export function familyMonthlyEstimate(monthlyMinor, learners, discountPercent = 0, maxLearners = 5) {
  const n = Math.max(1, Math.min(maxLearners, Math.floor(Number(learners) || 1)));
  if (monthlyMinor === null || monthlyMinor === undefined) return null;
  const percent = Math.max(0, Math.min(100, Number(discountPercent) || 0));
  const discountedLearner = Math.round(monthlyMinor * (1 - percent / 100));
  const saving = (monthlyMinor - discountedLearner) * (n - 1);
  return { learners: n, total: monthlyMinor * n - saving, saving, discountPercent: percent };
}
