# Performance and security follow-up — 28 October 2026

Repository: `Ehtisham1239/app.com`. Target: the existing
`appcom-online-quran-college` Vercel project, team
`team_8Xig9mSvNd3XLAzNbQgwPapo`, project
`prj_ohTvpaIwR1bWHFJWl23QiNfOoJG7`.
Source base: `63b14e07963a9b49d41bc4afdd4f04bf82e6e032`.

## Independently observed live baseline

The owner then supplied 27 October PDFs for the custom domain
`https://www.onlinequrancollege.com/`: mobile 98/100/100/100 (FCP 1.2 s,
LCP 2.4 s, TBT 0 ms); desktop 100/100/100/100 (FCP 0.3 s, LCP 0.6 s,
TBT 10 ms). A fresh 28 October 08:10 PKT test of **that custom domain** shows
mobile 96/100/100/100 (FCP 1.4 s, LCP 2.6 s, TBT 100 ms), desktop
100/100/100/100 (FCP 0.3 s, LCP 0.7 s, TBT 50 ms):
https://pagespeed.web.dev/analysis/https-www-onlinequrancollege-com/riaiu6u2z6?form_factor=mobile

The custom domain responds HTTP 200 from Vercel, declares its own canonical,
and shares the Vercel alias's current public CSS/JS chunk names. This updates
the older note about pending domain routing; authenticated project ownership
and deployed commit verification remain blocked. Do not present the alias's
scores below as the custom domain's scores.

Google PageSpeed report created 28 October 2026 at 08:03 PKT:
https://pagespeed.web.dev/analysis/https-appcom-online-quran-college-vercel-app/ufq4cukgkw?form_factor=mobile

| Metric | Mobile, Slow 4G | Desktop |
| --- | --- | --- |
| Performance | 99 | 100 |
| Accessibility | 100 | 100 |
| Best Practices | 100 | 100 |
| SEO | 100 | 100 |
| FCP | 0.9 s | 0.3 s |
| LCP | 2.2 s | 0.6 s |
| TBT | 0 ms | 30 ms |
| CLS | 0.001 | 0.001 |
| Speed Index | 1.5 s | 0.5 s |

These are single Lighthouse 13.5 lab samples of the existing live version,
**before this follow-up is deployed**. No CrUX field data is available.
Mobile render-blocking estimate: 110 ms; unused-JS estimate: 29 KiB.
Desktop's image-delivery warning identifies the 176px header mark rendered at
56px; the same URL is listed twice, so summed estimated savings are not a
reliable count of unique transferred bytes. Forced-reflow attribution includes
application and framework/unattributed work.

## Implemented in this branch

- `home-motion.jsx`: use IntersectionObserver's asynchronous layout snapshots
  rather than calling getBoundingClientRect for every candidate after style
  writes. Preserve the first-screen exclusion, one-time reveals and live
  reduced-motion preference changes.
- `header.jsx` and versioned `mark-v2-*` PNG assets: serve 64/128/176px marks
  according to rendered size and pixel density. The original remains intact.
  64px asset: 1,231 bytes; 128px: 3,329; 176px: 4,495, versus 5,732 for the
  original. PNG was smaller than a candidate WebP for this palette-based logo.
- Only mount mobile and desktop course dropdown contents when opened. Initial
  homepage elements fall from 750 to 687; menu keyboard dismissal/focus return
  are covered by the browser smoke test. Original hero artwork/component and
  all Arabic wording are preserved.
- `next.config.mjs`: enforced `script-src-attr 'none'` blocks injected HTML
  event handlers on public responses. This does not claim to be a complete
  strict public script CSP. Existing per-request staff nonces remain unchanged.
- Added a pinned Lighthouse development tool and `npm run audit:performance`.
  It runs fresh Chrome profiles for mobile and desktop, writes JSON/HTML and
  summary output, and labels local runs as seed-content/vendor-blocked tests.
  Requires Node >=22.19 and installed Chromium; `CHROMIUM_PATH` can select the
  executable. Production runtime behavior and its Node requirement are unchanged.
- Added `node scripts/run-site-quality.mjs --performance-check`: real-browser
  checks for pixel-density-aware logo selection, blocked injected event handlers,
  working React menu controls, scrolling reveals and reduced-motion cleanup.

No analytics/banner, GTM, business copy, free-trial eligibility, database or
custom-domain decisions were changed.

## Verification

- Production build passed: 208 prerendered HTML files; zero missing asset references.
- All 82 existing Node tests passed.
- ESLint: zero errors; 13 existing effect-synchronization warnings.
- 48 public viewport/route cases passed at 320/390/768/1440px: zero browser errors,
  zero horizontal overflow, zero form writes. Blog and analytics installation
  journeys and the technical sitemap audit passed with vendor QA stubs.
- New performance/security browser checks passed at 390px/DPR3 and 1440px/DPR1:
  correct logo variants, actual CSP violation for an injected onclick handler,
  functional menu, scrolling reveal and reduced-motion cleanup.
- Local Lighthouse 13.6 after changes: mobile 97/100/100/100, desktop
  100/100/100/100. Final isolated accepted-code run: mobile FCP 916 ms,
  LCP 2,649 ms, TBT 26 ms; desktop FCP 249 ms, LCP 651 ms, TBT 0 ms.
  Both runs report no attributed forced-reflow
  entries. These local seed-content results are not comparable to Google's
  live report or proof that all layout work has disappeared. The first local
  desktop-labelled baseline accidentally used mobile settings and is discarded.

Detailed reproducible outputs are under ignored
`artifacts/performance-20261028/`; no credentials, enquiries or account data
were generated or included.

Two additional candidates were rejected after measurement: global inline CSS
increased compressed homepage HTML from 27,217 to 72,383 bytes and a local
mobile trial scored 89; a homepage-only Arabic font caused both the original
and the extra font to download elsewhere on the same page. Neither candidate
is included. The isolated accepted-code results above are recorded in
`artifacts/performance-20261028/accepted/`; concurrent QA runs are not used
for a before/after claim. Mobile render-blocking estimate in this local run
is 20 ms, not zero. Neither the live nor local evidence establishes 100/0 ms
on both devices. Do not claim this request is fully achieved.

## Release blocker and remaining work

**Not deployed by this follow-up.** Vercel lists the project but project/detail
reads return 404 and a preview deployment attempt returns 403: the current
connection has no permission to create a Preview Deployment for this project.
The CLI fallback has no existing credentials; no login was completed. Automatic
Git deployment is not established by these checks. A source commit or PR must
not be described as a live release.

The live CSP/Trusted Types advisories remain. The earlier release documented
that blindly enforcing Trusted Types breaks Speed Insights and the mobile
menu. This branch neither installs an unchecked pass-through policy nor claims
that warning resolved. Completing strict public CSP/Trusted Types requires a
tested migration of framework and third-party script sinks. Public ISR/CDN
caching must be preserved or a measured rendering tradeoff explicitly reviewed.

Once deployment access is available: create a preview of this exact commit,
verify it against production settings and real integrations, release to the
existing project, then repeat live mobile/desktop PageSpeed and the browser
checks. Revert this branch's commit to roll back these source changes; do not
revert the unrelated prior analytics or business changes.

A 1 ms full-page load and fixed Lighthouse scores cannot be promised across
Slow 4G, devices and server/network conditions. The actionable goal is low
first paint/LCP and minimal blocking without breaking the application.
