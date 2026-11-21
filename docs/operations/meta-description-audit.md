---
title: Meta description length audit
type: operation
created: 2026-11-21
updated: 2026-11-21
sources:
  - code: scripts/bing-seo-audit.mjs
  - code: src/lib/teacher-description.js
  - code: src/app/(site)/teachers/[slug]/page.jsx
  - code: src/app/(site)/reviews/page.jsx
  - code: src/app/(site)/verify-certificate/page.jsx
  - code: supabase/migrations/20261121060000_seo_aeo_session_fixes.sql
verified_at: b74f389
---

# Meta description length audit

`node scripts/bing-seo-audit.mjs [origin]` fetches every sitemap URL and flags titles over 65 characters and descriptions outside 120–159 characters. It runs on the 1st of each month in GitHub Actions and can be run by hand against production.

Where a flagged description lives decides where to fix it:

| Page kind | Source |
|---|---|
| Static pages such as `/reviews`, `/verify-certificate` | `metadata` in the page file under `src/app/(site)/` |
| CMS pages such as `/about`, country hubs, blog posts | `seo_description` in Supabase `pages` / `blog_posts`; change through a migration file plus apply, as in `supabase/migrations/20261121060000_seo_aeo_session_fixes.sql` |
| Teacher profiles | Built by `teacherDescription` in `src/lib/teacher-description.js` from the CMS bio and headline |

> ⚠️ Teacher profile descriptions are generated, not stored. A bio under 120 characters is not used at all; the description becomes "Live one-to-one online Quran lessons with {name} ({headline}) …". Editing the bio in the CMS changes search snippets only once it reaches 120 characters. `tests/teacher-description.test.mjs` pins the length and wording.

> ⚠️ The page component still passes the result through `truncate(…, 158)`, so a bio longer than 158 characters is cut with an ellipsis rather than flagged.
