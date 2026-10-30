-- Parent management and recovery use the existing Client ID/access-code system.
-- Learning plans share the report's existing review/published snapshot boundary.
alter table public.monthly_reports add column learning_plan text not null default '' check (char_length(learning_plan)<=2000);
create or replace function private.progress_snapshot(r public.monthly_reports) returns jsonb
language sql stable set search_path = '' as $$
  select jsonb_build_object('adab', r.adab, 'qaida', r.qaida, 'dua', r.dua, 'tajweed', r.tajweed,
                            'engagement', r.engagement, 'outcome', r.outcome, 'remarks', r.remarks,
                            'learning_plan', r.learning_plan, 'period', r.period, 'status', r.status,
                            'teacher', (select p.full_name from public.profiles p where p.id = r.teacher_profile_id))
$$;
drop function public.progress_save(uuid,date,jsonb,text,boolean);
create or replace function public.progress_save(p_student_id uuid, p_period date, p_ratings jsonb, p_remarks text, p_submit boolean, p_plan text default null)
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

  if p_submit and not exists (
    select 1 from public.student_guardians sg join public.guardians g on g.id = sg.guardian_id
    where sg.student_id = p_student_id and g.deleted_at is null and g.client_id is not null
  ) then raise exception 'Link a Client ID and client name to this student before submitting.'; end if;

  select * into v_row from public.monthly_reports where student_id = p_student_id and period = v_period for update;
  if found and v_row.status = 'submitted' and not v_reviewer then
    raise exception 'This report is waiting for review. Ask the admin to request changes if it needs editing.';
  end if;

  insert into public.monthly_reports as m (student_id, period, teacher_profile_id, adab, qaida, dua, tajweed, engagement, outcome, remarks,
                                           status, submitted_at, change_note, updated_by, learning_plan)
  values (p_student_id, v_period, case when v_reviewer and not public.has_permission('progress:submit') then null else auth.uid() end,
          v_vals[1], v_vals[2], v_vals[3], v_vals[4], v_vals[5], v_vals[6], v_remarks,
          case when p_submit then 'submitted' else 'draft' end, case when p_submit then now() end, null, auth.uid(), left(trim(coalesce(p_plan, '')),2000))
  on conflict (student_id, period) do update set
    teacher_profile_id = coalesce(case when v_reviewer then m.teacher_profile_id else auth.uid() end, m.teacher_profile_id),
    learning_plan = case when p_plan is null then m.learning_plan else excluded.learning_plan end,
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
drop function public.progress_admin_update(uuid,jsonb,text,text);
create or replace function public.progress_admin_update(p_report_id uuid, p_ratings jsonb, p_remarks text, p_reason text, p_plan text default null)
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
  update public.monthly_reports set learning_plan = case when p_plan is null then learning_plan else left(trim(p_plan),2000) end, adab = v_vals[1], qaida = v_vals[2], dua = v_vals[3], tajweed = v_vals[4],
    engagement = v_vals[5], outcome = v_vals[6], remarks = left(trim(coalesce(p_remarks, '')), 1000),
    status = case when status = 'published' then 'submitted' else status end, updated_by = auth.uid()
  where id = p_report_id;
end $$;
revoke all on function public.progress_save(uuid,date,jsonb,text,boolean,text), public.progress_admin_update(uuid,jsonb,text,text,text) from public,anon;
grant execute on function public.progress_save(uuid,date,jsonb,text,boolean,text), public.progress_admin_update(uuid,jsonb,text,text,text) to authenticated;

create table private.parent_account_creations (
 request_id uuid primary key, guardian_id uuid not null references public.guardians(id) on delete cascade,
 created_by uuid references public.profiles(id), created_at timestamptz not null default now()
);
alter table private.parent_account_creations enable row level security;
revoke all on private.parent_account_creations from public,anon,authenticated;

create table public.parent_access_requests (
 id uuid primary key default gen_random_uuid(), guardian_id uuid not null references public.guardians(id) on delete cascade,
 kind text not null check(kind in ('activation','recovery')),
 status text not null default 'pending' check(status in ('pending','resolved')),
 requested_at timestamptz not null default now(), resolved_at timestamptz, resolved_by uuid references public.profiles(id)
);
create unique index parent_access_pending_idx on public.parent_access_requests(guardian_id) where status='pending';
create index parent_access_resolved_by_idx on public.parent_access_requests(resolved_by);
alter table public.parent_access_requests enable row level security;
revoke all on public.parent_access_requests from public,anon,authenticated;
grant select on public.parent_access_requests to authenticated;
create policy "parent access staff read" on public.parent_access_requests for select to authenticated
 using ((select public.has_permission('guardians:read')));

