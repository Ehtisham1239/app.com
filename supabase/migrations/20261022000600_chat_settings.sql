-- Persist the user-supplied public widget settings without overriding later CMS edits.
insert into public.settings (key,is_public,label,description,value)
values ('site.chat',true,'Website chat','Hatchium public chat widget',
  '{"enabled":true,"widget_key":"BZrCMwoaC3UYn9OpkcSASivkWFYm5A0B"}'::jsonb)
on conflict (key) do nothing;

update public.pages set body_html=replace(body_html,
  '<p><em>Last updated: 13 October 2026</em></p>',
  '<p><em>Last updated: 22 October 2026</em></p>')
where slug='privacy-policy' and locale='en' and deleted_at is null
and position('id="website-chat"' in body_html)>0
and position('<p><em>Last updated: 13 October 2026</em></p>' in body_html)>0;
