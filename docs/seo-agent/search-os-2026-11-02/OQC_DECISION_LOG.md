# Decision log

| Date | Decision | Basis | Made by | Status |
|---|---|---|---|---|
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
