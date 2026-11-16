# OQC monthly growth plan: Nov 2026 – Apr 2027

**Owner request (16 Nov 2026):** rank in Google, Bing and AI answers (SEO, AEO, GEO) across the UK, USA, Canada, Australia and the UAE, and plan the work month by month.

**Agents:**
- `oqc-seo` plans, drafts and measures.
- `oqc-engineer` ships code changes.

**Sources:**
- `AUTHORITY-PROGRAMME.md` for links and citations;
- `OQC-500-KEYWORD-MAP-2026-11-05.md` and `search-os-2026-11-02/OQC_KEYWORD_DATABASE.md` for keywords;
- `UAE-ORGANIC-GROWTH-AND-CITATION-PLAN-2026-11-02.md` for the UAE.

**Rules:**
- Numbers come only from Search Console, GA4 or Bing pulled in the same session.
- Content goes in as drafts until the owner says to publish.

## What already runs automatically

| Job | When | What it does |
|---|---|---|
| OQC SEO execution (scheduled task) | Every 3 days | Up to 2 READY items from the execution register; PR and CMS drafts only |
| OQC weekly search report | Mondays | Search Console by market, build state and open PRs |
| IndexNow (GitHub Action) | Mondays 03:17 UTC | Sends changed URLs to Bing, Yandex and other IndexNow engines |
| Bing SEO audit (GitHub Action) | 1st of each month | Checks title and description lengths, H1, canonical and alt text on every sitemap URL |
| Monthly technical SEO health check | 1st of each month | Sitemap, canonicals, schema and redirects |
| Quarterly Google update review | Jan, Apr, Jul, Oct | Official Google changes; strategy updates |

## Monthly targets

These are activity targets, not promised rankings. Search engines decide rankings.

| Metric | Monthly target |
|---|---|
| Verified new placements (links and citations) | 15–30, after the pilot month |
| New or improved pages | 4–6 (improve existing pages before adding new ones) |
| GEO prompt checks | 25 (5 unbranded prompts × 5 markets) |
| Bing audit flags | 0 open at month end |
| Free-trial requests | Owner goal: about 10 a day; track by market in GA4/CRM |

## Month 1: rest of Nov 2026 (foundation)

- [x] Five country hubs restored (PR #267) with the hreflang cluster; city pages retired to their hub.
- [x] OQC Engineer and OQC SEO agents added to `.claude/agents/`.
- [x] Bing: IndexNow running; 8 meta descriptions fixed; monthly audit live.
- [ ] Owner: Bing Webmaster → URL submission for /locations/united-kingdom, /locations/united-states, /locations/canada, /locations/australia, /locations/united-arab-emirates, plus Search Console URL inspection for the same five URLs.
- [ ] Owner review, then publish: 3 UAE drafts in `drafts/` (kids school-week plan, adult Tajweed, Hifz routine). Admissions confirms lesson windows in GST.
- [ ] Authority pilot: live-check queue items 1–12; team submits the eligible ones; Claude verifies live URLs.
- [ ] Linkable asset 1: a printable parent weekly Quran practice planner (HTML + PDF). Needs teacher review.

## Month 2: Dec 2026 (market hubs and authority)

- Australia hub upgrade: state time zones, an AUD fee answer and an FAQ. Primary query: "online quran classes australia".
- Tafseer course page rewrite: title, intro and FAQ. Query: "online tafseer course".
- Female teacher requests: an answer block on /teachers. Query: "female quran teacher online".
- UK hub: "learn Quran online UK" phrasing and an adult section.
- Authority: outreach to homeschool resource editors (queue items 3–5) with asset 1. Screen 25 new UK and Canada prospects.
- GEO: first monthly prompt log, 25 checks.

## Month 3: Jan 2027 (Ramadan preparation; Ramadan is expected around 8 Feb 2027)

- Ramadan pages and updates live by 8 Jan: a family Ramadan Quran plan refresh, and a Ramadan "complete a khatm" schedule tool (needs academic review).
- USA hub: a kids section. Query: "online quran classes usa kids".
- Linkable asset 2: a Ramadan Quran reading planner. Pitch it to mosque and community newsletters (one per market).
- Quarterly Google update review (5 Jan).

## Month 4: Feb 2027 (Ramadan)

- Keep Ramadan pages fresh; send IndexNow after each update.
- Teacher interview pitch to 3 podcasts or newsletters (practical Tajweed in Ramadan).
- Canada hub: a time-zone and billing answer, checked against current terms.
- Authority: follow up on December outreach (one polite follow-up only).

## Month 5: Mar 2027 (post-Ramadan retention content)

- "Keep up your Quran after Ramadan" guide plus internal links to the courses.
- UAE: refresh the hub from Search Console queries; publish the next UAE draft if demand shows.
- Re-check placements at 90 days; remove lost links from the live totals.

## Month 6: Apr 2027 (review and scale)

- Six-month review by market: non-brand clicks, qualified trials, placements live and AI-answer mentions.
- Decide which markets get more content or paid tests. Paid tests only with an approved budget and verified tracking.
- Quarterly Google update review (5 Apr).

## Monthly checklist (every month)

1. Pull Search Console (Google) and the Bing audit; list pages to fix.
2. Refresh the lowest-CTR page that has at least 20 impressions.
3. Improve 4–6 pages, or add them only where a query has no page.
4. Run the authority batch: screen 25, act on those scoring 75 or above, verify live URLs.
5. Run 25 GEO prompt checks and log mentions, cited URLs and accuracy.
6. Send IndexNow for changed URLs (automatic on Mondays).
7. Report to the owner in Roman Urdu: wins, drops, placements and the next 3 actions.
