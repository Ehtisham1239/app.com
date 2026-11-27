-- Suppress exact resubmissions for 24 hours without discarding changed
-- requests. Reuse the existing generic receipt on replays so they issue no
-- notification proof, trigger no outbox insert and publish no lead conversion.
-- Existing submission RPC signatures and permissions are retained.

create index if not exists contact_messages_email_created_idx
  on public.contact_messages (email, created_at desc) where deleted_at is null;

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
  v_fields jsonb;
  v_submission public.trial_applications;
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
  -- Match the values that will actually be saved. Acquisition metadata and
  -- arrival channel do not identify a new enquiry.
  v_fields := jsonb_build_object(
    'learner_name', v_name,
    'guardian_name', nullif(left(trim(coalesce(payload ->> 'guardian_name', '')), 120), ''),
    'email', v_email,
    'phone', v_phone,
    'phone_is_whatsapp', coalesce((payload ->> 'phone_is_whatsapp')::boolean, true),
    'country', left(trim(payload ->> 'country'), 80),
    'city', nullif(left(trim(coalesce(payload ->> 'city', '')), 80), ''),
    'timezone', v_tz,
    'age_band', v_age,
    'learner_gender', case when payload ->> 'learner_gender' in ('female', 'male') then payload ->> 'learner_gender' end,
    'course_id', v_course,
    'level', case when payload ->> 'level' in ('beginner', 'intermediate', 'advanced') then payload ->> 'level' else 'beginner' end,
    'teacher_gender_pref', case when payload ->> 'teacher_gender_pref' in ('female', 'male', 'any') then payload ->> 'teacher_gender_pref' else 'any' end,
    'teaching_language', coalesce(nullif(left(trim(coalesce(payload ->> 'teaching_language', '')), 40), ''), 'English'),
    'preferred_days', array(select left(x, 12) from jsonb_array_elements_text(coalesce(payload -> 'preferred_days', '[]'::jsonb)) x limit 7),
    'preferred_times', array(select left(x, 20) from jsonb_array_elements_text(coalesce(payload -> 'preferred_times', '[]'::jsonb)) x limit 6),
    'notes', nullif(left(trim(coalesce(payload ->> 'notes', '')), 2000), ''),
    'marketing_opt_in', coalesce((payload ->> 'marketing_opt_in')::boolean, false)
  );
  v_submission := jsonb_populate_record(null::public.trial_applications, v_fields);

  -- Hold the same lock through the insert, proof creation and outbox trigger.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('oqc:trial-replay:' || v_email, 0));
  if exists (
    select 1 from public.trial_applications t
    where t.email = v_email
      and t.created_at > now() - interval '24 hours'
      and t.deleted_at is null
      and to_jsonb(t) @> (v_fields - 'preferred_days' - 'preferred_times')
      and t.preferred_days = v_submission.preferred_days
      and t.preferred_times = v_submission.preferred_times
  ) then
    return jsonb_build_object('ok', true, 'reference', 'TR-RECEIVED');
  end if;

  select value ->> 'consent_version' into v_consent_version from public.settings where key = 'site.forms';

  select id into v_dup from public.trial_applications
   where (email = v_email or phone = v_phone)
     and course_id is not distinct from v_course
     and lower(trim(learner_name)) = lower(v_name)
     and age_band = v_age
     and created_at > now() - interval '30 days'
     and duplicate_of_id is null and deleted_at is null
   order by created_at limit 1;

  insert into public.trial_applications (
    learner_name, guardian_name, email, phone, phone_is_whatsapp, country, city, timezone, age_band,
    learner_gender, course_id, level, teacher_gender_pref, teaching_language, preferred_days, preferred_times,
    notes, consent_given, consent_text_version, marketing_opt_in, source, utm, duplicate_of_id, ip_hash, user_agent)
  values (
    v_submission.learner_name, v_submission.guardian_name, v_submission.email, v_submission.phone,
    v_submission.phone_is_whatsapp, v_submission.country, v_submission.city, v_submission.timezone,
    v_submission.age_band, v_submission.learner_gender, v_submission.course_id, v_submission.level,
    v_submission.teacher_gender_pref, v_submission.teaching_language, v_submission.preferred_days,
    v_submission.preferred_times, v_submission.notes,
    true,
    coalesce(v_consent_version, '2026-10-13'),
    v_submission.marketing_opt_in,
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

create or replace function public.submit_contact_message(payload jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_ip text := private.request_ip_hash();
  v_email text := lower(trim(coalesce(payload ->> 'email', '')));
  v_name text := trim(coalesce(payload ->> 'name', ''));
  v_subject text := trim(coalesce(payload ->> 'subject', ''));
  v_message text := trim(coalesce(payload ->> 'message', ''));
  v_fields jsonb;
  v_submission public.contact_messages;
  v_links int;
  v_score int := 0;
  v_ref text;
  v_consent_version text;
begin
  if coalesce(payload ->> 'website', '') <> '' then
    return jsonb_build_object('ok', true, 'reference', 'MSG-RECEIVED');
  end if;
  if not private.hit_rate_limit('contact:' || v_ip, 8, interval '1 hour') then
    raise exception 'Too many messages from your connection. Please try again later or message us on WhatsApp.';
  end if;
  if char_length(v_name) < 2 or char_length(v_name) > 120 then raise exception 'Please enter your name.'; end if;
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' or char_length(v_email) > 254 then
    raise exception 'Please enter a valid email address.';
  end if;
  if char_length(v_subject) < 2 then v_subject := 'General enquiry'; end if;
  if char_length(v_message) < 5 then raise exception 'Please write a short message.'; end if;
  if coalesce((payload ->> 'consent')::boolean, false) is not true then
    raise exception 'Please agree to the privacy notice so we can reply.';
  end if;
  v_links := (select count(*) from regexp_matches(v_message, 'https?://', 'g'));
  if v_links > 2 then v_score := v_score + 60; end if;
  if v_message ~* '(casino|crypto|viagra|seo services|backlinks|loan offer)' then v_score := v_score + 60; end if;
  v_fields := jsonb_build_object(
    'name', left(v_name, 120),
    'email', v_email,
    'phone', nullif(left(regexp_replace(coalesce(payload ->> 'phone', ''), '[^0-9+ ]', '', 'g'), 32), ''),
    'country', nullif(left(trim(coalesce(payload ->> 'country', '')), 80), ''),
    'city', nullif(left(trim(coalesce(payload ->> 'city', '')), 80), ''),
    'subject', left(v_subject, 160),
    'message', left(v_message, 5000)
  );
  v_submission := jsonb_populate_record(null::public.contact_messages, v_fields);

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('oqc:contact-replay:' || v_email, 0));
  if exists (
    select 1 from public.contact_messages m
    where m.email = v_email
      and m.created_at > now() - interval '24 hours'
      and m.deleted_at is null
      and to_jsonb(m) @> v_fields
  ) then
    return jsonb_build_object('ok', true, 'reference', 'MSG-RECEIVED');
  end if;

  select value ->> 'consent_version' into v_consent_version from public.settings where key = 'site.forms';

  insert into public.contact_messages (name, email, phone, country, city, subject, message,
                                       consent_text_version, status, spam_score, ip_hash, user_agent, source, utm)
  values (v_submission.name, v_submission.email, v_submission.phone, v_submission.country,
          v_submission.city, v_submission.subject, v_submission.message,
          coalesce(v_consent_version, '2026-10-13'),
          case when v_score >= 60 then 'spam' else 'new' end, v_score, v_ip, private.request_user_agent(),
          left(coalesce(nullif(payload ->> 'source', ''), 'website'), 120),
          case when jsonb_typeof(payload -> 'utm') = 'object' and octet_length((payload -> 'utm')::text) <= 4096 then payload -> 'utm' else '{}'::jsonb end)
  returning reference into v_ref;
  return jsonb_build_object('ok', true, 'reference', v_ref);
end $$;
