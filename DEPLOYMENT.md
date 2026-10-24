# app.com website and CMS deployment

## Semrush follow-up — 24 October 2026: production READY

The reviewed remediation source `c57c16ee9d84a1ad043963aadfb2d795d6358d55` is deployed as production deployment `dpl_8gavnNmqPoDfHYDjLXjYE5KkSKRG` (READY; build 79.48 seconds). The stable alias `https://project-umber-three-93.vercel.app` is assigned to this deployment. All 205 public sitemap URLs pass the post-release technical audit, and the live Course/ItemList markup and versioned SVG/cache response are verified. See [the remediation ledger](docs/SEMRUSH-REMEDIATION-2026-10-24.md) for verification details and remaining Semrush/TLS limitations. No production environment, database or domain configuration was changed. A pinned Git-source release succeeded; automatic deployment on future GitHub pushes is still not established.

Target repository: Ehtisham1239/app.com. Target Supabase project: `lgbwidraztavhhbnbfhr`.
The uploaded ZIP referenced a different Supabase project. That fallback has been removed.
The live college site's logo and hero image were downloaded from https://www.onlinequrancollege.com/.
Brand colours and Inter/Outfit fonts follow that site's published CSS.

## Current state

The public project key and personal Management API binding both connect successfully. All 17
migrations were applied to the target project in one transaction, with Supabase migration history
recorded. The database contains 163 published location pages. The `admin-users` Edge Function is
ACTIVE with its own caller-session/permission checks. The owner's selected first Super Admin has
been created and verified by real password sign-in, staff-role checks and an authenticated campaign
report request. First sign-in requires a password change. Temporary credentials are stored privately
outside this repository and are not included in source or logs.
The website can render the uploaded public seed content while the new schema is absent.
The fallback is read-only. Live database content now takes priority. Anonymous contact/trial form
submissions were tested against the remote database and their attribution verified; only those
synthetic test records were then removed. Public reads of private lead tables and unauthenticated
staff-management actions were rejected.

## Install the database

The initial schema is already installed; do not run the fresh-project SQL bundle again.
For future changes, use authenticated Supabase MCP or Supabase CLI with access to this exact project. Apply the SQL
files in `supabase/migrations/` in filename order. With the CLI authenticated, link this checkout:

```sh
supabase link --project-ref lgbwidraztavhhbnbfhr
supabase db push
supabase functions deploy admin-users --project-ref lgbwidraztavhhbnbfhr
```

Review `supabase db push --dry-run` before applying, particularly if other work has populated the
project since this inspection. Do not apply `supabase/tests/local_shim.sql` to Supabase.
The migration set includes the original uploaded database and two additions for campaign reporting
and editable country/city pages. The original optional cron/HTTP extensions require Supabase support.

Alternatively `node scripts/bundle-database.mjs` produces `artifacts/app-com-database.sql` for the
Supabase SQL Editor, **only for a fresh project**. It is a single transaction. It does not record
Supabase CLI migration history; use one migration workflow consistently. If an extension is unavailable,
resolve that on Supabase rather than running an incomplete schema.

## Administrator access

The initial administrator already exists. Do not repeat initial setup or reset that account.
Subsequent colleagues should be added through CMS Portal → Admin users.

### Initial setup reference for a separate fresh project

Use Supabase Dashboard → Authentication → Users → Add user, with the actual college administrator's
email and a securely chosen temporary password. Do not use a public signup to grant staff roles.
Then run this in the privileged SQL Editor, replacing only the user ID with that new Auth user's UUID:

```sql
update public.profiles
set role = 'super_admin', is_active = true, must_change_password = true
where id = 'REPLACE_WITH_AUTH_USER_UUID'::uuid
  and not exists (select 1 from public.profiles where role = 'super_admin' and is_active);
```

Verify exactly one row changed. Open `/admin`, sign in, and set a new password when prompted.
Thereafter use CMS Portal → Admin users to create colleagues. Never put admin passwords, access tokens
or service-role keys in public environment variables, source files or chat.

## Live production deployment

The owner authorized replacing the existing Vercel `project` in team `ehtisham1239s-projects`.

