# OQC SEO Operations — Blog Inventory & Remediation Audit
**Audit date:** 5 November 2026, 09:50 Asia/Karachi  
**Source of truth inspected:** Supabase project `app.com` (read-only query), GitHub `Ehtisham1239/app.com` default branch and PR #118, public search evidence.  
**Status:** Internal evidence register / draft only. No CMS content was edited, no article was republished, no live website setting was changed, and no outreach was sent.

## Executive summary

- The live CMS query returned **32 published, non-deleted blog articles**. This is the current CMS count, not yet a reconciled count of public archive URLs, sitemap URLs or Google-indexed URLs.
- Measured article body length (HTML tags stripped; navigation/footer excluded because the query reads `blog_posts.body_html` only): **299–921 words**. **0/32 exceed the owner's 1,000-word ceiling.**
- **32/32** have a non-empty SEO title and meta description. No duplicate `seo_focus_keyword` values were returned by the duplicate-keyword query.
- All 32 have a cover image URL and non-empty cover alt text in the CMS fields queried. Article-body `<img>` elements were not found in the structural scan.
- **15/32** contain the internal HTML marker `<!-- learning-revision-2026-10 -->` followed by additional article sections. This is not automatically bad content, but a manual consolidation review is required because several pages repeat the same decision advice in multiple sections.
- Four articles have no contextual course or market-hub link. Nine have no explicit `/free-trial` link; this is a relevance review, not a rule that every article must carry a sales CTA.
- Priority factual update: the Canada time-zone guide should explicitly account for the 2026 permanent time changes in British Columbia and Alberta. Official provincial sources confirm these changes.
- Priority editorial cleanup: the Australia time-zone article contains repeated sections and a hidden revision comment; consolidate before considering any expansion.
- Islamic/Tajweed/Hifz material requires qualified academic review. No scholar/reviewer identity or approval record was present in the CMS fields returned by this audit.

## Inventory — all 32 CMS-published articles

Word counts are measured from `body_html` after stripping HTML tags and splitting on whitespace. These are CMS body counts, not counts independently measured from rendered public pages.

| URL | Published | Updated | Words | Primary keyword |
|---|---:|---:|---:|---|
| /blog/online-quran-class-fees-usa-comparison | 2026-11-04 | 2026-11-04 | 464 | online Quran classes cost USA |
| /blog/what-age-start-online-quran-classes | 2026-11-04 | 2026-11-04 | 566 | what age to start learning Quran |
| /blog/common-tajweed-mistakes | 2026-11-03 | 2026-11-03 | 435 | common tajweed mistakes |
| /blog/makharij-explained-for-beginners | 2026-11-03 | 2026-11-03 | 424 | makharij lessons |
| /blog/sabaq-sabqi-manzil-explained | 2026-11-03 | 2026-11-03 | 526 | sabaq sabqi manzil |
| /blog/ramadan-quran-plan-for-families | 2026-11-03 | 2026-11-03 | 754 | ramadan quran classes |
| /blog/online-tafseer-classes-what-you-learn | 2026-11-03 | 2026-11-03 | 299 | Online Tafseer classes |
| /blog/tajweed-rules-for-beginners | 2026-11-03 | 2026-11-04 | 482 | Tajweed rules for beginners |
| /blog/how-long-does-hifz-take-online | 2026-11-03 | 2026-11-03 | 341 | How long does Hifz take online |
| /blog/how-long-to-learn-noorani-qaida | 2026-11-03 | 2026-11-04 | 388 | how long to learn noorani qaida |
| /blog/online-quran-lessons-canada-time-zones | 2026-11-02 | 2026-11-04 | 560 | online quran lessons canada time zones |
| /blog/online-quran-lessons-uae-families | 2026-11-02 | 2026-11-04 | 497 | quran lessons for uae families |
| /blog/choose-online-quran-classes-kids | 2026-10-28 | 2026-11-04 | 921 | how to choose online quran classes for kids |
| /blog/family-quran-learning-weekly-routine | 2026-10-28 | 2026-10-28 | 918 | family Quran learning routine |
| /blog/noorani-qaida-home-practice-checklist | 2026-10-28 | 2026-10-28 | 901 | Noorani Qaida home practice |
| /blog/online-quran-class-fees-uk-comparison | 2026-10-28 | 2026-10-29 | 919 | online Quran class fees in the UK |
| /blog/returning-to-quran-study-adults | 2026-10-28 | 2026-10-28 | 878 | returning to Quran study |
| /blog/adult-quran-beginner-first-month | 2026-10-22 | 2026-11-01 | 567 | adult beginner Quran study plan |
| /blog/choose-online-quran-teacher-usa | 2026-10-22 | 2026-11-05 | 608 | choosing an online Quran teacher in the USA |
| /blog/family-quran-learning-multiple-children | 2026-10-22 | 2026-11-01 | 541 | Quran lessons for multiple children |
| /blog/hifz-revision-with-school | 2026-10-22 | 2026-11-01 | 551 | Hifz revision alongside school |
| /blog/noorani-qaida-or-quran-reading | 2026-10-22 | 2026-11-01 | 554 | Noorani Qaida or Quran reading |
| /blog/online-quran-lesson-setup-accessibility | 2026-10-22 | 2026-11-01 | 578 | online Quran lesson setup |
| /blog/parent-teacher-quran-progress-review | 2026-10-22 | 2026-11-01 | 549 | parent teacher Quran progress review |
| /blog/prepare-child-first-online-quran-trial | 2026-10-22 | 2026-11-01 | 561 | preparing a child for an online Quran trial |
| /blog/questions-before-quran-course-enrolment | 2026-10-22 | 2026-11-01 | 554 | questions before Quran course enrolment |
| /blog/quran-lessons-australia-time-zones | 2026-10-22 | 2026-11-01 | 596 | Quran lesson times in Australia |
| /blog/quran-translation-and-arabic-difference | 2026-10-22 | 2026-11-01 | 565 | Quran translation vs Arabic study |
| /blog/tajweed-practice-with-feedback | 2026-10-22 | 2026-11-01 | 572 | Tajweed practice with teacher feedback |
| /blog/help-your-kids-learn-quran-online | 2026-06-15 | 2026-11-01 | 568 | help kids learn Quran online |
| /blog/importance-of-reciting-quran-with-tajweed | 2026-06-10 | 2026-11-01 | 469 | importance of Tajweed |
| /blog/memorization-techniques-for-beginners | 2026-06-05 | 2026-11-01 | 515 | Quran memorisation techniques for beginners |

