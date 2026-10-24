# Semrush follow-up — 24 October 2026

The six canonical course pages contained partial `CourseInstance` objects without real event dates or schedules. They now publish course information without representing individually arranged lessons as scheduled public events. The course directory now includes `ItemList` markup matching its visible course order. Shared icon paths and repeated card styles have also moved out of individual HTML documents.

**Release state: implemented and verified locally; not deployed.** Vercel is not connected in this session. The existing production origin remains `https://project-umber-three-93.vercel.app`; no alternate site, domain, database, authentication settings or production records were created or changed.

## Evidence and scope

- Source baseline: `392ff533223659c5bed3fc92b6f3408e982c00b1`, repository `Ehtisham1239/app.com`.
- Supplied file: `Semrush-Site_Audit__Overview-project-umber-three-93_vercel_app-24th_Oct_2026.pdf`, four pages, generated 24 October 2026. It reports 100 crawled pages, 88% site health, 83% AI search health, seven errors and 203 warnings. It does not include affected URLs, failing schema properties or the TLS hostname.
- A fresh robots-aware raw-HTML crawl attempted all 205 sitemap URLs plus one additional public route. All 206 returned HTTP 200; the crawler reported no missing title/description, malformed JSON-LD, missing language, missing image alt or canonical-format findings. This is broader than the overview's 100-page sample, but does not prove Google indexing or rich-result eligibility.
- All 21 distinct outbound link destinations found across those 206 pages returned HTTP 200, including their exact WhatsApp query strings. This does not prove that a social profile is signed-in accessible or owned by the college; it establishes current public HTTP responses. No healthy profile, contact action or attribution credit was removed to reduce a warning count.
- All 205 sitemap URLs are permitted for the eight agents listed in the PDF. Staff paths remain blocked under the most-specific-rule robots interpretation. Robots are not authentication; staff access also redirects to sign-in.
- The production source commit could not be independently inspected through hosting access. Live course markup matched the partial-instance pattern in the repository.
- Machine-readable results: [semrush-evidence-2026-10-24.json](semrush-evidence-2026-10-24.json). Dates use the Asia/Karachi reporting context; raw tool timestamps remain UTC.

## Issue ledger

| ID | Priority | Report item / location | Evidence, action and acceptance | State / owner |
| --- | --- | --- | --- | --- |
| S1 | P1 | Six invalid structured data items; six canonical `/courses/{slug}` pages | Live/source both emitted partial `CourseInstance` objects. Removed these incomplete Event objects, retained truthful Course name/description/provider, added provider URL and shared course-schema construction. No prices, ratings or schedules were invented. All six are clear of the local schema review after the change. The overview does not prove that these are the exact six Semrush field-level errors; confirm with a fresh detailed audit. | Implemented locally / developer; Semrush confirmation pending |
| S2 | P2 | `/courses` list schema | Added ordered `ItemList` with unique canonical detail URLs corresponding to the displayed course cards. Browser and unit checks verify count, order and matching detail URLs. | Implemented locally / developer |
| S3 | P2 | 94 low text-to-HTML warnings; shared course, pricing and FAQ templates | Moved the existing pinned Lucide artwork to one versioned, licensed, same-origin SVG sprite. Consolidated repeated card utility strings into CSS. Added practical course-selection guidance to the course directory. Existing main text word counts were preserved elsewhere. Controlled HTML reductions are approximately 2.9–9.7%. | Improved locally / developer; low-ratio warnings not declared eliminated |
| S4 | P2 | 107 external-link warnings | Deduplicated actual links across the entire public crawl: 21 unique destinations, all currently HTTP 200. The supplied overview cannot identify the original failing destinations or historical status codes. Acceptance requires the Semrush issue export or re-audit before declaring the 107 warnings resolved. | Not reproduced in current HTTP checks / SEO owner |
| S5 | P1 | One incorrect certificate name | HTTPS requests succeeded through the environment's trusted proxy. That does not independently establish the origin certificate SAN. The overview omits the failing hostname. Do not disable TLS verification or change domains to hide the error. Inspect the existing Vercel project's domains/certificate once connected; use the affected hostname from Semrush. | Blocked / hosting owner |
| S6 | P2 | One SNI warning | SNI and certificates are edge-hosting concerns, not JSX properties. Vercel account inspection and a direct-origin TLS check are still required. No unsupported hosting or DNS changes were made. | Blocked / hosting owner |
| S7 | Review | One page blocked from each AI/search agent; two blocked pages and one broken page in crawl overview | All 205 declared public URLs are currently allowed for all eight agents; 206 public responses are 200. Admin/auth/API crawl restrictions are intentional and preserved. Need affected URLs to distinguish historical failure, a utility route, or intentional private-page blocking. | Public access verified; original URL mapping unavailable / SEO owner |
| S8 | P1 | Production release | User authorized deployment to the existing Vercel project. Its documented Git integration is disconnected, so a GitHub commit is not deployment evidence. No authenticated Vercel capability is available yet. | Blocked / hosting owner |

