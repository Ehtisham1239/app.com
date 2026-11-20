---
id: CHK-007
type: checkpoint
date: 2026-11-19
---
# CHK-007 Crawl pipeline, link fixes and speed review

Hub: [[000-OQC-SEO-Hub]] · previous: [[CHK-006-screaming-frog-2026-11-19]] · [[CHK-005-speed-2026-11-19]]

**Observed (live crawl of www.onlinequrancollege.com, main 2b269f3, free crawler):** 468 URLs, 4xx 0, 5xx 0, redirect links 0, duplicate titles 0, missing title/meta/H1 0. `/admin` and `/parents` are blocked by robots.txt on purpose. The bare domain answers 308 to `www`, so crawl the `www` origin.
**Implemented, production verified:** crawler retries 429/503 with backoff (#358); Melbourne and Brisbane CMS link fixes (live).
**Observed (speed):** images are AVIF/WebP in `<picture>` with 400/800/1200 srcset, lazy except the LCP image, 1-year immutable cache. Hostinger CDN (hcdn) is on, HTTP/3 on, origin 8-250 ms. Server cache setting is off and was left off: `/api/geo` varies per visitor.
**BLOCKED:** (1) UPDATE 20 Nov: Cloudflare Worker `app-com` deleted (account has 0 workers, observed). The GitHub "Cloudflare Workers and Pages" app is still installed: its Uninstall needs a browser confirm box that tools cannot click; owner clicks Uninstall then OK at github.com/settings/installations/179280096. (2) Remove GA4 `G-EMHY1G2CKB` from `GTM-W7CMZS53`: needs the owner's Google sign-in.

**Next action:** owner disconnects and deletes `app-com` in the Cloudflare dashboard (Workers & Pages, Settings, Builds) and uninstalls the GitHub app; then drop the Cloudflare line from `.claude/agents/oqc-engineer.md` and confirm the PR check is gone.
