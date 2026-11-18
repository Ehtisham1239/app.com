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


## Real URL lists (exported from Search Console on 18 Nov 2026) and fixes

Observed from the Page indexing drilldowns (data of 13 Nov).

- **Noindex 59 = 52 retired `/locations/{country}[/{city}]` pages + 7 `/blog?category=` filters.** All already 301 (16 Nov decision; #306). Noindex intentionally kept off the redirect targets.
- **404 61:** 44 old relative links (`/about|contact|pricing|privacy-policy/{slug}`) already 301 in `next.config.mjs`; old non-www WordPress URLs (`/quran-nazara-course`, `/hifz-ul-quran-course`, `/noorani-qaida-course`, `/hadith-translation-course`, `/our-blogs`, `/faqs`, `/start-teaching-the-quran-to-your-children`, `/op/book-now-...`) already 301. **New in this change:** `/teaching-the-quran-to-your-children-2` 301s to the same guide; quiz pages, `/lp-profile`, `/api-test`, `/sign-in`, two old articles with no equivalent, `/wp-json/*`, and the injected spam date permalinks (`/2012/10/17/kod-pocztowy`, `/2013/01/23/komplety-erotyczne`) now answer **410 Gone** via `/gone`.
- **403 5:** `/wp-content/*`, `/wp-*.php` on the old WordPress install. Now 410 as well.
- **Alternate with canonical 11:** `/free-trial?...` query variants, `/?jkit-ajax-request=...`, `/pricing/`, `/privacy-policy/`. Expected: Google correctly picked the canonical. No change.
- **Redirect 13:** bare/`http` host, trailing-slash, `/book-now`, `/login.html`, `/online-quran-classes-uk`. Expected.
- **Duplicate without canonical 1:** `app.onlinequrancollege.com/login`, a different subdomain outside this repository.
- **Crawled, not indexed 7:** `/blog/feed.xml` now `X-Robots-Tag: noindex` (a feed should not be indexed); `/online-quran-classes-birmingham|leeds`, `/services/`, `/book-now/`, `/quran-quiz/` are redirects/410 now; `/blog/online-quran-classes-new-zealand-time-zones` is a real article (Google quality decision).
- **Discovered, not indexed 15:** 9 blog articles, `/editorial-standards`, `/learn/quran-for-reverts`, 4 teacher profiles (`/teachers/ustadha-aisha` is 301 to `/teachers/aisha`). All are in the sitemap and live; only Google can index them. Use URL Inspection > Request indexing.
- **Other hosts seen in the lists, not served by this repo:** `hiring.onlinequrancollege.com/_preview/`, `email.mail.onlinequrancollege.com`, `app.onlinequrancollege.com`.

## Verification (18 Nov 2026)
- **PASS, production** (`www.onlinequrancollege.com`, deployment `dpl_DQ35hVbn6CiTmgw48DDUu1cHaehi`, commit `2645ca2`): `/login` 200 + noindex; `/noorani-qaida-quiz`, `/wp-json/elementskit/v1`, `/2012/10/17/kod-pocztowy` 410 + noindex; `/blog/feed.xml` 200 + `X-Robots-Tag: noindex`. `/login.html`, `/about/pricing`, `/hifz-ul-quran-course`, `/teaching-the-quran-to-your-children-2` redirect (destination not read in this check).
- **PASS:** the 22 "discovered/crawled, not indexed" and hub URLs are 200, not noindex and self-canonical, so nothing on the site blocks them.
- **PASS, local:** `node --test` on redirects, robots, indexing, seo and legacy-gone: 44 pass, 0 fail.
- **BLOCKED:** Search Console "Request indexing" returned "Quota exceeded" (daily limit). IndexNow POST from the browser failed (CORS) and the sandbox cannot reach `api.indexnow.org`. Creating a scheduled task for tomorrow's requests was denied by the permission check.
- **NOT RUN:** full production build locally (Supabase not reachable from the sandbox); Search Console re-validation results (Google decides; validation already "Started").

## Checkpoint
**Next action (owner, 19 Nov onward):** in Search Console > URL Inspection, press REQUEST INDEXING for the 22 URLs, about 10 per day: the five hubs and `/locations`, `/editorial-standards`, `/learn/quran-for-reverts`, `/teachers/{ustadha-fatima,ustadha-khadija,ustadha-maryam,aisha}`, then the 10 blog articles listed under "Discovered/Crawled". Then run `node scripts/indexnow.mjs --submit <paths>` from a machine with internet access (Bing/Yandex only).
**Open, outside this repo:** `hiring.onlinequrancollege.com/_preview/`, `email.mail.onlinequrancollege.com`, `app.onlinequrancollege.com/login`.
**Recheck:** Page indexing report on about 25 Nov, once Google has recrawled the 404/403/noindex URLs.
