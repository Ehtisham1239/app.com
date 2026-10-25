# Site-wide instructions and keyword execution — 25 October 2026

The owner explicitly paused access/sign-in work and requested the remaining website improvements and relevant keywords across the site. No authentication, new connector or account-permission change is included. The existing code/release authorisation remains in effect.

## Implemented

Expanded the original ten visible search themes to 21 offering-matched service/navigation topics. Added natural Hadith/Tajweed/Islamic-learning phrases and clearer headings for fees, trial, contact, questions, learning guides, locations and articles. Existing course descriptions, article/profile/policy content, custom CMS metadata, prices, trial terms and religious quotations are preserved. No meta-keywords tag, hidden keyword list or invented rank/volume is introduced.

All existing country/city heroes now explain online Quran classes using the actual place, with relevant local-clock and fee context. Custom metadata still takes precedence; generated descriptions use this useful context only as a fallback. This is an improvement to existing pages, not a new mass-generated set of landing pages.

The homepage now offers direct USA, UK, Canada and Australia links, and course pages also link to UK/Canada guidance. The original home image, copy-first mobile layout, opt-in form, homepage independence and legacy redirects are retained. Image alt text continues to describe images.

`npm run seo:keywords` checks each existing sitemap page for its mapped topic in visible main content. The reusable `npm run seo:agent` now includes this verification. The versioned map records one principal topic per existing page; original article, teacher-profile and policy intent remains intact. A visible topic is not proof of search demand or a top-ten ranking. The first ten competitor-observed themes remain historically documented; the wider set includes relevant original seed topics.

## QA and release

53 automated tests pass; lint has zero errors and the same 19 existing warnings; production build passes. Local audit checks all 205 pages, 196 top-image responses and all 205 visible topic placements, with zero findings/failures. Eight regional desktop/mobile browser layouts, old-clock-data compatibility, enquiry query continuity and homepage image/form behaviour pass without submissions or unexpected writes.

Application source `6b2fc688e4f6a6f88e181e7baab545365db94244` is production READY as `dpl_EDdNMBhG7H9ynQQKy55qZQSssPAJ` at [the stable website](https://project-umber-three-93.vercel.app), with a 75.123-second build and verified matching alias/source. The live reusable audit passes 205 metadata/schema/canonical/page-identity checks, 196 top-image responses and all 205 visible-topic placements with zero failures. The original homepage image and existing form logic are preserved. The initial combined run had a navigation-harness syntax error from a duplicate variable declaration; it was corrected in QA code and rerun separately, rather than marking the failed run passed. No application change was required. Immediate rollback candidate: `dpl_6UFtHaH7jnE6jFDV6zbMB7k9fvRV`, application source `c5922ecbf050e475406f024b0f974643601d2484`.

GSC/GA4/Semrush account access, protected preview/log inspection, field CWV, Google index/rank positions and real remote enquiry persistence remain outside verified results. Access work is paused by the owner. Current Google Search Essentials, helpful-content, snippet and anchor-text guidance informed these scoped changes.

Final live navigation rerun passes fresh desktop, returning desktop and mobile cases: Home remains at `/`, all four priority country links exist before and after reload, explicit country pages open separately, the logo returns Home, and no horizontal overflow or automatic enquiry form is present. There are zero browser errors and no form submissions. The QA-only harness correction and final documentation do not change the deployed application source.
