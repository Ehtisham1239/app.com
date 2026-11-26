# OQC sitewide SEO, AEO, GEO, AIO and SXO audit — 26 November 2026

**Canonical site:** https://www.onlinequrancollege.com  
**Repository:** Ehtisham1239/app.com  
**Source baseline:** main `d464ee1d53a3709d88fcdd195c7c77289c3991ed`  
**Audit time:** 26 November 2026, 06:44–06:47 UTC  
**Mode:** Read-only production crawl and remote Lighthouse lab audit. This document records measured evidence, not rankings or guaranteed outcomes.

## Executive status

The current site has a strong technical SEO foundation. The latest live audit covered all 121 URLs in the XML sitemap:

| Check | Result |
|---|---:|
| Sitemap URLs declared / audited | 121 / 121 |
| Technical crawl findings | 0 |
| Page-quality failures | 0 |
| Keyword/topic placement failures | 0 |
| Top image responses checked | 62 |
| Duplicate titles / descriptions / canonicals | 0 / 0 / 0 |

The public crawl used GET requests only. It did not submit forms, alter the CMS, send messages, change DNS or deploy code.

The 121-page metadata inventory contains two descriptions longer than 160 characters before this branch's corrections: `/pricing` (161) and `/usa-quran-classes/states` (172). The branch shortens both and adds regression tests. One CMS-controlled blog title is 61 characters; its proposed correction is recorded below but is not changed here because the CMS editor/account is not connected.

## 1. SEO — search crawl, index and page intent

### Verified
- All 121 sitemap URLs returned a successful public response during the audit.
- The sitemap is reachable and referenced by `robots.txt`.
- All 121 audited pages had unique titles, meta descriptions and canonical URLs.
- The live audit found no technical or quality failures under its current checks.
- The site has a central five-market architecture (UK, USA, Canada, Australia and UAE), course pages, learning guides, blog content, teacher profiles and conversion pages.
- Public metadata, canonical URLs, structured data and hero-image responses were checked in the live HTML.

### Improvements applied in this branch
- Shortened the pricing meta description from 161 to 154 characters without changing the offer, prices, URL or page copy.
- Shortened the US state directory description from 172 to 152 characters and kept the same description in the CollectionPage JSON-LD.
- Added regression checks for the 160-character metadata limit on these high-priority pages and all ten state pages.

### CMS-only follow-up
For `/blog/quran-teacher-online-in-australia`, the current title is 61 characters. Suggested CMS title: **Online Quran Teacher in Australia | OQC**. Suggested description (153 characters): **Find an online Quran teacher in Australia for children and adults. Explore Tajweed, Noorani Qaida and Hifz lessons, then ask about a suitable class time.** This is a recommendation only; no CMS record was edited.

## 2. AEO / GEO / AIO — answer and AI discovery

### Verified
- `robots.js` explicitly allows Googlebot, bingbot, OAI-SearchBot, Claude-SearchBot, Claude-User and PerplexityBot on public pages. The wildcard group also permits other public crawlers; admin, auth, API and parent paths are disallowed.
- The owner-approved Content-Signal currently declares `search=yes, ai-input=yes, ai-train=yes`. This policy is preserved.
- `/llms.txt` and `/llms-full.txt` are generated from current public site data and distinguish online coverage from physical offices.
- The Organization and page-level JSON-LD is rendered in the initial HTML. The live crawl found no schema syntax/quality failures under its checks.
- The public site links to editorial standards and provides source/answer guidance for AI assistants.

### Operating standard
Do not add an “AI schema”, hidden prompt text, keyword blocks or mass-generated pages. Google says its AI Overviews and AI Mode use normal SEO fundamentals; it requires no special AI markup or `llms.txt` file. Keep clear answer-first content, original evidence, visible sources, accurate entity facts and crawlable internal links. Structured data must match visible page content.

OpenAI search discovery depends on OAI-SearchBot access; GPTBot is a separate training control. The existing robots policy is preserved rather than changing the owner's training preference.

## 3. SXO and mobile performance

Remote Lighthouse lab results from five representative routes (home, pricing, free trial, UK hub and USA hub):

| Device | Performance | SEO | Accessibility | Best practices |
|---|---:|---:|---:|---:|
| Mobile | 77–78 | 100 | 100 | 100 |
| Desktop | 98–100 | 100 | 100 | 100 |

