-- Website lead forwarding (owner choice 31 Oct 2026: send leads to Hatchium).
-- New contact messages and trial applications are queued in private.lead_outbox by
-- triggers, and a pg_cron job posts them as JSON to a webhook (Hatchium lead endpoint
-- or a Make webhook that relays to Hatchium). The CMS record is never changed.
-- Inactive until the owner stores the URL in Supabase Vault:
--   select vault.create_secret('<https url>', 'lead_webhook_url');
--   select vault.create_secret('<api key>', 'lead_webhook_token');   -- optional, sent as Bearer
-- Only fields a coordinator needs are sent: no IP hash, user agent, spam score or internal notes.

do $$
begin
  if exists (select 1 from pg_available_extensions where name = 'pg_net') then
    create extension if not exists pg_net with schema extensions;
  end if;
end $$;

create table if not exists private.lead_outbox (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('contact', 'trial')),
  record_id uuid not null,
  payload jsonb not null,
  status text not null default 'pending' check (status in ('pending', 'sending', 'sent', 'failed')),
  attempts int not null default 0,
  request_id bigint,
  last_status_code int,
  last_error text,
  next_attempt_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  unique (kind, record_id)
);
create index if not exists lead_outbox_due_idx on private.lead_outbox (next_attempt_at) where status in ('pending', 'sending');
alter table private.lead_outbox enable row level security;
revoke all on private.lead_outbox from public, anon, authenticated;

create or replace function private.lead_outbox_enqueue() returns trigger
language plpgsql security definer set search_path = '' as $$
declare v_payload jsonb;
begin
  if tg_table_name = 'contact_messages' then
    if new.status = 'spam' then return new; end if;
    v_payload := jsonb_build_object(
      'type', 'contact', 'reference', new.reference, 'submitted_at', new.created_at,
      'name', new.name, 'email', new.email, 'phone', new.phone, 'country', new.country, 'city', new.city,
      'subject', new.subject, 'message', new.message);
    insert into private.lead_outbox (kind, record_id, payload) values ('contact', new.id, v_payload) on conflict do nothing;
  else
    v_payload := jsonb_build_object(
      'type', 'trial', 'reference', new.reference, 'submitted_at', new.created_at,
      'learner_name', new.learner_name, 'guardian_name', new.guardian_name, 'email', new.email,
      'phone', new.phone, 'phone_is_whatsapp', new.phone_is_whatsapp, 'country', new.country, 'city', new.city,
      'timezone', new.timezone, 'age_band', new.age_band, 'level', new.level,
      'course', (select c.title from public.courses c where c.id = new.course_id),
      'teacher_gender_pref', new.teacher_gender_pref, 'teaching_language', new.teaching_language,
      'preferred_days', to_jsonb(new.preferred_days), 'preferred_times', to_jsonb(new.preferred_times),
      'notes', new.notes, 'source', new.source);
    insert into private.lead_outbox (kind, record_id, payload) values ('trial', new.id, v_payload) on conflict do nothing;
  end if;
  return new;
end $$;

drop trigger if exists lead_outbox_contact on public.contact_messages;
create trigger lead_outbox_contact after insert on public.contact_messages
  for each row execute function private.lead_outbox_enqueue();
drop trigger if exists lead_outbox_trial on public.trial_applications;
create trigger lead_outbox_trial after insert on public.trial_applications
  for each row execute function private.lead_outbox_enqueue();

-- Reads the webhook secret from Vault; null when not configured (forwarding inactive).
create or replace function private.lead_webhook_secret(p_name text) returns text
language plpgsql stable security definer set search_path = '' as $$
declare v text;
begin
  if to_regclass('vault.decrypted_secrets') is null then return null; end if;
  execute 'select decrypted_secret from vault.decrypted_secrets where name = $1 order by created_at desc limit 1' into v using p_name;
  return nullif(trim(v), '');
end $$;

-- One run: settle answered requests, then send due rows. Called by pg_cron every minute.
create or replace function private.lead_outbox_dispatch() returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_url text := private.lead_webhook_secret('lead_webhook_url');
  v_token text := private.lead_webhook_secret('lead_webhook_token');
  v_row private.lead_outbox;
  v_code int; v_err text; v_timed_out boolean; v_found boolean;
  v_headers jsonb;
