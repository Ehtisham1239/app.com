-- Monthly student progress reports (docs/results-portal/MONTHLY_PROGRESS.md). Additive only.
-- Teachers rate six categories for their assigned students; an admin edits if needed,
-- requests changes or publishes; parents see only the published snapshot.
-- Rating scale (proposed in the owner's workflow document): excellent, good,
-- satisfactory, needs_improvement. No marks, totals or percentages.

insert into public.app_role_permissions (role, permission)
select role, permission from (values
  ('admin', 'progress:*'),
  ('academic', 'progress:read'), ('academic', 'progress:review'), ('academic', 'progress:update'),
  ('qa', 'progress:read'),
  ('teacher', 'progress:submit')
) as v(role, permission)
where exists (select 1 from public.app_roles r where r.key = v.role)
on conflict do nothing;

-- Which teacher login reports on which student, and the group used for Student of the Month.
create table public.progress_assignments (
  id uuid primary key default gen_random_uuid(),
  teacher_profile_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  group_label text not null default '' check (char_length(group_label) <= 60),
  created_at timestamptz not null default now(),
  unique (teacher_profile_id, student_id)
);
create index progress_assignments_student_idx on public.progress_assignments(student_id);

create table public.monthly_reports (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete restrict,
  period date not null check (period = date_trunc('month', period)::date),
  teacher_profile_id uuid references public.profiles(id) on delete set null,
  adab text check (adab in ('excellent', 'good', 'satisfactory', 'needs_improvement')),
  qaida text check (qaida in ('excellent', 'good', 'satisfactory', 'needs_improvement')),
  dua text check (dua in ('excellent', 'good', 'satisfactory', 'needs_improvement')),
  tajweed text check (tajweed in ('excellent', 'good', 'satisfactory', 'needs_improvement')),
  engagement text check (engagement in ('excellent', 'good', 'satisfactory', 'needs_improvement')),
  outcome text check (outcome in ('excellent', 'good', 'satisfactory', 'needs_improvement')),
  remarks text not null default '' check (char_length(remarks) <= 1000),
  status text not null default 'draft' check (status in ('draft', 'submitted', 'changes_requested', 'published')),
  change_note text check (change_note is null or char_length(change_note) <= 500),
  submitted_at timestamptz,
  -- What parents see: replaced only by a complete publish.
  published jsonb,
  published_version int not null default 0,
  published_at timestamptz,
  published_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  version int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, period)
);
create index monthly_reports_teacher_idx on public.monthly_reports(teacher_profile_id);
create index monthly_reports_period_idx on public.monthly_reports(period, status);
create index monthly_reports_published_by_idx on public.monthly_reports(published_by);
create index monthly_reports_updated_by_idx on public.monthly_reports(updated_by);

create table public.monthly_report_history (
  id bigint generated always as identity primary key,
  report_id uuid not null references public.monthly_reports(id) on delete cascade,
  action text not null,
  snapshot jsonb not null,
  reason text check (reason is null or char_length(reason) <= 500),
  changed_by uuid references public.profiles(id) on delete set null,
  changed_at timestamptz not null default now()
);
create index monthly_report_history_report_idx on public.monthly_report_history(report_id, changed_at);
create index monthly_report_history_changed_by_idx on public.monthly_report_history(changed_by);

create table public.student_of_month (
  period date not null check (period = date_trunc('month', period)::date),
  group_label text not null default '' check (char_length(group_label) <= 60),
  student_id uuid not null references public.students(id) on delete cascade,
  set_by uuid references public.profiles(id) on delete set null,
  set_at timestamptz not null default now(),
  primary key (period, group_label)
);
create index student_of_month_student_idx on public.student_of_month(student_id);
create index student_of_month_set_by_idx on public.student_of_month(set_by);

create trigger monthly_reports_updated_at before update on public.monthly_reports for each row execute function private.tg_set_updated_at();
create trigger monthly_reports_version before update on public.monthly_reports for each row execute function private.tg_bump_version();
create trigger monthly_reports_audit after insert or update or delete on public.monthly_reports for each row execute function private.tg_audit();
create trigger progress_assignments_audit after insert or update or delete on public.progress_assignments for each row execute function private.tg_audit();

alter table public.progress_assignments enable row level security;
alter table public.monthly_reports enable row level security;
alter table public.monthly_report_history enable row level security;
alter table public.student_of_month enable row level security;
revoke all on public.progress_assignments, public.monthly_reports, public.monthly_report_history, public.student_of_month from anon, public;

-- Assignments: staff manage under progress:update; a teacher reads their own.
create policy "staff read" on public.progress_assignments for select to authenticated
  using ((select public.has_permission('progress:read')) or teacher_profile_id = (select auth.uid()));
