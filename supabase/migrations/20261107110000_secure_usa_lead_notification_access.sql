-- Secure USA admissions notification lookup with a short-lived 256-bit bearer token.
-- The raw token is returned only to the visitor who submitted the lead; only its
-- SHA-256 hash is stored in the private schema. The legacy two-argument lookup
-- remains as a harmless null-returning compatibility stub for a rolling frontend deployment.

create table if not exists private.usa_lead_notification_tokens (
  lead_id uuid primary key references public.trial_applications(id) on delete cascade,
  token_hash text not null unique check (token_hash ~ '^[0-9a-f]{64}$'),
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
alter table private.usa_lead_notification_tokens enable row level security;
revoke all on table private.usa_lead_notification_tokens from public, anon, authenticated, service_role;
create index if not exists usa_lead_notification_tokens_expires_idx
  on private.usa_lead_notification_tokens (expires_at);

create or replace function public.submit_trial_application(payload jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_ip text := private.request_ip_hash();
  v_email text := lower(trim(coalesce(payload ->> 'email', '')));
  v_phone text := regexp_replace(coalesce(payload ->> 'phone', ''), '[^0-9+]', '', 'g');
  v_name text := trim(coalesce(payload ->> 'learner_name', ''));
  v_tz text := coalesce(nullif(trim(payload ->> 'timezone'), ''), 'UTC');
  v_age text := coalesce(payload ->> 'age_band', '');
  v_course uuid;
  v_dup uuid;
  v_ref text;
  v_lead_id uuid;
  v_notification_token text;
  v_consent_version text;
begin
  if coalesce(payload ->> 'website', '') <> '' then
    return jsonb_build_object('ok', true, 'reference', 'TR-RECEIVED');
  end if;
  if not private.hit_rate_limit('trial:' || v_ip, 6, interval '1 hour') then
    raise exception 'Too many requests from your connection. Please try again later or message us on WhatsApp.';
  end if;
  if char_length(v_name) < 2 or char_length(v_name) > 120 then
    raise exception 'Please enter the learner''s full name.';
  end if;
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' or char_length(v_email) > 254 then
    raise exception 'Please enter a valid email address.';
  end if;
  if char_length(v_phone) < 7 or char_length(v_phone) > 20 then
    raise exception 'Please enter a valid phone or WhatsApp number with country code.';
  end if;
  if v_age not in ('child_4_7', 'child_8_12', 'teen_13_17', 'adult') then
    raise exception 'Please choose the learner''s age group.';
  end if;
  if coalesce(nullif(trim(payload ->> 'country'), ''), '') = '' then
    raise exception 'Please choose your country.';
  end if;
  if coalesce((payload ->> 'consent')::boolean, false) is not true then
    raise exception 'Please agree to the privacy notice so we can contact you.';
  end if;
  if not exists (select 1 from pg_catalog.pg_timezone_names where name = v_tz) then
    v_tz := 'UTC';
  end if;
  if coalesce(payload ->> 'course_id', '') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    select id into v_course from public.courses
      where id = (payload ->> 'course_id')::uuid and status = 'published' and deleted_at is null;
  end if;
  select value ->> 'consent_version' into v_consent_version from public.settings where key = 'site.forms';

  select id into v_dup from public.trial_applications
   where (email = v_email or phone = v_phone)
     and course_id is not distinct from v_course
     and created_at > now() - interval '30 days'
     and duplicate_of_id is null and deleted_at is null
   order by created_at limit 1;

  insert into public.trial_applications (
    learner_name, guardian_name, email, phone, phone_is_whatsapp, country, city, timezone, age_band,
    learner_gender, course_id, level, teacher_gender_pref, teaching_language, preferred_days, preferred_times,
    notes, consent_given, consent_text_version, marketing_opt_in, source, utm, duplicate_of_id, ip_hash, user_agent)
  values (
    v_name,
    nullif(left(trim(coalesce(payload ->> 'guardian_name', '')), 120), ''),
    v_email,
    v_phone,
    coalesce((payload ->> 'phone_is_whatsapp')::boolean, true),
    left(trim(payload ->> 'country'), 80),
    nullif(left(trim(coalesce(payload ->> 'city', '')), 80), ''),
    v_tz,
    v_age,
    case when payload ->> 'learner_gender' in ('female', 'male') then payload ->> 'learner_gender' end,
    v_course,
    case when payload ->> 'level' in ('beginner', 'intermediate', 'advanced') then payload ->> 'level' else 'beginner' end,
    case when payload ->> 'teacher_gender_pref' in ('female', 'male', 'any') then payload ->> 'teacher_gender_pref' else 'any' end,
    coalesce(nullif(left(trim(coalesce(payload ->> 'teaching_language', '')), 40), ''), 'English'),
    coalesce(array(select left(x, 12) from jsonb_array_elements_text(coalesce(payload -> 'preferred_days', '[]'::jsonb)) x limit 7), '{}'),
    coalesce(array(select left(x, 20) from jsonb_array_elements_text(coalesce(payload -> 'preferred_times', '[]'::jsonb)) x limit 6), '{}'),
    nullif(left(trim(coalesce(payload ->> 'notes', '')), 2000), ''),
    true,
    coalesce(v_consent_version, '2026-10-13'),
    coalesce((payload ->> 'marketing_opt_in')::boolean, false),
    coalesce(nullif(left(payload ->> 'source', 40), ''), 'website'),
    coalesce(payload -> 'utm', '{}'::jsonb),
    v_dup,
    v_ip,
    private.request_user_agent()
  ) returning id, reference into v_lead_id, v_ref;

  v_notification_token := encode(extensions.gen_random_bytes(32), 'hex');
  delete from private.usa_lead_notification_tokens where expires_at < now() - interval '1 day';
  insert into private.usa_lead_notification_tokens (lead_id, token_hash, expires_at)
  values (v_lead_id, encode(extensions.digest(v_notification_token, 'sha256'), 'hex'), now() + interval '30 minutes');

  return jsonb_build_object('ok', true, 'reference', v_ref, 'notification_token', v_notification_token);
end $$;

revoke execute on function public.submit_trial_application(jsonb) from public, anon, authenticated;
grant execute on function public.submit_trial_application(jsonb) to anon, authenticated, service_role;

create or replace function public.usa_lead_for_notification(p_reference text, p_email text)
returns jsonb
language sql stable set search_path = '' as $$
  select null::jsonb
$$;
revoke execute on function public.usa_lead_for_notification(text, text) from public, anon, authenticated, service_role;
grant execute on function public.usa_lead_for_notification(text, text) to anon, authenticated, service_role;

create or replace function public.usa_lead_for_notification(p_reference text, p_email text, p_notification_token text)
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
  join private.usa_lead_notification_tokens nt on nt.lead_id = t.id
  left join public.courses c on c.id = t.course_id
  left join public.trial_applications d on d.id = t.duplicate_of_id
  where p_reference ~ '^TR-[0-9]{4}-[0-9]{5,7}$'
    and p_notification_token ~ '^[0-9a-f]{64}$'
    and nt.token_hash = encode(extensions.digest(p_notification_token, 'sha256'), 'hex')
    and nt.expires_at > now()
    and t.reference = p_reference
    and t.email = lower(trim(coalesce(p_email, '')))
    and t.created_at > now() - interval '30 minutes'
    and t.deleted_at is null
    and t.utm ->> 'landing_page' = '/usa-quran-classes'
  limit 1
$$;

revoke execute on function public.usa_lead_for_notification(text, text, text) from public, anon, authenticated;
grant execute on function public.usa_lead_for_notification(text, text, text) to anon, authenticated, service_role;
