# OQC full repository audit — 25 November 2026

## Executive summary

- Repository: `Ehtisham1239/app.com`
- Audit baseline: `main` at `fcb673aeaaa8292ff1c8fd2f4c026e2aff925f4a`
- Review branch: `audit/oqc-full-audit-2026-11-25`
- Application: Next.js 16.4.6, React 19.3.0, Supabase JS/SSR, Tailwind CSS 4
- Scope: application architecture, SEO/indexation, analytics/conversion, forms/API, auth/security, CI, deployment and database migration boundaries
- Execution: source inspection and branch-only changes. No merge, deployment, production form submission, DNS change, secret change, Supabase query/migration or production data mutation was performed.

The repository has a substantial and well-tested implementation. The highest-value immediate action prepared on this branch is the AdSense removal already requested in the owner's open PR #430, rebased conceptually by applying the same two-file change on top of the current `main` commit. The existing PR #430 is still open and reported non-mergeable; it has not been changed or merged.

## Changes prepared on this branch

1. Removed the AdSense account verification meta tag and AdSense loader from `src/app/(site)/layout.jsx`.
2. Deleted `public/ads.txt`, which contained the single AdSense seller declaration.
3. No Google Ads / GTM conversion implementation was removed. The separate Google Ads and secondary GTM configuration in `src/lib/analytics.js` remains intact. AdSense and Google Ads are separate products and this change must not be described as disabling Google Ads campaigns or conversion measurement.

These changes reproduce the intent of PR #430 against the current main tree, avoiding its stale base/conflict. They are not live until separately reviewed and merged.

## Evidence-based findings

### P1 — AdSense removal is not yet in production

- Baseline `main` layout contained the AdSense verification meta and asynchronous loader.
- Baseline `public/ads.txt` contained `google.com, pub-4481593080893962, DIRECT, f08c47fec0942fa0`.
- PR #430 (`Remove Google AdSense from the public site`) is open, has two commits, and GitHub reported `mergeable: false`.
- This branch removes the same two items from current `main`.
- Do not claim production removal until a reviewed merge and a subsequent live Hostinger verification.

### P1 — Hosting verification is an external dependency

- `DEPLOYMENT.md` (current top section, dated 15 November) says Hostinger serves `www.onlinequrancollege.com`, auto-deploys pushes to `main`, and Vercel is used for preview URLs.
- It explicitly says a successful Vercel status is not proof of the public site release.
- The GitHub connector showed a successful Vercel status for the main commit, but this is not Hostinger evidence.
- The Hostinger connector/account tools were not available in this session. Current Hostinger deployment ID, served commit, build log, runtime variables and live rollback target therefore remain **not independently verified**.
- No deployment was triggered from this branch.

### P1 — CI performance/SEO checks are report-only

- `.github/workflows/oqc-quality-checks.yml` runs dependency audit, tests, lint and production build.
- The `live-performance-audit` job has `continue-on-error: true`; Lighthouse and live sitemap SEO crawl findings therefore do not fail the workflow.
- The responsive audit is also `continue-on-error` for pull requests because it measures the current production site rather than the PR preview.
- This is a sensible report-only design for some external checks, but a green CI badge alone does not certify that live performance or all SEO crawl checks passed.
- Recommendation: retain report-only behavior for unstable external probes, but publish explicit machine-readable pass/warn/fail summaries and require local deterministic SEO/indexation tests as merge gates. Do not tighten flaky production probes without reviewing their failure history.

### P1 — Analytics configuration is code-visible; actual data receipt is not verified

- `src/lib/analytics.js` defines the primary/secondary GTM and Google Ads configuration, cookieless behavior and denied ad consent signals.
- The code deliberately avoids a duplicate direct GA4 loader when GTM owns GA4 and strips query strings / private values from analytics page URLs.
- Repository source and tests are not proof that the live CMS settings, GTM containers, GA4 property or Google Ads conversion action are correctly configured and receiving events.
- No live GA4, Search Console, GTM Preview/Tag Assistant or Google Ads account read was available. Event receipt, conversion attribution, consent behavior in the live container and lead-to-admissions reconciliation remain **unverified**.
- Do not change live CMS settings or analytics IDs based on source defaults alone.

### P1 — Form and lead-delivery verification must remain non-destructive

- Current routes include `/free-trial`, `/free-trial/thank-you`, `/contact`, and `/contact/thank-you`; both thank-you pages explicitly set noindex.
- The API layer includes public form config, lead notification, USA lead notification and scheduled lead-sync routes.
- Tests cover lead notification formatting, privacy, token proof, parent-session boundaries and USA static landing page mapping.
- A real production form submission would create personal data and could trigger email/CRM actions. No production submissions were made.
- Required next verification: test submissions against an isolated QA database/CRM sandbox, then verify one controlled owner-approved production test with duplicate prevention and explicit cleanup/retention approval.

