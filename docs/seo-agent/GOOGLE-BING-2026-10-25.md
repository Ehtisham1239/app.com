# Google/Bing and blog release — 25 October 2026

Target: https://project-umber-three-93.vercel.app. Repository: Ehtisham1239/app.com. Reporting timezone: Asia/Karachi.

## Authority and initial evidence

The owner's request authorises website/blog SEO fixes and the existing end-to-end release workflow. Gates A/B/C are covered by that request and the earlier explicit implementation/deployment authorisation. Scope: reversible public template, metadata, discovery and validation changes on the existing site. No campaign, budget, account permission, analytics transport, database migration, DNS change, private record or enquiry submission.

Baseline main: `194fb82d88aeb7f7ab754162f344906c2d9b648c`. Verified live application: `02c1ceb9bfbb74a4648c21787874967d096b39e2`, deployment `dpl_RMWaXYkuruiSqdtzKS6u2CxvME7K`, READY on the stable alias. Preserve both existing Google verification files. This deployment remains the rollback candidate.

The fresh technical crawl covered all 205 sitemap URLs, without skips/errors or technical findings. A separate deeper review covered all 15 current blog articles, 418 original navigation destinations, 350 fragment references, listing/filter variants, article images and simulated Googlebot/bingbot user agents. All original internal destinations returned usable responses. The deeper review found omitted Parents/Tajweed/Hifz categories, seven malformed/unknown filter variants serving duplicate or empty HTTP 200 pages, and 15 article modification dates present in markup but absent from visible dates. Larger previews for general crawlers and an RSS feed were additional improvements, not critical indexing defects. The deeper pre-release check recorded 56 failing assertions across repeated article instances and new acceptance criteria; this is not 56 independent SEO errors or an external audit score.

## Implementation

| Area | Result | Acceptance check |
| --- | --- | --- |
| Blog navigation | Categories derive from up to 200 recent published records plus the visible page; all eight current categories appear, including the three omitted ones | All category links load relevant cards; current topic identified accessibly |
| Filters | Invalid page values, repeated page/category parameters, unknown topics and out-of-range pages return 404; valid category views remain noindex/follow | Eight negative probes and valid topic/pagination responses |
| Pagination | Crawlable Previous/Next links, per-page canonicals, matching WebPage identity, useful page labels and summaries | Page 2 retains its own canonical and returns to page 1 |
| Article identity | BlogPosting uses the visible cover or real fallback, original author and stored valid timestamps; organization bylines link to About | All 15 article images/authors/times agree with visible content |
| Dates | Published labels and materially later calendar-day Updated labels use UTC dates consistently | No invented publication/modification date or refresh-on-build timestamp |
| Preview controls | Shared public robots metadata permits large previews for general crawlers as well as Googlebot | Existing noindex controls remain effective; all sitemap pages expose the general preview directive |
| Discovery | Valid RSS 2.0 at `/blog/feed.xml`, HTML alternate links and visible subscription link; latest 50 posts filtered to canonical/indexable published records | XML parser, MIME type, 15 current items and public 200 response |
| Collection markup | Visible article lists represented as Blog/ItemList; article objects link back to the Blog | Parsed JSON-LD, real visible ordering and canonical URLs |
| Homepage | Restored explicit social type/site/locale; image sitemap now references the visible original `/brand/hero.webp` | Canonical and original image preserved; Home remains separate from country pages |
| Bing notification | Public host-ownership file and bounded `scripts/indexnow.mjs`; dry-run by default, explicit changed URL list and `--submit` required | Live key, canonical/sitemap/noindex/response validation before any POST; receipt distinguished from indexing |

Article prose, actual offers, prices, existing keyword intent, CMS custom metadata, country routes, image catalogue and enquiry flows are preserved. Existing articles already have practical body content and contextual course/guide links; they were reviewed rather than expanded with repeated keywords. No ranking/search-volume estimates were invented.

## Validation and release status

