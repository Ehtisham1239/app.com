-- USA landing page lead email (owner request, 5 Nov 2026).
--
-- The landing page saves a lead from the visitor's browser through
-- public.submit_trial_application, so the per-visitor rate limit and honeypot
-- keep working. It then asks /api/usa-lead-notification to email admissions.
-- That server route calls this function with the publishable key to confirm the
-- lead is real and to read the details it emails, so the email content always
-- comes from the database, never from the browser.
--
-- Only the person who just submitted can match a row: the reference returned to
-- them, the same email address, within 30 minutes, and only for leads saved from
-- /usa-quran-classes. Anything else returns null. Nothing is written.
create or replace function public.usa_lead_for_notification(p_reference text, p_email text)
returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'id', t.id,
    'reference', t.reference,
    'created_at', t.created_at,
    'learner_name', t.learner_name,
    'guardian_name', t.guardian_name,
    'email', t.email,
    'phone', t.phone,
    'country', t.country,
    'timezone', t.timezone,
    'age_band', t.age_band,
    'course', c.title,
    'teacher_gender_pref', t.teacher_gender_pref,
    'notes', t.notes,
    'source', t.source,
    'utm', t.utm,
    'repeat_of', d.reference,
    'repeat_of_created_at', d.created_at)
  from public.trial_applications t
  left join public.courses c on c.id = t.course_id
  left join public.trial_applications d on d.id = t.duplicate_of_id
  where p_reference ~ '^TR-[0-9]{4}-[0-9]{5,7}$'
    and t.reference = p_reference
    and t.email = lower(trim(coalesce(p_email, '')))
    and t.created_at > now() - interval '30 minutes'
    and t.deleted_at is null
    and t.utm ->> 'landing_page' = '/usa-quran-classes'
  limit 1
$$;

revoke execute on function public.usa_lead_for_notification(text, text) from public, anon, authenticated;
grant execute on function public.usa_lead_for_notification(text, text) to anon, authenticated, service_role;
