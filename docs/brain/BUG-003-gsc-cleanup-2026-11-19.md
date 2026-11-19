---
id: BUG-003
type: bug-register
date: 2026-11-19
---
# BUG-003 Search Console cleanup, 18-19 Nov

Hub: [[000-OQC-SEO-Hub]] · Earlier: [[BUG-002-seo-gaps-2026-11-19]] · Coverage notes: `docs/seo/GSC-COVERAGE-2026-11-18.md`

| # | Observed | Fix | Status |
|---|---|---|---|
| 1 | Plugin URL `/?jkit-ajax-request=...` listed by Google | proxy returns 410 + `X-Robots-Tag: noindex, nofollow` (#327) | production verified (curl 19 Nov: 410) |
| 2 | Three empty/duplicate CMS pages (`online-quran-academy`, `free-trial-video-guide`, `online-quran-classes-in-perth-australia`) | 301 to `/`, `/trial-video`, `/locations/australia/perth` (#328) + `pages.deleted_at` set | production verified (curl 19 Nov: 308 to targets) |
| 3 | Duplicate non-www `https://onlinequrancollege.com/sitemap.xml` in Sitemaps | removed in Search Console 19 Nov; www `sitemap.xml` + `sitemap.txt` kept | implemented (Sitemaps page shows 2 rows) |
| 4 | Request indexing, "Discovered - currently not indexed" list | 12 of 13 requested (18-19 Nov); `/teachers/ustadha-maryam` hit "Quota exceeded" | **open, quota** (do not retry in a loop) |
| 5 | "Not found (404)" CSV (61 URLs, last crawl Jun-Oct) | Observed 19 Nov: 46 redirect to a 200 page, 13 return 410, 2 hosts are not site pages | no site change needed; report is stale |
| 6 | "Blocked due to access forbidden (403)" (5 old WordPress paths) | Observed: `/wp-content/*`, `/wp-login.php` return 410 live; no reference in repo or CMS (SQL, 19 Nov) | no site change needed; waits for Google recrawl |
| 7 | "Duplicate without user-selected canonical" = `app.onlinequrancollege.com/login` | separate ERP server (uvicorn behind Caddy, A record 187.77.176.82); code not in any repo reachable here | **open (owner/server)**: add `header /login X-Robots-Tag "noindex"` in Caddy |
| 8 | DNS zone review (Hostinger, read-only) | records for mail (Mailgun, Resend, Hostinger mail), `app`, `www`, `@` are in use; `portal` (CNAME fusionlogics) and `ftp` unknown | **open (owner)**: confirm before any delete |
| 9 | Live crawl of all 257 sitemap URLs | 257 x 200, 0 noindex, 0 canonical mismatch, 0 missing canonical, 0 duplicate title, 0 duplicate URL | PASS (curl, 19 Nov) |
