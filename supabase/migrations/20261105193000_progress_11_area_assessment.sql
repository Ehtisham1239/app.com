-- Add the 11-area monthly assessment from OQC_Monthly_Assessment_Prototype.
-- Additive JSONB extension: historical six-dimension ratings and published snapshots
-- remain unchanged. The new selector wording is provisional pending Academic approval.

create or replace function private.progress_details(p jsonb) returns jsonb
language plpgsql immutable set search_path = '' as $$
declare
  v_scores jsonb := '{}'::jsonb;
  v_areas jsonb := '{}'::jsonb;
  v_key text;
  v_raw text;
  v_n numeric;
  v_held int; v_att int;
  v_text text;
  v_syl jsonb := '{}'::jsonb;
  v_performance jsonb := '{}'::jsonb;
  v_item jsonb;
  v_effort text;
  v_standard text;
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
    if v_raw !~ '^[0-9]{1,2}$' or v_raw::int > 62 then raise exception 'Classes held must be a whole number from 0 to 62.'; end if;
    v_held := v_raw::int;
  end if;
  v_raw := nullif(trim(coalesce(p -> 'attendance' ->> 'attended', '')), '');
  if v_raw is not null then
    if v_raw !~ '^[0-9]{1,2}$' then raise exception 'Classes attended must be a whole number.'; end if;
    v_att := v_raw::int;
    if v_held is null then raise exception 'Enter the classes held before the classes attended.'; end if;
    if v_att > v_held then raise exception 'Classes attended cannot be more than classes held.'; end if;
  end if;

  foreach v_key in array array['stage', 'level', 'covered', 'memorised', 'lessons_completed'] loop
    v_text := trim(coalesce(p -> 'syllabus' ->> v_key, ''));
    v_limit := case v_key when 'stage' then 40 when 'level' then 120 when 'covered' then 1000 when 'lessons_completed' then 100 else 600 end;
    if char_length(v_text) > v_limit then raise exception 'The syllabus field "%" is too long.', v_key; end if;
    if v_text <> '' then v_syl := v_syl || jsonb_build_object(v_key, v_text); end if;
  end loop;

  foreach v_key in array array['overall', 'improvement_targets', 'personal_development'] loop
    v_text := trim(coalesce(p -> 'performance' ->> v_key, ''));
    v_limit := case v_key when 'overall' then 300 when 'improvement_targets' then 1000 else 500 end;
    if char_length(v_text) > v_limit then raise exception 'Performance field % must be % characters or fewer.', v_key, v_limit; end if;
    if v_text <> '' then v_performance := v_performance || jsonb_build_object(v_key, v_text); end if;
  end loop;

  foreach v_key in array array[
    'qaida_reading', 'tajweed', 'makharij', 'fluency', 'hifz_revision',
    'duas', 'daily_sunnah', 'surahs', 'hadith', 'namaz', 'islamic_knowledge'
  ] loop
    v_item := p -> 'assessment_areas' -> v_key;
    if v_item is null then continue; end if;
    if jsonb_typeof(v_item) <> 'object' then raise exception 'Assessment area % must be an object.', v_key; end if;
    v_text := trim(coalesce(v_item ->> 'summary', ''));
    if char_length(v_text) > 500 then raise exception 'Assessment summary for % must be 500 characters or fewer.', v_key; end if;
    v_effort := nullif(trim(coalesce(v_item ->> 'effort', '')), '');
    if v_effort is not null and v_effort not in ('excellent', 'good', 'satisfactory', 'needs_improvement', 'not_applicable') then
      raise exception 'Invalid effort rating for %.', v_key;
    end if;
    v_standard := nullif(trim(coalesce(v_item ->> 'standard', '')), '');
    if v_standard is not null and v_standard not in ('above_expected', 'at_expected', 'working_towards', 'not_applicable') then
      raise exception 'Invalid course standard for %.', v_key;
    end if;
    v_areas := v_areas || jsonb_build_object(v_key, jsonb_strip_nulls(jsonb_build_object(
      'summary', nullif(v_text, ''), 'effort', v_effort, 'standard', v_standard
    )));
  end loop;

  return jsonb_strip_nulls(jsonb_build_object(
    'scores', nullif(v_scores, '{}'::jsonb),
    'attendance', case when v_held is null then null else jsonb_build_object('held', v_held, 'attended', v_att) end,
    'syllabus', nullif(v_syl, '{}'::jsonb),
    'performance', nullif(v_performance, '{}'::jsonb),
    'assessment_areas', nullif(v_areas, '{}'::jsonb)
  ));
end $$;

create or replace function private.progress_require_assessment_on_submit() returns trigger
language plpgsql set search_path = '' as $$
declare
  v_key text;
  v_item jsonb;
begin
  -- Preserve pre-existing reports until a new submission or publication transition.
  if TG_OP = 'UPDATE' and old.status in ('submitted', 'published') and new.status = old.status then
    return new;
  end if;
  if new.status not in ('submitted', 'published') then return new; end if;

  foreach v_key in array array[
    'qaida_reading', 'tajweed', 'makharij', 'fluency', 'hifz_revision',
    'duas', 'daily_sunnah', 'surahs', 'hadith', 'namaz', 'islamic_knowledge'
  ] loop
    v_item := new.details -> 'assessment_areas' -> v_key;
    if v_item is null
      or nullif(trim(coalesce(v_item ->> 'effort', '')), '') is null
      or nullif(trim(coalesce(v_item ->> 'standard', '')), '') is null then
      raise exception 'Complete effort and course-standard selectors for all 11 learning areas before submission or publication.';
    end if;
  end loop;
  return new;
end $$;

drop trigger if exists monthly_reports_require_assessment_on_submit on public.monthly_reports;
create trigger monthly_reports_require_assessment_on_submit
before insert or update of status, details on public.monthly_reports
for each row execute function private.progress_require_assessment_on_submit();

revoke all on function private.progress_require_assessment_on_submit() from public, anon, authenticated;
revoke execute on function private.progress_details(jsonb) from public, anon, authenticated;