create policy "staff create" on public.progress_assignments for insert to authenticated
  with check ((select public.has_permission('progress:update')));
create policy "staff update" on public.progress_assignments for update to authenticated
  using ((select public.has_permission('progress:update'))) with check ((select public.has_permission('progress:update')));
create policy "staff delete" on public.progress_assignments for delete to authenticated
  using ((select public.has_permission('progress:update')));
grant select, insert, update, delete on public.progress_assignments to authenticated;

-- Reports, history and awards: read only; every change goes through the functions below.
create policy "staff read" on public.monthly_reports for select to authenticated
  using ((select public.has_permission('progress:read')) or teacher_profile_id = (select auth.uid()));
grant select on public.monthly_reports to authenticated;
revoke insert, update, delete on public.monthly_reports from authenticated;

create policy "staff read" on public.monthly_report_history for select to authenticated
  using ((select public.has_permission('progress:read')));
grant select on public.monthly_report_history to authenticated;
revoke insert, update, delete on public.monthly_report_history from authenticated;

create policy "staff read" on public.student_of_month for select to authenticated
  using ((select public.has_permission('progress:read')));
grant select on public.student_of_month to authenticated;
revoke insert, update, delete on public.student_of_month from authenticated;

-- ---------------------------------------------------------------------------
-- Functions
-- ---------------------------------------------------------------------------
create or replace function private.progress_rating(p_value text) returns text
language sql immutable set search_path = '' as $$
  select case when nullif(trim(coalesce(p_value, '')), '') is null then null
              when lower(trim(p_value)) in ('excellent', 'good', 'satisfactory', 'needs_improvement') then lower(trim(p_value))
              else 'invalid' end
$$;

create or replace function private.progress_snapshot(r public.monthly_reports) returns jsonb
language sql stable set search_path = '' as $$
  select jsonb_build_object('adab', r.adab, 'qaida', r.qaida, 'dua', r.dua, 'tajweed', r.tajweed,
                            'engagement', r.engagement, 'outcome', r.outcome, 'remarks', r.remarks,
                            'period', r.period, 'status', r.status,
                            'teacher', (select p.full_name from public.profiles p where p.id = r.teacher_profile_id))
$$;

-- Students the caller may report on for a month, with that month's report status.
create or replace function public.progress_my_students(p_period date)
returns table (student_id uuid, full_name text, student_code text, group_label text, report_id uuid, status text, has_published boolean)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not (public.has_permission('progress:submit') or public.has_permission('progress:review')) then
    raise exception 'You do not have permission to do this (progress:submit).' using errcode = '42501';
  end if;
  return query
    select s.id, s.full_name, s.student_code, min(a.group_label), m.id, m.status, m.published is not null
    from public.progress_assignments a
    join public.students s on s.id = a.student_id and s.deleted_at is null
    left join public.monthly_reports m on m.student_id = s.id and m.period = date_trunc('month', p_period)::date
    where a.teacher_profile_id = auth.uid() or public.has_permission('progress:review')
    group by s.id, s.full_name, s.student_code, m.id, m.status, m.published
    order by s.full_name;
end $$;

-- Teacher (or reviewer) saves a draft or submits for review. One report per student and month:
-- repeating a save or submit updates the same report and never creates a duplicate.
create or replace function public.progress_save(p_student_id uuid, p_period date, p_ratings jsonb, p_remarks text, p_submit boolean)
returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_period date := date_trunc('month', p_period)::date;
  v_reviewer boolean := public.has_permission('progress:review');
  v_row public.monthly_reports;
  v_vals text[];
  v_key text;
  v_remarks text := left(trim(coalesce(p_remarks, '')), 1000);
