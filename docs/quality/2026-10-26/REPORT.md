# OQC mobile, performance, articles and SEO release

26 October 2026 · reporting timezone Asia/Karachi. Repository: `Ehtisham1239/app.com`. Public app: https://project-umber-three-93.vercel.app. Approved canonical host: https://www.onlinequrancollege.com. The canonical host is a separate domain-verification dependency; a canonical tag is not proof that the new app serves that address.

The reviewed implementation preserves the latest three-day offer and single-step booking form from upstream commits `f90092f` and `9482c7d`. Original homepage illustration, logo assets, editorial bodies, authors, publication history, explicit custom SEO settings and consent choices are preserved. Source changes and configuration alignment are complete; final deployment evidence is added below when verified.

## Findings and implementation ledger

| ID | Priority | Observed issue and impact | Implemented change | Acceptance / state |
| --- | --- | --- | --- | --- |
| PERF-1 | P1 | Both Latin font subsets were preloaded and declared as the same family without subset ranges. English visitors downloaded the large extended font unnecessarily. | Split the extended font into its own non-preloaded fallback family. International glyphs remain available on demand. | Home font transfer 275,376 → 190,008 bytes in the local sample; implemented locally. |
| PERF-2 | P1 | Supabase SDK code downloaded before visitors submitted a form. | Load the public SDK inside the existing async submit/lookup handlers, including the new quick-trial form. Auth, payloads and RPC permissions are unchanged. | Home script transfer 259,399 → 193,811 bytes in the combined sample; new one-step upstream form also contributes to the comparison. |
| BUILD-1 | P1 | Persisted `.next/server/route-cache` responses retained removed CSS chunk references after local rebuilds. This produced unstyled pages and misleading browser-test failures. | Clear rendered runtime responses before a build; preserve compiler/fetch caches. Fail the build if generated HTML references missing CSS/JS/font assets. | Clean and subsequent incremental builds passed the new integrity gate. |
| BROWSER-1 | P1 | Separate server/browser processes could use different managed network namespaces; hardcoded ports could reuse stale servers. Remote response forwarding could mishandle compression and teardown. | One parent runner, temporary free port, process-group cleanup, trusted-TLS GET/HEAD bridge preserving RSC headers and identity encoding, asset-error reporting, and waiting for lazy-image completion. | 48 route/viewport cases plus blog, analytics and form-validation journeys passed locally, zero browser errors/writes. |
| MOBILE-1 | P2 | The mobile CSS overrode the menu trigger to 40px; the close control was also 40px. Brand labels did not match accessible names. | 44px controls, flexible brand width, explicit visible-label spacing and reflow-safe header sizing. | Menu/focus/Escape checks, 200% text reflow and additional breakpoint checks passed. |
| MOBILE-2 | P2 | Consent overlay could sit above the mobile drawer; tall cards and long prose/tables reduced usable space. | Drawer remains above the consent panel. Bound panel height and safe-area spacing; contain long text, code and tables; retain readable form sizing. | Landscape drawer with unresolved consent and narrow layouts passed. |
| BLOG-1 | P2 | Long contents lists consumed mobile reading space; related content was ranked only by broad categories/tags. | Native collapsible contents with 44px links, desktop sidebar, curated task-based related reading and course/guide resources on all 15 articles. | Topic filters, pagination, anchors and no-JavaScript article reading passed. |
| BLOG-2 | P2 | Articles had no convenient clean print view or canonical-link copying. | Small reader toolbar, native clipboard/print actions, print-safe heading colours, source URL, and removal of navigation/marketing from print. | Browser API stubs and print-media assertions passed; no external sharing was performed. |
| SEO-1 | P2 | Robots sitemap origin was hardcoded and disagreed with isolated QA/preview metadata. Social images omitted known dimensions. | Generate robots from the same configured origin as sitemap/canonicals; retain public access/private exclusions. Add verified manifest dimensions to social-image metadata. | All 205 declared URLs, real 404/noindex probes and 197 top-image responses pass local gates. |
| SEO-2 | P2 | Careers was a sitemap-only orphan candidate in the initial crawl. Some older articles depended on pagination or weak related links. | Add Careers to company navigation without duplicating CMS links; strengthen article topic connections. | New links are present in shared server HTML; publication and follow-up crawling are verified during release. |
| AGENT-1 | P2 | SEO tools rejected the real Vercel app after the canonical-host switch. Agents had no compact site guide. | Explicit allowlist for both owned origins; reject credential-bearing/lookalike targets. Add `/llms.txt` with use cases, current courses, eligible articles, policies and booking boundaries. Add truthful Organization parent type/contact point from existing public fields. | Origin tests and 15 article links pass; no staff/API access or invented address/MCP service added. |
| CACHE-1 | P2 | New versioned hero files lacked long-lived image headers; versioned learning assets used one-day browser cache. | One-year immutable cache for versioned learning files and hero assets; preserve conservative caching for unversioned assets. | Sample AVIF/WebP/hero responses return 200 and the expected cache header. |
| DATA-1 | P1 | Public CMS/source already advertised three days, but five eligible package records still specified seven. | Align their `trial_days` to three and update the source fallback snapshot. Weekend remains zero. | Follow-up production SELECT verified all six package values. Existing applications and prices were not edited. See `trial-configuration.sql`. |

