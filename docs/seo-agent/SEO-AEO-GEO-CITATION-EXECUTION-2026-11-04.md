# OQC SEO, AEO, GEO and authority citation execution checkpoint
**Date:** 4 November 2026  
**Site:** https://www.onlinequrancollege.com  
**Repository:** https://github.com/Ehtisham1239/app.com  
**Branch:** main  
**Scope:** owner-supplied keyword plans, public website, source architecture, current public authority evidence and deploy readiness.

## Executive status

This is an evidence checkpoint, not a claim that every external account or ranking task is complete.

- **Observed live:** the canonical homepage presents live one-to-one online Quran classes, the current 3-day free-trial offer, course navigation, five market discovery links and an online-only service disclosure.
- **Observed live:** /courses, /faq and /free-trial are discoverable and describe the 3-day trial, with the Weekend plan excluded.
- **Implemented in source:** the owner-supplied keyword plan is mapped to existing homepage, course, audience, pricing, free-trial and country hub intents in `seo/USER-SUPPLIED-KEYWORD-PLAN-2026-11-04.md`.
- **Implemented in source:** course pages now link to all five indexed country hubs (UK, USA, Canada, Australia and UAE); a regression test asserts all five links.
- **Not yet production verified:** the course-page navigation change awaits CI and the Vercel deployment result.
- **Not verified in this run:** Google Search Console query/page metrics, Bing Webmaster verification, Google indexing inspection, current GA4 conversion events, live Core Web Vitals p75, or external profile admin access.
- **Owner-controlled:** third-party account verification, Apple Business organisation verification, social/Trustpilot profile edits, and editorial outreach/submissions. No account was accessed, no message sent and no new third-party profile created.

## Current public-page evidence

| Page | Current public observation | Follow-up |
|---|---|---|
| Homepage / | Search result from yesterday shows global service, six courses, 3-day eligible trial, published package examples, and online-only/no-walk-in disclosure. | Verify the same page after the latest deployment and compare every numerical claim with the live CMS Claims register. |
| /courses | Search result last week lists six courses and a useful course-selection explanation. | Maintain course-to-trial and course-to-market links. |
| /faq | Search result last week states 3-day eligible trial, Weekend exclusion, teacher preference, class format and fee/payment policies. | Keep operational policies synchronised with Admissions and Terms. |
| /free-trial | Search result last week says 3 days, no card on eligible plans, Weekend plan excluded, coordinator confirmation. | Test form completion, consent, CRM receipt and conversion event using a safe synthetic lead only in an approved test environment. |
| /pricing | Source page uses CMS plan data and says 3-day trial on eligible plans, Weekend plan excluded. | Recheck canonical response and cached search snippets. |
| /contact | Repository source says “Online-only academy · no walk-in office”; it uses configured contact details. | Recheck live page after current deployment. |
| Five market hubs | Repository has five indexed hubs and dedicated country landing content. | Confirm sitemap and index status per hub in GSC; do not infer indexing from HTTP 200. |

### Legacy pricing snippet

A search result for `/pricing/` still displays an old 7-day trial offer, while the current homepage and trial page show the 3-day eligible-plan offer. This may be an outdated search snapshot or a URL variant; the search result alone does not prove that the old copy is currently served. The source page's metadata uses canonical `/pricing`. Do not add a redirect or change the route solely from this stale snippet. Verify the actual HTTP redirect/canonical and use Search Console URL Inspection to request recrawl if the stale result persists.

## Keyword-to-page implementation

The supplied keyword plan is now mapped by intent, not repeated across every page:

- Global brand and broad service intent: homepage.
- Country commercial intent: `/locations/united-kingdom`, `/locations/united-states`, `/locations/canada`, `/locations/australia`, `/locations/united-arab-emirates`.
- Course intent: existing `/courses/*` pages.
- Children/adults and learning guidance: existing `/learn/*` pages and learning guides.
- Fees: `/pricing`.
- Trial/enrolment: `/free-trial`.

No city doorway pages or new course routes are introduced by this checkpoint. Search volume, difficulty, CPC and ranking position remain unverified until fresh GSC/Keyword Planner/market SERP evidence is available.

## Citation and entity authority findings

### Publicly verified
- Trustpilot public profile: https://www.trustpilot.com/review/onlinequrancollege.com — search result shows 8 reviews and 0 reviews in the last 12 months. Do not advertise a rating or imply recent customer feedback from this snapshot.
- Existing official social profile links are documented in the repository's global citation tracker; ownership/admin access is not independently verified in this run.

