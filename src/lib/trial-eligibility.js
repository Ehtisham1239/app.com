export function isTrialEligible(plan) {
  return !plan || (Number(plan.trial_days) > 0 && !/weekend/i.test(plan.name || ''));
}
