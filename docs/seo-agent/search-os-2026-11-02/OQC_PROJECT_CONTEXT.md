# OQC project context — verified 2 Nov 2026

## Platform (observed)
| Item | Value | Evidence |
|---|---|---|
| Production repository | `Ehtisham1239/app.com`, branch `main` | GitHub API |
| Framework | Next.js 16 + Supabase CMS (`lgbwidraztavhhbnbfhr`) | `package.json`, `AGENTS.md` |
| Hosting | Vercel project `appcom-online-quran-college` (`prj_ohTvpaIwR1bWHFJWl23QiNfOoJG7`) | Vercel API |
| Live production deployment | `dpl_GSAzm6mdAoDAbD5kbVfaCgSuzwYW`, commit `709d1e9`, state READY | Vercel API |
| Domains on that project | `www.onlinequrancollege.com` (primary); apex `onlinequrancollege.com` → www (308); `appcom-online-quran-college.vercel.app` (alias) | Vercel API |
| Runtime errors, last 24 h | none | Vercel runtime errors |
| Other OQC hosts seen in Search Console | `app.`, `go.`, `hiring.`, `portal.onlinequrancollege.com`; separate property `project-umber-three-93.vercel.app` | Search Console via Windsor |

The `app./go./hiring./portal.` subdomains are **not** served by this Vercel project; their host is unknown from here (DNS is at Hostinger per earlier notes).

## Business facts published by the site (observed in CMS `settings`)
- Name: Online Quran College; founded 2019; email info@onlinequrancollege.com; phone/WhatsApp +44 7864 710821; location shown: "United Kingdom" (country only, no street address).
- Socials in Organization `sameAs`: X, Facebook, Instagram, Trustpilot.
- Free trial: 3 days, Weekend plan excluded (`AGENTS.md`).

## Access matrix
| Resource | Access this session | Notes |
|---|---|---|
| GitHub repo | Yes (push, PR) | Merge needs owner approval in this session |
| Vercel API | Yes | Could not fetch live pages through it |
| Supabase (read) | Yes | Read-only queries used |
| Google Search Console | Yes, via Windsor (`sc-domain:onlinequrancollege.com`) | 28-day data pulled |
| GA4 | Connected via Windsor (property 560748871) | Not queried this session |
| Google Business Profile | Yes, via Windsor (3 locations) | Performance metrics denied (HTTP 403) — consistent with unverified profiles |
| Semrush | **Blocked** — account has no API units | https://www.semrush.com/mcp-access |
| Live website from this workspace | **Blocked** — shell egress allowlist refuses the domain; WebFetch permission requests went unanswered | Repo SEO scripts that crawl the live site could not run |
| npm registry | **Blocked** (ENOTFOUND) | 10 test files that need luxon/sharp/esbuild could not run; GitHub CI runs them |

## Historical leads re-checked
- `claude/oqc-direct-trustpilot-2026-11-02` → merged as PR #50 earlier today; not a live branch to work from.
- "GA4/GTM not configured" → outdated: `AGENTS.md` records GTM `GTM-W7CMZS53` owning GA4 `G-57TGPTDNT4` since 26 Oct.
