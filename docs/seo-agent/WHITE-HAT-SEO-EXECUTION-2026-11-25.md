# OQC White-Hat SEO execution baseline — 25 November 2026

## Status and scope

Status: **BASELINE RECORDED — implementation and live verification still in progress**.

Repository: `Ehtisham1239/app.com`
Working branch: `audit/oqc-full-audit-2026-11-25`
Production canonical host: `https://www.onlinequrancollege.com`
Working mode: branch-only. No merge, deployment, DNS, CMS, Supabase, account, advertising, external outreach or production form action is authorised by this record.

Primary business outcome: qualified organic free-trial enquiries, attended trials and paid enrolments by market—not raw sessions or rankings alone.

## Confirmed source observations

1. The public homepage is indexed and its latest available search snapshot presents live one-to-one lessons, the three-day trial, course navigation and country guides. Search snapshot is not a production deployment or index-coverage guarantee.
2. The repository contains a reusable read-only SEO audit runner (`npm run seo:agent`), a 50-phrase page map, technical crawl, page-quality, search-engine and image checks. The runner explicitly does not verify authenticated GSC/GA4/Semrush performance, actual ranking positions, field CWV, form persistence or organic enrolment attribution.
3. `src/app/robots.js` allows public search and answer-engine crawling while disallowing admin, auth, API and parent paths. This is a policy declaration, not proof of crawl or indexation.
4. `src/app/sitemap.js` composes fixed pages, approved market hubs, restored location routes and CMS-published content. Location inclusion checks canonical/noindex state through `shouldIncludeInSitemap`.
5. `src/lib/locations.js` and `tests/location-indexing.test.mjs` enforce five approved indexable market hubs (USA, UK, Canada, Australia and UAE) by default; city pages remain noindex unless the CMS explicitly approves them. Do not bulk-index city pages.
6. The homepage and country pages state that Canada pricing guidance is shown in USD. The location data also uses USD for Canada. Treat this as the current displayed business choice, not as a coding error; any switch to CAD requires fee-owner approval and end-to-end form/pricing verification.
7. The USA static campaign landing page is a separate paid-intent experience from the organic USA country hub. Preserve the separate routes, campaign attribution, form and thank-you flow. Do not consolidate them or change indexation without checking the latest owner decision and live metadata.
8. The existing keyword map is dated 29 October 2026. Its GSC sample covers 1–28 October 2026 and records small impression counts on several queries; other entries are SERP hypotheses. It contains no verified search volumes. Treat it as a historical starting point, not a current performance baseline.
9. The repository's SEO knowledge register records claims about active students, enrolled countries, teacher credentials and testimonials as not checked. Do not add numbers, qualifications, accreditation, outcomes, or testimonials without current documentary approval.
10. The SEO instructions require original, useful content, verified claims, Islamic academic review for Quran/Hadith/rulings, no fabricated local presence, no manipulative links and no automated bulk content. Preserve these guardrails.

## Priority issues and evidence gaps

### P1 — Current measurement baseline is not established

The repository records historical GSC and GA4 integration statements in different documents, while the current knowledge register still marks GSC ownership/API access, GA4 property details and organic metrics as unconfirmed or null. The full repository audit also found no current authenticated GSC/GA4 export in this execution.

Required before performance-led optimisation:
- Confirm the exact verified GSC property and canonical hostname.
- Export last 28 days and previous 28 days, with dates and country/page/query dimensions.
- Export GA4 organic sessions and actual trial/contact key events for the production hostname only.
- Separate CTA clicks, form attempts, saved leads, qualified leads, attended trials and paid enrolments.
- Record a dated baseline; do not backfill missing values or infer rankings from SERP checks.

### P1 — Hostinger production source and SEO release verification

The deployment record says Hostinger serves the public www domain and deploys main. The current working branch is not production. Verify the exact Hostinger deployment commit, build log, live canonical/robots/sitemap and page HTML only after a separately approved release. No deployment was triggered.

### P1 — US state expansion needs a quality gate

Prior approved research used 2020 U.S. Religion Census / ARDA estimates (not 2026 population counts) and prioritised:
- Phase 1: New York, California, Illinois, New Jersey, Texas.
- Phase 2: Michigan, Maryland, Virginia, Pennsylvania, Massachusetts, North Carolina.
- Phase 3: Florida, Georgia, Ohio, Minnesota, Arizona.

