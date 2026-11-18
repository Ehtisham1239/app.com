# Search Console coverage review, 18 Nov 2026

Source: GSC coverage export for `onlinequrancollege.com` (data to 13 Nov 2026). Status labels: **Observed** = in the export or repository; **Inferred** = reasoned from code, not seen on a URL list.

## What the export contains (Observed)
172 not-indexed pages (13 Nov): noindex 59, 404 61, redirect 13, alternate-with-canonical 11, 403 5, duplicate-without-canonical 1, discovered-not-indexed 15, crawled-not-indexed 7. 183 pages indexed. Only one per-URL list was supplied (`/login`, "indexed though blocked by robots.txt"). The other reasons need the per-reason drilldown export from GSC (Page indexing, click the reason, Export).

## Findings
| Reason | Pages | Cause (status) | Action |
|---|---|---|---|
| Excluded by noindex | 59 | Inferred: the retired city and country CMS pages (about 160 CMS rows carry `seo_noindex`). Owner decision of 16 Nov turned every one into a 301 to its hub or `/courses`, so the noindex is no longer served. | **Noindex not removed.** Removing it would undo the 16 Nov owner decision (`AGENTS.md`). These move to "Page with redirect" at the next recrawl. |
| Not found (404) | 61 | Inferred: old WordPress URLs. Many already 301 in `next.config.mjs`. Old menu entries (Quiz pages, LMS sign-in pages) have no equivalent. | Needs the URL list. Policy in the repo: redirect only to an equivalent page, otherwise keep 404/410. |
| Page with redirect | 13 | Inferred: legacy URLs, `/login`, `/register`, non-www host. | Expected, not an error. |
| Blocked 403 | 5 | Not determined. | Needs the URL list. |
| `/login` indexed though blocked by robots.txt | 1 | **Observed:** `/login` redirected to `/admin/login`, which robots.txt disallows. | **Fixed here:** `/login` now serves a 200 noindex page; `/login.html` 301s to it. |
| Discovered / crawled, not indexed | 22 | Google quality and crawl-budget decisions, no site error. | No code fix. Improve content and internal links, then request indexing. |

## Not verified
Per-URL causes for 404, 403, canonical and duplicate rows. No live headers were checked: the sandbox cannot reach the site and the logs on the Hobby plan keep one hour. Windsor's Search Console read is paused by the Free-plan account cap.
