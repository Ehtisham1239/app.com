# SEO audit implementation — 22 October 2026

The owner approved the audit follow-up and chose to keep the current Vercel production domain.
This release implements the code and content corrections that can be supported by available
source material. It does not claim ranking improvements, search account connectivity, or verified
local prices. The original college domain and DNS are unchanged.

| Audit issue | Result |
| --- | --- |
| SEO-001 canonical host | Owner chose the existing Vercel origin; canonical, sitemap and social URLs remain there. No domain migration. |
| SEO-002 legacy arrivals | Seven old UK/city paths redirect directly to their matching location routes. Bradford and Leicester have editable CMS pages; careers has an honest enquiries page without a vacancy claim. |
| SEO-003 form countries | Previously completed: all supported markets occur once in country selectors. This release also resolves known city-specific time zones in trial requests. |
| SEO-004 local page usefulness | Added date-aware local scheduling, city-specific IANA zones and practical enrolment/fee guidance. No invented branches, regional prices, reviews or teacher availability. Market-specific editorial expansion still needs verified business details and demand data. The generic CMS paragraphs are not claimed to be unique regional research. |
| SEO-005 measurement | Campaign reporting explains that untagged website leads are unclassified. Official GA4/GSC entry points are available. Account verification, IDs, consent decisions and actual search/analytics data remain external prerequisites; no analytics transport was added. |
| SEO-006 storage notice | Public policy describes campaign tags, click IDs, sessionStorage, browser lifetime and enquiry persistence. Expired browser entries are cleared when checked. |
| SEO-007 CTA contrast | White on college green replaces white on emerald for secondary CTAs, with a darker hover. Browser-measured default text contrast is 6.84:1. |
| SEO-008 unsupported claims | Removed original seeded student-count, establishment and blanket credential/background-check claims. Existing content revisions preserve prior page copy. Owner-edited paragraphs and custom stats are preserved. Verified figures/credentials can be added through CMS after evidence is supplied. |
| SEO-009 currencies | Fees editor includes every supported location currency. It validates amounts, duplicate currencies and whole-unit ISK input while keeping existing hundredths-based storage. No local rates or exchange conversions were created. |
| SEO-010 search titles | Short, distinct location title defaults match CMS previews; explicit CMS SEO titles still take precedence. |
| SEO-011 breadcrumbs | BreadcrumbList uses the same names, hierarchy and URLs as visible location breadcrumbs. All JSON-LD is escaped. |
| SEO-012 certificate utility | Functional verification route is noindex/follow and omitted from sitemap. It remains accessible through existing website links. |
| SEO-013 releases | Tracked source-upload script targets the existing Vercel project, requires a clean committed checkout and records its source commit. Git integration remains disconnected; pushes alone do not deploy. See DEPLOYMENT.md. |
| SEO-014 performance evidence | Browser checks verify functional rendering and mobile overflow. They are not CrUX, Lighthouse, INP or real-user CWV results. Search Console/CrUX field data and representative direct-network lab measurements still require access. No unsupported performance claim or third-party monitoring was introduced. |

## Validation and migration

`npm test` passes 24 tests, including RLS, content publishing, form persistence, currency checks,
legacy mappings and clock-change handling. Lint has no errors and 19 pre-existing warnings
(one existing render-time Date.now warning was fixed). The production build passes.
`scripts/seo-smoke.mjs` checks all 165 location routes, canonical links, unique titles, breadcrumbs,
seven redirects with preserved campaign queries, policies, utility indexing and a mobile scheduling
and trial-prefill flow. It does not submit dummy forms or change owner login credentials.

Migration `20261022000400_seo_audit_followup.sql` was tested for repeatability and preserving
custom page content. It adds the privacy notice, replaces only matching seeded unsupported claim
paragraphs/stats, and inserts the two restored city pages without overwriting existing pages.
It was applied to the authorised app.com Supabase project with migration history. Public copy
before the migration was saved outside the repository; page revision triggers also retain snapshots.

## Remaining external inputs

To establish organic growth baselines, the owner must provide authorised Search Console/analytics
property access or exports. Local fees, teacher credentials, historical figures and genuinely local
editorial detail need approved source information. These items cannot be completed by inventing
numbers or treating a link to an official tool as a connected account.

## Rollback

Revert the release code and redeploy the previous reviewed source to the same Vercel project.
Restore public page copy selectively through CMS revisions if required; preserve later owner edits.
Previous settings copy is in the release's private public-content backup outside Git. Do not reset
users, remove enquiries, delete approved prices or rerun the fresh-database bundle on the live project.
