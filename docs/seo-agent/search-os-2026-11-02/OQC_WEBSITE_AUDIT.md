# OQC website audit — 2 Nov 2026

Method: source inspection of `main` (production `709d1e9`, then `d9defa4` from mid-session) plus Google Search Console data for `sc-domain:onlinequrancollege.com`, last 28 days, pulled through Windsor on 2 Nov 2026. A live crawl could not run from this workspace (see `OQC_PROJECT_CONTEXT.md`); earlier crawl evidence is in `../../SEO-PUBLIC-VERIFICATION-2026-10-31.md`.

## 1. Search Console baseline (measured, 28 days to 2 Nov 2026)
| Country | Clicks | Impressions | Avg position |
|---|---:|---:|---:|
| United Kingdom | 1 | 129 | 25.6 |
| United States | 0 | 125 | 33.2 |
| Australia | 1 | 115 | 44.7 |
| Canada | 0 | 13 | 41.8 |
| United Arab Emirates | 0 | 5 | 10.0 |
| Pakistan | 7 | 63 | 13.1 |
| Lithuania | 0 | 115 | 5.5 |

Reading: the site is visible but almost never on page 1 for commercial queries in the five markets. About 15 clicks site-wide in 28 days, most branded or from Pakistan. Lithuania's 115 impressions all come from one irrelevant query ("arabic classes near me") on `/locations/lithuania`, which is already noindex in source and should fall away.

Best-placed commercial queries (position ≤ 15): "online quran classes uk" (13.3, 18 imp), "online quran classes near me" UK (11.3), "quran teacher near me" UK (12.5) and US (6), "how much do online quran classes cost in the uk?" (9.0, 6 imp — answered on `/pricing` since PR #41), "online quran" AU (11), "female quran teacher near me" UK (2).

## 2. Findings register
| ID | Finding | Evidence | Impact | Priority | Status |
|---|---|---|---|---|---|
| A1 | Three **unverified Google Business Profile** listings exist, one on a London address used by many unrelated companies, one with whole-country service areas | Windsor GBP data | Policy/suspension risk; split brand entity | P0 | Decision needed — see `OQC_GBP_ELIGIBILITY_AND_OWNERSHIP.md` |
| A2 | Production alias `appcom-online-quran-college.vercel.app` serves a full duplicate of the site without `noindex` | Vercel domain list; `next.config.mjs` headers | Duplicate host can be crawled | P1 | Implemented in this PR (X-Robots-Tag on `*.vercel.app`) |
| A3 | Trial form phone placeholder `+44 7700 900123` (Ofcom drama range) | `quick-trial-form.jsx` | A UK-only example on a five-market form; looks like a real number | P1 | Implemented in this PR |
| A4 | `app.`, `go.`, `hiring.`, `portal.` subdomains are indexed (portal/login pages) | Search Console pages report | Login and campaign pages compete with the main site; weak quality signals | P1 | Blocked — host not in this repo; owner/DNS action |
| A5 | Old indexed URLs with parameters (`/free-trial?country=…&currency=…`) | Search Console pages | Low; page already declares canonical `/free-trial` | P3 | Observed; no action |
| A6 | Course page `/courses/quran-translation` averages position 65.9 on 22 impressions | Search Console | Weak relevance for "tafseer course" intents | P2 | Content task E-08 |
| A7 | No Canada- or UAE-specific blog guide (USA and Australia have one each) | CMS `blog_posts` | Thin supporting content for two markets | P2 | Content task E-09 |
| A8 | Separate Search Console property for `project-umber-three-93.vercel.app` | Windsor accounts | Old project still verified; may be indexed | P2 | Owner action |
| A9 | Repo SEO scripts (`seo:agent`, `seo:keywords`, `seo:keyword-map`) need live-site network access | Script runs failed with ENOTFOUND | No fresh crawl this session | — | Blocked here; run from a machine that can reach the site |

## 3. Already strong (keep)
- One canonical host with apex → www 308 (Vercel).
- Robots: public crawl allowed; `/admin`, `/auth`, `/api/`, `/parents` disallowed (`src/app/robots.js`).
- Sitemap built from fixed pages + CMS rows, excluding noindex pages (`src/app/sitemap.js`).
- Country hubs for all five markets indexable; city pages and other countries noindex,follow (`INDEXED_MARKETS`).
- Legacy WordPress URLs 301 to their new homes (`next.config.mjs`).
- EducationalOrganization + WebSite JSON-LD with only CMS-stated facts; no invented street address or ratings.
- All 20 published blogs are under the 1,000-word rule (largest: 920 words).

## 4. Free-trial journey (source review)
`/free-trial` → `QuickTrialForm`: learner, age band, country, time zone, teacher preference, WhatsApp, email, consent. Client validation requires 7–15 digits. Page states 3-day trial, Weekend plan excluded, reply within 24 hours, with FAQPage data matching visible text. Improvement made: country-code placeholder and a visible hint linked to the field for screen readers.
