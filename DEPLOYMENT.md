# app.com website and CMS deployment

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
