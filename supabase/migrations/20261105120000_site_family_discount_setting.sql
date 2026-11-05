-- Public, CMS-managed sibling discount configuration.
-- The original published Fees FAQ confirms 15% off each additional child.
insert into public.settings (key, value, is_public, label, description)
values (
  'site.family_discount',
  jsonb_build_object(
    'enabled', true,
    'name', 'Sibling Discount',
    'percent', 15,
    'applies_to', 'each_additional_child',
    'max_learners', 5,
    'billing_period', 'monthly',
    'eligible_plan_ids', jsonb_build_array(
      '9f191bbd-42de-4fa6-8b34-613e60925d44',
      'cec03624-ecdf-4287-bc99-6c4fea2f813e',
      '7af44c20-9142-4502-a0a3-640a1fea0be7',
      '70b36488-a881-449c-8923-a9ecd5b04405',
      'b7f3114c-e499-4621-a6e3-cd45062bb2b6',
      'a89c9944-595f-4599-8d49-026ddb17231f'
    ),
    'currency_scope', 'all_published_plan_currencies',
    'description', 'Each additional child from the same household receives 15% off the monthly plan fee.'
  ),
  true,
  'Sibling discount',
  'Public family pricing rule: 15% off each additional child monthly fee, for up to five learners. Managed through CMS settings.'
)
on conflict (key) do update set
  value = excluded.value,
  is_public = true,
  label = excluded.label,
  description = excluded.description,
  updated_at = now();