### Eligibility / policy decisions
- Google Business Profile: **do not create or verify** while OQC remains an online-only business with no in-person customer contact. Google's current eligibility guidance explicitly lists online-only businesses as ineligible.
- Generic local directories requiring a customer-facing location: excluded. Do not invent country offices, service-area presence, local phone numbers, virtual offices or local staff.
- Paid links, automated profile creation, mass directory submissions, link exchanges and low-quality profile links: excluded.
- Apple Business: owner-controlled brand/organisation verification may be explored without creating a fictitious physical place pin; account verification is not completed.
- Bing Webmaster Tools: repository's prior tracker says not verified/connection pending. Import/verify with the owner account, then submit the canonical sitemap.
- Trustpilot/social profile edits and education-resource submissions: prepared only; require owner account access and approval. No outreach or submission was sent.

### Canonical identity controls
Use one truthful global brand identity, the canonical HTTPS www host, approved email/phone only after owner confirmation, and no street address for the online-only model. Do not publish the Facebook handle's “Ltd” suffix as legal proof; confirm the actual legal entity against the official registry before changing legal-name fields. Do not add founding year, student totals, accreditation, teacher credentials, ratings or testimonials without evidence and approval.

## Official external references to cite where relevant

1. Google Search Essentials — technical eligibility, people-first content and discoverability: https://developers.google.com/search/docs/essentials
2. Google Search spam policies — link spam, keyword stuffing and scaled content abuse: https://developers.google.com/search/docs/essentials/spam-policies
3. Google structured-data general policies — visible, accurate content; no misleading/fake reviews; rich results not guaranteed: https://developers.google.com/search/docs/appearance/structured-data/sd-policies
4. Google Business Profile eligibility and ownership — online-only businesses are ineligible: https://support.google.com/business/answer/13763036
5. Google Business Profile getting started — online-only businesses should not sign up for a Business Profile: https://support.google.com/business/answer/7039811
6. Google Business Profile representation rules — accurate real-world identity; no virtual office unless staffed; accurate address/service area: https://support.google.com/business/answer/3038177

Use official religious sources and qualified academic review for Quran/Hadith references in learning articles. These web-search policy references are not religious sources and must not be cited as evidence for religious rulings.

## Release change in this checkpoint

- Source update: `src/app/(site)/courses/[slug]/page.jsx` now adds the UAE country-hub link alongside UK, USA, Canada and Australia.
- Regression test: `tests/seo-execution.test.mjs` asserts that every course page includes all five approved market hub links.
- Related strategy: `seo/USER-SUPPLIED-KEYWORD-PLAN-2026-11-04.md`.
- CI / deployment: pending at time this file was prepared. Update this status only after inspecting the exact commit's workflow and production smoke checks.

## Remaining completion gates

| Workstream | Status | Evidence required to close |
|---|---|---|
| Keyword architecture | Implemented in repository documentation | GSC query/page data validates priorities and one URL per intent. |
| Course-to-market internal links | Implemented in source | CI pass, production deployment READY and live page source/links verified. |
| Technical SEO | Existing metadata, sitemap, robots and canonical layers found in source | Current production HTTP crawl, canonical/redirect checks, sitemap coverage and URL Inspection. |
| AEO/GEO | Existing visible FAQs, course guidance, country-specific direct answers and structured data found | Fact-check visible answers; schema validation; do not promise AI citations. |
| External citations | Research packs and tracker exist; public Trustpilot profile observed | Owner verifies accounts, updates profiles, approves and submits genuine editorial recommendations; record live URLs/evidence. |
| GSC/Bing | Prior dated records exist; no fresh authenticated data retrieved | Owner authorises supported Search Console/Bing account access and verifies sitemap/indexing. |
| GA4/CRM attribution | Approved GTM/GA4 implementation documented in AGENTS.md | Fresh GA4/GHL/ERP report; test conversion journey and reconcile qualified trials/enrolments. |
| Performance | Earlier GA4 averages and lab checks documented, not current p75 field evidence | Current CrUX/GSC p75 LCP, INP, CLS by device and money page. |
| Production deployment | Pending | Exact SHA deployed; production smoke test passes on canonical host; inspect apex redirect separately. |

## Measurement discipline

Report only fresh GSC/GA4/CRM evidence for rankings, clicks, qualified leads, trial bookings, enrolments and retention. A crawl, HTTP 200, search snippet, schema test or deployment badge is not proof of Google indexing, ranking gains or AI-answer citations. The goal is qualified trial bookings and paid enrolments, not traffic alone.