- Public website: https://project-umber-three-93.vercel.app
- CMS sign-in: https://project-umber-three-93.vercel.app/admin
- Vercel project: `prj_q3qTOTMNxuDfgmd5XoCaoWVhQBVu`
- Ready production deployment: `dpl_FcsjGuh8XfrJz2SwUBFnnR9ynhSX`
- Application source uploaded from Git commit `c327dda` (tracked files only).

Project creation was not permitted by the supplied token, but updating and deploying this existing
project succeeded. Its previous GitHub link pointed at a different repository and was disconnected
with the owner's authorization. Vercel's GitHub integration could not access `Ehtisham1239/app.com`,
so this deployment was made by uploading tracked source files via the authenticated Vercel API.
**GitHub pushes do not automatically redeploy this project yet.** Grant the Vercel GitHub App access
to `Ehtisham1239/app.com`, then reconnect that repository in project settings to enable automatic builds.
Do not reconnect the old repository. Private credentials, local environment files and build caches
were excluded from the source upload.

Vercel is configured for Next.js, Node 24, `npm ci`, and `npm run build`. The two public Supabase
variables and `NEXT_PUBLIC_SITE_URL=https://project-umber-three-93.vercel.app` are saved in the Vercel
project. The original college custom domain has not been moved or connected to this deployment.

The production homepage, city page, pricing and sitemap returned 200; `/admin` redirected to login.
The live CMS password sign-in reached the mandatory first-login password-change page without browser
JavaScript errors. A browser contact-form submission and its campaign attribution were verified in
the real database, then that synthetic record was deleted. The verification login session was signed out.
Cloud browser requests were forwarded through Node's session proxy and trusted CA, preserving TLS
verification; Chromium's separate trust store did not contain the current cloud proxy CA.

## App hosting

Use Node 24 (Node >=20.9 supported). Copy `.env.example` to `.env.local` for local development;
set the target project's **public** publishable key, URL, and canonical website URL in hosting settings.
The public key provided in chat is installed in this current machine's ignored `.env.local` and saved
as an environment configuration draft; it is not bundled as a hardcoded credential in source.

```sh
npm ci
npm test
npm run lint
npm run build
npm start -- --hostname 0.0.0.0
```

On this managed cloud machine, use `NODE_USE_ENV_PROXY=1` for Node commands that contact Supabase.
Keep the inherited proxy and CA trust settings. Other hosts normally do not need this variable.
Set the canonical URL to the final deployed domain before building. The live website is not redeployed
by pushing this repository unless the user's hosting integration is configured to do that.

## CMS and campaign workflow

- `/admin`: CMS entry point, linked from the public desktop/mobile header and footer.
- Blog, courses, fees, pages, media, contact forms, trial leads and settings reuse the uploaded CMS.
- `/admin/campaigns`: counts trial/contact submissions and current enrolled trial statuses by
  source, medium and campaign, with dates and CSV export. No ad inventory, spend, impressions or
  ad-network connection has been added.
- Use campaign URLs such as `/locations/united-kingdom/london?utm_source=google&utm_medium=cpc&utm_campaign=london-quran`.
  Tags persist in session storage for up to 24 hours from the campaign landing, across public pages
  in that browser tab. A later tagged campaign replaces the earlier one. No visitor identifier is created.
  This attribution storage should be described in the college's privacy notice before launch.
- `/locations`: 50 countries and 113 cities. Country pages use the local currency code and only
  display an explicitly published matching price. Other currencies show a quote request; no
  exchange rates or new fee amounts are invented. Multi-time-zone countries ask for the learner's
  local schedule rather than assuming every city shares the country's reference zone.
- In CMS → Pages, edit `locations-united-kingdom-london` (and equivalent slugs) to change location
  content and SEO. View links open the real `/locations/...` route. Country/city pages are online
  service areas, not claimed physical branches. Slugs in the registry are fixed route identities.

## Validation limits