## Validation and practical limits

- 67 automated tests pass, including local Postgres/RLS/RPC tests. Supabase-only cron/HTTP extensions are excluded from local emulation.
- Production build and the rendered-asset integrity gate pass. ESLint: zero errors, 19 existing warnings.
- Local Chromium: 48 template/viewport cases at 320/390/768/1440px plus 15 cases at 360/430/1024/1280px and 844×390 landscape. No horizontal overflow, failed hero/footer decoding, undersized footer targets or JavaScript errors in the completed suites.
- Blog filtering, pagination, table-of-contents anchors, reader actions and print mode pass on mobile/desktop. Articles and learning links remain readable without JavaScript.
- The one-step trial form blocks invalid submission, focuses the first error and supports a specific US time zone. Production enquiry submission, email/WhatsApp delivery and authenticated staff operations were not exercised.
- GA4 owner ID `G-57TGPTDNT4` remains enabled. Consent, rejection persistence, deduplication, route page views and revocation pass at 390/1440px with inert Google stubs. These are installation checks, not GA4 Realtime receipts.
- All 205 sitemap URLs pass technical/metadata/topic placement checks; 197 top-image responses pass. This is not Google index coverage, an independent rich-results result or a ranking measurement.

Initial raw crawler coverage was 204 pages with cap 300, no robots skips and all responses 200. It deliberately did not follow the robots sitemap onto a different origin, so sitemap coverage there was zero; the separate application audit covered all 205 declared paths. The initial 204 cross-origin-canonical observations describe the canonical migration dependency, not 204 unrelated defects fixed by this release.

Local Lighthouse 13.5 samples reported accessibility/best-practices/SEO category scores of 100 on two templates. Aggregate performance scores were **unavailable** because this Chromium environment returned `NO_SCREENSHOTS` during tracing. No 100-performance claim is made. Resource-transfer reductions are lab byte counts, not field LCP/INP/CLS, real-device Safari coverage or ranking improvements. The article toolbar adds about 1.2KB of compressed JavaScript; extended Latin still downloads where article glyphs require it.

## Agent-readiness evidence

The public Is Agentic snapshot scored **69** at `2026-10-26T06:52:50.152Z`: https://is-agentic.com/scan/project-umber-three-93.vercel.app. This is the pre-release snapshot, not a post-release score. The service caches reports; rereading it immediately does not prove improvement.

The functional browser/SEO-runner defects were repaired and tested independently. This release also improves public discovery and machine-readable identity. Markdown content negotiation was not implemented. Developer API/MCP recommendations do not establish that a remote education website needs a public API; the scanner's Vercel registry association is not an OQC MCP integration. No fabricated office address, credential or API was added to gain points. Google's AI-search guidance does not require special AI markup or `llms.txt` for inclusion.

## Search intent and international competition