Mobile diagnostics:
- Total Blocking Time: 996–1,102 ms.
- JavaScript execution: approximately 1.5–1.6 seconds.
- Estimated unused JavaScript savings: 283–384 KiB.
- Cumulative Layout Shift: 0 on the five sampled mobile routes.
- Mobile LCP ranged from approximately 1.1 to 2.0 seconds in this lab run.

The homepage's Lighthouse task breakdown attributes major work to the two Google Tag Manager containers (`GTM-W7CMZS53` and `GTM-52PTXDRF`), the GA4 Google tag destination and the Google Ads tag. First-party Next.js chunks also contribute. This is a lab finding, not field p75 Core Web Vitals.

**Approval boundary:** Do not remove, consolidate, delay or reconfigure GTM/GA4/Google Ads tags without the owner's specific approval and a verified GTM account review. The current tracking setup is an owner decision. The next safe step is a tag inventory and duplicate-trigger audit; consolidation can then be proposed with a before/after event QA plan.

## 4. US state landing pages — indexation quality gate

All ten requested state pages and the state directory exist in the production source. They currently have self-canonicals, index/follow directives, state-specific titles, local city examples, time-zone notes, Service/FAQ structured data and trial links.

A text-only pairwise comparison of the ten rendered page bodies produced an average Jaccard word-set similarity of **0.851** (85.1%). Page lengths range approximately 690–714 words. The pages have some state-specific scheduling and city content, but most copy is shared.

The 25 November white-hat SEO baseline says state-page indexation is not approved until each page has genuinely useful, unique state-specific material and local evidence. The current source/test state is inconsistent with that record: all ten pages are presently indexable and included in the sitemap. This branch does **not** change their robots directives or sitemap inclusion. Owner decision and evidence are required before changing indexation.

Evidence that could justify a state page includes real, consented local parent experience, confirmed teacher/time-slot coverage, documented local service demand or state-specific operational guidance. Do not invent local branches, teachers, reviews, customers or availability. ARDA 2020 adherent estimates are audience-research context, not official resident counts or proof of OQC demand.

## 5. Measurement gaps

The latest audit explicitly did not check:
- Authenticated Google Search Console query/page/country performance or Google AI feature reporting.
- GA4 organic sessions, saved trial leads, qualified leads, attended trials or enrolments.
- Bing Webmaster query/index reports.
- Search rankings, search volume, keyword difficulty or AI citations.
- Field p75 Core Web Vitals.
- Actual production form persistence, CRM receipt or email delivery.

A successful HTTP crawl or Lighthouse SEO score is not proof of indexing, rankings, AI citations or qualified enquiries. Connect the approved GSC/GA4 data source (or provide dated exports) before deciding which of the 121 URLs need content expansion, consolidation or a different intent target.

## 6. Deployment and release gates

The deployment record says the canonical site is `https://www.onlinequrancollege.com`, Hostinger serves the public domain and pushes to `main` trigger the Hostinger build. The Hostinger account connector is not available in this ChatGPT session. The current release gate requires an account audit, exact target confirmation, restorable file/database backup, environment-name inventory, staging build and tests of public routes, CMS, staff permissions, Supabase, trial/contact forms, notifications, media, currency and redirects.

This branch is not merged and no production deployment, DNS change, CMS write, form submission or account action has been performed.

## 7. Official guidance

- Google AI features and websites: https://developers.google.com/search/docs/appearance/ai-features
- Google structured data: https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
- Google helpful, reliable, people-first content: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- OpenAI crawler controls: https://developers.openai.com/api/docs/bots

## Next actions

1. Review and merge the metadata-only fixes after CI.
2. Obtain GSC/GA4 data to prioritize the existing 121 URLs by impressions, clicks and actual saved-lead conversions.
3. Obtain owner approval and evidence for state-page indexation; keep the current directives unchanged until then.
4. Review GTM containers and tags with the tracking owner; propose a safe consolidation only if duplicate tags/triggers are confirmed.
5. Connect Hostinger, confirm the production target and complete backup/staging gates before release.
6. Re-run the same live crawl and Lighthouse sample after the approved deployment and compare like-for-like metrics.
