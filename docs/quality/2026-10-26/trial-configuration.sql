-- Configuration alignment performed and verified on 26 October 2026.
-- Existing website source/CMS policy was already three days (upstream f90092f).
-- Align future eligible packages, preserving prices, existing applications and
-- the Weekend plan's zero-day exclusion. This is a data patch, not a DDL migration.
update public.pricing_plans
set trial_days = 3
where status = 'published' and is_public = true and deleted_at is null
  and trial_days = 7
  and name in ('Package 1', 'Package 2', 'Package 3', 'Package 4', 'Leisure');

select name, trial_days from public.pricing_plans
where status = 'published' and is_public = true and deleted_at is null
order by sort_order;
-- Verified result: Package 1–4 and Leisure = 3; Weekend = 0.
-- Before this alignment, the five eligible packages had trial_days = 7.
-- Restore 7 only if the owner intentionally reverses the three-day policy,
-- and align public copy/settings at the same time. Existing trials were not edited.
