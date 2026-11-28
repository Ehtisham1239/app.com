export const FREE_TRIAL_DAYS = 3;

export function isTrialEligible(plan) {
  return !plan || (Number(plan.trial_days) === FREE_TRIAL_DAYS && !/weekend/i.test(plan.name || ''));
}