`npm test` uses real PostgreSQL via PGlite and the uploaded local Auth/storage shim. It tests migrations,
consent, lead persistence, campaign aggregation, staff permissions and CMS edits. Cron and HTTP extension
setup are platform-only and are explicitly excluded from this local test; Supabase Auth itself is not
emulated by it. Browser checks exercise public pages, mobile layout and the protected login redirect.
Remote form persistence, attribution, public content reads, private-table access rejection and Edge
Function deployment are verified. The platform-only cron and HTTP extension migrations also applied
successfully on the real Supabase project. Real staff password sign-in, active Super Admin access,
mandatory first-login password change and authenticated campaign reporting are verified. The test
session was signed out and its consumed bootstrap token removed. Public Vercel deployment and live
CMS sign-in are verified as documented above. Automatic GitHub deployment remains disconnected.

## SEO tools and college branding update

CMS Portal → **SEO tools** audits pages, articles and courses using the current user's content
permissions. It includes title/snippet previews, content recommendations, duplicate metadata detection,
search and indexing filters, and CSV export. Editors can set a focus phrase, canonical URL and noindex
flag in existing content forms. Suggestions are editorial guidance, not ranking scores or guarantees.
The per-page canonical/noindex controls are used by public HTML metadata and sitemap generation;
CMS saves revalidate the sitemap and site content. Legacy country/city CMS slugs permanently redirect
to their single `/locations/...` route. Organization, website, article and course JSON-LD are safely
encoded. Search Console and Bing verification codes can be entered under Website settings → Search
engines. Paste only the public verification code, not full HTML tags or account credentials.

The Google Search Console, Bing Webmaster, PageSpeed Insights and Rich Results Test buttons open
those official tools. They do not connect accounts, submit sitemaps automatically or import ranking
or traffic data. Those services require the owner's own accounts/verification where applicable.

Migration `20261022000300_seo_controls.sql` adds indexing/focus/canonical fields to the existing content
tables without changing their RLS permissions. It is installed in the live Supabase project with
migration history. Validation includes 18 automated tests and a browser scenario with an isolated,
temporary content-editor account: sign in, change its temporary password, load the audit, save SEO
fields, verify public noindex metadata/sitemap exclusion, and inspect the responsive branding. Only
synthetic fixtures were removed; the owner's login and password were preserved.

The public palette follows the live college reference: primary `#006847`, primary hover `#004f36`,
secondary emerald `#10b981`, accent amber `#f59e0b`, pale section background `#f4fbf7`, white main
background and footer `#111827`. Headings use Outfit and body text Inter. The homepage now uses the
light hero treatment, original college logo/hero image, bold green headings and green action buttons.

The SEO/branding update is deployed to the production URL above. The authenticated SEO browser
scenario was repeated against the real Vercel deployment, including saved noindex fields and live
sitemap exclusion. Synthetic content and staff fixtures were deleted and caches revalidated. The
legacy city alias returns 308, the protected SEO route redirects unauthenticated visitors to login,
and the updated Open Graph image returns image/png.

## Country selector coverage fix — 22 October 2026

Trial and contact country selectors now include all 50 supported location markets, including the
32 previously missing countries. Existing country choices and default time zones are retained;
`Other` remains last. Source commit: `931be14`. Production deployment:
`dpl_P3jTBrQC5GSEQRB43ngUMZyti7P8`, served at the production URL above.

Validation: 19 automated tests pass, production build succeeds, and lint has zero errors with the
same 20 existing warnings. Local and live mobile browser checks confirm Portugal/Lisbon prefill,
Europe/Lisbon scheduling despite an Asia/Karachi browser time zone, country/city retention across
Continue/Back, and Portugal plus existing UK/US contact choices. No test forms were submitted.
This change does not apply the other recommendations in the SEO audit.

## Releasing SEO audit fixes

The approved canonical host remains `https://project-umber-three-93.vercel.app`.
Do not move the college domain or reconnect the old unrelated repository. GitHub pushes alone
still do not deploy this project. The supported source-upload procedure is now tracked:

```sh
npm ci
npm test
npm run lint
NODE_USE_ENV_PROXY=1 npm run build
# Commit and push the reviewed release first; the deployment helper rejects a dirty checkout.
NODE_USE_ENV_PROXY=1 node --env-file=.env.local scripts/deploy-vercel.mjs
```

