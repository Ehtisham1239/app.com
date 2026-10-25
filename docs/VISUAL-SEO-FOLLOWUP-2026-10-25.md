# Homepage image, complete cards and SEO follow-up — 25 October 2026

The homepage now uses the exact `https://www.onlinequrancollege.com/hero.webp` illustration requested by the owner. Its downloaded SHA-256 matches the existing `public/brand/hero.webp` asset byte for byte (36,548 bytes). It is served locally in 320/440px responsive variants, eagerly with high fetch priority and reserved portrait dimensions. Home copy remains first on mobile. Social sharing retains the dedicated Open Graph banner.

Course cards on all country/city pages now have the relevant course thumbnail, an audience label and an explicit course link. Course, article and guide cards also have per-record registered fallback imagery when CMS cover fields are blank; custom approved covers are retained. Course, fee, learning, article and benefit cards use six restrained colour palettes with dark text and their existing focus/hover states. The brand asset cache uses a one-day freshness period rather than an immutable lifetime for unversioned files.

## Ten topic-to-page placements

These are themes observed on the public TarteeleQuran pages and retrieved search results, not an independently confirmed list of its ten highest-ranking queries. No Google country/device position export, search volume, difficulty, traffic or Search Console performance access was supplied. Competitor branding, claims, pricing and prose are not copied. Existing custom SEO fields are preserved; new short original visible introductions/section headings support the actual college offerings.

| Theme | Principal URL |
| --- | --- |
| learn Quran online | `/` |
| online Quran classes for kids | `/learn/quran-for-kids` |
| learn Quran online for adults | `/learn/quran-for-adults` |
| learn Noorani Qaida online | `/courses/noorani-qaida` |
| online Quran reading with Tajweed | `/courses/quran-nazara` |
| online Quran memorization | `/courses/hifz-quran` |
| learn Quranic Arabic online | `/courses/arabic-language` |
| online Quran translation and Tafseer | `/courses/quran-translation` |
| female Quran teacher online | `/teachers` |
| online Quran classes in the USA | `/locations/united-states` |

Evidence and placements are recorded in `content/seo-intent-map.json`. Reference pages: [TarteeleQuran homepage](https://www.tarteelequran.com/), [children’s classes](https://www.tarteelequran.com/quran-classes-for-kids/), [Noorani Qaida](https://www.tarteelequran.com/quran-courses/learn-noorani-qaida-online/) and [female teachers](https://www.tarteelequran.com/female-quran-teacher/). The search sample is not a locale-controlled Google rank tracker.

## New PDF and issue ledger

The latest supplied `(2).pdf` remains a 100-page overview with 88% Site Health, 83% AI Search Health, 7 errors and 203 warnings. It identifies no affected URLs, failing schema fields, external destinations or certificate hostname. It is not a fresh post-release crawl.

| Report item | Evidence and status |
| --- | --- |
| Six invalid structured-data items | Previously removed incomplete CourseInstance/Event objects remain absent. Real Course name/description/provider and the course directory remain in place; current local page checks pass. Google Course list requirements and visible-data guidance were reviewed. A new Semrush issue-level export is needed to reconcile the original six items. |
| Incorrect certificate name / SNI | Current Vercel project domain is verified and has no project-domain redirect. Platform DNS configuration reports `misconfigured:false` and no conflicts. Its managed `vercel.app` configuration also reports `ipStatus:required-change`; no DNS mutation is inferred from that generic field. The original affected hostname and independent origin SAN/SNI remain unavailable. These report items are not claimed conclusively resolved. |
| 107 external-link warnings | Recheck unique destinations discovered by the complete public crawl, preserving queries and distinguishing actual 404/410 from access walls. Do not delete working sources or private-page crawl restrictions to force a score. |
| 94 low text/HTML ratios | Compact shared templates, icon sprite and CSS remain. Useful short copy and thumbnail cards are retained; no padding, hidden keywords or removal of legal/article detail is used. A ratio threshold or 100% audit score is not guaranteed. |
| Blocked/broken/redirected pages | Public page response/robots checks and correct legacy routing are verified independently. Staff/auth/API restrictions and genuine missing-page 404s remain intentional. |

## Local verification

48 automated tests pass; ESLint reports zero errors and the same 19 existing warnings. Generated diagnostic/build files in ignored `artifacts/` are now excluded from lint, rather than disabling source rules. Clean production build passes. All 205 sitemap pages pass technical and page identity checks, with 196 distinct top-image responses. Browser checks cover 19 desktop/mobile route layouts, the ten visible topic placements, original hero source, image decoding, varied card colours and absence of horizontal overflow. Fresh/returning desktop and mobile Home → Country → Home navigation passes without form submissions; chat is stubbed. Full-page captures in this serverless Chromium can repeat compositor tiles; assertions use the actual DOM (one H1) and image decoding rather than treating capture artefacts as duplicated page content.

## Routing work retained

The homepage independence correction is retained. Live HTTP checks on source `0dd3177123873dc7fe15de082e4fc7a433d637fe` pass 45 homepage variants, all 187 configured redirects and their 178 final destinations, tracking parameters, three genuine missing-page 404s and protected admin redirection. The live test uses cURL for HTTPS HEAD requests because this environment’s Node proxy HEAD transport stalled; normal GETs and local HEADs are tested directly. This is a test-client limitation, not evidence of a website redirect defect. The newer Google Search Console verification file remains preserved.

## Release and measurement

Final deployed source, public crawl, external-link results and live browser evidence are recorded after publication. No database, domain or production environment mutation is included. No physical Safari coverage, field Core Web Vitals, Google indexing, fresh Semrush score, actual competitor ranks or remote form persistence is claimed.

Primary implementation references: [Google Course list](https://developers.google.com/search/docs/appearance/structured-data/course), [structured-data policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies), [SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide), installed Next.js metadata/proxy/redirect documentation.
