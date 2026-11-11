-- OQC lead shift schedule (owner rule, 11 Nov 2026). All times Pakistan Standard Time (UTC+5).
--   Day shift    08:00–19:59 PKT
--   Night shift  20:00–07:59 PKT (belongs to the date on which it started)
-- Lead forms never close. Each free-trial request and contact message records the shift
-- and shift date of the moment it was submitted; these never change afterwards.
-- At 08:00 and 20:00 PKT every lead still awaiting follow-up passes to the incoming
-- shift's queue. The hand-over is logged in public.lead_shift_handovers and does not
-- edit the lead rows, so it cannot bump versions, flood the audit log or clash with a
-- coordinator who has a lead open. The queue itself is "pending leads", so it stays
-- correct even if a scheduled run is missed. src/lib/lead-shift.js mirrors these rules.

-- ---------------------------------------------------------------------------
-- 1. Shift rules
-- ---------------------------------------------------------------------------
create or replace function private.oqc_lead_shift(p_at timestamptz) returns text
language sql stable set search_path = '' as $$
  select case when extract(hour from p_at at time zone 'Asia/Karachi') between 8 and 19 then 'day' else 'night' end
$$;

create or replace function private.oqc_lead_shift_date(p_at timestamptz) returns date
language sql stable set search_path = '' as $$
  -- Subtracting 8 hours keeps 08:00–23:59 on the same date and moves 00:00–07:59 to the
  -- previous date: exactly "the date the shift started" for both shifts.
  select ((p_at at time zone 'Asia/Karachi') - interval '8 hours')::date
$$;

create or replace function private.oqc_last_shift_handover(p_at timestamptz) returns timestamptz
language sql stable set search_path = '' as $$
  select (
    private.oqc_lead_shift_date(p_at)
    + case when private.oqc_lead_shift(p_at) = 'day' then time '08:00' else time '20:00' end
  ) at time zone 'Asia/Karachi'
$$;

revoke all on function private.oqc_lead_shift(timestamptz) from public, anon, authenticated;
revoke all on function private.oqc_lead_shift_date(timestamptz) from public, anon, authenticated;
revoke all on function private.oqc_last_shift_handover(timestamptz) from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2. Recorded shift on every lead
-- ---------------------------------------------------------------------------
alter table public.trial_applications
  add column if not exists lead_shift text,
  add column if not exists shift_date date;
alter table public.contact_messages
  add column if not exists lead_shift text,
  add column if not exists shift_date date;

-- Back-fill existing leads from their submission time without firing the update,
-- version or audit triggers (this is a schema change, not an edit by a coordinator).
alter table public.trial_applications disable trigger user;
update public.trial_applications
   set lead_shift = private.oqc_lead_shift(created_at), shift_date = private.oqc_lead_shift_date(created_at)
 where lead_shift is null or shift_date is null;
alter table public.trial_applications enable trigger user;

alter table public.contact_messages disable trigger user;
update public.contact_messages
   set lead_shift = private.oqc_lead_shift(created_at), shift_date = private.oqc_lead_shift_date(created_at)
 where lead_shift is null or shift_date is null;
alter table public.contact_messages enable trigger user;

alter table public.trial_applications
  alter column lead_shift set not null,
  alter column shift_date set not null,
  add constraint trial_applications_lead_shift_check check (lead_shift in ('day', 'night'));
alter table public.contact_messages
  alter column lead_shift set not null,
  alter column shift_date set not null,
  add constraint contact_messages_lead_shift_check check (lead_shift in ('day', 'night'));

create index if not exists trials_shift_idx
  on public.trial_applications (shift_date desc, lead_shift) where deleted_at is null;
create index if not exists contacts_shift_idx
  on public.contact_messages (shift_date desc, lead_shift) where deleted_at is null;

-- The shift always comes from the database clock at insert and can never be edited:
-- any value sent by a browser, an import or a coordinator is replaced.
create or replace function private.tg_lead_shift() returns trigger
language plpgsql set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    new.created_at := coalesce(new.created_at, now());
    new.lead_shift := private.oqc_lead_shift(new.created_at);
    new.shift_date := private.oqc_lead_shift_date(new.created_at);
  else
    new.lead_shift := old.lead_shift;
    new.shift_date := old.shift_date;
  end if;
  return new;