`KEYWORD-MAP.csv` maps 15 existing article questions and ten service/audience routes to distinct informational or commercial purposes. These are offering-matched query hypotheses, not measured search volumes, difficulty, rankings or traffic. No bulk city pages, repeated keyword blocks or purchased backlinks were added.

English-language search observations on 26 October 2026 surfaced [Her Quran Academy](https://herquranacademy.com/online-quran-classes-uk/), [Rahber Institute](https://rahberinstituteuk.com/online-quran-classes-for-kids-uk) and [Nurverse Quran](https://nurversequran.com/courses/noorani-qaida/). Visible comparison features include local-time clarity, explicit package/course information and parent-oriented starting-point questions. This release strengthens OQC's navigation, current trial consistency, reader resources and performance foundation. Those pages' prices, reviews, availability and credentials were not adopted as OQC facts. This was not a geographically controlled SERP/ranking study.

Before expanding content, the college should supply teacher-reviewed worked examples, reviewer identities/qualifications and original learner-safe resources. Preserve custom article bodies and real publication dates. Do not promise fixed learning outcomes or publish invented testimonials, accreditation or local offices.

## Remaining dependencies and 30/60/90-day plan

| Priority | Dependency / owner | Required acceptance evidence |
| --- | --- | --- |
| P1 | Canonical-domain owner / authoritative DNS provider | Complete ownership TXT challenge, verify both hostnames and routing, then confirm this exact app and HTTPS on the approved canonical host. Prior exact values are in `docs/seo-agent/GA4-ACTIVATION-2026-10-26.md`; re-read provider recommendations before routing changes. |
| P1 | Owner / Search Console and analytics accounts | Verify property/sitemap status and a real consented GA4 receipt. Export page/query/country/device baselines; do not infer indexing from HTTP 200. |
| P2 | Owner / coordinator | Verify real enquiry persistence and final delivery with an explicitly identified test, and review current teacher/offer evidence. No real customer data was used by this QA. |
| P2 | Hosting administrator | Restore runtime-log observability; the last runtime-log API attempt returned 403. A clean server-log scan is not established. |
| P2 | Content team, days 1–30 | Review priority kids/Tajweed/Hifz articles; add useful original examples and approved citations where needed. Complete domain/measurement blockers before declaring launch or outcomes. |
| P2 | Content team, days 31–60 | Publish reviewed supporting resources for actual query gaps, improve relevant internal links, and pursue legitimate educational partnerships with approval for outreach. |
| P2 | SEO owner, days 61–90 | Compare complete like-for-like periods, qualified enquiries and enrolments; inspect cannibalisation, weak pages and mobile field CWV before choosing further edits. |

Rankings and indexing cannot be guaranteed by code changes. Search Console, GA4 outcomes, field CWV and a fresh Semrush URL-level audit remain unavailable in this session. The old Semrush overview's unidentified seven errors/222 warnings are not silently declared resolved by these independent checks.

## Reproduce and release

Run `npm ci`, `npm test`, `npm run build`, `npm run verify:site`. Install Playwright Chromium or provide `CHROMIUM_PATH` and optional `CHROMIUM_ARGS_JSON`. The verification command starts its local server within the same parent process on a temporary port and cleans up the process group. For public read-only QA: `npm run verify:site -- https://project-umber-three-93.vercel.app`. The runner does not submit enquiries or call authenticated staff routes.

Release only the reviewed tree on the existing Vercel project `prj_q3qTOTMNxuDfgmd5XoCaoWVhQBVu`, account `team_8Xig9mSvNd3XLAzNbQgwPapo`. Preserve the current READY upstream three-day release as rollback; do not promote the older seven-day source over newer work. Final source/deployment/alias and live results are recorded in `EVIDENCE.json` after publishing.

Primary guidance checked: [Google helpful content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content), [AI search features](https://developers.google.com/search/docs/appearance/ai-features), [Article structured data](https://developers.google.com/search/docs/appearance/structured-data/article), [Web Vitals](https://web.dev/articles/vitals), [Is Agentic documentation](https://is-agentic.com/docs), installed Next.js 16.4.3 metadata/font/image/link documentation, and [Supabase JavaScript RPC](https://supabase.com/docs/reference/javascript/rpc).
