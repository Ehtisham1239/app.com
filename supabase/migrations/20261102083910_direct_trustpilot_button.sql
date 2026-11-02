-- OQC owner requirement (2 Nov 2026): the public review button should open Trustpilot directly.
-- Preserve existing CMS copy and Google review settings while switching the destination and mode.
insert into public.settings (key, value, is_public, label, description)
values (
  'site.reviews_button',
  jsonb_build_object(
    'enabled', true,
    'label', 'Review us on Trustpilot',
    'sublabel', 'Parents & students',
    'url', 'https://www.trustpilot.com/evaluate/onlinequrancollege.com',
    'every_page', true,
    'open_form', false,
    'google_url', ''
  ),
  true,
  'Reviews button',
  'Direct Trustpilot review invitation link'
)
on conflict (key) do update
set value = public.settings.value || jsonb_build_object(
  'enabled', true,
  'label', 'Review us on Trustpilot',
  'url', 'https://www.trustpilot.com/evaluate/onlinequrancollege.com',
  'every_page', true,
  'open_form', false
),
    is_public = true;