Author field for all 32 records returned as “Online Quran College”. The audit did not verify a named human author or academic reviewer.

## Structural checks across all 32

- SEO title present: 32/32.
- SEO description present: 32/32.
- Duplicate focus keyword: none returned.
- Body images: none detected.
- Cover image URL missing: none returned.
- Cover alt missing where cover image exists: none returned.
- Over 1,000 words: 0.
- Four without a contextual `/courses/` or `/locations/` internal link:
  - `family-quran-learning-weekly-routine`
  - `online-quran-lesson-setup-accessibility`
  - `questions-before-quran-course-enrolment`
  - `ramadan-quran-plan-for-families`
- Nine without an explicit `/free-trial` link:
  - `adult-quran-beginner-first-month`
  - `family-quran-learning-multiple-children`
  - `help-your-kids-learn-quran-online`
  - `hifz-revision-with-school`
  - `importance-of-reciting-quran-with-tajweed`
  - `memorization-techniques-for-beginners`
  - `parent-teacher-quran-progress-review`
  - `quran-lessons-australia-time-zones`
  - `tajweed-practice-with-feedback`
  - CTA presence is a contextual recommendation, not a mandatory SEO field.

## Priority issue register

| ID | URL / scope | Exact evidence | Issue / impact | Priority | Proposed change | Owner / access | Risk / approval | Status / verification |
|---|---|---|---|---|---|---|---|---|
| BLOG-001 | /blog/online-quran-lessons-canada-time-zones | Article explains six zones and generic seasonal changes; it does not mention the new permanent arrangements in BC and Alberta. | Date-sensitive local-time guidance is incomplete after 2026 changes; risk of incorrect recurring class-time advice. | P0 | Add a concise, dated explanation: BC adopted permanent Pacific Time (PCT) after its final spring-forward on 8 Mar 2026; Alberta Time (ABT, UTC-6) became permanent from 1 Nov 2026. Keep other provincial/territorial exceptions and advise checking the actual city/date. | Content editor + SEO; official provincial sources already available. | Low editorial risk; approval needed before CMS publication. | DRAFT REQUIRED; verify wording against provincial pages and test planner for Vancouver/Calgary/Toronto/Newfoundland. |
| BLOG-002 | /blog/quran-lessons-australia-time-zones | 596 words; repeated scheduling, seasonal-change and family-routine sections; hidden `learning-revision-2026-10` marker; no trial CTA. | Repeated sections dilute clarity and create unnecessary reading; no direct next step for a high-intent country guide. | P1 | Consolidate overlapping sections into one sequence: identify city/date, DST differences, recurring-time rule, family routine, AUD quote. Add a contextual trial link only if useful. Retain local exceptions (Broken Hill/Lord Howe if discussed) only with reliable sourcing. | Content editor + SEO. | Low risk; no URL change or deletion. Owner approval before CMS update. | DRAFT REQUIRED; compare rendered article after authorized update. |
| BLOG-003 | 15 articles containing revision marker | Marker found in: hifz-revision-with-school; quran-translation-and-arabic-difference; noorani-qaida-or-quran-reading; quran-lessons-australia-time-zones; family-quran-learning-multiple-children; adult-quran-beginner-first-month; prepare-child-first-online-quran-trial; online-quran-lesson-setup-accessibility; tajweed-practice-with-feedback; questions-before-quran-course-enrolment; parent-teacher-quran-progress-review; choose-online-quran-teacher-usa; help-your-kids-learn-quran-online; importance-of-reciting-quran-with-tajweed; memorization-techniques-for-beginners. | A revision marker itself is harmless, but several articles repeat earlier advice in appended sections. This may weaken editorial flow and increase maintenance. | P1 | Review all 15 for semantic repetition; merge overlapping sections, remove internal HTML comments from visible content source, preserve unique useful additions and keep each article under 1,000 words. Do not delete useful material solely because it repeats a theme. | Content editor; academic reviewer for religious content. | Medium; preserve all unique guidance and existing URLs. Owner approval before publication. | IN REVIEW; manual consolidation checklist required. |
| BLOG-004 | /blog/online-tafseer-classes-what-you-learn | 299 words; discusses tafseer, context of revelation and scholarly interpretation; no external reference in the body returned. | Sensitive religious interpretation topic with minimal attribution and no visible reviewer evidence. | P0 | Have qualified scholar review definitions, scope, claims and any examples; identify approved source(s), named reviewer and review date before publication. Do not add a fabricated reviewer or fatwa. | Academic Excellence / qualified scholar. | High religious-integrity risk; scholar approval required. | BLOCKED pending academic review. |
| BLOG-005 | Tajweed/Hifz instructional articles | Relevant posts include common-tajweed-mistakes, makharij-explained-for-beginners, tajweed-rules-for-beginners, sabaq-sabqi-manzil-explained, how-long-does-hifz-take-online, how-long-to-learn-noorani-qaida, tajweed-practice-with-feedback, importance-of-reciting-quran-with-tajweed, memorization-techniques-for-beginners. | Precise Arabic/Tajweed terminology, counts, recitation examples and memorisation advice need qualified verification; a CMS author label is not proof of academic review. | P0 | Review Arabic spellings, makharij groupings, rule descriptions, Qur’an examples, translations and Hifz terminology against recognized Tajweed references; record scholar name, qualification evidence, date and approved changes. | Academic Excellence / qualified Tajweed reviewer. | High; do not silently rewrite religious content. | BLOCKED pending qualified review. |
| BLOG-006 | Four articles without course/market internal link | family-quran-learning-weekly-routine; online-quran-lesson-setup-accessibility; questions-before-quran-course-enrolment; ramadan-quran-plan-for-families. | Readers may not find the relevant course or country planning page. | P2 | Add one or two contextually relevant links where they genuinely help; avoid forced keyword anchors. | SEO/content editor. | Low; no URL changes. | DRAFT REQUIRED; verify destination status and link relevance. |
| BLOG-007 | Nine articles without trial link | See structural-check list above. | Potential conversion path gap on articles with high enrolment intent; informational content does not all need a CTA. | P2 | Review intent individually. Add a natural CTA to high-intent articles; leave purely educational pages without a sales CTA if it harms usefulness. | SEO + Admissions. | Low; trial eligibility wording must stay accurate. | RECOMMENDED; owner approval for copy changes. |
| BLOG-008 | Public archive, sitemap and CMS reconciliation | CMS query returns 32 published posts. Public archive and sitemap could not be independently fetched by the web inspection session; Google search snapshot shows selected latest articles only. | Public URL count, pagination completeness and Google-indexed URL count are not proven by the CMS count. | P0 | Crawl `/blog`, all pagination pages, RSS/feed if enabled, sitemap post URLs and Search Console Page Indexing/URL Inspection. Reconcile 32 CMS rows against public canonical URLs and index coverage. | Technical SEO + GSC access. | Low; no content changes until reconciled. | REQUIRES ACCESS / LIVE CRAWL. |
| BLOG-009 | Homepage and older search snapshots | A current search snippet shows the online-only homepage and 3-day eligible-plan offer; a separate stale cached open snapshot showed legacy 5,000+ students, 25+ countries, 24/7 support, named tutor credentials and testimonials. | Search cache may be stale; do not treat the cached page as proof that current production HTML contains these claims. | P1 | Fetch canonical production HTML directly and compare with CMS; if old text is only cached, use Search Console URL Inspection and request recrawl after access is granted. If live HTML contains unsupported claims, remove or substantiate them with owner evidence first. | Owner + web/SEO + GSC access. | High trust/reputation risk; no silent claim selection. | UNKNOWN live HTML; REQUIRES ACCESS to GSC. |

