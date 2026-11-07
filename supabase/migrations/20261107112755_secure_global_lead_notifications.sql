-- Contact and review submission wrappers preserve the original validation, RLS
-- boundaries, honeypot and rate limits. A notification proof is issued in the
-- same transaction as a successful submission and is stored only as a hash.
create table private.website_lead_notification_tokens (
  reference text primary key,
  token_hash text not null check (token_hash ~ '^[0-9a-f]{64}$'),
  expires_at timestamptz not null
);
alter table private.website_lead_notification_tokens enable row level security;
revoke all on table private.website_lead_notification_tokens from public, anon, authenticated, service_role;
create index on private.website_lead_notification_tokens (expires_at);

create function private.attach_website_notification_token(result jsonb) returns jsonb
language plpgsql set search_path = '' as $$
declare
  ref text := result ->> 'reference';
  token text;
begin
  if ref is null or ref !~ '^(MSG|REV)-[0-9]{4}-[0-9]{5,7}$' then return result; end if;
  token := encode(extensions.gen_random_bytes(32), 'hex');
  delete from private.website_lead_notification_tokens where expires_at < now() - interval '1 day';
  insert into private.website_lead_notification_tokens (reference, token_hash, expires_at)
  values (ref, encode(extensions.digest(token, 'sha256'), 'hex'), now() + interval '30 minutes');
  return result || jsonb_build_object('notification_token', token);
end
$$;
revoke all on function private.attach_website_notification_token(jsonb) from public, anon, authenticated, service_role;

create function public.submit_contact_message_with_notification(payload jsonb) returns jsonb
language sql security definer set search_path = '' as $$
  select private.attach_website_notification_token(public.submit_contact_message(payload));
$$;
revoke all on function public.submit_contact_message_with_notification(jsonb) from public, anon, authenticated;
grant execute on function public.submit_contact_message_with_notification(jsonb) to anon, authenticated;

create function public.submit_review_with_notification(payload jsonb) returns jsonb
language sql security definer set search_path = '' as $$
  select private.attach_website_notification_token(public.submit_review(payload));
$$;
revoke all on function public.submit_review_with_notification(jsonb) from public, anon, authenticated;
grant execute on function public.submit_review_with_notification(jsonb) to anon, authenticated;

create or replace function public.lead_for_notification(p_reference text, p_email text, p_token text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when p_token is null or p_token !~ '^[0-9a-f]{64}$' then null
    when p_reference ~ '^TR-[0-9]{4}-[0-9]{5,7}$' then (
      select jsonb_build_object(
        'lead_type', 'trial', 'id', t.id, 'reference', t.reference, 'created_at', t.created_at,
        'learner_name', t.learner_name, 'guardian_name', t.guardian_name, 'email', t.email,
        'phone', t.phone, 'country', t.country, 'timezone', t.timezone, 'age_band', t.age_band,
        'course', c.title, 'teacher_gender_pref', t.teacher_gender_pref, 'notes', t.notes,
        'source', t.source, 'utm', t.utm, 'repeat_of', d.reference, 'repeat_of_created_at', d.created_at
      )
      from public.trial_applications t
      join private.usa_lead_notification_tokens proof on proof.lead_id = t.id
      left join public.courses c on c.id = t.course_id
      left join public.trial_applications d on d.id = t.duplicate_of_id
      where t.reference = p_reference
        and t.email = lower(trim(coalesce(p_email, '')))
        and t.created_at > now() - interval '30 minutes'
        and t.deleted_at is null
        and proof.expires_at > now()
        and proof.token_hash = encode(extensions.digest(p_token, 'sha256'), 'hex')
        and t.utm ->> 'landing_page' is distinct from '/usa-quran-classes'
      limit 1
    )
    when p_reference ~ '^MSG-[0-9]{4}-[0-9]{5,7}$' then (
      select jsonb_build_object(
        'lead_type', 'contact', 'id', m.id, 'reference', m.reference, 'created_at', m.created_at,
        'name', m.name, 'email', m.email, 'phone', m.phone, 'country', m.country,
        'city', m.city, 'subject', m.subject, 'message', m.message, 'source', m.source, 'utm', m.utm
      )
      from public.contact_messages m
      join private.website_lead_notification_tokens proof on proof.reference = m.reference
      where m.reference = p_reference
        and m.email = lower(trim(coalesce(p_email, '')))
        and m.created_at > now() - interval '30 minutes'
        and m.deleted_at is null
        and m.status <> 'spam'
        and proof.expires_at > now()
        and proof.token_hash = encode(extensions.digest(p_token, 'sha256'), 'hex')
      limit 1
    )
    when p_reference ~ '^REV-[0-9]{4}-[0-9]{5,7}$' then (
      select jsonb_build_object(
        'lead_type', 'review', 'id', r.id, 'reference', r.reference, 'created_at', r.created_at,
        'name', r.name, 'email', r.email, 'relation', r.relation, 'country', r.country,
        'rating', r.rating, 'comment', r.comment, 'publish_consent', r.publish_consent,
        'publish_consent_at', r.publish_consent_at, 'page_path', r.page_path,
        'media_count', cardinality(r.media_paths)
      )
      from public.review_submissions r
      join private.website_lead_notification_tokens proof on proof.reference = r.reference
      where r.reference = p_reference
        and r.email = lower(trim(coalesce(p_email, '')))
        and r.created_at > now() - interval '30 minutes'
        and r.deleted_at is null
        and r.status <> 'spam'
        and proof.expires_at > now()
        and proof.token_hash = encode(extensions.digest(p_token, 'sha256'), 'hex')
      limit 1
    )
    else null
  end
$$;

revoke all on function public.lead_for_notification(text, text, text) from public, anon, authenticated;
grant execute on function public.lead_for_notification(text, text, text) to service_role;
