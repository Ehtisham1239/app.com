<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Owner decisions — do not change without the owner's written approval

- **Analytics (26 Oct 2026):** no analytics banner or "Analytics preferences" button. GA4 runs cookieless: `client_storage: "none"` with `analytics_storage: "granted"` so hits appear in GA4 reports; `ad_storage`, `ad_user_data` and `ad_personalization` stay denied and Google signals stay off. Do not switch analytics storage to "denied" (reports go empty) and do not bring back the banner. `tests/analytics.test.mjs` pins this.
- **Google Tag Manager (26 Oct 2026):** allowed. When a container ID is set, GTM owns GA4 (live container `GTM-W7CMZS53` in the tech.iqratech@gmail.com GTM account "Online Quran College", published 26 Oct 2026 with owner approval, holds the cookieless Google tag `G-57TGPTDNT4` plus page_view, generate_lead, contact_click and web-vitals GA4 events from the site's `oqc_*` dataLayer events; `16203239528` is the GA4 web data stream ID, not a GTM ID), so the direct gtag script is not loaded — loading both double-counts. The site pushes `set` client_storage "none" and the denied ad consent before the container loads. Inside the container, keep the Google tag cookieless and add no cookie-setting or ad tags without owner approval.
- **Free trial (26 Oct 2026):** 3 days, Weekend plan excluded.
- **Brand colours (26 Oct 2026):** logo green (`#0C6C0C` / `#249C0C`), deep green `#0D4A1C`, soft gold accents.
