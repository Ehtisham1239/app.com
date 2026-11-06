-- Global website lead notification lookup.
-- This privileged lookup returns only the just-submitted row matching reference + email
-- within 30 minutes. It is callable only by the server-side service_role key.
create or replace function public.lead_for_notification(p_reference text, p_email text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when p_reference ~ '^TR-[0-9]{4}-[0-9]{5,7}$' then (
      select jsonb_build_object(
        'lead_type', 'trial', 'id', t.id, 'reference', t.reference, 'created_at', t.created_at,
        'learner_name', t.learner_name, 'guardian_name', t.guardian_name, 'email', t.email,
        'phone', t.phone, 'country', t.country, 'timezone', t.timezone, 'age_band', t.age_band,
        'course', c.title, 'teacher_gender_pref', t.teacher_gender_pref, 'notes', t.notes,
        'source', t.source, 'utm', t.utm, 'repeat_of', d.reference, 'repeat_of_created_at', d.created_at
      )
      from public.trial_applications t
      left join public.courses c on c.id = t.course_id
      left join public.trial_applications d on d.id = t.duplicate_of_id
      where t.reference = p_reference
        and t.email = lower(trim(coalesce(p_email, '')))
        and t.created_at > now() - interval '30 minutes'
        and t.deleted_at is null
      limit 1
    )
    when p_reference ~ '^MSG-[0-9]{4}-[0-9]{5,7}$' then (
      select jsonb_build_object(
        'lead_type', 'contact', 'id', m.id, 'reference', m.reference, 'created_at', m.created_at,
        'name', m.name, 'email', m.email, 'phone', m.phone, 'country', m.country,
        'city', m.city, 'subject', m.subject, 'message', m.message, 'source', m.source, 'utm', m.utm
      )
      from public.contact_messages m
      where m.reference = p_reference
        and m.email = lower(trim(coalesce(p_email, '')))
        and m.created_at > now() - interval '30 minutes'
        and m.deleted_at is null
        and m.status <> 'spam'
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
      where r.reference = p_reference
        and r.email = lower(trim(coalesce(p_email, '')))
        and r.created_at > now() - interval '30 minutes'
        and r.deleted_at is null
        and r.status <> 'spam'
      limit 1
    )
    else null
  end
$$;

revoke all on function public.lead_for_notification(text, text) from public, anon, authenticated;
grant execute on function public.lead_for_notification(text, text) to service_role;