begin
  if not (public.has_permission('progress:submit') or v_reviewer) then
    raise exception 'You do not have permission to do this (progress:submit).' using errcode = '42501';
  end if;
  if p_period is null or v_period > date_trunc('month', now())::date then raise exception 'Choose the current or a past month.'; end if;
  if not v_reviewer and not exists (select 1 from public.progress_assignments a where a.teacher_profile_id = auth.uid() and a.student_id = p_student_id) then
    raise exception 'This student is not assigned to you.' using errcode = '42501';
  end if;
  if not exists (select 1 from public.students s where s.id = p_student_id and s.deleted_at is null) then raise exception 'Student not found.'; end if;
  foreach v_key in array array['adab', 'qaida', 'dua', 'tajweed', 'engagement', 'outcome'] loop
    v_vals := array_append(v_vals, private.progress_rating(p_ratings ->> v_key));
    if v_vals[cardinality(v_vals)] = 'invalid' then raise exception 'Choose a rating from the list for %.', v_key; end if;
  end loop;
  if p_submit and (array_position(v_vals, null) is not null or v_remarks = '') then
    raise exception 'Give all six ratings and the teacher remarks before submitting.';
  end if;

  select * into v_row from public.monthly_reports where student_id = p_student_id and period = v_period for update;
  if found and v_row.status = 'submitted' and not v_reviewer then
    raise exception 'This report is waiting for review. Ask the admin to request changes if it needs editing.';
  end if;

  insert into public.monthly_reports as m (student_id, period, teacher_profile_id, adab, qaida, dua, tajweed, engagement, outcome, remarks,
                                           status, submitted_at, change_note, updated_by)
  values (p_student_id, v_period, case when v_reviewer and not public.has_permission('progress:submit') then null else auth.uid() end,
          v_vals[1], v_vals[2], v_vals[3], v_vals[4], v_vals[5], v_vals[6], v_remarks,
          case when p_submit then 'submitted' else 'draft' end, case when p_submit then now() end, null, auth.uid())
  on conflict (student_id, period) do update set
    teacher_profile_id = coalesce(case when v_reviewer then m.teacher_profile_id else auth.uid() end, m.teacher_profile_id),
    adab = excluded.adab, qaida = excluded.qaida, dua = excluded.dua, tajweed = excluded.tajweed,
    engagement = excluded.engagement, outcome = excluded.outcome, remarks = excluded.remarks,
    status = case when p_submit then 'submitted' when m.status = 'changes_requested' then 'changes_requested' else 'draft' end,
    submitted_at = case when p_submit then now() else m.submitted_at end,
    change_note = case when p_submit then null else m.change_note end,
    updated_by = auth.uid()
  returning * into v_row;

  if p_submit then
    insert into public.monthly_report_history (report_id, action, snapshot, changed_by)
    values (v_row.id, 'submitted', private.progress_snapshot(v_row), auth.uid());
  end if;
  return v_row.id;
end $$;

-- Admin edit before approval (or of a published report as a new revision); the reason is kept.
create or replace function public.progress_admin_update(p_report_id uuid, p_ratings jsonb, p_remarks text, p_reason text)
returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_row public.monthly_reports;
  v_vals text[];
  v_key text;
begin
  perform private.require_permission('progress:review');
  if coalesce(char_length(trim(p_reason)), 0) < 3 then raise exception 'Give a reason for the edit.'; end if;
  select * into v_row from public.monthly_reports where id = p_report_id for update;
  if not found then raise exception 'Report not found.'; end if;
  foreach v_key in array array['adab', 'qaida', 'dua', 'tajweed', 'engagement', 'outcome'] loop
    v_vals := array_append(v_vals, private.progress_rating(p_ratings ->> v_key));
    if v_vals[cardinality(v_vals)] = 'invalid' then raise exception 'Choose a rating from the list for %.', v_key; end if;
  end loop;
  insert into public.monthly_report_history (report_id, action, snapshot, reason, changed_by)
  values (v_row.id, 'edited_before', private.progress_snapshot(v_row), left(trim(p_reason), 500), auth.uid());
  update public.monthly_reports set adab = v_vals[1], qaida = v_vals[2], dua = v_vals[3], tajweed = v_vals[4],
    engagement = v_vals[5], outcome = v_vals[6], remarks = left(trim(coalesce(p_remarks, '')), 1000),
    status = case when status = 'published' then 'submitted' else status end, updated_by = auth.uid()
  where id = p_report_id;
end $$;

create or replace function public.progress_request_changes(p_report_id uuid, p_reason text) returns void
language plpgsql security definer set search_path = '' as $$
declare v_row public.monthly_reports;
begin
  perform private.require_permission('progress:review');
  if coalesce(char_length(trim(p_reason)), 0) < 3 then raise exception 'Tell the teacher what to change.'; end if;
  select * into v_row from public.monthly_reports where id = p_report_id for update;
  if not found or v_row.status not in ('submitted', 'draft') then raise exception 'Only submitted reports can be sent back.'; end if;
  update public.monthly_reports set status = 'changes_requested', change_note = left(trim(p_reason), 500), updated_by = auth.uid()
  where id = p_report_id returning * into v_row;
  insert into public.monthly_report_history (report_id, action, snapshot, reason, changed_by)
  values (v_row.id, 'changes_requested', private.progress_snapshot(v_row), left(trim(p_reason), 500), auth.uid());
end $$;