## Date-sensitive sources for the Canada/Australia guides

- Alberta Government, “Alberta’s new time system (ABT)”: https://www.alberta.ca/albertas-new-time-system-abt — states permanent Alberta Time, UTC-6, effective 1 November 2026.
- British Columbia Government, 17 September 2026 release: https://archive.news.gov.bc.ca/releases/news_releases_2024-2028/2026CITZ0009-001073.htm — confirms Pacific Time/PCT as the province’s year-round time standard and no fall-back in November.
- National Research Council Canada: https://nrc.canada.ca/en/certifications-evaluations-standards/canadas-official-time/time-zones-daylight-saving-time — page itself warns some information is no longer accurate as of 1 November 2026 and directs users to provincial/territorial government sources.
- Tourism Australia: https://www.australia.com/en/facts-and-planning/about-australia/time-zones.html — standard zones and daylight-saving states.
- Reserve Bank of Australia schedule: https://www.rba.gov.au/schedules-events/daylight-saving.html — 2026 start/end dates and participating states.

## Related current workstreams

### Five-market competitor and keyword work
The existing 3 November execution map is a 10-provider-per-market monitoring set, not a verified top-10 ranking. The 5 November competitor audit in this PR uses public competitor pages to compare observable features only. It does not claim competitor traffic, backlink counts, organic positions or conversion rates. Current examples include Nouf Quran Academy, Huda Quran Academy, Academy for Quran, Madani Islamic Academy, Noor Ul Qalam and OnlineQuran.pk. Public competitor claims remain self-reported unless independently corroborated.

