-- Teacher form/client identity and parent-owned report-card identity. No student data is rewritten.
drop function public.progress_my_students(date);
create or replace function public.progress_my_students(p_period date)
returns table (student_id uuid, full_name text, student_code text, group_label text, report_id uuid, status text, has_published boolean, clients jsonb)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not (public.has_permission('progress:submit') or public.has_permission('progress:review')) then
    raise exception 'You do not have permission to do this (progress:submit).' using errcode = '42501';
  end if;
  return query
    select s.id, s.full_name, s.student_code, min(a.group_label), m.id, m.status, m.published is not null,
      coalesce((select jsonb_agg(jsonb_build_object('client_id', q.client_id, 'client_name', q.full_name)) from (
        select g.client_id, g.full_name from public.student_guardians sg
        join public.guardians g on g.id = sg.guardian_id and g.deleted_at is null and g.client_id is not null
        where sg.student_id = s.id order by sg.is_primary desc, g.created_at, g.id limit 1
      ) q), '[]'::jsonb)
    from public.progress_assignments a
    join public.students s on s.id = a.student_id and s.deleted_at is null
    left join public.monthly_reports m on m.student_id = s.id and m.period = date_trunc('month', p_period)::date
    where a.teacher_profile_id = auth.uid() or public.has_permission('progress:review')
    group by s.id, s.full_name, s.student_code, m.id, m.status, m.published
    order by s.full_name;
end $$;
revoke all on function public.progress_my_students(date) from public, anon;
grant execute on function public.progress_my_students(date) to authenticated;

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

  if p_submit and not exists (
    select 1 from public.student_guardians sg join public.guardians g on g.id = sg.guardian_id
    where sg.student_id = p_student_id and g.deleted_at is null and g.client_id is not null
  ) then raise exception 'Link a Client ID and client name to this student before submitting.'; end if;

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
create or replace function public.parent_progress(p_token text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_guardian uuid := private.parent_guardian(p_token);
begin
  if v_guardian is null then return null; end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object('student_id', s.id, 'client_id', (select g.client_id from public.guardians g where g.id = v_guardian), 'client_name', (select g.full_name from public.guardians g where g.id = v_guardian), 'name', s.full_name, 'code', s.student_code,
      'reports', coalesce((
        select jsonb_agg(m.published || jsonb_build_object('id', m.id, 'version', m.published_version, 'published_at', m.published_at,
                           'student_of_month', exists (select 1 from public.student_of_month w where w.student_id = s.id and w.period = m.period))
                         order by m.period desc)
        from public.monthly_reports m where m.student_id = s.id and m.published is not null), '[]'::jsonb)
    ) order by s.full_name)
    from public.student_guardians sg join public.students s on s.id = sg.student_id and s.deleted_at is null
    where sg.guardian_id = v_guardian), '[]'::jsonb);
end $$;