end $$;
revoke all on function private.tg_lead_shift() from public, anon, authenticated;

drop trigger if exists trial_applications_lead_shift on public.trial_applications;
create trigger trial_applications_lead_shift before insert or update on public.trial_applications
  for each row execute function private.tg_lead_shift();
drop trigger if exists contact_messages_lead_shift on public.contact_messages;
create trigger contact_messages_lead_shift before insert or update on public.contact_messages
  for each row execute function private.tg_lead_shift();

-- ---------------------------------------------------------------------------
-- 3. Hand-over log and job
-- ---------------------------------------------------------------------------
create table if not exists public.lead_shift_handovers (
  id uuid primary key default gen_random_uuid(),
  handover_at timestamptz not null unique,
  from_shift text not null check (from_shift in ('day', 'night')),
  to_shift text not null check (to_shift in ('day', 'night') and to_shift <> from_shift),
  to_shift_date date not null,
  trial_ids uuid[] not null default '{}',
  contact_ids uuid[] not null default '{}',
  trials_count int not null default 0 check (trials_count >= 0),
  contacts_count int not null default 0 check (contacts_count >= 0),
  ran_at timestamptz not null default now()
);
create index if not exists lead_shift_handovers_at_idx on public.lead_shift_handovers (handover_at desc);

alter table public.lead_shift_handovers enable row level security;
revoke all on table public.lead_shift_handovers from public, anon, authenticated;
grant select on table public.lead_shift_handovers to authenticated;
grant all on table public.lead_shift_handovers to service_role;
drop policy if exists "staff read" on public.lead_shift_handovers;
create policy "staff read" on public.lead_shift_handovers for select to authenticated
  using (public.has_permission('trials:read') or public.has_permission('contacts:read'));

-- Records the most recent 08:00/20:00 PKT hand-over at or before p_at. Leads submitted
-- before that moment and still awaiting follow-up (trials: new/reviewed; messages:
-- new/read) are carried into the incoming shift. Running it again for the same
-- hand-over changes nothing, so a late or repeated run is safe.
create or replace function private.run_lead_shift_handover(p_at timestamptz default now()) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_at timestamptz := private.oqc_last_shift_handover(p_at);
  v_to text := private.oqc_lead_shift(v_at);
  v_row public.lead_shift_handovers;
begin
  insert into public.lead_shift_handovers
    (handover_at, from_shift, to_shift, to_shift_date, trial_ids, contact_ids, trials_count, contacts_count)
  select v_at,
         case v_to when 'day' then 'night' else 'day' end,
         v_to,
         private.oqc_lead_shift_date(v_at),
         t.ids, c.ids, cardinality(t.ids), cardinality(c.ids)
    from (select coalesce(array_agg(id order by created_at), '{}') as ids
            from public.trial_applications
           where deleted_at is null and status in ('new', 'reviewed') and created_at < v_at) t,
         (select coalesce(array_agg(id order by created_at), '{}') as ids
            from public.contact_messages
           where deleted_at is null and status in ('new', 'read') and created_at < v_at) c
  on conflict (handover_at) do nothing
  returning * into v_row;

  if v_row.id is null then
    return jsonb_build_object('ok', true, 'handover_at', v_at, 'to_shift', v_to, 'already_recorded', true);
  end if;
  return jsonb_build_object('ok', true, 'handover_at', v_at, 'to_shift', v_to,
    'trials', v_row.trials_count, 'contacts', v_row.contacts_count);
end $$;
revoke all on function private.run_lead_shift_handover(timestamptz) from public, anon, authenticated;

-- pg_cron runs in UTC: 03:00 UTC = 08:00 PKT, 15:00 UTC = 20:00 PKT.
-- (Skipped by the local PGlite tests, which have no pg_cron.)
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule('oqc-lead-shift-handover', '0 3,15 * * *', 'select private.run_lead_shift_handover()');
  end if;
end $$;

-- Record the hand-over that started the current shift so the queue banner has a starting point.
select private.run_lead_shift_handover();
