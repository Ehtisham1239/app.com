# Organic enquiry source — 31 October 2026

## Problem and implemented correction

The public page-level CampaignAttribution component already captures campaign parameters into sessionStorage on navigation, and both enquiry forms include the returned object in their saved payload. However, untagged search arrivals produce no source: a genuine Google visitor can browse to the trial form and be saved simply as `website`. Read-only aggregate CMS review confirmed missing attribution in the reporting window; raw counts remain private. This does not identify or qualify the GA4-reported event against a saved lead.

The same capture helper now infers a search source only when neither a current explicit campaign nor a valid retained campaign exists. An exact, bounded allowlist recognises Google domains, Bing, DuckDuckGo and Yahoo Search. It saves the engine label, medium `organic`, landing pathname and `attribution_method: search_referrer`. It never retains a referrer URL, search terms, query strings from that referrer or visitor identifier. Both forms and CMS source/medium reports use the existing payload; no migration, account configuration or extra third-party transmission is introduced.

Explicit/retained campaigns keep priority. Unknown, absent, internal, malformed and lookalike referrers remain unclassified. Session storage stays optional with the existing 24-hour lifetime; blocked storage still allows submission and same-page source inference. Existing cookieless GA4/GTM settings, denied ad signals and no-banner owner decision remain untouched. This is inferred source reporting, not traffic generation, ranking growth or proof that an enquiry is genuine.

## Validation and limits

- Six attribution tests pass, including three new behavioral cases: search → internal navigation → form source retention; campaign precedence; supported engines, storage failure and spoofed/unknown referrers.
- Full project suite: 160 tests pass. Focused ESLint: zero errors. Production build passes with 212 rendered HTML files and zero missing static references.
- Existing backend trial/contact functions accept the JSONB attribution payload; no schema change or production QA enquiry was made. No historical records were modified or relabelled. New behavior cannot recover the source of old untagged records.
- Public privacy copy already describes enquiry attribution/session storage. A supplemental sentence explaining inferred search sources is prepared for owner review below; no legal wording was changed and no legal compliance certification is claimed.

Suggested disclosure clarification (draft, not published): “For an untagged visit from a recognised search engine, we may infer its name and an organic source label from the referring website. We do not retain the full referrer URL or search terms. Explicit campaign tags take priority.”

## Conversion measurement next step

For future genuine enquiries, staff should review source/medium, classify real versus demo/test, record contact outcome, trial booking, attendance and admission in the existing operational workflow. A contact click or generate_lead event is not an admission. No student numbers, expected conversion lift or rankings are promised.

Rollback: revert only attribution.js and its added tests after checking later edits. Existing stored enquiry data can remain; do not clear leads or reset the database. Preserve the current campaign capture component and the owner's analytics choices.

## Recovered legacy-content frontier

Archived originals were located and their actual HTML retrieved successfully for all three unresolved legacy paths. Snapshot metadata and response evidence are saved separately; old religious advice/quotes are not republished or treated as qualified scholarly approval.

| Legacy path | Recovered snapshot | Treatment for review |
| --- | --- | --- |
| /how-to-learn-quran-by-heart-2 | 29 February 2024 | Compare /blog/memorization-techniques-for-beginners: same practical memorisation intent. Exact permanent redirect can be prepared for owner URL approval. |
| /start-teaching-the-quran-to-your-children | 13 May 2026 | Compare /blog/help-your-kids-learn-quran-online: parent-led introduction, daily example and practical support. Exact redirect can be prepared for owner URL approval. |
| /basic-islamic-education | 29 February 2024 | Original addresses broad Islamic education, not exclusively children. /courses/hadith-translation may cover some basics; confirm scope with Academics/owner. Do not silently redirect to a child-only guide. |

The original-content access blocker is resolved; equivalence/URL approval remains open. Candidate mappings are not deployed by this attribution change.
