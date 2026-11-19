---
id: EVD-002
type: evidence
date: 2026-11-18
method: Search Console UI (last 28 days), CI live crawl + Lighthouse lab runs on main
---
# EVD-002 Search Console and speed evidence

Hub: [[000-OQC-SEO-Hub]]

**Observed — Search Console, 28 days to 16 Nov 2026**
- 50 clicks, ~2,000 impressions, CTR 2.5%, average position 23.6.
- Clicks come mostly from city pages at position 4–7 with 12–20% CTR: Antwerp, Brussels, Stockholm, Moscow, Zurich, Vienna, Geneva, Aarhus, Frankfurt, Rotterdam. All still indexed on 18 Nov (URL Inspection).
- `/locations/lithuania` gets 166 impressions for "arabic classes near me" at position 5.7, 0 clicks.
- `/pricing` (position 3.4, 0 clicks) appears only as a sitelink under the brand query "online quran college"; not a defect.
- Country hubs rank 50+ for head terms (e.g. "online quran classes australia" 63.3). Content is 1,400+ words with FAQ and Service schema.
- `/locations/united-arab-emirates/dubai`: "URL is unknown to Google"; indexing request hit the daily quota.

**Observed — live crawl (CI, 18 Nov 12:49 UTC):** 258/258 sitemap URLs audited, 0 technical findings, 0 quality failures, 0 keyword failures.

**Observed — Lighthouse lab, mobile (performance / TBT)**

| Page | #325 (9d57f1f) | #326 (3eac3bc) |
|---|---|---|
| / | 92 / 332 ms | 74 / 1,479 ms |
| /pricing | 91 / 298 ms | 73 / 1,651 ms |
| /free-trial | 97 / 196 ms | 74 / 1,488 ms |
| /locations/united-kingdom | 95 / 258 ms | 74 / 1,641 ms |
| /locations/united-states | 94 / 296 ms | 73 / 1,789 ms |

Desktop stayed 91–99. Best-practices 77 on every run before and after (third-party cookies), so that score is unrelated to #326.

**Observed — tags:** `GTM-W7CMZS53` (v15) also references GA4 `G-EMHY1G2CKB`; `AW-16564445897` is referenced by the site code and both containers.

**Unknown:** field Core Web Vitals (CrUX), keyword volumes, backlink profile. Windsor reads paused (Free plan, 3 accounts).