### P1 — Database state and migration application are not verified

- The repository contains a long ordered migration history through 24 November 2026, including private lead-notification token tables, RLS hardening, rate-limit tables, parent portal and lead outbox migrations.
- `DEPLOYMENT.md` explicitly states neither hosting provider applies Supabase migrations automatically.
- No Supabase project query, migration history read, advisor scan or database write was performed in this audit.
- Source migrations being present does not prove that production has applied them in order. Before any code depending on a new migration is released, compare the production migration ledger with the repository and review RLS/policies/functions. Never run migrations automatically as part of this branch.

### P2 — SEO/indexation controls are thoughtfully implemented

- `src/app/robots.js` allows public search and AI answer crawlers while disallowing admin, auth, API and parent paths.
- `src/app/sitemap.js` builds fixed, location, course, page, blog and teacher entries and applies canonical/noindex checks to CMS-managed content.
- `src/lib/locations.js` plus `tests/location-indexing.test.mjs` enforce the five approved market hubs by default and keep city pages noindex unless explicitly approved in CMS.
- `tests/robots.test.mjs` and `tests/search-crawler-policy.test.mjs` cover crawler policy.
- A sitemap being generated correctly does not prove Google/Bing have crawled or indexed its URLs. GSC/Bing index coverage and query performance remain external evidence requirements.

### P2 — Daily GitHub audit schedule is not exactly 08:00 Pakistan time

- `.github/workflows/free-daily-seo-audit.yml` schedules at `17 3 * * *` UTC, which is 08:17 in Pakistan (UTC+5).
- It crawls at most 500 URLs per run.
- The separate operations register records an external 08:00 Asia/Karachi task; that external scheduler was not accessible here. Do not assume the GitHub workflow replaces it.
- If exact 08:00 Pakistan time is desired for this GitHub workflow, review changing the cron to `0 3 * * *` UTC, while avoiding duplicate runs with the external scheduler.

### P2 — Security controls exist, but no live penetration test was performed

- `src/proxy.js` protects admin routes behind Supabase authentication, applies a staff CSP and marks parent portal responses noindex/private.
- Parent session API tests cover foreign origins, invalid/expired tokens, no-store behavior and cookie flags.
- `src/lib/request-origin.js` blocks cross-site mutation requests; lead notification endpoints use short-lived proof tokens and avoid logging personal data.
- Supabase migrations enable RLS on private rate-limit and notification-token tables and restrict function execution.
- `.env.example` contains blank placeholders; recursive tree inspection did not find committed `.env` files or obvious private-key filenames. This is not a historical secret scan and cannot establish that credentials were never committed.
- No production database advisor, DAST, authenticated role review or credential rotation was performed.

### P2 — Architecture and test coverage

- The repository is the documented single source for the public site, CMS/admin, parent portal, API routes, SEO logic, scripts and migrations.
- `package.json` exposes tests, lint, production build, browser smoke, responsive audit, performance audit and SEO audit scripts.
- Main commit `fcb673a` had successful GitHub checks at audit time: test/lint/build, production smoke, responsive audit and live performance audit. The CI workflow's report-only caveat above still applies.
- The repository README describes 205 existing public pages/topic placements; that is a dated documented inventory, not a fresh independent count of live indexed URLs.

## Recommended release sequence

1. Review this branch diff and the AdSense removal intent against owner approval.
2. Run full CI on this branch; inspect test, lint, build, responsive and performance artifacts separately.
3. Verify Hostinger's deployed commit and build log through the Hostinger account before/after any approved release.
4. Verify `/ads.txt` and homepage HTML on the actual Hostinger production origin after merge; confirm no AdSense loader remains.
5. Separately validate GTM/GA4/Google Ads event receipt without changing the approved cookieless and denied-ad-storage design.
6. Reconcile Supabase migration history and RLS using read-only account access before any schema-dependent release.
7. Run QA form journeys with synthetic data; only use production test data after explicit approval.
8. Monitor GSC, Bing, GA4, lead delivery and admissions outcomes; report evidence separately from recommendations.

## Explicit non-actions

- No merge, deployment, production rollback or DNS change.
- No Supabase query, migration, schema edit or production data mutation.
- No real production trial/contact/review form submission.
- No credentials, environment variables, account settings, ads budget or third-party campaign changes.
- No bulk city indexation, canonical URL, redirect or sitemap policy change.
