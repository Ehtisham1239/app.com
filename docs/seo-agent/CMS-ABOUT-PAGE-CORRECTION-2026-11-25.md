# OQC CMS SEO correction — About page

Date: 25 November 2026 (UTC)
Project: Supabase `app.com` (`lgbwidraztavhhbnbfhr`)
Public route: `/about`
Execution: owner-authorised, content-only update; read-back verification completed.

## Finding

A read-only check of the published `public.pages` record found that the About page had been edited on 21 November and had reintroduced:
- an unsubstantiated “since 2019” founding-date claim in the excerpt;
- “established in 2019” in the SEO description;
- broad “qualified male and female Quran teachers” claims and a promise that public teacher profiles describe qualifications, despite the earlier audit recording no active public teacher profiles.

The site-wide `site.identity.established = 2019` value was also present and could be emitted in Organization structured data.

## Change made

The published About page was updated from version 17 to version 18:
- Removed founding-year claims.
- Rewrote the excerpt, SEO title and description around verified service facts and learner intent.
- Added a clear explanation of the OQC learning cycle: Learn → Practice → Assessment → Feedback → Improve.
- Added course discovery, trial, pricing and approved country-guide links.
- Explained teacher preference and availability accurately: families may request a female teacher; Admissions confirms suitable availability for the course, teaching language and requested time.
- Clarified that country pages are online learning guides, not branches or walk-in offices.
- Preserved the existing `/about` route and indexability; no redirect or canonical change was made.

The `public.settings` row `site.identity` had only its unsupported `established` property removed. Existing name, legal name, tagline and description were preserved.

## Exact metadata now published

- SEO title: `About Online Quran College | Online Quran Learning`
- SEO description: `Discover Online Quran College’s live one-to-one Quran lessons for children and adults, course options, learning approach and how to request a trial.`

## Verification

Read-only SELECT after the update confirmed:
- `public.pages` About row: exactly one row updated; version 18; new excerpt, SEO title, SEO description and body HTML read back.
- `public.settings` `site.identity`: exactly one row updated; `established` is absent; all other identity properties retained.
- Current plan records still state a 3-day trial on eligible plans and no trial on the Weekend plan; the new copy reflects that.
- No schema, migrations, student/parent/teacher private records, lead records, pricing, trial settings, forms, analytics, routes, DNS or ad campaigns were changed.

## Release / cache status

This verifies the Supabase CMS records, not the public HTML after cache revalidation. The About page is configured for ISR revalidation; allow its revalidation window or use the approved Hostinger cache/revalidation mechanism, then verify the rendered live page and JSON-LD.

## Rollback reference

Before values were captured by the read-only query immediately before the update. The previous page content was version 17. Restore only the About page content fields and `site.identity.established` if the owner explicitly requests rollback; do not roll back unrelated CMS settings.
