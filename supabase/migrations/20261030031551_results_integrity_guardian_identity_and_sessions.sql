-- Follow-up for the already installed results portal. Existing results and credentials are preserved.
create unique index guardians_client_id_ci on public.guardians (lower(client_id)) where client_id is not null;
alter table private.guardian_codes enable row level security;
alter table private.parent_sessions enable row level security;


create or replace function private.validate_assessment() returns trigger
language plpgsql set search_path = '' as $$
declare b jsonb; v_grades text[] := '{}'; v_thresholds numeric[] := '{}'; v_threshold numeric;
begin
  if jsonb_typeof(new.grade_bands) <> 'array' or jsonb_array_length(new.grade_bands) > 30 then
    raise exception 'Grade bands must be an array of at most 30 grades.';
  end if;
  for b in select value from jsonb_array_elements(new.grade_bands) loop
    if jsonb_typeof(b) <> 'object' or coalesce(b->>'grade','') !~ '^[A-Z0-9+*-]{1,6}$'
       or jsonb_typeof(b->'min_percent') is distinct from 'number'
       or char_length(coalesce(b->>'label','')) > 40 then
      raise exception 'Each grade needs an uppercase code, a numeric minimum percentage and a short label.';
    end if;
    v_threshold := (b->>'min_percent')::numeric;
    if v_threshold < 0 or v_threshold > 100 or b->>'grade' = any(v_grades) or v_threshold = any(v_thresholds) then
      raise exception 'Grade codes and minimum percentages must be unique, between 0 and 100.';
    end if;
    v_grades := array_append(v_grades, b->>'grade');
    v_thresholds := array_append(v_thresholds, v_threshold);
  end loop;
  if tg_op = 'UPDATE' and
     row(new.code, new.title, new.course_id, new.assessment_date, new.period_label, new.total_marks, new.grade_bands)
     is distinct from row(old.code, old.title, old.course_id, old.assessment_date, old.period_label, old.total_marks, old.grade_bands)
     and exists (select 1 from public.result_import_batches where assessment_id = old.id and status in ('ready_for_approval','approved','published')) then
    raise exception 'Results are already submitted. Keep this assessment unchanged and create a new assessment instead.';
  end if;
  return new;
end $$;
create trigger assessments_validate before insert or update on public.assessments
for each row execute function private.validate_assessment();

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
  select * into v_assessment from public.assessments where id = v_batch.assessment_id for share;
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
  select * into v_assessment from public.assessments where id = v_batch.assessment_id for share;
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

create or replace function public.parent_session_active(p_token text) returns boolean
language sql security definer set search_path = '' as $$
  select private.parent_guardian(p_token) is not null;
$$;

revoke execute on function public.parent_session_active(text), private.validate_assessment() from public, anon, authenticated;
grant execute on function public.parent_session_active(text) to anon, authenticated;