## Controlled document-weight comparison

Both versions were built from the same dependency lock and public seed snapshot, without production database credentials. These figures compare uncompressed HTML, including framework payloads. The database-backed live homepage has different content and is not a like-for-like byte baseline.

| Page | Before bytes | After bytes | Reduction |
| --- | ---: | ---: | ---: |
| Home | 239,168 | 224,542 | 6.12% |
| Courses | 91,648 | 86,950 | 5.13% |
| Pricing | 96,790 | 88,192 | 8.88% |
| Noorani Qaida | 120,244 | 109,263 | 9.13% |
| London | 156,996 | 141,802 | 9.68% |
| USA | 166,369 | 151,149 | 9.15% |

The shared icon file adds a 13,959-byte request on an uncached visit and is cached immutably by its content-hashed filename. Its license is included in the SVG. Do not interpret document reductions as an equivalent speed gain. All 15 sampled text/HTML ratios remain below 10%; framework hydration and legitimate short forms still contribute markup. No padding copy or JavaScript-only replacement was introduced to force a scoring threshold.

## Validation

- 45 automated tests pass, including course/listing schema and resolution of every generated/shared and CMS-selected icon.
- ESLint: zero errors; 19 pre-existing React hook/render warnings. They were not silently suppressed or presented as resolved Semrush warnings.
- Clean production build passes and produces 230 static pages/routes in the build output.
- All 205 local sitemap URLs pass the existing technical audit: zero findings and zero fetch errors. Explicit missing-route, utility/noindex, pagination and campaign-query probes are included.
- Fourteen Chromium route/viewport cases pass at 390px and 1440px: page responses, no horizontal overflow, visible shared glyphs, course/list schema, mobile menu, currency choice and protected admin redirect. No enquiries were submitted; third-party chat was stubbed.
- Before/after course-title font size, line height, weight, color and width match across the sampled layouts. Final mobile course and desktop regional screenshots were inspected internally.
- A stale mixed CSS cache was discovered during comparison. After moving aside the old generated build and rebuilding cleanly, all sampled routes referenced the same current CSS and the comparisons passed. Generated build directories are not release source.

No real-device Safari coverage, authenticated staff workflow check, remote form persistence test, independent TLS/SNI scan, field Core Web Vitals, Google Rich Results Test, Search Console validation, fresh Semrush score or post-release live verification is claimed.

## Release and rollback

1. Connect Vercel for the existing `project` in the documented team. Inspect project `prj_q3qTOTMNxuDfgmd5XoCaoWVhQBVu`, current Git link, environment configuration and domains before choosing the matching release route. Preserve its production URL and existing Supabase environment values.
2. Publish the reviewed source state to that existing project using the established deployment procedure or a sufficient connected hosting capability. The repository's upload script requires credentials/public configuration supplied securely outside Git; it must not be run with blank values.
3. Wait for the matching deployment to reach READY, verify the stable production alias and confirm the source commit in deployment metadata. Recrawl the changed course/listing templates, sprite response/cache header, sitemap and robots; repeat mobile checks.
4. Re-run Semrush with enough crawl capacity for at least the current 205 sitemap pages. Obtain the detailed issue URLs/properties, especially certificate/SNI and any external-link errors that persist.

Rollback source by reverting the remediation commit. If a release is subsequently made, restore the previously verified Vercel deployment for an immediate runtime rollback. No database rollback is required because no schema/data mutation was made.

## Primary references checked

- [Google Course list markup](https://developers.google.com/search/docs/appearance/structured-data/course): required course properties and pairing detail pages with an ItemList summary.
- [Google's structured-data feature retirement notice](https://developers.google.com/search/blog/2025/06/simplifying-search-results): Course Info differs from the supported Course list feature. No rich-result guarantee is made.
- [Semrush issue definitions](https://www.semrush.com/kb/542-site-audit-issues-list): schema, TLS/SNI, external links and text/HTML diagnostic categories.
- [Vercel SSL documentation](https://vercel.com/docs/domains/working-with-ssl): certificate provisioning is handled at hosting/domain level.
- Installed Next.js 16.4.3 JSON-LD and metadata-route documentation was reviewed before implementation.
