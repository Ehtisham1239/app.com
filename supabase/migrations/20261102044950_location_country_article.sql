-- 2 Nov 2026: the 22 Oct location seed wrote "in United States" / "in Netherlands"
-- without the article. Correct only the exact seeded wording on the two country hubs
-- that still carry it; any copy staff have rewritten is left untouched.
-- Content revision triggers snapshot the previous body/excerpt before each update.
update public.pages
set body_html = replace(body_html, '<h2>Quran learning from home in United States</h2>', '<h2>Quran learning from home in the United States</h2>'),
    excerpt = replace(excerpt, 'Hifz and Arabic online in United States.', 'Hifz and Arabic online in the United States.')
where slug = 'locations-united-states'
  and deleted_at is null
  and (body_html like '%<h2>Quran learning from home in United States</h2>%'
       or excerpt like '%Hifz and Arabic online in United States.%');

update public.pages
set body_html = replace(body_html, '<h2>Quran learning from home in Netherlands</h2>', '<h2>Quran learning from home in the Netherlands</h2>'),
    excerpt = replace(excerpt, 'Hifz and Arabic online in Netherlands.', 'Hifz and Arabic online in the Netherlands.')
where slug = 'locations-netherlands'
  and deleted_at is null
  and (body_html like '%<h2>Quran learning from home in Netherlands</h2>%'
       or excerpt like '%Hifz and Arabic online in Netherlands.%');