-- No raw credential is stored in this idempotency registry; a retried successful
-- create returns the existing account, without disclosing the one-time code again.
create function public.guardian_create_portal_account(p_request_id uuid,p_name text,p_student_id uuid,p_email text default null,p_phone text default null,p_client_id text default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare v_guardian public.guardians; v_existing private.parent_account_creations; v_code text; v_client text;
begin
 perform private.require_permission('guardians:create');
 perform private.require_permission('guardians:update');
 if p_request_id is null then raise exception 'A creation reference is required.'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_request_id::text,0));
 select * into v_existing from private.parent_account_creations where request_id=p_request_id;
 if found then
   if v_existing.created_by is distinct from auth.uid() then raise exception 'Creation reference unavailable.' using errcode='42501'; end if;
   select * into v_guardian from public.guardians where id=v_existing.guardian_id and deleted_at is null;
   if not found then raise exception 'This parent account is no longer available.'; end if;
   return jsonb_build_object('guardian',jsonb_build_object('id',v_guardian.id,'full_name',v_guardian.full_name,'client_id',v_guardian.client_id),'code',null,'created',false);
 end if;
 if char_length(trim(coalesce(p_name,''))) not between 2 and 160 then raise exception 'Enter the parent name (2–160 characters).'; end if;
 if not exists(select 1 from public.students where id=p_student_id and deleted_at is null) then raise exception 'Choose an existing student.'; end if;
 if char_length(coalesce(p_email,''))>254 or char_length(coalesce(p_phone,''))>40 then raise exception 'Contact details are too long.'; end if;
 if nullif(trim(coalesce(p_email,'')),'') is null and nullif(trim(coalesce(p_phone,'')),'') is null then raise exception 'A registered email or phone is required for recovery.'; end if;
 v_client:=coalesce(nullif(trim(p_client_id),''),'OQC-P-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,12)));
 if v_client !~ '^[A-Za-z0-9][A-Za-z0-9._-]{2,63}$' then raise exception 'Client ID format is not valid.'; end if;
 insert into public.guardians(full_name,relationship,email,phone,client_id)
 values(trim(p_name),'Parent',nullif(lower(trim(p_email)),''),nullif(trim(p_phone),''),v_client) returning * into v_guardian;
 insert into public.student_guardians(student_id,guardian_id) values(p_student_id,v_guardian.id);
 v_code:=public.guardian_issue_code(v_guardian.id);
 insert into private.parent_account_creations(request_id,guardian_id,created_by) values(p_request_id,v_guardian.id,auth.uid());
 return jsonb_build_object('guardian',jsonb_build_object('id',v_guardian.id,'full_name',v_guardian.full_name,'client_id',v_guardian.client_id),'code',v_code,'created',true);
end $$;
revoke all on function public.guardian_create_portal_account(uuid,text,uuid,text,text,text) from public,anon;
grant execute on function public.guardian_create_portal_account(uuid,text,uuid,text,text,text) to authenticated;

-- Public callers receive the same void acknowledgement for matching/unknown
-- details. Matching contact is a request filter, not proof of identity: only
-- staff can rotate credentials and deliver them through the verified channel.
create function public.parent_request_access(p_client_id text,p_contact text,p_kind text default 'recovery') returns void
language plpgsql security definer set search_path='' as $$
declare v_guardian uuid; v_contact text:=lower(trim(coalesce(p_contact,'')));
begin
 if p_kind is null or p_kind not in ('activation','recovery') or char_length(coalesce(p_client_id,''))>64 or char_length(v_contact)>254 then return; end if;
 if char_length(v_contact)<5 then return; end if;
 select g.id into v_guardian from public.guardians g where lower(g.client_id)=lower(trim(p_client_id)) and g.deleted_at is null and
 ((g.email is not null and lower(trim(g.email))=v_contact) or
 (g.phone is not null and char_length(regexp_replace(v_contact,'[^0-9]','','g'))>=7 and regexp_replace(g.phone,'[^0-9]','','g')=regexp_replace(v_contact,'[^0-9]','','g')));
 if v_guardian is null then return; end if;
 perform pg_advisory_xact_lock(hashtextextended(v_guardian::text,1));
 if exists(select 1 from public.parent_access_requests where guardian_id=v_guardian and requested_at>now()-interval '15 minutes') then return; end if;
 insert into public.parent_access_requests(guardian_id,kind) values(v_guardian,p_kind) on conflict do nothing;
end $$;
revoke all on function public.parent_request_access(text,text,text) from public;
grant execute on function public.parent_request_access(text,text,text) to anon,authenticated;

create function public.guardian_resolve_access_request(p_request_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare r public.parent_access_requests; g public.guardians; c text;
begin
 perform private.require_permission('guardians:update');
 select * into r from public.parent_access_requests where id=p_request_id for update;
 if not found or r.status<>'pending' then raise exception 'This request is no longer pending.'; end if;
 select * into g from public.guardians where id=r.guardian_id and deleted_at is null;
 if not found then raise exception 'Parent account not available.'; end if;
 c:=public.guardian_issue_code(g.id);
 update public.parent_access_requests set status='resolved',resolved_at=now(),resolved_by=auth.uid() where id=r.id;
 return jsonb_build_object('guardian',jsonb_build_object('id',g.id,'full_name',g.full_name,'client_id',g.client_id),'code',c);
end $$;
revoke all on function public.guardian_resolve_access_request(uuid) from public,anon;
grant execute on function public.guardian_resolve_access_request(uuid) to authenticated;
notify pgrst,'reload schema';