Pre-release: 57 automated tests pass; production build passes. ESLint has zero errors and the same 19 pre-existing React advisories, mainly in staff interfaces; these are not new SEO defects. Production dependency audit reports zero known vulnerabilities. Local public checks cover 205 pages, all 15 articles, eight categories, ten listing/filter views, 422 internal destinations, 353 fragment references, all article images, RSS and six crawler-user-agent responses. Mobile (390px) and desktop (1440px) blog flows pass category selection, pagination, image decoding, date visibility, table-of-contents links and overflow checks. Article content remains available without JavaScript. Three existing fresh/returning desktop/mobile Home-to-country-to-Home/reload flows pass; no forms submitted. Screenshots were visually inspected.

Production release is verified READY as `dpl_HWA4ngycSX2bwc8JHGGro2jyxzuk` from application source `88d8a0d939ad9fe6ec7296fddd7e5e7ddc226bc0` (73-second build), with the stable alias and Git source confirmed. Live checks pass all 205 sitemap pages and topic placements, 196 top-image responses, 15 blogs, eight categories, ten listing/filter views, 422 internal destinations, 353 fragment references and six crawler-user-agent probes. RSS parses as valid XML with 15 items. Both original Google verification files remain HTTP 200 with matching local contents. Two live blog flows, no-JavaScript article rendering and three fresh/returning desktop/mobile Home/country flows pass without writes or browser errors. The 16 reviewed changed blog/listing URLs were sent once to IndexNow: HTTP 202 received, ownership-key validation pending, indexing unconfirmed. See `GOOGLE-BING-EVIDENCE-2026-10-25.json` for the complete receipt and checks. Subsequent documentation-only commits preserve the deployed application source.

## Ongoing checks

- `npm run seo:agent` — existing technical, page-quality and visible-topic checks.
- `npm run seo:search-engines -- <owned-origin> <output-directory>` — deeper link/blog/preview/feed/filter checks; bounded to 250 sitemap pages and 1,000 destinations. Current regression expectations reflect this site's 15-article catalogue.
- `npm run seo:notify -- /blog /blog/<changed-slug>` — dry-run public URL validation. Add `--submit` only for a reviewed release's changed canonical URLs. Never resubmit unchanged historic content in a loop.

RSS is intentionally a latest-50 feed and category discovery is bounded to recent 200 records. Revisit those bounds if the catalogue grows. Test-script raw HTML heuristics do not replace official rich-result testing or a manual editorial review.

## Primary sources checked at implementation

- Google Article/BlogPosting: https://developers.google.com/search/docs/appearance/structured-data/article
- Google helpful content and truthful dates: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- Google pagination: https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading
- Bing preview controls: https://blogs.bing.com/webmaster/2020/4/Announcing-new-options-for-webmasters-to-control-their-snippets-at-Bing/
- Bing sitemap guidance: https://blogs.bing.com/webmaster/2025/7/Keeping-Content-Discoverable-with-Sitemaps-in-AI-Powered-Search/
- Bing IndexNow implementation: https://www.bing.com/indexnow/getstarted
- IndexNow protocol/receipts: https://www.indexnow.org/documentation

The Bing guidelines help page was reachable through search but its dynamic body was not readable through the public fetch; substantive Bing decisions above use readable official Bing documentation. Next.js implementation follows the installed 16.4.3 metadata, sitemap and route-handler documentation.

## Account-dependent and measurement limits

Google ownership confirmation, Search Console sitemap submission, Google-selected canonicals/index counts, Bing Webmaster verification/performance, official Rich Results Test outcomes and field Core Web Vitals remain unverified. No authenticated Google/Bing dashboard was used during this release. IndexNow receipt is URL notification only, including a possible validation-pending 202; it does not establish crawl/index inclusion or Google notification. No organic rank, traffic or conversion gain is asserted. The 19 existing compiler advisories and factual substantiation of existing business claims remain separate review items; they are not silently declared fixed.
