---
title: Academic subjects (school and college tuition)
type: subsystem
created: 2026-11-24
updated: 2026-11-24
sources:
  - code: src/lib/academic.js
  - code: src/lib/site-data.js
  - code: src/app/(site)/academic-subjects/page.jsx
  - code: src/lib/course-schema.js
  - code: src/app/sitemap.js
  - code: src/lib/admin/resources.js
  - code: tests/academic-subjects.test.mjs
verified_at: c2e9160
---

# Academic subjects

Owner decision (24 Nov 2026, in chat): publish academic subjects (Mathematics, English, sciences and the
other school and college subjects). They are CMS courses with category `academic`, shown on
`/academic-subjects`, one card per subject with its own **Book Now** (`/free-trial?course=<id>`). Quran
and Islamic courses are unchanged. Programming and exam-preparation categories were not approved and are
not published. Background: [[ai-admissions-audit-and-plan]].

## Add, hide or remove a subject
CMS → Courses → set **Category** to "Academic subject" and publish. Set the status to archived to take it
off the site (it disappears within about five minutes). The hub returns 404 when no academic subject is
published.

> ⚠️ Quran-facing pages (header menu, home, location pages, learn, CMS blocks, `/courses`, `llms.txt`) must
> call `getQuranCourses()`, never `getCourses()`. Otherwise academic subjects appear under "Quran courses"
> in the menu and on every location page. `tests/academic-subjects.test.mjs` pins this. The free-trial form
> and course detail pages deliberately use `getCourses()`.

> ⚠️ No fee, class length, schedule or free-trial claim is made for academic subjects: they have no
> approved price, tutors or trial rule on record. The course schema leaves out the 30-minute weekly
> schedule and the subscription offer for them, the hub page text is tested for prices and trial promises,
> and `/llms-full.txt` tells the chatbot never to promise a trial. Admissions confirms tutor, time, fee and
> trial eligibility.

> ⚠️ Subject detail pages are `noindex` and stay out of the sitemap; only the hub is indexed (the sitemap
> adds it once a subject is published). They are thin pages, and the Quran pages are the site's topical
> focus. Turn `seo_noindex` off for one subject only when it has real content and an approved offer.

> ⚠️ Academic pages use `ACADEMIC_HERO`, a neutral laptop-and-book scene. Every other hero image shows a
> Quran lesson and its alt text says so.

## Not covered
Real booking and tutor availability (the availability tables are empty), pricing, programming and exam
courses. See the plan.
