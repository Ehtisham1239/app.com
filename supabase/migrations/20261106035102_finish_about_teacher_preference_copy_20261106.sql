-- Applied to the production CMS on 2026-11-06.
-- The About page uses inline strong markup around the list label, so this
-- follow-up replaces the exact rendered fragments missed by the first pass.

update public.pages
set body_html = replace(
  replace(
    body_html,
    '<li><strong>Comfort</strong> — female teachers for sisters and children, male teachers for brothers.</li>',
    '<li><strong>Comfort</strong> — learners can discuss teacher preferences with Admissions; availability is confirmed for the course, language and requested time.</li>'
  ),
  'Families can ask for a <a href="/learn/female-quran-teacher">female</a> or male teacher.',
  'Families can share a teacher preference with Admissions; availability is confirmed for the requested course, language and time.'
)
where id = 'ddc0167c-2e4f-41a2-be69-5918e2687730'
  and status = 'published'
  and body_html like '%male teachers for brothers%';
