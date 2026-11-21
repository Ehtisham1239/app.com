-- Applied to the production CMS on 2026-11-06.
-- Keep public wording aligned with the active public teacher roster and confirmed availability.

update public.faqs
set answer = 'You can request a female teacher on the free-trial form. Admissions confirms whether a suitable female teacher is available for your course, teaching language and requested time before lessons are arranged. Other teacher preferences can be discussed with Admissions; availability is confirmed before enrolment.'
where id = 'e33d4880-54ba-40ec-bc0a-9e3172ab55d8'
  and locale = 'en'
  and status = 'published'
  and answer = 'Yes. Female teachers are available for children and sisters, and male teachers for brothers. Choose your preference on the free-trial form.';

update public.pages
set excerpt = 'Online Quran College provides live one-to-one online Quran lessons for children and adults. Families can discuss teacher preferences with Admissions and confirm availability before enrolment.',
    body_html = replace(
      replace(
        body_html,
        'Comfort — female teachers for sisters and children, male teachers for brothers.',
        'Comfort — learners can discuss teacher preferences with Admissions; availability is confirmed for the course, language and requested time.'
      ),
      'Families can ask for a female or male teacher.',
      'Families can share a teacher preference with Admissions; availability is confirmed for the requested course, language and time.'
    )
where id = 'ddc0167c-2e4f-41a2-be69-5918e2687730'
  and slug = 'about'
  and locale = 'en'
  and status = 'published'
  and body_html like '%male teachers for brothers%';

update public.settings
set value = value - 'established'
where key = 'site.identity'
  and value ? 'established';
