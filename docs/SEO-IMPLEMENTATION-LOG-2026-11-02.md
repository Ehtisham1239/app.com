# OQC SEO / AEO / GEO implementation log — 2 November 2026

## Scope and evidence standard

Owner instruction: proceed with all website optimization workstreams in priority order and maintain an evidence-based deployment log.

Status labels used here:
- **Observed** — returned directly by GitHub/Vercel tools or public-source inspection.
- **Source-configured** — present in repository code or documented project settings; not proof of live third-party receipt.
- **Previously verified** — supported by dated project evidence, not re-tested in this run.
- **Pending** — requires account access, business confirmation, a new measurement, or a reviewed release.
- **Not done** — no mutation or external submission was performed.

## 1. Production source and hosting identity

| Item | Evidence | Status |
|---|---|---|
| GitHub source | `Ehtisham1239/app.com`, default branch `main`; README identifies it as the OQC Next.js 16 + Supabase website/CMS | Observed |
| Vercel project | `appcom-online-quran-college`, project ID `prj_ohTvpaIwR1bWHFJWl23QiNfOoJG7` | Observed |
| Deployment source link | Vercel deployment metadata explicitly reports GitHub repo `Ehtisham1239/app.com` | Observed |
| Latest production deployment in inspected list | READY, branch `main`, commit `6950777877241c38d1d6e78e6211ac08ea9886c8` | Observed |
| Newest ready preview in inspected list | READY, branch `claude/oqc-direct-trustpilot-2026-11-02`, commit `199ea7d1be2446a02cfa9e8b2632e17921126c89`; two commits ahead of main | Observed; preview only |
| Production domain | `www.onlinequrancollege.com` attached and verified in Vercel project inventory | Observed |
| Apex domain | `onlinequrancollege.com` attached, verified, and configured to redirect to www with HTTP 308 | Observed |
| Canonical site URL env | Vercel environment inventory reports `NEXT_PUBLIC_SITE_URL` set to the www origin for production/preview/development | Observed |
| Registrar DNS | Hostinger DNS zone was not inspected in this run | Pending |

## 2. Safe repository action taken

A documentation-only branch, `ops/seo-evidence-2026-11-02`, was created from `main`.

- Updated `content/deployment-target.json` to record the verified Vercel domain state, canonical www host, project identity, repository and verification date.
- No application source, database, production environment variable, DNS record, domain routing, CMS content, or live account was changed.
- No production deployment or promotion was initiated.
- The documentation branch is not merged into `main`; it does not affect the live site.

## 3. Analytics and Search Console discrepancy — P1

Owner's latest message says Search Console setup is in progress and GA4/GTM are not configured.

Repository evidence is inconsistent with that statement:
- `src/lib/default-settings.js` contains enabled analytics defaults with GA4 ID `G-57TGPTDNT4` and GTM ID `GTM-W7CMZS53`.
- `AGENTS.md` records an owner-approved GTM configuration and GA4 tag.
- The operations register dated 31 October records a read-only GA4/GSC baseline refresh and matching production GA4 identity.
- Vercel's environment inventory does not expose any GA4/GTM environment variables; the application obtains these settings through the CMS.
- Source configuration and historical QA do not prove current Google tag delivery, GA4 Realtime receipt, or that the owner still has access to the corresponding properties.

**Decision:** do not overwrite IDs, disable analytics, create a second property, or install a duplicate tag. Next verification must inspect the current CMS setting and use GTM Preview / Tag Assistant plus GA4 Realtime or DebugView with a controlled test visit. Confirm Search Console property ownership and sitemap processing in the owner's Google account. Do not send real trial forms during QA.

Existing implementation supports page views, allowlisted lead/contact signals and Web Vitals. The saved-enquiry event must not be represented as a qualified lead, attended trial or paid enrolment.

## 4. Technical SEO / AEO / GEO baseline

Observed in source:
- `src/app/robots.js` provides crawl rules and references the canonical sitemap.
- `src/app/sitemap.js` dynamically generates public fixed pages, eligible country/location pages, published courses, CMS pages, blogs and teacher profiles.
- `src/lib/seo.js` includes canonical validation, title/description analysis, duplicate metadata checks and sitemap eligibility rules.
- Site-wide Organization/WebSite JSON-LD is generated from site identity/contact settings; homepage WebPage JSON-LD is also present.
- Sitemap/indexability logic excludes CMS records marked noindex and applies canonical checks.
- SEO scripts exist in package scripts: `seo:agent`, `seo:keywords`, `seo:keyword-map`, `seo:search-engines`, and `audit:performance`.

Previously verified in repository registers:
- 20 targeted article remediations recorded as live on 28 October.
- Technical SEO changed-page review recorded on 31 October; 49 sitemap declarations were observed in that dated check.
- UK, USA, Australia and Canada are the approved country hubs. City pages remain noindex until local proof is approved.
- Maximum 1,000 words per blog is an OQC editorial rule, not a search-engine ranking requirement.
- Existing content and schema work is to be extended only where there is a real user need and evidence.

