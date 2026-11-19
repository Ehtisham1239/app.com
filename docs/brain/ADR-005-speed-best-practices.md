---
id: ADR-005
type: decision
date: 2026-11-19
---
# ADR-005 Speed best practices (checklist and current status)

Hub: [[000-OQC-SEO-Hub]] · evidence: [[CHK-005-speed-2026-11-19]], [[CHK-007-crawl-speed-2026-11-19]]

Sources: Next.js production checklist and CDN caching guide (bundled in `node_modules/next/dist/docs`), web.dev Core Web Vitals guidance, Chrome team notes on third-party scripts and Next.js (developer.chrome.com/blog/next-third-parties), corewebvitals.io 2026 checklist. Targets at the 75th percentile: LCP <= 2.5 s, INP <= 200 ms, CLS <= 0.1.

| Practice | Status here |
| --- | --- |
| Responsive AVIF/WebP, width/height set, lazy-load below the fold, one eager high-priority LCP image | Observed: done |
| Long immutable cache for hashed or versioned assets | Observed: done (`next.config.mjs` headers) |
| Few web-font files, `unicode-range` on fallbacks, no unused subsets | Done (CHK-005): 100-134 KB per page |
| No layout shift (reserved image/hero space) | Done: CLS 0 mobile, 0.098 desktop |
| Third-party scripts start after load and idle, never during first paint | Done (owner, 19 Nov); keep it |
| Fewer third-party tags: duplicates removed | Partly: second GA4 `G-EMHY1G2CKB` still in `GTM-W7CMZS53` (BLOCKED, owner sign-in) |
| Server Components by default; small `"use client"` islands | Inferred: first-party JS is not the bottleneck (CHK-005) |
| CDN on, HTTP/3, brotli | Observed: hcdn on |
| Edge caching of ISR HTML (`s-maxage=300`) | Observed: hcdn reports DYNAMIC. Not changed: needs the host to honour `Vary`/`_rsc` and per-visitor `/api/geo` must stay uncached |
| Real-user vitals (web-vitals to GA4) | Done (`oqc_*` events, GTM) |
| Lighthouse in CI on live pages | Done (`live-performance-audit`) |

**Rule for new work:** do not add a script, font file, hero-size image or client component without checking the live audit afterwards; a regression of LCP, TBT or CLS blocks the merge.
**Unknown:** whether hcdn can cache the ISR HTML safely; test on a single static route first.