Use the existing secure `VERCEL_TOKEN` binding and public Supabase app settings. The helper
only targets the existing `project` project in `ehtisham1239s-projects`, records the source commit
in deployment metadata, and saves the deployment ID under ignored `artifacts/`. Wait for that
ID to reach READY before verifying the stable production alias. Then run:

```sh
NEXT_PUBLIC_SITE_URL=https://project-umber-three-93.vercel.app NODE_USE_ENV_PROXY=1 node scripts/seo-smoke.mjs https://project-umber-three-93.vercel.app
```

For a local production build, start it on port 3010 and use the same smoke script without a URL.
Provide the build's `NEXT_PUBLIC_SITE_URL` value to the test process when checking local canonical
URLs. These checks crawl location HTML and exercise the mobile planner without submitting forms.
The browser bridge uses Node's inherited proxy and CA trust with TLS verification enabled.

## Verified SEO audit release

Source commit `29054954371fce2e906174a64fdba6324ac18eba` is deployed as
`dpl_2TMV3LaE1uZhA2ajpQZvJEymTJGo` (READY). The deployment metadata records the matching source
commit. Live smoke checks passed for all 165 location pages and seven legacy redirects, including
canonical links, unique titles, BreadcrumbList, the policy update, certificate noindex/sitemap
alignment, local-time planning and Los Angeles trial prefill. No synthetic enquiries were submitted.
Measured CTA text contrast was 6.84:1 and the mobile browser reported no JavaScript errors.
The database follow-up is migration `20261022000400`; 19 migrations are installed in total.
See SEO-IMPLEMENTATION.md for completed changes and the remaining owner-data prerequisites.

## Hatchium widget integration

The supplied Hatchium embed runs on public website pages after hydration. Website settings →
Website chat controls its public key and enabled state. The staff portal does not embed it; entering
CMS through the header performs a document navigation to discard the public third-party runtime.
WhatsApp remains available on the opposite side. Policy and public widget configuration use
migrations `20261022000500` and `20261022000600`.

`NODE_USE_ENV_PROXY=1 node scripts/hatchium-smoke.mjs <base-url>` tests the embed contract with a
stubbed vendor script, single loading, CMS isolation and form usability when downloading the widget
fails. This is not an actual Hatchium conversation test. No Make webhook or lead API endpoint was
provided, so automatic forwarding of website forms is not active. See HATCHIUM-INTEGRATION.md for
the exact remaining destination/account setup and the distinction between Make receipt and final
chat delivery.

## GMS proposal implementation release

The proposal’s one-time website/CMS launch work adds two distinct regional guides, four editable
learning guides, twelve practical articles, crawlable blog pagination, course/market FAQs and a private
SEO growth workspace. The keyword map contains 60 research hypotheses. Real country-cohort reporting
uses saved enquiries; manual search/analytics source records start empty. No agency costing, invented
rates, tutor credentials, testimonials, backlinks or traffic results are published.

Migrations `20261022000700` and `20261022000800` were installed with history. Existing content is
preserved on repeat. New growth tables use RLS and role-based staff access; task completion requires
an evidence reference. Search Console and GA4 metrics have separate source rules. Known CMS guide
and location aliases are permanent routing-config redirects, avoiding duplicate redirect headers
observed on first-render runtime redirects.

Validation: 31 automated tests pass, production build passes, lint has no errors and 19 existing
warnings. The local production crawl checked 205 sitemap URLs and unique titles, 385 internal
destinations, four guide aliases, all twelve launch articles, FAQ visibility/schema consistency and
blog pagination. A stubbed public form transport verified the non-PII success event without saving
an enquiry. An isolated real content-editor browser session verified private growth plan/report
loading, task create/update and evidence-form defaults on desktop/mobile; its task and account were
deleted. Owner credentials were preserved.

Public release smoke check (after deployment reaches READY):

```sh
SMOKE_CANONICAL_ORIGIN=https://project-umber-three-93.vercel.app NODE_USE_ENV_PROXY=1 node scripts/growth-smoke.mjs https://project-umber-three-93.vercel.app
```

