-- Monthly report details for the e-DMC and syllabus card. Additive only.
-- details = {
--   "scores":     {"adab": 0-10, "qaida": …, "dua": …, "tajweed": …, "engagement": …, "outcome": …}  (each optional)
--   "attendance": {"held": 0-62, "attended": 0-held}                                                    (optional)
--   "syllabus":   {"level": text≤120, "covered": text≤1000, "memorised": text≤600}                      (optional)
-- }
-- Details travel with the report through review and are visible to parents only in the published snapshot.

alter table public.monthly_reports add column if not exists details jsonb not null default '{}'::jsonb
  check (jsonb_typeof(details) = 'object');

-- Validates and normalises a details object; raises a readable error on bad input.
create or replace function private.progress_details(p jsonb) returns jsonb
language plpgsql immutable set search_path = '' as $$
declare
  v_scores jsonb := '{}'::jsonb;
  v_key text;
  v_raw text;
  v_n numeric;
  v_held int; v_att int;
  v_text text;
  v_syl jsonb := '{}'::jsonb;
  v_limit int;
begin
  if p is null or jsonb_typeof(p) <> 'object' then return '{}'::jsonb; end if;
  foreach v_key in array array['adab', 'qaida', 'dua', 'tajweed', 'engagement', 'outcome'] loop
    v_raw := nullif(trim(coalesce(p -> 'scores' ->> v_key, '')), '');
    if v_raw is not null then
      if v_raw !~ '^[0-9]{1,2}(\.[05])?$' then raise exception 'Marks for % must be a number from 0 to 10.', v_key; end if;
      v_n := v_raw::numeric;
      if v_n > 10 then raise exception 'Marks for % must be a number from 0 to 10.', v_key; end if;
      v_scores := v_scores || jsonb_build_object(v_key, v_n);
    end if;
  end loop;

  v_raw := nullif(trim(coalesce(p -> 'attendance' ->> 'held', '')), '');
  if v_raw is not null then
    if v_raw !~ '^[0-9]{1,2}$' then raise exception 'Classes held must be a whole number from 0 to 62.'; end if;
    if v_raw::int > 62 then raise exception 'Classes held must be a whole number from 0 to 62.'; end if;
    v_held := v_raw::int;
  end if;
  v_raw := nullif(trim(coalesce(p -> 'attendance' ->> 'attended', '')), '');
  if v_raw is not null then
    if v_raw !~ '^[0-9]{1,2}$' then raise exception 'Classes attended must be a whole number.'; end if;
    v_att := v_raw::int;
    if v_held is null then raise exception 'Enter the classes held before the classes attended.'; end if;
    if v_att > v_held then raise exception 'Classes attended cannot be more than classes held.'; end if;
  end if;

  foreach v_key in array array['level', 'covered', 'memorised'] loop
    v_text := trim(coalesce(p -> 'syllabus' ->> v_key, ''));
    v_limit := case v_key when 'level' then 120 when 'covered' then 1000 else 600 end;
    if char_length(v_text) > v_limit then
      raise exception 'The syllabus field "%" is too long.', v_key;
    end if;
    if v_text <> '' then v_syl := v_syl || jsonb_build_object(v_key, v_text); end if;
  end loop;

  return jsonb_strip_nulls(jsonb_build_object(
    'scores', nullif(v_scores, '{}'::jsonb),
    'attendance', case when v_held is null then null else jsonb_build_object('held', v_held, 'attended', v_att) end,
    'syllabus', nullif(v_syl, '{}'::jsonb)));
end $$;

create or replace function private.progress_snapshot(r public.monthly_reports) returns jsonb
language sql stable set search_path = '' as $$
  select jsonb_build_object('adab', r.adab, 'qaida', r.qaida, 'dua', r.dua, 'tajweed', r.tajweed,
                            'engagement', r.engagement, 'outcome', r.outcome, 'remarks', r.remarks,
                            'learning_plan', r.learning_plan, 'details', r.details, 'period', r.period, 'status', r.status,
                            'teacher', (select p.full_name from public.profiles p where p.id = r.teacher_profile_id))
$$;

drop function public.progress_save(uuid, date, jsonb, text, boolean, text);
create or replace function public.progress_save(p_student_id uuid, p_period date, p_ratings jsonb, p_remarks text, p_submit boolean,
                                                p_plan text default null, p_details jsonb default null)
returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_period date := date_trunc('month', p_period)::date;
  v_reviewer boolean := public.has_permission('progress:review');
  v_row public.monthly_reports;
  v_vals text[];
  v_key text;
  v_remarks text := left(trim(coalesce(p_remarks, '')), 1000);
  v_details jsonb := case when p_details is null then null else private.progress_details(p_details) end;
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
                                           status, submitted_at, change_note, updated_by, learning_plan, details)
  values (p_student_id, v_period, case when v_reviewer and not public.has_permission('progress:submit') then null else auth.uid() end,
          v_vals[1], v_vals[2], v_vals[3], v_vals[4], v_vals[5], v_vals[6], v_remarks,
          case when p_submit then 'submitted' else 'draft' end, case when p_submit then now() end, null, auth.uid(),
          left(trim(coalesce(p_plan, '')), 2000), coalesce(v_details, '{}'::jsonb))
  on conflict (student_id, period) do update set
    teacher_profile_id = coalesce(case when v_reviewer then m.teacher_profile_id else auth.uid() end, m.teacher_profile_id),
    learning_plan = case when p_plan is null then m.learning_plan else excluded.learning_plan end,
    details = case when v_details is null then m.details else excluded.details end,
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

drop function public.progress_admin_update(uuid, jsonb, text, text, text);
create or replace function public.progress_admin_update(p_report_id uuid, p_ratings jsonb, p_remarks text, p_reason text,
                                                        p_plan text default null, p_details jsonb default null)
returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_row public.monthly_reports;
  v_vals text[];
  v_key text;
  v_details jsonb := case when p_details is null then null else private.progress_details(p_details) end;
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
  update public.monthly_reports set
    learning_plan = case when p_plan is null then learning_plan else left(trim(p_plan), 2000) end,
    details = coalesce(v_details, details),
    adab = v_vals[1], qaida = v_vals[2], dua = v_vals[3], tajweed = v_vals[4],
    engagement = v_vals[5], outcome = v_vals[6], remarks = left(trim(coalesce(p_remarks, '')), 1000),
    status = case when status = 'published' then 'submitted' else status end, updated_by = auth.uid()
  where id = p_report_id;
end $$;

revoke execute on function private.progress_details(jsonb) from public, anon, authenticated;
revoke all on function public.progress_save(uuid, date, jsonb, text, boolean, text, jsonb),
  public.progress_admin_update(uuid, jsonb, text, text, text, jsonb) from public, anon;
grant execute on function public.progress_save(uuid, date, jsonb, text, boolean, text, jsonb),
  public.progress_admin_update(uuid, jsonb, text, text, text, jsonb) to authenticated;
