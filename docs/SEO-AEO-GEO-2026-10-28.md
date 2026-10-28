# Search settings and learning-hub release — 28 October 2026

Site: https://www.onlinequrancollege.com. Business: remote, live one-to-one Quran education for children and adults. Reporting timezone: Asia/Karachi. Source baseline: `7f8e487d208a903338f73eeb0e8add1e9d33b669`. Baseline live release: `dpl_DefE8AaqefyHSazecjguRUb2Rh8h`, source `36187436fd3f3ac68c8b3c6cf6c17f854f336ffb`; retained as rollback.

The owner requested completion of Search engines/Analytics settings and original SEO/AEO/GEO improvements inspired by the attached competitor-topic plan. This authorizes implementation, merge and live deployment. Existing source instructions requiring draft-only work are superseded for this explicitly authorized release. No external message, account permission change, fabricated verification token, pricing/credential claim or purchased link is authorized by a competitor example.

## Observed settings and account boundaries

A current read of the **app.com** Supabase project `lgbwidraztavhhbnbfhr` confirms:

- `site.seo.title`: Online Quran College — Live 1-on-1 Online Quran Classes.
- `site.seo.description`: Learn Quran online with live one-to-one classes: Noorani Qaida, Tajweed, Hifz, Arabic and Islamic studies for kids and adults. Female & male teachers. 3-day free trial.
- `site.analytics`: enabled, `G-57TGPTDNT4`, `GTM-W7CMZS53`. GTM owns GA4; no parallel direct loader.
- Both optional meta verification fields are absent. This is **not** evidence of an indexing defect: Google file/DNS ownership methods do not require the meta field. Preserve `/google45a9bbd1d6a72727.html` and `/google5fa9c672751cfb98.html`.

No database mutation was necessary: the actual title, description and analytics IDs are already filled. An initial read used the nonexistent `posts` name; information_schema confirmed `blog_posts`, and the corrected read returned 15 published articles. No data was changed by either read.

The current cloud browser reached the normal staff sign-in page at `/admin/login?next=%2Fadmin%2Fsettings`; no staff session was available. Production administrative save/revalidation and private staff flows were not exercised. Website-side functionality is checked through the source build, settings helper tests, current database reads and public output. A previous Google unusual-traffic block remains a limit for this browser; it was not retried or circumvented. The owner installed Windsor.ai during this release. Its skill is available, but the active tool registry has not yet exposed get_connectors/get_fields/get_data; no connected Google property/account is confirmed from the app installation alone. No authenticated Search Console or Bing ownership/sitemap confirmation, GA4 DebugView receipt or ranking baseline is claimed.

## Findings and implementation ledger

| ID / priority | Evidence and impact | Implementation | Acceptance / owner | State before release |
| --- | --- | --- | --- | --- |
| S1 / P2 | Admin help said analytics waits for visitor consent, inconsistent with the approved cookieless/no-banner mode | Settings copy now describes memory-only analytics cookies, denied ad consent and GTM ownership; configuration status explicitly does not confirm delivery | Built settings route; owner-approved analytics regression suite; developer | Implemented locally |
| S2 / P2 | Source fallback had an empty GTM ID despite the live approved container | Align DEFAULT_SETTINGS with `GTM-W7CMZS53`; actual saved IDs retain priority | Fallback resolves to GTM mode and never introduces a second loader; developer | Implemented locally |
| S3 / P2 | Partial SEO settings could remove search defaults; whitespace-only home title used nullish fallback | Shared normalizer preserves approved custom fields, restores absent/blank title/description, trims codes before save; metadata emits only valid optional tokens | Partial/empty/custom/token/snippet tests; production build; developer | Implemented locally |
| S4 / P2 | Existing learning hub was four cards, without a direct course-selection answer/comparison or clear enrolment checklist | Same `/learn` URL gains an original six-course comparison, practical enrolment answers, accessible section links, eight existing article links and trial CTA | 320/390/1440px, matching schema/resources, anchor/keyboard/trial navigation and no-JS reading; developer | Implemented locally |
| S5 / P2 | Supplied plan overlaps many existing published guides and 15 articles | Ten-theme intent/brief map in `content/seo-agent/intent-map-2026-10-28.json`; use existing pages without copying competitor prose or creating duplicate city/keyword pages | Existing canonical course/guide/article records; editorial owner | Implemented locally |
| S6 / P1 measurement | No current authenticated GSC/Bing property or organic-conversion baseline | Preserve real ownership files; distinguish optional tokens from verification; prepare exact account-dependent completion steps | Account owner confirms property, submits sitemap and connects reporting | Blocked by account access |

