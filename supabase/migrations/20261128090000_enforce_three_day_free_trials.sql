-- Existing eligible packages keep the free trial. Weekend stays ineligible.
update public.pricing_plans
set trial_days = case when name ~* 'weekend' then 0 else 3 end
where deleted_at is null
  and (trial_days not in (0, 3) or (name ~* 'weekend' and trial_days <> 0));

alter table public.pricing_plans
  add constraint pricing_plans_free_trial_policy
  check (deleted_at is not null or (trial_days in (0, 3) and (name !~* 'weekend' or trial_days = 0)));
