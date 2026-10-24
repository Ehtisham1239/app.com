# Public page and mobile improvements — 24 October 2026

This follow-up implements the requested visual, content, metadata and mobile changes on the existing Online Quran College website. The earlier Semrush remediation remains documented in [SEMRUSH-REMEDIATION-2026-10-24.md](SEMRUSH-REMEDIATION-2026-10-24.md). The newly supplied overview repeats 7 errors and 203 warnings across a 100-page crawl, without affected URLs or structured-data properties; it is not evidence of a new post-release crawl.

## Implemented behaviour

- The homepage enquiry form mounts only after **Open enquiry form** is clicked. Scrolling no longer loads it automatically, and its former 760px placeholder is removed. Mobile visitors retain the homepage, including after reload. Explicit trial and contact links continue to work.
- Every one of the 205 public sitemap pages has a top visual, a unique title/description/canonical identity and a `WebPage` identity connected to the shared `WebSite` and `EducationalOrganization`. Existing `Course`, `BlogPosting`, breadcrumbs and visible FAQ markup remain in place. Individually arranged courses do not invent scheduled events, dates, ratings or offers.
- Four new Islamic editorial illustrations provide study, courtyard, library and geometric-arch scenes. They are delivered in three widths (400/800/1200px), in AVIF and WebP, with descriptive alt text, dimensions and versioned cacheable paths. Course, article and guide pages retain their individual learning illustrations, now at the top. Regional headers combine the new study illustration with each page’s distinct map and local details; the scenes do not imply a real local branch or mosque photograph.
- Regional pages now lead with the actual city/country, IANA time zones, currency, online lesson format and time planner. Six repeated full course cards and full package lists are replaced by compact course links and a fee summary. Approved CMS guidance remains available in a native expandable section. City links, country hierarchy, map credits and accessible FAQs remain usable without JavaScript.
- Fee summaries use only existing approved monthly prices in that currency. Unpriced currencies request a quote; no exchange rate is invented. Regional package links preselect the requested currency on `/pricing`.
- Homepage introductions, benefits, card teasers and FAQs are shorter. Full article bodies, learning outcomes, course modules and policy terms are preserved.
- `/robots.txt` is now an actual static `text/plain` file. All public learning pages are allowed; staff, auth and API paths remain excluded. It references the existing production sitemap. Update this static sitemap hostname when moving to a different canonical domain.
- Public metadata consistently includes canonical URLs, page-specific Open Graph/Twitter information and large image-preview directives. Utility noindex behaviour is preserved.

## Verification completed locally

- Clean Next.js production build passes. Dynamic currency selection is server rendered; the remaining declared public pages retain their existing rendering strategy.
- **46 automated tests pass**, including actual responsive image dimensions/payloads, geographic/time-zone behaviour, course schema, robots access, SEO utilities and existing database contract tests.
- ESLint reports **0 errors and 19 existing warnings**. No rule was disabled to obtain these results.
- Technical audit: **205/205 sitemap pages**, zero findings and zero fetch errors, plus missing-route, utility/noindex, query-canonical and pagination probes.
- Page quality audit: **205/205 pages** have the required unique metadata, one H1, page/schema identity and an informative top visual; **195 distinct top-image URLs** return valid image responses. Four generated illustrations have 24 responsive format/size files, all below 200KB each.
- Chromium device emulation passes for iPhone portrait, Android portrait, iPhone landscape and iPad Mini: initial home entry, visible heading/header, no automatic enquiry form on scroll, explicit activation, reload at the top, intended trial navigation, introduction/image before the trial form and no horizontal overflow. Nine desktop templates and direct NOK currency selection also pass. No enquiries are submitted; third-party chat is stubbed.
- Desktop London, course and trial layouts and mobile entry screenshots were inspected. Raw evidence and screenshots are produced under ignored `artifacts/islamic-redesign/`; the portable summary is [ISLAMIC-REDESIGN-EVIDENCE-2026-10-24.json](ISLAMIC-REDESIGN-EVIDENCE-2026-10-24.json).

Controlled local prerendered HTML comparison against the previous release, using the same seed snapshot: homepage 224,542 → 207,501 bytes (7.59% smaller), London 141,802 → 81,377 (42.61% smaller), USA 151,149 → 89,794 (40.59% smaller). Noorani Qaida increases from 109,263 to 112,446 bytes (2.91%) with its additional top visual and page identity. These are document weights, not measured speed or ranking gains; they exclude image requests.

## Illustration provenance

Generated on 24 October 2026 using the built-in image-generation workflow: closed Quran on a stand beside an arched window; fictional mosque courtyard with reflecting pool; Islamic study library with writing desk; geometric arch and peaceful courtyard. Shared art direction: landscape, emerald/mint/ivory/gold, no people, no sacred figures, no promotional text. Original PNGs were retained separately; repository assets are mechanical resized/encoded derivatives. Natural Earth and GeoNames map attribution remains on regional pages.

## Verification limits

Browser device emulation is not a physical iPhone/Safari test. Public rendering checks do not establish remote form persistence, authenticated staff workflows, field Core Web Vitals, Google indexing or a fresh Semrush score. The PDF does not identify its certificate/SNI hostname; the existing Vercel domain was previously verified as configured, but those original warnings are not claimed resolved. The existing public/private crawl distinction is intentional. No literal “100% perfect” or guaranteed rich result/ranking is asserted.

## Release

**Production READY.** Reviewed source `ec92c57018a520a83c4e0db4c0d0ad36a5d9b5e7` is deployed as `dpl_7CB6qRsLKBfHnRCv2zkYtDQmRGV7` (build 72.938 seconds), assigned to [the existing production website](https://project-umber-three-93.vercel.app). The existing Vercel project, canonical hostname, environment and database are retained; no database or DNS migration was made.

Post-release checks pass: all 205 sitemap pages with zero technical findings or fetch errors; all 205 page/metadata/schema/hero checks; 195 distinct top-image responses; all 24 new AVIF/WebP files with exact expected byte sizes and immutable caching; 15 template/course schema samples with zero findings; and public access for all 205 pages for eight search/AI agents, with staff access excluded. The complete live browser suite passes all four emulated mobile cases and nine desktop templates, including NOK selection, without submitting any form. Owned-site requests use the environment’s trusted TLS/proxy route; third-party chat is stubbed. The live browser evidence is included in the portable JSON record.

Rollback: restore the previously verified production deployment `dpl_8gavnNmqPoDfHYDjLXjYE5KkSKRG` or revert the application commit. No database rollback is required. Automatic deployment on future GitHub pushes remains unverified; this was a pinned Git-source release.
