-- Enforce all 11 monthly assessment areas for every new submission/publication.
-- Historical published snapshots remain readable; any subsequent content edit must
-- satisfy the current rubric. Both selectors accept "not_applicable" explicitly.

create or replace function private.progress_require_assessment_on_submit() returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_key text;
  v_item jsonb;
  v_effort text;
  v_standard text;
begin
  -- Do not rewrite or block an unchanged historical submitted/published row.
  if TG_OP = 'UPDATE'
     and old.status in ('submitted', 'published')
     and new.status = old.status
     and new.details is not distinct from old.details then
    return new;
  end if;

  if new.status not in ('submitted', 'published') then
    return new;
  end if;

  foreach v_key in array array[
    'qaida_reading', 'tajweed', 'makharij', 'fluency', 'hifz_revision',
    'duas', 'daily_sunnah', 'surahs', 'hadith', 'namaz', 'islamic_knowledge'
  ] loop
    v_item := new.details -> 'assessment_areas' -> v_key;

    if v_item is null or jsonb_typeof(v_item) <> 'object' then
      raise exception 'Complete effort and course-standard selectors for all 11 learning areas before submission or publication. Missing: %.', v_key;
    end if;

    v_effort := nullif(trim(coalesce(v_item ->> 'effort', '')), '');
    v_standard := nullif(trim(coalesce(v_item ->> 'standard', '')), '');

    if v_effort is null or v_standard is null then
      raise exception 'Complete effort and course-standard selectors for all 11 learning areas before submission or publication. Missing: %.', v_key;
    end if;

    if v_effort not in ('excellent', 'good', 'satisfactory', 'needs_improvement', 'not_applicable') then
      raise exception 'Invalid effort rating for %.', v_key;
    end if;

    if v_standard not in ('above_expected', 'at_expected', 'working_towards', 'not_applicable') then
      raise exception 'Invalid course standard for %.', v_key;
    end if;
  end loop;

  return new;
end
$$;

drop trigger if exists monthly_reports_require_assessment_on_submit on public.monthly_reports;
create trigger monthly_reports_require_assessment_on_submit
before insert or update of status, details on public.monthly_reports
for each row execute function private.progress_require_assessment_on_submit();

revoke all on function private.progress_require_assessment_on_submit() from public, anon, authenticated;
