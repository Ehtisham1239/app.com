-- Preserve existing validation, consent, rate limits and spam protection.
alter table public.contact_messages add column if not exists source text not null default 'website';
alter table public.contact_messages add column if not exists utm jsonb not null default '{}'::jsonb;
create or replace function public.submit_contact_message(payload jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_ip text := private.request_ip_hash();
  v_email text := lower(trim(coalesce(payload ->> 'email', '')));
  v_name text := trim(coalesce(payload ->> 'name', ''));
  v_subject text := trim(coalesce(payload ->> 'subject', ''));
  v_message text := trim(coalesce(payload ->> 'message', ''));
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
  select value ->> 'consent_version' into v_consent_version from public.settings where key = 'site.forms';

  insert into public.contact_messages (name, email, phone, country, city, subject, message,
                                       consent_text_version, status, spam_score, ip_hash, user_agent, source, utm)
  values (left(v_name, 120), v_email,
          nullif(left(regexp_replace(coalesce(payload ->> 'phone', ''), '[^0-9+ ]', '', 'g'), 32), ''),
          nullif(left(trim(coalesce(payload ->> 'country', '')), 80), ''),
          nullif(left(trim(coalesce(payload ->> 'city', '')), 80), ''),
          left(v_subject, 160), left(v_message, 5000),
          coalesce(v_consent_version, '2026-10-13'),
          case when v_score >= 60 then 'spam' else 'new' end, v_score, v_ip, private.request_user_agent(),
          left(coalesce(nullif(payload ->> 'source', ''), 'website'), 120),
          case when jsonb_typeof(payload -> 'utm') = 'object' and octet_length((payload -> 'utm')::text) <= 4096 then payload -> 'utm' else '{}'::jsonb end)
  returning reference into v_ref;
  return jsonb_build_object('ok', true, 'reference', v_ref);
end $$;

-- Aggregated form conversions only: no ad-platform spend/impression claims.
create or replace function public.campaign_report(p_from date, p_to date) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare v jsonb;
begin
  if not public.has_permission('reports:read') then
    raise exception 'You do not have permission to view reports.' using errcode = '42501';
  end if;
  if p_from is null or p_to is null or p_from > p_to or p_to - p_from > 366 then
    raise exception 'Choose a valid date range up to 366 days.';
  end if;
  with leads as (
    select source, utm, status, 'trial'::text as form_type from public.trial_applications
      where public.has_permission('trials:read') and deleted_at is null
        and created_at >= p_from::timestamp at time zone 'Asia/Karachi'
        and created_at < (p_to + 1)::timestamp at time zone 'Asia/Karachi'
    union all
    select source, utm, status, 'contact'::text from public.contact_messages
      where public.has_permission('contacts:read') and deleted_at is null and status <> 'spam'
        and created_at >= p_from::timestamp at time zone 'Asia/Karachi'
        and created_at < (p_to + 1)::timestamp at time zone 'Asia/Karachi'
  ), grouped as (
    select left(coalesce(nullif(utm ->> 'utm_source', ''), nullif(source, ''), 'website'), 120) as source,
      left(coalesce(nullif(utm ->> 'utm_medium', ''), 'Unspecified'), 120) as medium,
      left(coalesce(nullif(utm ->> 'utm_campaign', ''), 'Unattributed'), 120) as campaign,
      count(*) as leads, count(*) filter (where form_type = 'trial') as trials,
      count(*) filter (where form_type = 'contact') as contacts,
      count(*) filter (where form_type = 'trial' and status = 'enrolled') as enrolled
      from leads group by 1,2,3
  ) select coalesce(jsonb_agg(to_jsonb(g) order by g.leads desc, g.source, g.campaign), '[]'::jsonb) into v from grouped g;
  return v;
end $$;
revoke all on function public.campaign_report(date, date) from public, anon;
grant execute on function public.campaign_report(date, date) to authenticated;
