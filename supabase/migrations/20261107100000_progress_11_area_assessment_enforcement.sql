-- Re-enable the approved 11-area monthly assessment after the temporary rollout deferral.
-- Every new report submission/publication requires both selectors for all 11 areas.
-- Existing submitted/published legacy records without assessment_version remain compatible.

create or replace function private.progress_require_assessment_on_submit() returns trigger
language plpgsql set search_path = '' as $$
declare
  v_key text;
  v_item jsonb;
begin
  if TG_OP = 'UPDATE' then
    -- Preserve already-submitted legacy reports. Once a report is versioned, its
    -- selectors remain mandatory on every subsequent review/publish operation.
    if old.status in ('submitted', 'published')
       and old.details ->> 'assessment_version' is distinct from '1'
       and new.details ->> 'assessment_version' is distinct from '1' then
      return new;
    end if;
  end if;

  if new.status not in ('submitted', 'published') then return new; end if;

  foreach v_key in array array[
    'qaida_reading', 'tajweed', 'makharij', 'fluency', 'hifz_revision',
    'duas', 'daily_sunnah', 'surahs', 'hadith', 'namaz', 'islamic_knowledge'
  ] loop
    v_item := new.details -> 'assessment_areas' -> v_key;
    if v_item is null
       or jsonb_typeof(v_item) <> 'object'
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
