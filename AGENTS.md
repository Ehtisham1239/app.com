<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Owner decisions — do not change without the owner's written approval

- **Analytics (26 Oct 2026):** no analytics banner or "Analytics preferences" button. GA4 runs cookieless with `analytics_storage: "granted"` so hits appear in GA4 reports; `ad_storage`, `ad_user_data` and `ad_personalization` stay denied and Google signals stay off. GA4 ignores `client_storage: "none"`, so `shieldAnalyticsCookies` keeps `_ga*`/`_gid`/`_gat`/`_gcl*` cookies in page memory only (nothing written to the device) and each page load sends a random `client_id`. Do not switch analytics storage to "denied" (reports go empty), do not remove the cookie shield, and do not bring back the banner. `tests/analytics.test.mjs` pins this.
- **Google Tag Manager (26 Oct 2026):** allowed and active. Container `GTM-W7CMZS53` (tech.iqratech@gmail.com GTM account "Online Quran College", published with owner approval) owns GA4: Google tag `G-57TGPTDNT4` plus page_view, generate_lead, contact_click and web-vitals GA4 events from the site's `oqc_*` dataLayer events, so the direct gtag script is not loaded — loading both double-counts. The site pushes `set` with the page `client_id` and the denied ad consent before the container loads; the cookie shield applies in both modes. `16203239528` is the GA4 web data stream ID, not a GTM ID. Inside the container add no cookie-setting or ad tags without owner approval.
- **Free trial (26 Oct 2026):** 3 days, Weekend plan excluded.
- **Brand colours (26 Oct 2026):** logo green (`#0C6C0C` / `#249C0C`), deep green `#0D4A1C`, soft gold accents.
- **Local-currency prices (29 Oct 2026):** show prices converted live into the visitor's currency. The visitor's country (Vercel `x-vercel-ip-country`, via `/api/geo`, no cookie) preselects the currency on `/pricing`; daily USD rates come from ExchangeRate-API (`src/lib/fx.js`, attributed on the page). An approved price saved in the CMS always wins. A converted figure is shown with `≈` and "approx." and the page says the coordinator confirms the fee and payment currency. If rates are unavailable, fall back to "ask for a quote" rather than guessing.

## Engineering workflow (owner instruction, 29 Oct 2026)

For any software work in this repository — new features, fixes, reviews, security, testing, migrations or releases — follow the project skill `.claude/skills/engineer-secure-software/SKILL.md` and load only the references the task needs. In particular: inspect before changing, use the smallest workflow that fits, verify with real checks, label status precisely (observed / implemented / locally verified / deployed / production verified), and never claim "100% secure" or untested readiness.