### Technical SEO and production
- Source code includes generated sitemap/robots logic, five indexed market hubs, canonical/hreflang helpers and content-driven blog listing.
- Public web open of the canonical domain returned an old cached page snapshot; the newer search snippet is more current. Live response headers, current rendered HTML, canonical selection, robots, sitemap, schema validation and field Core Web Vitals were not independently verified in this session.
- PR #118 exact head: `f0b5062650569e94d90096ce5f357b7b0bf223e8`.
- GitHub workflow `OQC quality checks` run 41951469453: completed / success.
- GitHub combined Vercel status points to a READY preview deployment (deployment ID `8fJhvGd6qAedN656yXsXDRxfT6t3`). The PR remains open and unmerged. The preview URL was not accessible through the public page inspection tool, so responsive/live smoke QA remains outstanding.
- No production deployment or merge is claimed.

### Analytics and organic baseline
Historical 25–30 October GSC and prior GA4 figures in the 2 November strategy PDF are historical only (13 clicks / 568 impressions / 2.3% CTR / average position 22.2; GA4 252 sessions over the stated prior three-month period and zero key events). These are not a current November 5 baseline. Current authenticated GSC, GA4, GTM, CRM conversion and backlink-index data remain unavailable in this run.

### Backlinks
No verified Ahrefs/Semrush/Majestic backlink export was available. No prospect is marked qualified, owner-approved, contacted or placed on the basis of this audit. No outreach or submission occurred. GBP remains excluded because OQC is online-only and has no eligible customer-facing physical branch.

## Draft register status

- **Page Register:** 5 candidate country hubs mapped; live canonical/index status requires crawl/GSC.
- **Content Calendar:** hold new articles until the 32-article inventory and remediation are reviewed.
- **Link Log:** no verified backlink exports; pipeline remains IDENTIFIED only when a real prospect has been individually checked. No contact/placement.
- **Claims Register:** trial offer currently stated as 3 days on eligible plans; Weekend plan excluded. Prices/currency, discounts, founding year, years served, teacher qualifications, student counts, ratings and support availability require a current owner-approved source of truth before public reuse.
- **Agent Log:** 5 November read-only CMS audit, PR #118 review, public competitor sample, official time-zone source review. No CMS update, merge, production deploy, outreach, GBP action or account setting change.

## Closure criteria

This audit is complete as a **CMS inventory and initial remediation audit**, not as a complete content quality sign-off. Close each issue only after: (1) the owner approves the wording, (2) the CMS content is updated through an authorized path, (3) public canonical HTML is rechecked, (4) article word count remains <=1,000, (5) internal links/CTA/structured data are tested, (6) scholar approval is attached where needed, and (7) Search Console recrawl/index state is checked when access is available.
