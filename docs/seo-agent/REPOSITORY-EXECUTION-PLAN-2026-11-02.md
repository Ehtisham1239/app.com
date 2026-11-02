# OQC website repository execution plan

**Updated:** 2 November 2026  
**Repository:** `Ehtisham1239/app.com`  
**Website:** https://www.onlinequrancollege.com  
**Scope:** This plan applies only to the OQC public website in this repository. Do not modify unrelated repositories, projects, accounts or business systems.

## Execution rules

1. Inspect the current default branch and production source before each implementation batch; this working branch may be behind newer owner-approved changes.
2. Preserve existing Next.js 16 + Supabase architecture and existing SEO infrastructure. Extend existing helpers and scripts; do not create duplicate metadata, schema, sitemap, analytics or crawl systems.
3. Work on an isolated branch and open a reviewable PR. Never write directly to the production branch as a shortcut.
4. Do not publish CMS content, change DNS, alter Vercel settings, submit search-engine forms, send outreach, change advertising, or alter analytics consent without the specific required authorization.
5. Keep all business claims evidence-backed. No invented reviews, ratings, testimonials, accreditations, addresses, branches, prices, staffing claims, student counts or AI-search citations.
6. Preserve the owner decisions in `AGENTS.md`: GTM `GTM-W7CMZS53` owns GA4 `G-57TGPTDNT4`; no duplicate direct GA4 loader; preserve cookieless measurement, cookie shield and denied advertising consent; free trial is 3 days and excludes Weekend; retain approved geo-currency behavior and brand colours.
7. Treat implementation status precisely: observed, changed in branch, locally verified, preview deployed, production deployed, production verified. Never collapse these into “done”.

## Confirmed existing foundation

- `src/app/robots.js`: public crawl policy and sitemap declaration.
- `src/app/sitemap.js`: dynamic sitemap built from published CMS content and approved location records.
- `src/lib/seo.js`: metadata helpers, canonical validation, duplicate metadata checks, content analysis, sitemap inclusion and JSON-LD helpers.
- `scripts/seo-agent-audit.mjs`: read-only audit orchestration.
- `scripts/keyword-coverage.mjs`: visible topic placement checks, not search-volume or ranking measurement.
- `scripts/search-engine-audit.mjs`: public Google/Bing-oriented release checks.
- `AGENTS.md` and `docs/seo-agent/MASTER-OPERATING-SPEC.md`: governing owner decisions and SEO/AEO/GEO guardrails.

## Implementation batches

### Batch 0 — source-of-truth and branch reconciliation

- Compare this branch with the latest default branch and production release commit before applying changes.
- Read all nested `AGENTS.md` instructions and the secure-engineering skill references relevant to each change.
- Reconcile the current owner-approved market order with the existing market/indexation register. Recent owner requests include USA, UK, Australia, Canada and UAE, while the current SEO instructions park UAE. Do not silently change UAE indexability or publish UAE pages until the owner decision and local service evidence are recorded.
- Reconcile claims, page, content, keyword and link registers; preserve noindex rules for pages without approved evidence.
- Confirm the canonical host, Vercel project/team and production alias using live authenticated evidence before deployment work.

### Batch 1 — technical SEO and crawl integrity

- Run the existing SEO agent, keyword coverage, keyword map, search-engine audit, site-quality, lint, test and production build scripts in a real checkout.
- Compare sitemap URLs with live canonical, indexable, successful routes; detect duplicate URLs, redirect destinations, noindex leaks and stale CMS records.
- Validate robots rules, XML sitemap response/content type, canonical host, metadata, one primary H1, crawlable internal links, redirect chains and orphan routes.
- Add regression tests only for confirmed defects. Do not weaken checks to make a report pass.
- Confirm that dynamic CMS and location routes remain safe when records are missing, unpublished or marked noindex.

### Batch 2 — AEO/GEO and structured data

- Audit visible page answers for high-intent parent and learner questions; lead with a concise factual answer and then supporting detail.
- Maintain claim-to-evidence references and visible author/reviewer context only when verified.
- Emit schema only when it accurately describes visible page content and the relevant current search-engine guidance supports the type.
- Validate JSON-LD syntax, entity consistency, canonical URLs and visible-content parity. Never use schema to introduce hidden claims or review markup.
- Record AI answer appearances as dated observations with query, engine, URL and evidence. Do not promise or imply guaranteed citations.

### Batch 3 — international organic growth

- Research intent separately for USA, UK, Australia, Canada and UAE; do not copy country pages by swapping place names.
- Before indexation, verify market-specific service details, teaching-time availability, currency display, spelling, contact/lead routing and genuine local relevance.
- Keep country/city page indexation governed by the approved page register and documented evidence. City pages require enrolled families, consented local proof and real local detail under current policy.
- Do not create physical-office or local-branch claims for this online-only academy.
- Keep all free-trial and pricing language consistent with owner-approved facts.

### Batch 4 — conversion and measurement

- Preserve current GTM/GA4 implementation and privacy behavior.
- Verify actual GSC and GA4 properties, stream, reporting timezone, event delivery and country/landing-page data using authorized access.
- Trace the organic funnel from landing page to saved enquiry, qualified lead, trial booking, attendance and paid enrolment where systems expose reliable data.
- Keep PII out of analytics events and SEO reports. Never infer qualified leads from aggregate form submissions.
- Add tests for event allowlists and sensitive query/path redaction when relevant.

### Batch 5 — content, images, accessibility and performance

- Audit existing content first; retain the owner’s maximum 1,000-word blog preference without treating word count as a Google ranking factor.
- Correct only substantiated factual, metadata, internal-link, image-alt and heading defects.
- Test responsive layouts, keyboard/focus flows, forms, image loading, mobile overflow and representative user journeys.
- Separate local Lighthouse lab scores from field Core Web Vitals; production field data requires real CrUX/PageSpeed evidence.
- Keep Islamic text, Qur'an references, hadith and rulings flagged for qualified academic review.

### Batch 6 — preview, release and production verification

- Run focused unit/regression tests, full project tests, lint, build, browser smoke and relevant SEO crawls.
- Inspect the actual preview deployment and verify the deployed commit SHA.
- Production release requires explicit release authorization and confirmed correct Vercel project/team/domain.
- After release, verify canonical domain, key landing pages, free-trial flow, sitemap, robots, redirects, analytics events and error logs.
- Record rollback candidate, deployment URL, commit SHA, test evidence and unresolved risks.

## Current blockers

- No local repository checkout/build runtime is available in the current tool session; therefore test, lint, build and browser execution cannot be truthfully claimed.
- Current Vercel team/project discovery did not establish access to the production project or domain; deployment is blocked pending correct project/team authorization.
- GSC/GA4 live reporting access is not established in this implementation session; no live performance metrics are claimed.
- Market indexation policy needs explicit reconciliation before UAE or additional country/city pages are made indexable.

## Acceptance criteria

- [ ] Changes are based on the latest default-branch source.
- [ ] Each confirmed defect has a minimal fix and regression coverage.
- [ ] No duplicate SEO or analytics infrastructure is introduced.
- [ ] All relevant tests, lint, build and browser checks pass in a real checkout.
- [ ] Preview deployment is inspected and tied to the intended commit.
- [ ] Production release is separately authorized and verified.
- [ ] GSC/GA4 findings cite current authenticated data.
- [ ] Market pages and business claims meet owner evidence rules.
- [ ] No unrelated repositories, projects or accounts are modified.
