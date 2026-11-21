---
id: CHK-003
type: checkpoint
date: 2026-11-19
---
# CHK-003 Checkpoint

Hub: [[000-OQC-SEO-Hub]] · Previous: [[CHK-002-seo-2026-11-19]] · Register: [[BUG-003-gsc-cleanup-2026-11-19]]

**Done (Observed):** jkit URL 410, three retired pages 301, non-www sitemap removed, 12 of 13 indexing requests accepted, 257/257 sitemap URLs PASS on a live curl crawl.
**Results:** unit tests 469 PASS on the #328 branch (earlier). No production code changed in this checkpoint (docs only).
**Not run:** Google's own index state for the requested pages (Unknown until recrawl); field Core Web Vitals; Windsor reads (BLOCKED, see BUG-002 #7).
**Open:** BUG-003 #4 (maryam quota), #7 (app login noindex, server side), #8 (`portal`, `ftp` DNS); BUG-002 #2, #3, #6.
**Next action:** after quota reset request indexing once for `/teachers/ustadha-maryam` (with the 13:35 PKT UAE retry); owner adds the Caddy noindex line for `app.` login; recheck Page indexing about 25 Nov.
