# International organic search: GSC baseline and release gates (13 Nov 2026)

Source: owner-provided Google Search Console export `onlinequrancollege.com-Performance-on-Search-2026-11-13.zip`, Search type Web, filter Last 3 months. This is a snapshot, not a live API feed. Do not infer conversion rates from clicks.

## Market priority (non-Pakistan)
| Market | Clicks | Impressions | CTR | Average position |
| --- | ---: | ---: | ---: | ---: |
| United Kingdom | 3 | 207 | 1.45% | 25.14 |
| United States | 1 | 266 | 0.38% | 33.39 |
| Australia | 1 | 215 | 0.47% | 43.74 |
| Canada | 0 | 44 | 0% | 58 |
| Switzerland | 3 | 18 | 16.67% | 7 |
| Belgium | 2 | 17 | 11.76% | 6 |
| Netherlands | 2 | 14 | 14.29% | 9.71 |
| Sweden | 1 | 9 | 11.11% | 9 |
| Germany | 0 | 12 | 0% | 6 |
| Ireland | 0 | 12 | 0% | 8.17 |

Exclude Pakistan from **growth targeting**, not from service availability or existing site operation.

## Priority URLs for investigation
- `/online-quran-classes-uk`: 88 impressions, 0 clicks, avg position 34.27. Check query/page alignment and UK-specific usefulness.
- `/locations/united-states/houston`: 141 impressions, 0 clicks, position 29.21. Investigate queries before editing snippets.
- `/locations/australia/melbourne`: 92 impressions, 0 clicks, position 33.58.
- `/locations/australia/perth`: 87 impressions, 1 click, position 23.1.
- `/courses`: 67 impressions, 0 clicks, position 4.21; review search terms, branded navigational effects, title and snippet.
- `/pricing`: 56 impressions, 0 clicks, position 3.61; check intent and SERP before rewriting.
- `/locations/lithuania`: 172 impressions, 0 clicks, position 5.65. Prior internal audit attributed Lithuania visibility to irrelevant 'arabic classes near me' queries; DO NOT treat as evidence of Lithuanian demand or index a noindex page solely to chase impressions.
- `/locations/belgium/antwerp`: 2 clicks / 18 impressions; `/locations/switzerland/zurich`: 2 / 10. Preserve useful pages and verify actual user intent.

## Implementation acceptance criteria
1. Verify canonical origin, HTTPS and www redirects; ensure sitemap entries return 200, canonicalize to themselves, and are indexable. Do not add noindex pages to sitemap.
2. Audit mobile Core Web Vitals by real-user field data where available, then Lighthouse diagnostics; do not assert scores without measurements.
3. For each target market, review query intent, country-level language and local-time scheduling. No fabricated branches, teacher locations, testimonials, pricing, or guarantees.
4. Improve existing commercial pages before creating additional city pages. Each page needs original helpful information, distinct purpose, accurate service availability, useful internal links and a functioning free-trial CTA.
5. Keep canonical and hreflang mutually consistent; only add hreflang for genuine equivalent language/region versions. Country landing pages in the same language are not automatically hreflang alternates.
6. Check title, meta description, headings, structured data eligibility and rich-result validation. Do not add FAQ rich-result markup expecting visibility for a commercial website.
7. Test free-trial submission through CMS/Supabase/GHL with a non-production test lead, verify attribution fields (source, landing page, campaign/UTM) and deduplication, without publishing personal data.
8. Run lint, unit tests, build, link checks, sitemap/robots checks, and preview smoke tests. Release only after CI passes and Vercel deployment restrictions are cleared.
9. Compare non-Pakistan organic clicks, non-branded impressions, qualified trial leads, and trial-to-enrolment conversion weekly by country. Treat rankings and traffic as observations, not promises.

## Execution notes
This document records audit priorities only. It does not claim that page changes, CI, Search Console submission or production deployment have occurred. The earlier Vercel 402 resource-creation blocker and pending lead-sync worker must be checked independently before release.
