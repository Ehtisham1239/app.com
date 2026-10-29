-- Student results and parent results portal (docs/results-portal).
-- Additive only: new tables/functions and one nullable column on guardians.
-- Grading bands are owner policy and are stored per assessment (empty = no computed grade).

-- ---------------------------------------------------------------------------
-- 1. Permissions (module "results"). Approval and publication stay with admin.
-- ---------------------------------------------------------------------------
insert into public.app_role_permissions (role, permission)
select role, permission from (values
  ('admin', 'results:*'),
  ('academic', 'results:read'), ('academic', 'results:create'), ('academic', 'results:review'), ('academic', 'results:update'),
  ('qa', 'results:read')
) as v(role, permission)
where exists (select 1 from public.app_roles r where r.key = v.role)
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- 2. Tables
-- ---------------------------------------------------------------------------
create table public.assessments (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[A-Z0-9][A-Z0-9-]{1,39}$'),
  title text not null check (char_length(title) between 2 and 160),
  course_id uuid references public.courses(id) on delete set null,
  assessment_date date not null,
  period_label text not null default '' check (char_length(period_label) <= 80),
  total_marks numeric(7, 2) not null check (total_marks > 0 and total_marks <= 10000),
  -- [{"grade": "A", "min_percent": 90}, …] supplied by the owner; [] means marks only.
  grade_bands jsonb not null default '[]'::jsonb check (jsonb_typeof(grade_bands) = 'array'),
  status text not null default 'draft' check (status in ('draft', 'active', 'closed')),
  created_by uuid default auth.uid() references public.profiles(id) on delete set null,
  version int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index assessments_course_idx on public.assessments(course_id);
create index assessments_created_by_idx on public.assessments(created_by);

create table public.result_import_batches (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete restrict,
  original_filename text not null check (char_length(original_filename) between 1 and 200),
  file_sha256 text not null check (file_sha256 ~ '^[0-9a-f]{64}$'),
  status text not null default 'needs_review' check (status in
    ('needs_review', 'ready_for_approval', 'approved', 'published', 'rejected', 'cancelled')),
  total_rows int not null default 0 check (total_rows >= 0),
  valid_rows int not null default 0 check (valid_rows >= 0),
  invalid_rows int not null default 0 check (invalid_rows >= 0),
  duplicate_rows int not null default 0 check (duplicate_rows >= 0),
  excluded_rows int not null default 0 check (excluded_rows >= 0),
  decision_note text check (decision_note is null or char_length(decision_note) <= 500),
  created_by uuid default auth.uid() references public.profiles(id) on delete set null,
  reviewed_by uuid references public.profiles(id) on delete set null,
  approved_by uuid references public.profiles(id) on delete set null,
  published_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  approved_at timestamptz,
  published_at timestamptz,
  version int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (assessment_id, file_sha256)
);
create index result_import_batches_assessment_idx on public.result_import_batches(assessment_id);
create index result_import_batches_created_by_idx on public.result_import_batches(created_by);

create table public.result_import_rows (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.result_import_batches(id) on delete cascade,
  row_number int not null check (row_number between 1 and 5000),
  student_code text not null default '' check (char_length(student_code) <= 40),
  student_name text not null default '' check (char_length(student_name) <= 160),
  marks_text text not null default '' check (char_length(marks_text) <= 20),
  grade text not null default '' check (char_length(grade) <= 20),
  teacher_remarks text not null default '' check (char_length(teacher_remarks) <= 1000),
  marks_obtained numeric(7, 2),
  matched_student_id uuid references public.students(id) on delete set null,
  errors text[] not null default '{}',
  status text not null default 'pending' check (status in ('pending', 'valid', 'invalid', 'duplicate', 'excluded')),
  created_at timestamptz not null default now(),
  unique (batch_id, row_number)
);
create index result_import_rows_student_idx on public.result_import_rows(matched_student_id);

create table public.student_results (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete restrict,
  student_id uuid not null references public.students(id) on delete restrict,
  marks_obtained numeric(7, 2) not null check (marks_obtained >= 0),
  total_marks numeric(7, 2) not null check (total_marks > 0),
  percentage numeric(5, 2) generated always as (round(marks_obtained * 100 / total_marks, 2)) stored,
  grade text not null default '' check (char_length(grade) <= 20),
  teacher_remarks text not null default '' check (char_length(teacher_remarks) <= 1000),
  status text not null default 'published' check (status in ('published', 'withdrawn')),
  batch_id uuid references public.result_import_batches(id) on delete set null,
  certificate_id uuid references public.certificates(id) on delete set null,
  published_by uuid references public.profiles(id) on delete set null,
  published_at timestamptz not null default now(),
  version int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (marks_obtained <= total_marks),
  unique (assessment_id, student_id)
);
create index student_results_student_idx on public.student_results(student_id);
create index student_results_batch_idx on public.student_results(batch_id);
create index student_results_certificate_idx on public.student_results(certificate_id);
create index student_results_published_by_idx on public.student_results(published_by);

create table public.student_result_history (
  id bigint generated always as identity primary key,
  result_id uuid not null references public.student_results(id) on delete cascade,
  version int not null,
  snapshot jsonb not null,
  reason text not null check (char_length(reason) between 3 and 500),
  changed_by uuid references public.profiles(id) on delete set null,
  changed_at timestamptz not null default now()
);
create index student_result_history_result_idx on public.student_result_history(result_id, version);
create index student_result_history_changed_by_idx on public.student_result_history(changed_by);

-- Parent access. The Client ID is an identifier, not a secret; the code is.
alter table public.guardians add column client_id text unique
  check (client_id is null or client_id ~ '^[A-Za-z0-9][A-Za-z0-9._-]{2,63}$');

create table private.guardian_codes (
  guardian_id uuid primary key references public.guardians(id) on delete cascade,
  code_hash text not null,
  issued_at timestamptz not null default now(),
  issued_by uuid,
  failed_attempts int not null default 0,
  locked_until timestamptz
);

create table private.parent_sessions (
  token_hash text primary key,
  guardian_id uuid not null references public.guardians(id) on delete cascade,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz
);
create index parent_sessions_guardian_idx on private.parent_sessions(guardian_id);

-- ---------------------------------------------------------------------------
-- 3. Triggers: updated_at, version, audit (reuse existing helpers)
-- ---------------------------------------------------------------------------
create trigger assessments_updated_at before update on public.assessments for each row execute function private.tg_set_updated_at();
create trigger result_import_batches_updated_at before update on public.result_import_batches for each row execute function private.tg_set_updated_at();
create trigger student_results_updated_at before update on public.student_results for each row execute function private.tg_set_updated_at();
create trigger assessments_version before update on public.assessments for each row execute function private.tg_bump_version();
create trigger result_import_batches_version before update on public.result_import_batches for each row execute function private.tg_bump_version();
create trigger student_results_version before update on public.student_results for each row execute function private.tg_bump_version();
create trigger assessments_audit after insert or update or delete on public.assessments for each row execute function private.tg_audit();
create trigger result_import_batches_audit after insert or update or delete on public.result_import_batches for each row execute function private.tg_audit();
create trigger student_results_audit after insert or update or delete on public.student_results for each row execute function private.tg_audit();

-- ---------------------------------------------------------------------------
-- 4. Row Level Security and grants
-- ---------------------------------------------------------------------------
alter table public.assessments enable row level security;
alter table public.result_import_batches enable row level security;
alter table public.result_import_rows enable row level security;
alter table public.student_results enable row level security;
alter table public.student_result_history enable row level security;

-- Supabase grants new tables to anon by default; none of these are public.
revoke all on public.assessments, public.result_import_batches, public.result_import_rows,
  public.student_results, public.student_result_history from anon, public;
revoke all on private.guardian_codes, private.parent_sessions from anon, authenticated, public;

-- Assessments: ordinary staff CRUD under results:*.
select private.apply_staff_policies('assessments', 'results');
grant select, insert, update, delete on public.assessments to authenticated;

-- Batches and rows: staff read and create; every state change goes through functions.
create policy "staff read" on public.result_import_batches for select to authenticated
  using ((select public.has_permission('results:read')));
create policy "staff create" on public.result_import_batches for insert to authenticated
  with check ((select public.has_permission('results:create')) and status = 'needs_review'
              and created_by = (select auth.uid()) and reviewed_by is null and approved_by is null and published_by is null);
grant select, insert on public.result_import_batches to authenticated;
revoke update, delete on public.result_import_batches from authenticated;

create policy "staff read" on public.result_import_rows for select to authenticated
  using ((select public.has_permission('results:read')));
create policy "staff create" on public.result_import_rows for insert to authenticated
  with check ((select public.has_permission('results:create')) and status = 'pending' and matched_student_id is null
              and exists (select 1 from public.result_import_batches b where b.id = batch_id and b.status = 'needs_review'));
grant select, insert on public.result_import_rows to authenticated;
revoke update, delete on public.result_import_rows from authenticated;

-- Published results and history: read only; written by functions.
create policy "staff read" on public.student_results for select to authenticated
  using ((select public.has_permission('results:read')));
grant select on public.student_results to authenticated;
revoke insert, update, delete on public.student_results from authenticated;

create policy "staff read" on public.student_result_history for select to authenticated
  using ((select public.has_permission('results:read')));
grant select on public.student_result_history to authenticated;
revoke insert, update, delete on public.student_result_history from authenticated;

-- ---------------------------------------------------------------------------
-- 5. Staff workflow functions
-- ---------------------------------------------------------------------------
create or replace function private.require_permission(p_permission text) returns void
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.has_permission(p_permission) then
    raise exception 'You do not have permission to do this (%).', p_permission using errcode = '42501';
  end if;
end $$;

-- Grade for a percentage from the assessment's owner-defined bands ('' when none apply).
create or replace function private.grade_for(p_bands jsonb, p_percent numeric) returns text
language sql immutable set search_path = '' as $$
  select coalesce((
    select b ->> 'grade' from jsonb_array_elements(p_bands) b
    where (b ->> 'min_percent') ~ '^[0-9]+(\.[0-9]+)?$' and p_percent >= (b ->> 'min_percent')::numeric
    order by (b ->> 'min_percent')::numeric desc limit 1
  ), '')
$$;

-- Authoritative validation of every row in a batch. Safe to run repeatedly.
create or replace function private.validate_result_batch(p_batch_id uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_batch public.result_import_batches;
  v_assessment public.assessments;
  r record;
  v_errors text[];
  v_marks numeric;
  v_student public.students;
  v_bands text[];
begin
  select * into v_batch from public.result_import_batches where id = p_batch_id for update;
  if not found then raise exception 'Import batch not found.'; end if;
  if v_batch.status <> 'needs_review' then raise exception 'Only batches that need review can be validated.'; end if;
  select * into v_assessment from public.assessments where id = v_batch.assessment_id;
  if v_assessment.status <> 'active' then raise exception 'The assessment must be active to import results.'; end if;
  select coalesce(array_agg(upper(b ->> 'grade')), '{}') into v_bands from jsonb_array_elements(v_assessment.grade_bands) b;

  for r in select * from public.result_import_rows where batch_id = p_batch_id and status <> 'excluded' order by row_number loop
    v_errors := '{}';
    v_marks := null;
    v_student := null;
    select * into v_student from public.students s where s.student_code = upper(trim(r.student_code)) and s.deleted_at is null;
    if trim(r.student_code) = '' then v_errors := array_append(v_errors, 'Student code is missing');
    elsif v_student.id is null then v_errors := array_append(v_errors, 'Unknown student code');
    elsif trim(r.student_name) <> '' and lower(regexp_replace(trim(r.student_name), '\s+', ' ', 'g')) <> lower(regexp_replace(trim(v_student.full_name), '\s+', ' ', 'g')) then
      v_errors := array_append(v_errors, 'Student name does not match the student code');
    end if;
    if trim(r.marks_text) !~ '^[0-9]{1,5}(\.[0-9]{1,2})?$' then v_errors := array_append(v_errors, 'Marks must be a number');
    else
      v_marks := trim(r.marks_text)::numeric;
      if v_marks > v_assessment.total_marks then v_errors := array_append(v_errors, 'Marks exceed the maximum for this assessment'); end if;
    end if;
    if trim(r.grade) <> '' and cardinality(v_bands) > 0 and not (upper(trim(r.grade)) = any(v_bands)) then
      v_errors := array_append(v_errors, 'Grade is not in the approved scheme');
    end if;
    if v_student.id is not null and exists (select 1 from public.student_results x where x.assessment_id = v_assessment.id and x.student_id = v_student.id) then
      v_errors := array_append(v_errors, 'A result already exists for this student; use a correction');
    end if;
    update public.result_import_rows set
      matched_student_id = v_student.id,
      marks_obtained = case when cardinality(v_errors) = 0 then v_marks end,
      errors = v_errors,
      status = case when cardinality(v_errors) = 0 then 'valid' else 'invalid' end
    where id = r.id;
  end loop;

  -- The same student twice in one file: keep none until staff exclude the extra row.
  update public.result_import_rows x set status = case when x.status = 'valid' then 'duplicate' else x.status end,
    errors = array_append(x.errors, 'Student appears more than once in this file')
  where x.batch_id = p_batch_id and x.status in ('valid', 'invalid') and x.matched_student_id is not null
    and exists (select 1 from public.result_import_rows y where y.batch_id = p_batch_id and y.id <> x.id
                and y.status <> 'excluded' and y.matched_student_id = x.matched_student_id);

  update public.result_import_batches b set
    total_rows = c.total, valid_rows = c.valid, invalid_rows = c.invalid, duplicate_rows = c.duplicate, excluded_rows = c.excluded
  from (select count(*) total, count(*) filter (where status = 'valid') valid, count(*) filter (where status = 'invalid') invalid,
               count(*) filter (where status = 'duplicate') duplicate, count(*) filter (where status = 'excluded') excluded
        from public.result_import_rows where batch_id = p_batch_id) c
  where b.id = p_batch_id;
  return (select jsonb_build_object('total', total_rows, 'valid', valid_rows, 'invalid', invalid_rows,
                                    'duplicate', duplicate_rows, 'excluded', excluded_rows)
          from public.result_import_batches where id = p_batch_id);
end $$;

create or replace function public.results_validate_batch(p_batch_id uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_permission('results:create');
  return private.validate_result_batch(p_batch_id);
end $$;

create or replace function public.results_set_row_excluded(p_row_id uuid, p_excluded boolean) returns void
language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_permission('results:review');
  update public.result_import_rows r set status = case when p_excluded then 'excluded' else 'pending' end
  from public.result_import_batches b
  where r.id = p_row_id and b.id = r.batch_id and b.status = 'needs_review';
  if not found then raise exception 'Row not found or batch is no longer editable.'; end if;
end $$;

create or replace function public.results_submit_batch(p_batch_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare v_counts jsonb;
begin
  perform private.require_permission('results:review');
  v_counts := private.validate_result_batch(p_batch_id);
  if (v_counts ->> 'invalid')::int > 0 or (v_counts ->> 'duplicate')::int > 0 then
    raise exception 'Fix or exclude invalid and duplicate rows before submitting.';
  end if;
  if (v_counts ->> 'valid')::int = 0 then raise exception 'There are no valid rows to submit.'; end if;
  update public.result_import_batches set status = 'ready_for_approval', reviewed_by = auth.uid(), reviewed_at = now()
  where id = p_batch_id;
end $$;

create or replace function public.results_decide_batch(p_batch_id uuid, p_approve boolean, p_note text default null) returns void
language plpgsql security definer set search_path = '' as $$
declare v_batch public.result_import_batches;
begin
  perform private.require_permission('results:approve');
  select * into v_batch from public.result_import_batches where id = p_batch_id for update;
  if not found or v_batch.status <> 'ready_for_approval' then raise exception 'Batch is not awaiting approval.'; end if;
  -- Separation of duties: the person who uploaded the file does not approve it.
  if v_batch.created_by = auth.uid() and not public.has_permission('*') then
    raise exception 'A different staff member must approve this batch.';
  end if;
  if not p_approve and coalesce(trim(p_note), '') = '' then raise exception 'Give a reason for rejecting the batch.'; end if;
  update public.result_import_batches set
    status = case when p_approve then 'approved' else 'rejected' end,
    approved_by = auth.uid(), approved_at = now(), decision_note = nullif(trim(p_note), '')
  where id = p_batch_id;
end $$;

-- Publishes every valid row in one transaction; any conflict aborts the whole batch.
create or replace function public.results_publish_batch(p_batch_id uuid) returns int
language plpgsql security definer set search_path = '' as $$
declare
  v_batch public.result_import_batches;
  v_assessment public.assessments;
  v_count int;
begin
  perform private.require_permission('results:publish');
  select * into v_batch from public.result_import_batches where id = p_batch_id for update;
  if not found or v_batch.status <> 'approved' then raise exception 'Only approved batches can be published.'; end if;
  select * into v_assessment from public.assessments where id = v_batch.assessment_id;
  insert into public.student_results (assessment_id, student_id, marks_obtained, total_marks, grade, teacher_remarks,
                                      batch_id, published_by, published_at)
  select v_assessment.id, r.matched_student_id, r.marks_obtained, v_assessment.total_marks,
         coalesce(nullif(upper(trim(r.grade)), ''), private.grade_for(v_assessment.grade_bands, round(r.marks_obtained * 100 / v_assessment.total_marks, 2))),
         trim(r.teacher_remarks), v_batch.id, auth.uid(), now()
  from public.result_import_rows r
  where r.batch_id = p_batch_id and r.status = 'valid';
  get diagnostics v_count = row_count;
  update public.result_import_batches set status = 'published', published_by = auth.uid(), published_at = now() where id = p_batch_id;
  return v_count;
end $$;

create or replace function public.results_cancel_batch(p_batch_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_permission('results:create');
  update public.result_import_batches set status = 'cancelled'
  where id = p_batch_id and status in ('needs_review', 'ready_for_approval');
  if not found then raise exception 'Only unpublished batches awaiting review or approval can be cancelled.'; end if;
end $$;

-- Controlled correction of a published result; the previous version is kept.
create or replace function public.results_correct(p_result_id uuid, p_marks numeric, p_grade text, p_remarks text, p_reason text) returns void
language plpgsql security definer set search_path = '' as $$
declare v_result public.student_results;
begin
  perform private.require_permission('results:update');
  if coalesce(char_length(trim(p_reason)), 0) < 3 then raise exception 'Give a reason for the correction.'; end if;
  select * into v_result from public.student_results where id = p_result_id for update;
  if not found then raise exception 'Result not found.'; end if;
  insert into public.student_result_history (result_id, version, snapshot, reason, changed_by)
  values (v_result.id, v_result.version, to_jsonb(v_result), trim(p_reason), auth.uid());
  update public.student_results set marks_obtained = p_marks, grade = upper(coalesce(trim(p_grade), '')),
    teacher_remarks = coalesce(trim(p_remarks), '')
  where id = p_result_id;
end $$;

create or replace function public.results_set_withdrawn(p_result_id uuid, p_withdrawn boolean, p_reason text) returns void
language plpgsql security definer set search_path = '' as $$
declare v_result public.student_results;
begin
  perform private.require_permission('results:update');
  if coalesce(char_length(trim(p_reason)), 0) < 3 then raise exception 'Give a reason.'; end if;
  select * into v_result from public.student_results where id = p_result_id for update;
  if not found then raise exception 'Result not found.'; end if;
  insert into public.student_result_history (result_id, version, snapshot, reason, changed_by)
  values (v_result.id, v_result.version, to_jsonb(v_result), trim(p_reason), auth.uid());
  update public.student_results set status = case when p_withdrawn then 'withdrawn' else 'published' end where id = p_result_id;
end $$;

-- Links an existing certificate of the same student to a result.
create or replace function public.results_link_certificate(p_result_id uuid, p_certificate_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_permission('results:update');
  perform private.require_permission('certificates:update');
  if p_certificate_id is not null and not exists (
    select 1 from public.certificates c join public.student_results r on r.student_id = c.student_id
    where c.id = p_certificate_id and r.id = p_result_id) then
    raise exception 'The certificate must belong to the same student.';
  end if;
  update public.student_results set certificate_id = p_certificate_id where id = p_result_id;
  if not found then raise exception 'Result not found.'; end if;
end $$;

-- ---------------------------------------------------------------------------
-- 6. Parent access codes and sessions
-- ---------------------------------------------------------------------------
-- Issues (or replaces) a guardian's access code and ends their sessions.
-- The plain code is returned once and never stored.
create or replace function public.guardian_issue_code(p_guardian_id uuid) returns text
language plpgsql security definer set search_path = '' as $$
declare
  v_alphabet constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  v_bytes bytea := extensions.gen_random_bytes(12);
  v_code text := '';
  i int;
begin
  perform private.require_permission('guardians:update');
  if not exists (select 1 from public.guardians where id = p_guardian_id and deleted_at is null and client_id is not null) then
    raise exception 'Add a Client ID to this guardian before issuing a code.';
  end if;
  for i in 0..11 loop
    v_code := v_code || substr(v_alphabet, (get_byte(v_bytes, i) % length(v_alphabet)) + 1, 1);
  end loop;
  insert into private.guardian_codes (guardian_id, code_hash, issued_at, issued_by, failed_attempts, locked_until)
  values (p_guardian_id, extensions.crypt(v_code, extensions.gen_salt('bf', 10)), now(), auth.uid(), 0, null)
  on conflict (guardian_id) do update set code_hash = excluded.code_hash, issued_at = now(), issued_by = auth.uid(),
    failed_attempts = 0, locked_until = null;
  update private.parent_sessions set revoked_at = now() where guardian_id = p_guardian_id and revoked_at is null;
  insert into public.audit_logs (actor_id, action, entity_type, entity_id, summary)
  values (auth.uid(), 'issue_code', 'guardians', p_guardian_id::text, 'Parent access code issued');
  return substr(v_code, 1, 4) || '-' || substr(v_code, 5, 4) || '-' || substr(v_code, 9, 4);
end $$;

-- Returns {"ok": true, "token": …} or {"ok": false}. Unknown Client ID, wrong code and
-- lockout all give the same answer. Failures are counted (not raised) so they persist.
create or replace function public.parent_sign_in(p_client_id text, p_code text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_client text := lower(trim(coalesce(p_client_id, '')));
  v_code text := upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
  v_guardian_id uuid;
  v_hash text;
  v_locked timestamptz;
  v_token text;
begin
  if not private.hit_rate_limit('parent-ip:' || private.request_ip_hash(), 30, interval '15 minutes')
     or not private.hit_rate_limit('parent-id:' || v_client, 10, interval '15 minutes') then
    return jsonb_build_object('ok', false);
  end if;
  select g.id, c.code_hash, c.locked_until into v_guardian_id, v_hash, v_locked
  from public.guardians g join private.guardian_codes c on c.guardian_id = g.id
  where lower(g.client_id) = v_client and g.deleted_at is null;

  if v_guardian_id is null then
    perform extensions.crypt(v_code, '$2a$10$abcdefghijklmnopqrstuu');  -- similar work for unknown IDs
    return jsonb_build_object('ok', false);
  end if;
  if v_locked is not null and v_locked > now() then return jsonb_build_object('ok', false); end if;
  if char_length(v_code) <> 12 or extensions.crypt(v_code, v_hash) <> v_hash then
    update private.guardian_codes set
      failed_attempts = case when failed_attempts + 1 >= 5 then 0 else failed_attempts + 1 end,
      locked_until = case when failed_attempts + 1 >= 5 then now() + interval '15 minutes' else locked_until end
    where guardian_id = v_guardian_id;
    return jsonb_build_object('ok', false);
  end if;

  update private.guardian_codes set failed_attempts = 0, locked_until = null where guardian_id = v_guardian_id;
  v_token := encode(extensions.gen_random_bytes(32), 'hex');
  insert into private.parent_sessions (token_hash, guardian_id, expires_at)
  values (encode(extensions.digest(v_token, 'sha256'), 'hex'), v_guardian_id, now() + interval '8 hours');
  return jsonb_build_object('ok', true, 'token', v_token);
end $$;

-- Active guardian for a session token (30 minutes idle, 8 hours absolute), or null.
create or replace function private.parent_guardian(p_token text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_guardian uuid;
begin
  if coalesce(p_token, '') !~ '^[0-9a-f]{64}$' then return null; end if;
  update private.parent_sessions s set last_seen_at = now()
  from public.guardians g
  where s.token_hash = encode(extensions.digest(p_token, 'sha256'), 'hex') and s.revoked_at is null
    and s.expires_at > now() and s.last_seen_at > now() - interval '30 minutes'
    and g.id = s.guardian_id and g.deleted_at is null
  returning s.guardian_id into v_guardian;
  return v_guardian;
end $$;

-- Linked students with their published results and issued certificates only.
create or replace function public.parent_results(p_token text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_guardian uuid := private.parent_guardian(p_token);
begin
  if v_guardian is null then return null; end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', s.id,
      'name', s.full_name,
      'results', coalesce((
        select jsonb_agg(jsonb_build_object(
          'id', r.id, 'assessment', a.title, 'period', a.period_label, 'date', a.assessment_date,
          'course', co.title, 'marks', r.marks_obtained, 'total', r.total_marks, 'percentage', r.percentage,
          'grade', r.grade, 'remarks', r.teacher_remarks, 'published_at', r.published_at,
          'certificate_id', case when ce.status = 'issued' then ce.id end) order by a.assessment_date desc)
        from public.student_results r
        join public.assessments a on a.id = r.assessment_id
        left join public.courses co on co.id = a.course_id
        left join public.certificates ce on ce.id = r.certificate_id
        where r.student_id = s.id and r.status = 'published'), '[]'::jsonb),
      'certificates', coalesce((
        select jsonb_agg(jsonb_build_object('id', c.id, 'number', c.number, 'title', c.title, 'issued_on', c.issued_on)
                         order by c.issued_on desc)
        from public.certificates c where c.student_id = s.id and c.status = 'issued'), '[]'::jsonb)
    ) order by s.full_name)
    from public.student_guardians sg
    join public.students s on s.id = sg.student_id and s.deleted_at is null
    where sg.guardian_id = v_guardian), '[]'::jsonb);
end $$;

create or replace function public.parent_certificate(p_token text, p_certificate_id uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_guardian uuid := private.parent_guardian(p_token);
begin
  if v_guardian is null then return null; end if;
  return (
    select jsonb_build_object('number', c.number, 'student', s.full_name, 'title', c.title, 'achievement', c.achievement,
                              'course', co.title, 'issued_on', c.issued_on, 'signed_by', c.signed_by)
    from public.certificates c
    join public.students s on s.id = c.student_id and s.deleted_at is null
    join public.student_guardians sg on sg.student_id = s.id and sg.guardian_id = v_guardian
    left join public.courses co on co.id = c.course_id
    where c.id = p_certificate_id and c.status = 'issued');
end $$;

create or replace function public.parent_sign_out(p_token text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if coalesce(p_token, '') !~ '^[0-9a-f]{64}$' then return; end if;
  update private.parent_sessions set revoked_at = now()
  where token_hash = encode(extensions.digest(p_token, 'sha256'), 'hex') and revoked_at is null;
end $$;

-- ---------------------------------------------------------------------------
-- 7. Function grants (new functions are executable by PUBLIC by default)
-- ---------------------------------------------------------------------------
revoke execute on function
  private.require_permission(text), private.grade_for(jsonb, numeric), private.parent_guardian(text), private.validate_result_batch(uuid),
  public.results_validate_batch(uuid), public.results_set_row_excluded(uuid, boolean), public.results_submit_batch(uuid),
  public.results_decide_batch(uuid, boolean, text), public.results_publish_batch(uuid), public.results_cancel_batch(uuid),
  public.results_correct(uuid, numeric, text, text, text), public.results_set_withdrawn(uuid, boolean, text),
  public.results_link_certificate(uuid, uuid), public.guardian_issue_code(uuid),
  public.parent_sign_in(text, text), public.parent_results(text), public.parent_certificate(text, uuid), public.parent_sign_out(text)
from public, anon, authenticated;

grant execute on function
  public.results_validate_batch(uuid), public.results_set_row_excluded(uuid, boolean), public.results_submit_batch(uuid),
  public.results_decide_batch(uuid, boolean, text), public.results_publish_batch(uuid), public.results_cancel_batch(uuid),
  public.results_correct(uuid, numeric, text, text, text), public.results_set_withdrawn(uuid, boolean, text),
  public.results_link_certificate(uuid, uuid), public.guardian_issue_code(uuid)
to authenticated;

grant execute on function public.parent_sign_in(text, text), public.parent_results(text),
  public.parent_certificate(text, uuid), public.parent_sign_out(text)
to anon, authenticated;