begin
  -- 1. Settle requests pg_net has answered (2xx = sent; otherwise retry with backoff, give up after 6).
  for v_row in select * from private.lead_outbox where status = 'sending' and request_id is not null loop
    select r.status_code, r.error_msg, r.timed_out, true into v_code, v_err, v_timed_out, v_found
      from net._http_response r where r.id = v_row.request_id;
    if not coalesce(v_found, false) then
      -- No answer yet; treat as lost after 10 minutes.
      if v_row.next_attempt_at > now() - interval '10 minutes' then continue; end if;
      v_err := 'No response recorded';
    end if;
    if v_code between 200 and 299 then
      update private.lead_outbox set status = 'sent', sent_at = now(), last_status_code = v_code, last_error = null where id = v_row.id;
    else
      update private.lead_outbox set
        status = case when attempts >= 6 then 'failed' else 'pending' end,
        last_status_code = v_code,
        last_error = left(coalesce(v_err, case when v_timed_out then 'Timed out' end, 'HTTP ' || v_code), 500),
        next_attempt_at = now() + make_interval(mins => least(power(2, attempts)::int, 120)),
        request_id = null
      where id = v_row.id;
    end if;
    v_found := false; v_code := null; v_err := null; v_timed_out := null;
  end loop;

  if v_url is null or v_url !~ '^https://' then return; end if;
  v_headers := jsonb_build_object('Content-Type', 'application/json')
    || case when v_token is null then '{}'::jsonb else jsonb_build_object('Authorization', 'Bearer ' || v_token) end;

  -- 2. Send due rows (bounded per run).
  for v_row in select * from private.lead_outbox where status = 'pending' and next_attempt_at <= now()
               order by created_at limit 25 for update skip locked loop
    update private.lead_outbox set
      status = 'sending', attempts = attempts + 1, next_attempt_at = now(),
      request_id = net.http_post(url := v_url,
        body := v_row.payload || jsonb_build_object('event_id', v_row.id, 'site', 'onlinequrancollege.com'),
        headers := v_headers || jsonb_build_object('Idempotency-Key', v_row.id::text),
        timeout_milliseconds := 10000)
    where id = v_row.id;
  end loop;
end $$;

-- Staff view: whether forwarding is configured and how deliveries are doing. No lead contents.
create or replace function public.lead_forwarding_status() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
begin
  perform private.require_permission('settings:read');
  return jsonb_build_object(
    'configured', private.lead_webhook_secret('lead_webhook_url') is not null,
    'pending', (select count(*) from private.lead_outbox where status in ('pending', 'sending')),
    'sent', (select count(*) from private.lead_outbox where status = 'sent'),
    'failed', (select count(*) from private.lead_outbox where status = 'failed'),
    'last_sent_at', (select max(sent_at) from private.lead_outbox),
    'last_error', (select last_error from private.lead_outbox where last_error is not null order by next_attempt_at desc limit 1));
end $$;

-- Staff action: queue failed deliveries again after fixing the webhook.
create or replace function public.lead_forwarding_retry_failed() returns int
language plpgsql security definer set search_path = '' as $$
declare v int;
begin
  perform private.require_permission('settings:update');
  update private.lead_outbox set status = 'pending', attempts = 0, next_attempt_at = now(), request_id = null where status = 'failed';
  get diagnostics v = row_count;
  return v;
end $$;

revoke all on function private.lead_outbox_enqueue(), private.lead_webhook_secret(text), private.lead_outbox_dispatch() from public, anon, authenticated;
revoke all on function public.lead_forwarding_status(), public.lead_forwarding_retry_failed() from public, anon;
grant execute on function public.lead_forwarding_status(), public.lead_forwarding_retry_failed() to authenticated;

-- Schedule only where pg_cron exists (production); local tests call the dispatcher directly.
do $$
begin
  if to_regnamespace('cron') is not null then
    perform cron.unschedule(jobid) from cron.job where jobname = 'oqc-lead-forwarding';
    perform cron.schedule('oqc-lead-forwarding', '* * * * *', 'select private.lead_outbox_dispatch()');
  end if;
end $$;

notify pgrst, 'reload schema';