These estimates are audience-research context only. They do not prove OQC customers, local demand, local teachers, a branch or a ranking opportunity. Do not publish 15 near-identical doorway pages. First validate state-level GSC demand and build unique, useful state-specific material (real scheduling constraints, parent questions, available services, accurate currency/fees and local proof). Until each page passes editorial and local-evidence review, keep it as a research/content brief or noindex draft. Keep `/locations/united-states` as the main organic USA hub and `/usa-quran-classes` as a distinct campaign route.

### P2 — Existing content needs page-by-page editorial review

Prioritise existing pages before creating more:
1. USA and other market hubs.
2. Course pages (Noorani Qaida, Quran reading/Nazara, Tajweed, Hifz, Arabic, Quran translation/Tafseer, Hadith/Islamic studies).
3. Pricing, free trial, teachers, about, FAQ and contact.
4. Existing blogs mapped to commercial pages.

For each page, check search intent, uniqueness, accurate offer/fee statements, useful original detail, author/reviewer transparency, internal links, title/description, H1/H2 structure, canonical, indexability, image alt, broken links and a clear next step. Do not add words merely to reach a target length.

### P2 — Internal links and content architecture

Maintain one clear intent per URL. Use contextual links from relevant guides to the matching course, market hub and trial page. Do not force exact-match anchors or create large generic footer link blocks. Monitor orphan pages and pages with only one inbound link.

### P2 — Technical SEO and structured data

Re-run the repository's full read-only audit on the production alias and branch QA build. Separately verify:
- status codes, redirects, canonical host and redirect chains;
- robots and XML sitemap URL eligibility;
- unique titles/descriptions and exactly one visible H1;
- rendered metadata and internal crawlable links;
- image response, dimensions, alt and mobile layout;
- JSON-LD syntax and consistency with visible page facts;
- Core Web Vitals from field data where available.

Do not treat a green build, schema presence, FAQ markup or Lighthouse lab score as proof of indexing, rich results or rankings. FAQ rich-result appearance is not an OQC growth target.

### P2 — Ethical authority building

Continue only relevant, editorially earned opportunities: useful original teaching resources, expert-reviewed learning guides, genuine community/education partnerships and digital PR where a real relationship exists. No paid ranking links, PBNs, mass directories, profile/forum links, automated outreach, reciprocal link schemes or fabricated mentions. No outreach is sent without approval.

## Implementation sequence

1. **Baseline and reconcile** — verify current live pages, route map, claims, indexation and analytics; resolve contradictory/stale operating records.
2. **Fix confirmed technical defects** — only changes demonstrated by current crawl/tests; preserve routes, canonical equity, analytics, forms and production data.
3. **Optimise existing money pages** — page-specific intent, copy, metadata, links, images and trust evidence.
4. **Remediate existing articles** — improve usefulness, sources, reviewer process, internal links and next steps; consolidate only with redirect/canonical evidence.
5. **USA state content pilot** — research briefs for Phase 1 states; do not mass-create or index thin state pages.
6. **Authority and AEO/GEO** — improve clear factual answers and source transparency; no guarantees of AI citations or placements.
7. **Measurement and iteration** — weekly evidence review, monthly market KPI report, QA and approved release.

## Acceptance criteria

- No unexplained change to existing URL, canonical, redirect, index/noindex or sitemap policy.
- No broken public pages, forms, lead attribution, CRM integration or student/parent data.
- Every published factual claim has an approved source; Quran/Hadith content has academic review.
- All intended indexable pages return 200, self-canonicalise as intended, have unique metadata and are in the sitemap; private/noindex pages are excluded.
- All changes pass tests, lint, production build, responsive and public-page audits on the exact branch SHA.
- Hostinger live verification is recorded separately after an approved deployment.
- Report measured outcomes only from authenticated, dated GSC/GA4/CRM evidence.

## Current completion state

- Repository review: **IN PROGRESS**.
- Historical keyword map reviewed: **COMPLETE (dated baseline only)**.
- Current authenticated GSC/GA4 baseline: **REQUIRES ACCESS / VERIFICATION**.
- Live full-site crawl in this execution: **NOT RUN** (the repository's runner requires execution from a local/QA runtime).
- Content remediation: **NOT YET IMPLEMENTED**.
- USA state pages: **RESEARCH PRIORITY APPROVED; INDEXING NOT APPROVED**.
- Production merge/deployment: **NOT AUTHORISED / NOT PERFORMED**.
