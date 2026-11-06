-- The 11-area assessment vocabulary is provisional pending Academic approval.
-- The current teacher form still submits the established six-rating contract and
-- does not collect assessment_areas. Keep the JSONB parser additive/optional, but
-- do not block existing teacher submissions or admin publication until the new
-- UI, training, rubric and approval are complete.

drop trigger if exists monthly_reports_require_assessment_on_submit on public.monthly_reports;
drop function if exists private.progress_require_assessment_on_submit();
