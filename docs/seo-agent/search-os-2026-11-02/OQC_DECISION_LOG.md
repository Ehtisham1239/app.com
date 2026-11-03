# Decision log

| Date | Decision | Basis | Made by | Status |
|---|---|---|---|---|
| 2026-11-03 | Owner asked to execute live: merged #77, #78, #79; published first website testimonial (owner confirmed permission) and the Ramadan family plan article; review publish-permission migration applied to production; monthly SEO task now runs every 3 days. Citations stay one global identity with no bulk directories; off-site profiles need owner sign-in (E-24) | Owner instructions in session; CI + Vercel READY; live pages fetched | Owner | Applied |
| 2026-11-03 | E-20 approved: UK hub SEO title "Learn Quran Online in the UK – Kids & Adult Classes" and new meta description live in the CMS (version 12). #65 and #73 are on main via #74 and in production deploy of 64eae3a (READY) | Owner instruction in session; CMS read-back; Vercel deployment list | Owner | Applied |
| 2026-11-03 | Monthly run: only READY task was E-11 (UK hub) → implemented in code. Lowest-CTR page = UK hub (56 impr, 0 clicks); new title/meta proposed (E-20), not applied because the published CMS record may only change with owner approval. Houston/Melbourne/Perth excluded as noindex city pages. No CMS drafts this month (no READY content task) | Windsor GSC 28 days (US/UK/CA/AU/AE), CMS `pages` read, source | Claude (scheduled monthly run) | In PR |
| 2026-11-03 | E-07, E-08, E-10 were already done by earlier releases; marked verified instead of rewriting working pages. Hubs now link visibly to their market article (E-18). Main's broken build fixed in a separate PR #66 so it can merge before #65 | Source + CMS inspection, CI build log | Claude | Recorded |
| 2026-11-02 | Two-year automation: three recurring scheduled tasks — weekly search report (Mon 08:34 PKT, read-only), monthly SEO execution (3rd, 10:41 PKT: up to 2 READY tasks → one PR + CMS drafts only), quarterly Google-update review (5 Jan/Apr/Jul/Oct, 11:37 PKT: official sources only → docs PR). None may merge, deploy, publish, or touch GBP/DNS/analytics; the owner approves every release | Owner asked for 2 years of automatic work | Owner request; guardrails by Claude | Active |
| 2026-11-02 | USA, UK, Canada, Australia, UAE are all primary markets; UAE no longer parked | Owner's master instructions shared 2 Nov (all three list these five markets) | Owner (written) | Recorded; INSTRUCTIONS.md and citation plan updated |
| 2026-11-02 | Inside the five, work order follows evidence: AU and CA hubs first (worst positions), UK hub push (closest to page 1), then UAE | Search Console 28-day data | Claude | Proposed |
| 2026-11-02 | No new `/usa/`-style URLs; keep `/locations/{country}` hubs; no hreflang | Avoid cannibalisation; single-language site | Claude | Applied |
| 2026-11-02 | GBP: OQC is not eligible as an online-only service; no listing will be verified or optimized until an in-person office is confirmed | Google eligibility guidelines | Claude | Applied; removal pending owner |
| 2026-11-02 | `*.vercel.app` hosts get `noindex, follow` | Duplicate-host risk | Claude | In PR |
| 2026-11-01 | One blog byline "Online Quran College" for now | Owner | Owner | Active |
| 2026-11-01 | Keyword volumes from Google Keyword Planner | Owner | Owner | Active (Semrush has no units) |
| 2026-10-26 | Free trial 3 days, Weekend plan excluded; GTM owns GA4 | AGENTS.md | Owner | Active |

## Waiting for the owner
1. GBP: does any OQC office (Mansehra or London) receive customers in person during set hours? → keep one or remove all three.
2. Teacher profiles: which teachers and academic reviewer may be named, with verified qualifications and consent?
3. Subdomains `app./go./hiring./portal.`: where are they hosted, and should they be noindexed or redirected?
4. Merge this PR (preview build must pass first).
| 2026-11-03 | Owner re-indexed 3 city pages (Houston, Perth, Melbourne) that outranked their US/AU hubs while noindexed; every other city page keeps the 26–28 Oct noindex default. Content is local time-zone planning, online-only, no local address or branch claim | Windsor GSC query × page × country (28 days to 3 Nov) | Owner (in chat) | Implemented in CMS + PR |
