# CMS header code and schema markup — 15 November 2026

Requested by the SEO team (Ghulam Nabi, 4–6 Nov 2026): manage verification/SEO head code and JSON-LD from the CMS without a developer, with schema in the initial HTML and no duplicates.

## Why validator.schema.org listed only WebPage and FAQPage

Observed on production (`dpl_9exiRCD6jChJAwknKFkhEYBsrtVt`, source `bdda2d1`): the homepage HTML already contained the site-wide graph — `WebSite` and `["EducationalOrganization","Organization"]` — server-rendered in the first HTML response, not injected by JavaScript. The Schema Markup Validator merges nodes linked by `@id` and lists only root entities. `WebPage` links to `WebSite` (`isPartOf`) and to the Organization (`about`), and `WebSite` links to it as `publisher`, so the validator shows both nested inside `WebPage` with 0 errors and 0 warnings. Google's Rich Results Test lists them separately. Linking by `@id` is the recommended pattern, so the markup was kept.

## What was added

Admin → Website settings → **SEO code & schema**:

| Part | Setting row | Who can save | Output |
|---|---|---|---|
| Header custom code | `site.head_code` | `seo_code:update` — Super Admin (`*`) and Administrator | `<meta>`, `<link>` and async `<script src>` in `<head>`; inline scripts at the start of `<body>`. Public pages only. |
| Site-wide schema | `site.custom_schema.schema` | `settings:update` (Admin, Marketing) | Merged into the one site-wide `@graph`. Organization/EducationalOrganization/WebSite objects extend the built-in nodes (CMS values win, lists combine); other types are appended once. |
| Page schema | `site.custom_schema.page_schemas` | `settings:update` | One JSON-LD block on an exact path (`/pricing`) or section (`/blog/*`). |

Safeguards (`src/lib/custom-code.js`, pinned by `tests/custom-code.test.mjs`):

- Head code is parsed, not pasted: only allowlisted tags/attributes; no event handlers, `http:` or blocking external scripts, stylesheets, canonical/icon links, reserved metadata (description, robots, OG…), JSON-LD, or tags already installed (GTM-W7CMZS53, GA4 G-57TGPTDNT4, Clarity). Exact duplicates and the Search-engines verification code are removed.
- Schema must be valid schema.org JSON. Page-only types (WebPage, FAQPage, BreadcrumbList, Article…) are refused site-wide; a second Organization/WebSite with another `@id` is refused; page entries cannot redefine the site identity or the page's built-in WebPage; one FAQPage/BreadcrumbList per entry.
- The public render re-validates and drops anything invalid, so a value written directly to the database cannot inject markup. JSON-LD is escaped (`<` → `<`).
- Database: restrictive RLS policies (`20261115120000_seo_custom_code.sql`) require `seo_code:update` to insert, update or delete `site.head_code`; other settings rows are unchanged.
- Performance: values come from the existing cached settings query; pages stay statically generated/ISR (no per-request rendering added).

Also fixed: `/quran-study` published two WebPage blocks with the same `@id` (page + PageHero); the page's own block was removed.

## Verification

- `npm test` (428 tests, 13 new), `npm run lint` (0 errors) and `npm run build` pass locally.
- Offline build against a local PostgREST stand-in serving seed content plus test values: head tags placed as described, invalid trailing tag dropped, Organization merged (one node), page schema only on its paths, disabled entries absent. A scan of all 226 prerendered pages found no repeated `@id`, FAQPage, BreadcrumbList, Organization or WebSite (the four pages without an Organization were 404/error pages).
- Production checks after release are recorded in the PR.

## Rollback

Revert the PR (the site ignores the two rows without this code). Database rollback: drop the three `head code …` policies, delete `('admin','seo_code:update')` and the `site.head_code` / `site.custom_schema` rows.

## Release record (15 Nov 2026)

- Migration `20261115120000_seo_custom_code.sql` applied to Supabase `lgbwidraztavhhbnbfhr` before merge. Policy check (one transaction, rolled back): Marketing (content_editor) could not update `site.head_code` (0 rows) but could update `site.custom_schema` and other settings; Administrator could update all.
- PR #261 merged as `78e92ce`. Hostinger build `01a1dfd8-68c8-723d-b164-71ecb7b2810a` completed and published at 15:36 UTC; live `/quran-study` now has one WebPage block.
- Schema Markup Validator on the live homepage after release: 0 errors, 0 warnings (WebPage + FAQPage roots; WebSite and EducationalOrganization nested). Google Rich Results Test needs a signed-in Google account and is left to the SEO team.
- Microsoft Clarity `zdo7gxbgkn` was already installed in the root layout `<head>` (#256); do not add it again through Header custom code (the parser refuses it).

## Development dependency audit (15 Nov 2026)

`npm audit --omit=dev`: 0 vulnerabilities. `npm audit fix` (no `--force`) updated Lighthouse's Sentry/glob chain and typescript-eslint patch versions (11 → 8 moderate advisories). The remaining 8 are one advisory (GHSA-g3hv-75wg-m249, minimatch pattern DoS) inside lint tooling: typescript-eslint requires minimatch ^10 and the fix is only in 11.x, while npm's `--force` fix downgrades eslint-config-next to 15. Not applied: it affects only local/CI linting of our own files, never the website.