This is a functional crawl and stubbed browser-event check, not a live GA4, Make or chat-delivery test.
See docs/GMS-PROPOSAL-IMPLEMENTATION.md for the delivery map and account-dependent/recurring work.

GMS launch source `3dcae964890d9973a9234364e8eca2060f285281` reached READY as deployment
`dpl_6dHP4ojN5ArS5yzgfbNqvLJFTeVc`; deployment metadata matched the source commit. Live verification
repeated the full public checks: 205 URLs/unique titles, 385 internal destinations, four guide aliases,
twelve launch articles, 172 FAQ-schema instances matched to visible questions, pagination, mobile
planning and the stubbed non-PII success event. There were zero browser errors and no public dummy
enquiries saved. An isolated authenticated content-editor flow also passed against production,
including task create/update, market reporting, empty baseline fields and mobile layout; its account
and task were deleted. The three verified one-time launch tasks were marked complete with the source
commit as evidence. Recurring and account-dependent tasks remain open. There are 23 installed
migrations and zero seeded baseline records.

## Image and mobile release — 22 October 2026

Production deployment `dpl_J13P1WNgF81dsucS871PeUx9aK6w` is READY on https://project-umber-three-93.vercel.app from source `b1024e904873ea5753fe577d329400831491f023`. Migration `20261022000900_learning_images.sql` is installed (24 migrations total). Six generated images are registered in CMS Media Library and assigned to 6 courses, 15 articles and 169 location/learning pages.

Live checks passed: 18 WebP variants, 165 country/city routes, 10 loaded mobile/desktop cover views and 105 responsive checks across 320–1920px. Maximum observed layout shift in the controlled cover check: 0. Authenticated CMS media selection and alt-description persistence passed with an isolated temporary editor; cleanup confirmed zero temporary users/pages. Automated tests: 35 passed. Build passed; lint has 0 errors and the existing 19 warnings. Chat vendor behavior was stubbed for browser regression tests. Physical iPhone/Safari testing and field Core Web Vitals are not represented by these checks.

Public navigation uses “Portal”; its header WhatsApp links were removed. Original contact records, logo and palette remain. Home motion respects reduced-motion preferences. See [image and mobile implementation notes](docs/IMAGE-SEO-RELEASE.md).

## Mobile branding and country release — 23 October 2026

Production deployment `dpl_EuYkd1tXRMG1oLZsnYGvbzkXZjkZ` is READY from app source `5547eef485cc566881d531d4e81703f5783390c5` on the existing Vercel domain. Mobile reference layout, the original green/mint palette, restored homepage sections, compact WhatsApp icon, smaller brand assets and deferred home enquiry form are live. No new product tools or database migrations were added.

All 38 automated tests pass; build passes; lint has 0 errors and the existing 19 warnings. Live checks pass at 320/360/390/430px plus desktop, 105 responsive route/viewport checks and stubbed home enquiry confirmation. Portal redirects to login correctly via verified HTTPS; the headless browser follow-up is bridged because its native redirect trust store differs from the environment CA.

All 50 country mappings and six simulated Vercel-country redirects pass in the local production server. The live probe returned the general homepage (200); it does not establish a physical-country redirect test. Live UK/USA/Australia pages, explicit global override, crawler access and legacy redirects pass. IP routing uses Vercel-provided country data, defaults safely for missing/unsupported countries, and preserves direct content links and manual choices. Global homepage preview: https://project-umber-three-93.vercel.app/?view=global . See [implementation notes](docs/MOBILE-BRAND-AND-REGION-RELEASE.md).

## Professional imagery and SEO update — 23 October 2026

