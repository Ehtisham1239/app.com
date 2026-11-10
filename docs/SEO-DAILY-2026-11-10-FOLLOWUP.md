# OQC SEO, AEO, GEO and organic-growth follow-up — 10 November 2026

**Reporting time:** 08:20 PKT (Asia/Karachi)  
**Repository:** [Ehtisham1239/app.com](https://github.com/Ehtisham1239/app.com)  
**Code reviewed:** `27ef9a85779179569c3cc2cc9449c0feb093bcbe`  
**Latest docs-only production deployment:** `dpl_D5Uwv2DWPP1nxXYmiPRMaHnNqEfh` — READY  
**Status:** Read-only research and a draft documentation PR. No application code, CMS, DNS, account settings, analytics configuration, pricing, or production content changed.

## Work plan

1. Reconcile the 10 November report and blog register against current CMS, repository and public pages.
2. Verify the Canadian 2026 clock rules against official provincial/territorial sources.
3. Test the related lesson-planner source and regression coverage.
4. Refresh the available organic baseline, lead-delivery evidence, competitor observations and ethical-link pipeline.
5. Record the highest-value issues without changing production.

## Executive summary

- **CONFIRMED:** 35 published CMS articles; body counts 299–920 words, none above the owner's 1,000-word limit. The 10 November verification register covers 20 changed articles; all 20 have body/CMS match, HTTP 200, self-canonical, index/follow, zero recorded schema errors/issues, cover alt text and responsive image sources.
- **CONFIRMED:** The Canada article correction and Australia article consolidation are now recorded complete in the task table. The Canada article is 635 words; the Australia article is 502 words.
- **P1 NEW:** The Canada lesson planner includes Winnipeg as `America/Winnipeg`, but the permanent-offset compatibility map only overrides Vancouver and Edmonton. Winnipeg is missing an explicit UTC−5 override for browsers with stale IANA data, and no post-1 November Winnipeg regression test exists.
- **P2 NEW:** The Canada article does not yet mention the Northwest Territories' new permanent UTC−6 rule or Ontario Regulation 333/26 for areas west of 90°W. This is a content-completeness improvement, not a claim that the existing correction is wrong.
- **P1 OPEN:** Qualified academic review/indexing approval remains unreconciled for three newly indexable articles.
- **LEAD DELIVERY:** Two application-side CRM sync records are marked `synced`; one notification `lookup_failed` error appears in the last 24 hours. This is not proof of lost lead data, and email delivery has not been independently verified.
- **MEASUREMENT:** The latest stored 28-day baseline is 36 Search Console clicks / 1,266 impressions and 93 GA4 organic sessions, 9 `generate_lead` events and 27 `contact_click` events. The GA4 session/user counts are inflated by the owner-approved cookieless random-client-ID mode; use events directionally, not as qualified leads.
- **BACKLINKS:** No outreach or placement occurred. All prospects remain research-only.
- **NO PRODUCTION CHANGE:** All code, CMS and account changes remain pending owner approval.

## 1. Blog inventory and remediation

**Current CMS query:** 35 published records, 35 indexable, 0 noindex. Measured body counts are 299–920 words. The current 10 November report records a maximum inclusive count of 951 when title and excerpt are included. No article requires shortening.

The 20 recently changed article records are individually audited in [BLOG-ACTION-REGISTER-2026-11-10.json](https://github.com/Ehtisham1239/app.com/blob/main/docs/seo-agent/BLOG-ACTION-REGISTER-2026-11-10.json). The register reports:
- 20/20 bodies match CMS;
- 20/20 HTTP 200 and self-canonical;
- 20/20 index/follow;
- 0 schema errors and 0 recorded issues;
- cover alt text, 1200×800 dimensions and 400/800/1200 responsive sources;
- 31 distinct contextual destinations checked.

The Canada article is 635 words and the Australia article is 502 words. Their earlier remediation tasks are marked complete in Supabase. The public search/browser cache still returned a six-day-old Canada article snapshot showing the superseded wording; the internal 10 November register records the current page as 200 and body-matched to CMS. Treat the public cached snapshot as stale, not as proof of a live-site failure.

**Public archive reconciliation:** public archive pages 1–3 expose 27 article cards (9 per page). Page 4 returned a cache miss; the RSS endpoint was rejected by the retrieval tool because it does not handle `application/rss+xml`; direct `robots.txt` and `sitemap.xml` opens also failed. These are retrieval limitations, not confirmed HTTP errors. The CMS and internal sitemap inventory both record 35 blog articles.

## 2. Canadian time-zone accuracy — highest-value technical finding

The Canada article has already been corrected for British Columbia, Alberta, Manitoba, Saskatchewan and Yukon. Official sources confirm:
- B.C. moved to year-round Pacific Time (UTC−7) after its final spring-forward on 8 March 2026, while local mountain-time exceptions remain in parts of eastern B.C. ([B.C. Government](https://news.gov.bc.ca/releases/2026AG0013-000209)).
- Alberta Time is UTC−6 year-round from 1 November 2026 ([Alberta Government](https://www.alberta.ca/albertas-new-time-system-abt)).
- Manitoba Standard Time is UTC−5 year-round from 1 November 2026 ([Manitoba Government](https://www.gov.mb.ca/timechange/)).
- Northwest Territories Time is UTC−6 year-round from 1 November 2026 ([GNWT](https://www.gov.nt.ca/en/newsroom/northwest-territories-ends-seasonal-time-change)).
- Ontario Regulation 333/26 establishes UTC−5 year-round west of the 90th meridian ([Ontario e-Laws](https://www.ontario.ca/laws/regulation/r26333)).

### Winnipeg planner gap

The source `src/lib/market-timezones.js` includes Winnipeg with `America/Winnipeg`. However, `src/lib/location-schedule.js` explicitly overrides only `America/Vancouver` and `America/Edmonton` from 1 November 2026. The current test file covers Vancouver, Edmonton, Toronto, St. John's and Regina, but not Winnipeg after the Manitoba change. The matching Supabase task remains blocked.

**Proposed code-only correction — not applied:** add `"America/Winnipeg": -300` to the permanent-offset map for dates on/after 2026-11-01. Add regression tests:
- Winnipeg 2026-11-10 18:00 → UTC 2026-11-10T23:00:00.000Z.
- Winnipeg 2026-11-01 01:30 must be unambiguous.
- Historical dates before 2026-11-01 must preserve the existing IANA rule.

**Suggested article addendum — not published:**

> The Northwest Territories now uses Northwest Territories Time (UTC−6) year-round from 1 November 2026. In Ontario, the area west of the 90th meridian uses UTC−5 year-round under Regulation 333/26; most of the rest of Ontario continues seasonal clock changes. In eastern British Columbia, some communities including the East Kootenay and Golden area retain local mountain-time arrangements. Confirm the learner's exact city and date before agreeing a recurring lesson.

Keep the city/date confirmation instruction and verify the planner for Winnipeg before any production change.

## 3. Technical SEO, deployment and accessibility

- Latest production deployment for the documentation commit is Vercel READY with aliases on the OQC domain. The application code deployment from PR #182 is also READY.
- The latest code deployment is not a fresh browser/mobile pass. The 10 November report records Chromium failing before navigation (socket permission/SIGABRT) and a separate browser returning `ERR_CONNECTION_REFUSED`; no bypass was attempted.
- No new 390px mobile verification or post-deployment field p75 Core Web Vitals data is available.
- Public archive pages 1–3 were observed; page 4 and feed/robots/sitemap could not be retrieved through this web tool. No HTTP failure is inferred.
- Search Console URL Inspection and Google-selected canonical data remain unavailable.

## 4. Analytics and conversion

**Stored source:** Windsor.ai metric rows in Supabase, period 12 October–8 November 2026.

| Metric | Stored value | Qualification |
|---|---:|---|
| Search Console clicks | 36 | All countries; 22 homepage clicks, 8 brand-query clicks from Pakistan |
| Search Console impressions | 1,266 | Non-brand UK/USA/Canada/Australia queries mostly below position 20 |
| GA4 organic sessions | 93 | Inflated because each page load receives a new random client ID |
| `generate_lead` events | 9 | Events, not confirmed qualified leads |
| `contact_click` events | 27 | Engagement events, not admissions |

Fresh GA4 event reporting was blocked by the Windsor connected-account limit. No account was disconnected or changed. Do not report organic sessions/users as a trustworthy baseline until measurement design and account capacity are reviewed.

The owner-approved analytics configuration remains unchanged: cookieless analytics, analytics storage granted, advertising signals denied, no banner, and no persistent Google cookies. This is not a legal-compliance certification. Owner/legal review for UK/EEA and other relevant markets remains open.

## 5. Lead and CRM delivery

- Supabase `lead_crm_sync`: two records with `status=synced`.
- Vercel aggregated errors: one `lead_notification lookup_failed` event in the last 24 hours.
- Latest 50-minute production error/warning query: no entries.
- Vercel Hobby runtime-log retention prevented a complete 24-hour raw-log read.

The current route saves/validates the lead before notification. A lookup failure does not prove the saved lead was lost. Application-side GHL status is not independent GHL UI readback, and email receipt was not verified. An approved test lead is needed before claiming end-to-end delivery.

## 6. Keyword, SERP and competitor opportunity

The stored Search Console baseline shows that 22/36 clicks went to the homepage and non-brand country queries mostly sit below position 20. The highest-value next work is to improve the existing country hubs and course-to-country paths, not create thin city pages.

Current public competitor sample:
- [Her Quran Academy — Canada](https://herquranacademy.com/online-quran-classes-canada/) presents female-only one-to-one lessons, CAD prices, two free trial lessons and a time finder with daylight-saving handling.
- [Saba Quran — Canada](https://sabaquran.com/countries/canada) presents a named female teacher, CAD pricing and local-time scheduling.

These are competitors' own public claims, not independently verified outcomes or credentials. OQC's current Canada page clearly shows USD fees, one-to-one lessons, teacher preference, online-only delivery and a three-day trial on eligible plans (Weekend excluded). A conversion opportunity is to make the CAD quote/estimate path clearer without inventing or publishing an unapproved local price.

## 7. Ethical backlink operations

The current outreach log remains research-only:
- RISE: IDENTIFIED; pitch draft exists, no owner-approved submission or sender.
- IslamiCity: IDENTIFIED; submission route found, but named author, academic review and AI/authorship policy remain unverified.
- ISRA Academy: IDENTIFIED; publication activity found, no open contribution route confirmed.
- ISRE: IDENTIFIED; resource recommendation route observed, fit/acceptance unconfirmed.

No prospect is CONTACTED. No response, negotiation, placement or verified backlink is claimed. No outreach, payment or form submission occurred.

## 8. AEO/GEO policy check

Google's current official guidance says ordinary SEO fundamentals apply to AI Overviews and AI Mode; pages must be indexed and eligible for a snippet; indexing and inclusion are not guaranteed; there is no special AI schema or AI text file required ([Google AI features guidance](https://developers.google.com/search/docs/appearance/ai-features)). Google also explicitly says it has no preferred article word count and recommends accurate authorship, useful original content and avoiding fabricated author profiles ([people-first content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)).

No special AI markup, fake Q&A, or new filler article is recommended.

## 9. Owner/access blockers and next priorities

1. **P1:** Approve or reject the small Winnipeg time-zone planner correction; if approved, add regression tests before production deployment.
2. **P1:** Obtain qualified academic sign-off and owner indexing decision for the three November articles.
3. **P1:** Reconcile the notification lookup error; verify GHL and email independently using an approved test lead.
4. **P2:** Approve the short Canada article addendum for NWT, northwestern Ontario and eastern B.C. local exceptions.
5. **P2:** Obtain 390px mobile verification and field p75 CWV data from a supported browser/source.
6. **P2:** Resolve Windsor reporting-account capacity or provide dated GA4/GSC exports; preserve the owner-approved analytics setting pending legal review.
7. **P2:** Continue ethical prospect qualification only; obtain verified sender and explicit RISE/IslamiCity submission authorization before contact.

## 10. Work completed in this follow-up

- Re-read the current 10 November report, 20-article register, operations register and master specification.
- Reconciled all 35 published CMS records and measured body word counts.
- Reviewed 20 updated article audit records.
- Checked public blog archive pages 1–3 and attempted page 4 and RSS retrieval.
- Re-verified official Canadian time rules and identified the missing Winnipeg planner override plus two newly effective jurisdiction rules missing from the article.
- Checked production deployment, CRM sync aggregate, Vercel runtime errors, stored GA4/GSC metrics and current competitor pages.
- Created this draft issue register and follow-up report on an unmerged documentation branch only.

**No live site, CMS, production code, DNS, analytics, CRM account, backlink or public content was changed.**
