# OQC SEO + AEO + GEO repository audit and implementation checkpoint

**Date:** 2 November 2026  
**Repository:** `Ehtisham1239/app.com`  
**Default branch at inspection:** `main`  
**Scope:** Read-only source audit and safe implementation planning; no production deployment or live account changes.

## Executive status

The repository is a substantial Next.js 16 + Supabase website, not an unconfigured SEO starter. It already contains a large SEO foundation and an executable SEO-agent workflow. Rebuilding those systems would create regression risk. The next implementation should close verified gaps and reconcile conflicting operating instructions rather than add duplicate metadata, analytics, schema or content systems.

### Confirmed from repository source

- `package.json` defines `seo:agent`, `seo:keywords`, `seo:keyword-map`, `seo:search-engines`, `seo:notify`, site quality, performance and browser-smoke scripts.
- `src/app/robots.js` allows public crawling, disallows `/admin`, `/auth`, `/api/` and `/parents`, and points to the sitemap.
- `src/app/sitemap.js` generates the sitemap from fixed pages, approved location records and published courses, pages, posts and teachers. It applies `shouldIncludeInSitemap` and canonical/noindex rules.
- `src/lib/seo.js` already provides title/description helpers, canonical validation, content analysis, duplicate metadata detection, sitemap inclusion rules, safe JSON-LD serialization, BreadcrumbList, FAQPage and location Service schema helpers.
- `next.config.mjs` contains legacy redirects, security headers, image caching and admin noindex controls.
- Existing docs record a detailed SEO implementation, a reusable SEO agent, keyword coverage and previous production QA. These are historical records; this audit does not independently re-run those earlier tests.
- `AGENTS.md` is authoritative for owner decisions: the free trial is 3 days (Weekend plan excluded); GTM `GTM-W7CMZS53` owns GA4 `G-57TGPTDNT4`; do not load a duplicate direct GA4 tag; preserve the approved cookieless analytics/cookie-shield and denied advertising consent; approved local-currency behavior must remain unchanged.

## High-priority issues to reconcile

1. **Market-priority conflict:** the SEO-agent instructions currently say UK first, USA/Australia later, Canada after that, and UAE parked. Recent owner direction requests USA, UK, Australia, Canada and UAE work. Before publishing new market pages or changing indexability, update the source-of-truth decision register to reflect the owner's latest explicit market order and evidence. Do not assume that every country hub or city page should be indexable.
2. **Domain / Vercel account mismatch:** repository README and SEO instructions identify `https://www.onlinequrancollege.com` as canonical and name Vercel project `appcom-online-quran-college`. The currently connected Vercel project-list tool surfaced that project but project-detail lookup returned 404, and the connected domain list returned no domains. Treat deployment configuration as REQUIRES ACCESS until the correct Vercel team/project connection is resolved.
3. **Analytics access:** `AGENTS.md` records an approved GTM/GA4 implementation. Do not infer current property access or data freshness from source code. Reconnect/authorize Search Console and GA4 reporting and verify the actual properties, streams, event delivery and country-level conversion data before changing tracking.
4. **AEO/GEO measurement:** source helpers support FAQ and service structured data, but the presence of schema is not evidence of AI answer citations. Establish a page-level answer-readiness and entity/claim register, record primary-source citations, and measure referral/mention evidence where available. Do not promise inclusion in AI answers.
5. **Claims and trust:** revalidate student counts, teacher qualifications, safeguarding, reviews, ratings, trial language, pricing and service-area statements against current owner-approved evidence. Never add aggregate ratings/review schema from unverified or ineligible sources.
6. **International localization:** use country-specific currency, terminology, time zones and genuine service detail. Avoid spun near-duplicate pages. Keep city pages noindex unless their documented local-proof requirements are met.

## Safe implementation sequence

### P0 — reconcile source of truth and access
- Review the complete SEO-agent operating specification and current claims/page/keyword registers.
- Resolve the five-market priority order and the current approved page-indexation policy.
- Confirm canonical production domain, correct Vercel team/project and deployment connection.
- Verify GSC domain property and GA4 property/stream access; preserve the existing GTM ownership and consent design.

### P1 — technical SEO verification and targeted fixes
- Run the repository's existing `npm run seo:agent`, `npm run seo:keywords`, `npm run seo:keyword-map`, `npm run seo:search-engines`, `npm run verify:site`, `npm run lint`, `npm test` and production build in a controlled checkout.
- Compare generated sitemap URLs with actual canonical/indexable routes.
- Check rendered HTML and browser-rendered output for titles, descriptions, canonicals, robots directives, headings, internal links, structured data and crawlable anchors.
- Validate redirects and ensure no redirect chains or accidental noindex on priority hubs.
- Run mobile and performance checks; distinguish Lighthouse lab data from field Core Web Vitals.

### P2 — AEO/GEO content and entity quality
- Build answer blocks for genuine high-intent questions: concise answer first, useful detail next, clear source/author/reviewer context where verified.
- Link claims to primary authoritative sources; add visible references where useful.
- Ensure Organization, Course, Article, BreadcrumbList, FAQPage and Service schema are only emitted where visible page content supports them. Validate every schema type and avoid invented properties.
- Maintain consistent organization name, canonical URL, offerings, service model and contact facts across the site and legitimate third-party references.
- Track target queries/prompts and evidence by engine/date; treat AI citations as observations, not guaranteed outcomes.

### P3 — international and conversion growth
- Research and map query intent separately for USA, UK, Canada, Australia and UAE.
- Create/expand only pages with distinct audience value and approved business details.
- Keep free-trial offer and pricing consistent with `AGENTS.md`.
- Measure organic qualified leads, trial submissions, bookings, attendance and paid enrolments by country/landing page, subject to actual CRM/ERP attribution and privacy controls.

## Access and execution limitations observed

- GitHub repository is accessible with repository write permissions.
- The available GitHub connector supports branch and file/PR mutations; this branch is isolated from `main`.
- The current tool session does not provide a local checkout/runtime for installing dependencies and executing this repository's test/build scripts. Therefore no tests, lint, build, browser crawl or live deployment are claimed in this checkpoint.
- Vercel project detail/domain verification is currently blocked as described above.
- GSC/GA4 data access is not established in this checkpoint.

## Acceptance criteria before merge

- [ ] Owner-approved market priority and page indexation decisions recorded.
- [ ] Correct Vercel project/team and canonical domain verified.
- [ ] GSC and GA4 properties authorized and reporting data confirmed.
- [ ] SEO agent and keyword audits run against the current production alias; artifacts retained.
- [ ] Sitemap, robots, canonical, redirects and rendered page metadata pass crawl QA.
- [ ] AEO/GEO content and schema changes pass source-evidence and structured-data validation.
- [ ] No fabricated claims, reviews, addresses, branches, author credentials or AI-citation promises.
- [ ] `npm test`, `npm run lint`, `npm run build` and relevant browser/site QA pass.
- [ ] Preview deployment is inspected; production deploy is separately authorized and smoke-tested.
- [ ] Rollback candidate and release evidence are recorded.

## Status

**Observed:** repository structure and source-level SEO foundations.  
**Implemented in this branch:** this audit/implementation checkpoint only.  
**Not yet implemented or verified:** source-code fixes, automated test execution, GSC/GA4 reporting, Vercel project verification, preview deployment and production release.