New hub prose describes course selection and enrolment, using the actual catalogue and approved three-day trial terms (Weekend excluded). It adds no religious quotation, ruling, teacher credential, review, student count, invented fee, physical office or fixed learning outcome. Curated article and comparison links are limited to available published, self-canonical, indexable records. The resource ItemList matches the visible guide/article links; BreadcrumbList supplements the existing WebPage/Organization identity. JSON-LD syntax and visible agreement are tested, **not** an official rich-result certification or ranking enhancement. No special AI schema, mass generated articles, llms.txt work or change to crawler training preferences is included.

## Evidence and limits

- 85 Node tests pass, including verification/default/custom-setting and analytics safety regressions.
- ESLint: zero errors; 13 pre-existing warnings.
- Production build passes; 208 rendered HTML files, 20 unique static assets, zero missing references.
- Local rendered checks pass at 320, 390 and 1440px: six comparison rows, 12 visible resources matching ItemList, working section links, keyboard focus for the scrollable table, no viewport overflow, CTA reaches the real free-trial form. Content remains readable with JavaScript disabled. Zero browser errors and zero form submissions.
- Full local regression: 48 public viewport cases and four journeys pass with zero errors/writes; blog category/pagination/TOC flows pass at 390/1440px; both analytics checks use GTM without a duplicate direct loader. All 202 declared sitemap pages pass technical/quality/topic checks, with 194 top-image responses checked.
- Existing artwork, homepage hero and public analytics transport are preserved. Vendor-stub navigation checks prove installation/flow behaviour, not Google event receipt. No new Lighthouse score, field CWV, search position, backlink gain or conversion uplift is claimed.
- Public crawl, live release and changed-route evidence will be recorded below after completion. A crawl checks declared/reached HTML, not search-engine index inclusion; caps, skips and errors must accompany its result.

## Prioritized next 30 / 60 / 90 days

These are a proposed measurement-led work sequence, not an activated schedule or a ranking promise.

| Period | Work and owner | Done when |
| --- | --- | --- |
| First 30 days | Account owner confirms the existing Google URL-prefix property using a deployed ownership file or account-issued meta code, completes Bing ownership, submits the canonical sitemap and connects read-only GSC/GA4 reporting. SEO owner maps country/device/page/query performance and validates trial events against real saved enquiries. | Dated dashboard/export evidence identifies property, period and actual event receipts; no learner data in analytics. |
| Days 31–60 | SEO owner uses actual queries to select gaps in the existing UK hub, course pages and useful guides. Academics reviews any teaching/religious material; staff provides real examples and approved author information. Improve original pages before making overlapping new URLs. | Reviewed content answers a demonstrated question, has one canonical target, relevant links, substantiated claims and a working trial path. |
| Days 61–90 | Compare complete like-for-like periods for impressions/clicks/CTR/position, organic trial enquiries and qualified enrolments. Review device/country gaps and field CWV. Pursue only relevant editorial mentions or genuine partnerships. | Evidence distinguishes observation from attribution and lists next actions; no guaranteed rank, link schemes or invented local presence. |

## Sources checked

- Google AI features and your website: https://developers.google.com/search/docs/appearance/ai-features
- Google generative AI optimization guide: https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
- Google title links: https://developers.google.com/search/docs/appearance/title-link
- Google snippets: https://developers.google.com/search/docs/appearance/snippet
- Competitor public course/topic evidence: https://www.tarteelequran.com/ and https://www.tarteelequran.com/learn-noorani-qaida-online-with-classes-for-kids-and-beginners/
- Installed Next.js 16.4.3 metadata and JSON-LD documentation, read before implementation.

The competitor sources show topic coverage, not confirmed top-ten keywords, search volumes, traffic or a replicable ranking formula. Google's guidance does not require special AI markup or promise inclusion; our AEO/GEO work is clear answers, crawlable text, useful internal links and truthful structured data.