Pending:
- Fresh whole-site crawl against current production.
- Current GSC indexing/canonical/sitemap reports.
- Updated duplicate-title/description and internal-link report.
- Validate visible content and JSON-LD against current CMS data.
- Expert review for religious content and teacher qualification claims.

## 5. Speed / Core Web Vitals

Previously recorded evidence:
- 26 October PageSpeed lab report: mobile performance 88, LCP 3.5s; desktop performance 100, LCP 0.7s. The record states CrUX had no field data.
- 28 October local Lighthouse: mobile performance 93, desktop 100; mobile LCP 3.17s. This is local lab evidence, not production field CWV.
- 31 October PageSpeed Insights API attempt returned HTTP 429; no valid new lab or field measurement was returned.
- The source already defers the review form chunk until user intent, uses responsive AVIF/WebP learning imagery, and includes Vercel Speed Insights.

Decision:
- Do not publish a new score or claim that field Core Web Vitals pass.
- Re-run PageSpeed/Lighthouse on production homepage, a course page, pricing and free-trial when measurement access/quota permits.
- Collect field p75 LCP/INP/CLS by mobile/desktop and country when available.
- Preserve eager/high-priority hero loading; lazy-load only below-the-fold media; avoid adding third-party scripts without a measured reason.

## 6. Trustpilot / review integrity

Observed in main source:
- The website has a CMS-controlled review button and a review submission workflow.
- Review submissions are stored as unpublished drafts; they are not automatically published as testimonials.
- The latest mainline review workflow defers loading the larger review form until visitor intent.
- Google and Trustpilot invitations are presented to every reviewer regardless of rating; tests explicitly reject star-rating gating.
- Reviewer first-name display and permission-before-publishing guidance are present in the admin workflow.

Preview-only work:
- A separate ready preview branch, two commits ahead of main, changes the review button toward a direct Trustpilot invitation. It is not part of the inspected production deployment. Review and test that branch before any merge.

Previously observed Trustpilot profile issues (dated public audit):
- Profile had a small historic review count and no recent invitation activity shown.
- TrustScore presentation was inconsistent between page text and graphic; do not use a fixed score in site copy/schema until rechecked.
- Improve profile description, categories and verified contact details only through the authorised Trustpilot account.
- Send a neutral, fair invitation to all eligible customers. No incentives, pressure, positive-only selection or review gating.

Pending:
- Recheck current Trustpilot score/count/profile details.
- Verify business profile owner access.
- Update profile description/logo/category if account access is granted and all claims are confirmed.
- Do not add aggregateRating/review schema unless it is eligible, accurate, visible and policy-compliant.

## 7. International citations and entity authority

Owner-confirmed business model: online-only academy, no customer-facing physical office.

Consequences:
- Do not create a Google Business Profile or Bing Places listing for a virtual/imaginary office.
- Google states a business must make in-person customer contact during stated hours and lists online-only businesses as ineligible: https://support.google.com/business/answer/13763036
- Build legitimate brand/entity citations instead: Trustpilot, LinkedIn, suitable online education directories, genuine partner/resource pages, educational editorial mentions and authentic professional profiles.
- Verify exact legal name, website, contact details, service model, country targeting and claims before submission.
- Do not associate OQC with similarly named but unrelated Quran academies.
- Keep citation records separate from backlink records; a citation is not automatically a backlink.

Previously documented outreach state:
- Five link/resource candidates reviewed; one resource pitch prepared; zero acquired backlinks recorded in the 28 October register.
- RISE resource submission was identified as a possible next step; it requires a verified OQC sender and the appropriate owner approval/access before submission.

## 8. Current release gates and next actions

| Priority | Action | Required evidence / completion gate |
|---|---|---|
| P1 | Confirm current CMS analytics setting and Google account ownership | GTM Preview/Tag Assistant + GA4 Realtime/DebugView; GSC property status |
| P1 | Run fresh technical crawl | URL inventory, HTTP status, canonical, indexability, robots, sitemap, metadata, schema and internal-link report |
| P1 | Verify free-trial form data and conversion flow | No placeholder contact value; successful controlled test only in a safe test environment; no PII in analytics |
| P1 | Confirm production performance baseline | Fresh mobile/desktop PSI/Lighthouse and field CWV where available |
| P2 | Review Trustpilot preview branch and profile | PR diff/tests, verified profile facts, policy-compliant neutral invite flow |
| P2 | Update entity/citation register | Verified publisher eligibility, exact brand facts, live listing URLs and evidence |
| P2 | Refresh country and keyword map | GSC country/query/page data; no invented search volume or rankings |
| P2 | Continue expert-led AEO/GEO content | Unique answers, source references, real author/reviewer and Islamic academic review as appropriate |

## 9. Deployment record

**This run:** repository and Vercel mapping verified; Vercel domains verified; docs-only branch created; deployment-target metadata refreshed on that branch.

**Not deployed:** no source-code changes, no database/CMS writes, no analytics property changes, no DNS changes, no Trustpilot account edits, no citation submissions, and no production deployment.

**Next release policy:** inspect current main and the preview diff, run the repository's own test/lint/build/SEO/performance checks, create a reviewed preview, verify routes and conversions, then deploy only the tested build. Keep the existing production deployment available as rollback.