-- Publishes the complete report as one snapshot; the previous snapshot stays in history.
create or replace function public.progress_publish(p_report_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare v_row public.monthly_reports;
begin
  perform private.require_permission('progress:publish');
  select * into v_row from public.monthly_reports where id = p_report_id for update;
  if not found then raise exception 'Report not found.'; end if;
  if v_row.status <> 'submitted' then raise exception 'Only a submitted report can be published.'; end if;
  if v_row.adab is null or v_row.qaida is null or v_row.dua is null or v_row.tajweed is null
     or v_row.engagement is null or v_row.outcome is null or trim(v_row.remarks) = '' then
    raise exception 'The report needs all six ratings and remarks before publishing.';
  end if;
  update public.monthly_reports set status = 'published', published = private.progress_snapshot(v_row) - 'status',
    published_version = published_version + 1, published_at = now(), published_by = auth.uid(), change_note = null, updated_by = auth.uid()
  where id = p_report_id returning * into v_row;
  insert into public.monthly_report_history (report_id, action, snapshot, changed_by)
  values (v_row.id, 'published', v_row.published || jsonb_build_object('version', v_row.published_version), auth.uid());
end $$;

-- Takes a published report off the parent portal (kept in history).
create or replace function public.progress_unpublish(p_report_id uuid, p_reason text) returns void
language plpgsql security definer set search_path = '' as $$
declare v_row public.monthly_reports;
begin
  perform private.require_permission('progress:publish');
  if coalesce(char_length(trim(p_reason)), 0) < 3 then raise exception 'Give a reason.'; end if;
  select * into v_row from public.monthly_reports where id = p_report_id for update;
  if not found or v_row.published is null then raise exception 'This report is not published.'; end if;
  insert into public.monthly_report_history (report_id, action, snapshot, reason, changed_by)
  values (v_row.id, 'unpublished', v_row.published, left(trim(p_reason), 500), auth.uid());
  update public.monthly_reports set published = null, published_at = null,
    status = case when status = 'published' then 'submitted' else status end, updated_by = auth.uid()
  where id = p_report_id;
end $$;

-- Student of the Month: an admin choice per month and group (null student removes it).
create or replace function public.progress_set_award(p_period date, p_group text, p_student_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare v_period date := date_trunc('month', p_period)::date; v_group text := left(trim(coalesce(p_group, '')), 60);
begin
  perform private.require_permission('progress:publish');
  if p_student_id is null then
    delete from public.student_of_month where period = v_period and group_label = v_group;
  else
    if not exists (select 1 from public.students where id = p_student_id and deleted_at is null) then raise exception 'Student not found.'; end if;
    insert into public.student_of_month (period, group_label, student_id, set_by) values (v_period, v_group, p_student_id, auth.uid())
    on conflict (period, group_label) do update set student_id = excluded.student_id, set_by = auth.uid(), set_at = now();
  end if;
  insert into public.audit_logs (actor_id, action, entity_type, entity_id, summary)
  values (auth.uid(), 'award', 'student_of_month', null, format('Student of the Month %s %s', to_char(v_period, 'Mon YYYY'), nullif(v_group, '')));
end $$;

-- Parent portal: published monthly reports of the parent's own children, with award flags.
create or replace function public.parent_progress(p_token text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_guardian uuid := private.parent_guardian(p_token);
begin
  if v_guardian is null then return null; end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object('student_id', s.id, 'name', s.full_name, 'code', s.student_code,
      'reports', coalesce((
        select jsonb_agg(m.published || jsonb_build_object('id', m.id, 'version', m.published_version, 'published_at', m.published_at,
                           'student_of_month', exists (select 1 from public.student_of_month w where w.student_id = s.id and w.period = m.period))
                         order by m.period desc)
        from public.monthly_reports m where m.student_id = s.id and m.published is not null), '[]'::jsonb)
    ) order by s.full_name)
    from public.student_guardians sg join public.students s on s.id = sg.student_id and s.deleted_at is null
    where sg.guardian_id = v_guardian), '[]'::jsonb);
end $$;

revoke execute on function
  private.progress_rating(text), private.progress_snapshot(public.monthly_reports),
  public.progress_my_students(date), public.progress_save(uuid, date, jsonb, text, boolean),
  public.progress_admin_update(uuid, jsonb, text, text), public.progress_request_changes(uuid, text),
  public.progress_publish(uuid), public.progress_unpublish(uuid, text), public.progress_set_award(date, text, uuid),
  public.parent_progress(text)
from public, anon, authenticated;
grant execute on function
  public.progress_my_students(date), public.progress_save(uuid, date, jsonb, text, boolean),
  public.progress_admin_update(uuid, jsonb, text, text), public.progress_request_changes(uuid, text),
  public.progress_publish(uuid), public.progress_unpublish(uuid, text), public.progress_set_award(date, text, uuid)
to authenticated;
grant execute on function public.parent_progress(text) to anon, authenticated;