- Production READY deployment: `dpl_CDh9ThjhfMA3kfW3FNkL5Pk3PY6f`.
- Application source: `6a3c00a6a8e22c869285cde431cbc1a404e48175`; stable URL: `https://project-umber-three-93.vercel.app` (`/?view=global` opens the general homepage).
- Added a branded family learning illustration, responsive homepage learning-card visuals, and supporting contact/trial images. Removed the left floating WhatsApp shortcut; preserved Hatchium and contextual contact links.
- Supabase migration `20261023000100_about_learning_image.sql` applied; new illustration registered in Media Library with its alt text and AI illustration caption. Custom About covers are preserved.
- Local validation: 38 tests passed; lint 0 errors / 19 existing warnings; production build passed. 105 responsive checks passed. Image checks passed for 21 assets, 165 country/city pages and 10 representative viewport cases (observed layout shift 0 in that controlled run).
- Live validation: 12 homepage/About/contact/trial viewport checks passed; images decode, descriptive alt text, canonical/social metadata, matching homepage FAQ data and local-image sitemap entries verified. Left shortcut absent; vendor-stub chat loading, CMS isolation and form availability on vendor failure passed. Actual vendor message delivery was not tested; no forms or messages submitted.
- Evidence: `/workspace/reports/oqc-visuals-2026-10-23/`. Browser checks use Chromium with verified Node HTTPS transport for this environment's CA setup, not physical device coverage. No ranking guarantee or measured field-speed claim.

## Public usability and homepage motion — 23 October 2026

- Production READY deployment: `dpl_7Xb65E3VjxcMB2U2K68Rfpebnpda`; application source `31271d8337997c1433d291557af902ab44477aeb`.
- Stable website: `https://project-umber-three-93.vercel.app`; `/?view=global` opens the general homepage.
- Simplified homepage, conditional tutor/review sections, section shortcuts, staggered reveals and finite hero effects; brand palette, published routes and CMS records preserved.
- Improved mobile/keyboard menus, country/city search, contact validation, trial-step focus and confirmation feedback. No database migration or animation dependency added.
- Validation: 38 automated tests passed; lint 0 errors / 19 existing warnings; production build passed. 105 responsive checks and deferred homepage-form confirmation passed locally. Final local and live usability smoke flows passed for mobile and desktop menus, directory search, contact/trial confirmation, animation/reduced-motion behaviour and content without JavaScript.
- Form RPCs and chat vendor were stubbed in browser checks: no real leads or messages were submitted. Chromium viewport checks do not represent physical-device testing. Reports saved under `/workspace/reports/oqc-usability-2026-10-23/`.

## Distinct visuals, interface polish and security patches — 23 October 2026

- Production READY deployment: `dpl_6NJSdrVs5LFsZHAJ2zmLkLJdDULg`; application source `7d933188832fa78765e3afe26d60b7a555565cf5`.
- Stable website: `https://project-umber-three-93.vercel.app`; use `/?view=global` for the general homepage.
- 191 published content records have 191 unique covers. The 197-visual catalogue contains 32 photographic illustrations (25 new) and 165 country/city maps. Uploaded 190 new masters into Supabase Media Library; migration `20261023000200_distinct_visual_covers.sql` applied. Original logo appears in map artwork and separate photo badges. Existing homepage hero remains.
- Added responsive AVIF photo sources with WebP fallbacks, refreshed course cards, clear buttons on green backgrounds and regional hero layouts. Combined 1200px photographic AVIF payload is about 45% smaller than WebP; this is a file-size comparison, not a field speed result. Alt text, social covers and image sitemap assignments updated.
- Next.js / eslint-config-next upgraded to 16.4.3, sanitize-html to 2.18.1; scoped typography parser override to 7.1.6. Final npm audit reports zero known vulnerabilities. Deployment now uploads individual files before submitting digest references.
- Validation: 38 automated tests pass; lint 0 errors / 19 existing warnings; production build passes. 591 WebP variants, all 165 regional pages and 10 cover viewport checks passed, with observed layout shift 0 in that controlled run. After dependency patches, 105 responsive checks, usability flows and 12 focused image/layout checks passed locally.
- Final live checks passed for 12 course/blog/regional viewport cases, AVIF selection, logo/text separation and visible trial buttons; image MIME types, image sitemap and protected Portal redirect verified. Live menu/search/form validation and confirmation, animations, reduced-motion and no-JavaScript flows also passed. Forms and chat were stubbed; no real enquiries or messages were submitted. Chromium checks do not establish physical Safari coverage or search rankings.
- Evidence: `/workspace/reports/oqc-distinct-visuals-2026-10-23/`. See [visual sources and release notes](docs/DISTINCT-VISUALS-RELEASE.md).
