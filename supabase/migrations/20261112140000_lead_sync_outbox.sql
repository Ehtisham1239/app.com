-- Durable lead delivery (owner request, 12 Nov 2026).
-- Until now a lead reached HighLevel and the admissions inbox only if the
-- visitor's browser made a second call after the form was saved. A closed tab,
-- a lost connection or a failed proof lookup lost the delivery with no record.
-- Every trial request and contact message now queues its own delivery job in
-- the same transaction that saves it. A server worker (/api/cron/lead-sync)
-- claims due jobs, retries with backoff, and records every outcome. Lead rows
-- are never edited. Only the service role can use these functions.
create table public.lead_sync_jobs (
  reference text primary key check (reference ~ '^(TR|MSG)-[0-9]{4}-[0-9]{5,7}$'),
  lead_type text not null check (lead_type in ('trial', 'contact')),
  status text not null default 'pending' check (status in ('pending', 'done', 'dead')),
  crm_done boolean not null default false,
  email_done boolean not null default false,
  attempts integer not null default 0 check (attempts >= 0),
  next_attempt_at timestamptz not null default now() + interval '2 minutes',
  last_error text check (last_error is null or last_error ~ '^[a-z0-9_]{1,80}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index lead_sync_jobs_due on public.lead_sync_jobs (next_attempt_at) where status = 'pending';
alter table public.lead_sync_jobs enable row level security;
revoke all on table public.lead_sync_jobs from public, anon, authenticated;
grant select on table public.lead_sync_jobs to authenticated;
create policy "staff read" on public.lead_sync_jobs for select to authenticated using (
  (lead_type = 'trial' and (select public.has_permission('trials:read')))
  or (lead_type = 'contact' and (select public.has_permission('contacts:read')))
);

create function private.tg_enqueue_lead_sync() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.reference is not null and coalesce(new.status::text, '') <> 'spam' then
    insert into public.lead_sync_jobs (reference, lead_type)
    values (new.reference, case tg_table_name when 'trial_applications' then 'trial' else 'contact' end)
    on conflict (reference) do nothing;
  end if;
  return new;
end
$$;
revoke all on function private.tg_enqueue_lead_sync() from public, anon, authenticated;
create trigger trial_applications_enqueue_sync after insert on public.trial_applications
  for each row execute function private.tg_enqueue_lead_sync();
create trigger contact_messages_enqueue_sync after insert on public.contact_messages
  for each row execute function private.tg_enqueue_lead_sync();

-- Picks due jobs for one worker run. SKIP LOCKED keeps two overlapping runs
-- from taking the same job; the backoff is applied at claim time so a worker
-- that crashes mid-job simply retries later. Gives up after 8 attempts.
create function public.claim_lead_sync_jobs(p_limit integer default 10)
returns table (reference text, lead_type text, crm_done boolean, email_done boolean)
language sql security definer set search_path = '' as $$
  with due as (
    select j.reference from public.lead_sync_jobs j
    where j.status = 'pending' and j.attempts < 8 and j.next_attempt_at <= now()
    order by j.next_attempt_at
    limit greatest(1, least(coalesce(p_limit, 10), 25))
    for update skip locked
  )
  update public.lead_sync_jobs j
  set attempts = j.attempts + 1,
      next_attempt_at = now() + (interval '2 minutes' * power(2, least(j.attempts, 6))),
      updated_at = now()
  from due
  where j.reference = due.reference
  returning j.reference, j.lead_type, j.crm_done, j.email_done
$$;

-- The same lead shape as lead_for_notification, looked up by reference alone
-- for the trusted worker (no browser proof token exists for a retry).
create function public.lead_for_outbox(p_reference text) returns jsonb
language sql stable security definer set search_path = '' as $$
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
      where t.reference = p_reference and t.deleted_at is null
      limit 1
    )
    when p_reference ~ '^MSG-[0-9]{4}-[0-9]{5,7}$' then (
      select jsonb_build_object(
        'lead_type', 'contact', 'id', m.id, 'reference', m.reference, 'created_at', m.created_at,
        'name', m.name, 'email', m.email, 'phone', m.phone, 'country', m.country,
        'city', m.city, 'subject', m.subject, 'message', m.message, 'source', m.source, 'utm', m.utm
      )
      from public.contact_messages m
      where m.reference = p_reference and m.deleted_at is null and m.status <> 'spam'
      limit 1
    )
    else null
  end
$$;

-- Records one attempt. p_crm_ok is null when HighLevel is not enabled. The
-- admin "CRM status" keeps reading lead_crm_sync, so a failure shows there too
-- (that table's detail allows letters and underscores only, so digits are dropped).
create function public.complete_lead_sync_job(p_reference text, p_crm_ok boolean, p_email_ok boolean, p_error text default null)
returns text
language plpgsql security definer set search_path = '' as $$
declare
  v_job public.lead_sync_jobs;
  v_crm boolean;
  v_email boolean;
  v_error text := nullif(left(regexp_replace(lower(coalesce(p_error, '')), '[^a-z0-9_]', '', 'g'), 80), '');
  v_status text;
begin
  select * into v_job from public.lead_sync_jobs where reference = p_reference for update;
  if not found then return null; end if;
  v_crm := v_job.crm_done or coalesce(p_crm_ok, true);
  v_email := v_job.email_done or coalesce(p_email_ok, false);
  v_status := case when v_crm and v_email then 'done' when v_job.attempts >= 8 then 'dead' else 'pending' end;
  update public.lead_sync_jobs
  set crm_done = v_crm, email_done = v_email, status = v_status,
      last_error = case when v_status = 'done' then null else v_error end, updated_at = now()
  where reference = p_reference;
  if p_crm_ok is not null then
    insert into public.lead_crm_sync (reference, status, detail, updated_at)
    values (p_reference, case when p_crm_ok then 'synced' else 'failed' end,
            case when p_crm_ok then null else nullif(left(regexp_replace(coalesce(v_error, ''), '[^a-z_]', '', 'g'), 60), '') end, now())
    on conflict (reference) do update set status = excluded.status, detail = excluded.detail, updated_at = excluded.updated_at;
  end if;
  return v_status;
end
$$;

revoke all on function public.claim_lead_sync_jobs(integer) from public, anon, authenticated;
revoke all on function public.lead_for_outbox(text) from public, anon, authenticated;
revoke all on function public.complete_lead_sync_job(text, boolean, boolean, text) from public, anon, authenticated;
grant execute on function public.claim_lead_sync_jobs(integer) to service_role;
grant execute on function public.lead_for_outbox(text) to service_role;
grant execute on function public.complete_lead_sync_job(text, boolean, boolean, text) to service_role;
