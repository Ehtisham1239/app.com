-- Correct the reversed Dallas-to-Pakistan conversion on the Dallas city page (issue #175).
-- Dallas is UTC-5 in CDT and UTC-6 in CST; Pakistan stays on PKT (UTC+5).
-- Therefore 5:00 pm Dallas is 3:00 am (CDT) or 4:00 am (CST) the following day in Pakistan.
-- Only this one sentence changes; no prices, indexation settings or trial terms are touched.
update public.pages
set body_html = replace(
  body_html,
  '5:00 pm Dallas lesson corresponds to 4:00 am in Pakistan during CDT or 3:00 am during CST on the relevant date.',
  '5:00 pm Dallas lesson corresponds to 3:00 am in Pakistan during CDT or 4:00 am during CST, on the following day.'
)
where slug = 'locations-united-states-dallas'
  and status = 'published'
  and deleted_at is null
  and body_html like '%5:00 pm Dallas lesson corresponds to 4:00 am in Pakistan during CDT or 3:00 am during CST on the relevant date.%';
