# Loading and pending accessibility release — 28 October 2026

Target: `https://www.onlinequrancollege.com`, Vercel project
`prj_ohTvpaIwR1bWHFJWl23QiNfOoJG7`, repository `Ehtisham1239/app.com`.
Previous production: source `28a2e64bf8a587ddbbed69519f8a7ed0bb55c444`,
deployment `dpl_5PrY4r83ZHeo3XYteZ9wmMqAajHq`.

## Supplied report analysis

The reattached `PageSpeed Insights mobile(1).pdf` and
`PageSpeed Insights desktop(1).pdf` are byte-identical to the earlier PDFs.
Their report is from 27 October 2026 at 11:49 PKT, before the 28 October release.
Mobile: performance 98, accessibility/best practices/SEO 100; FCP 1.2 s,
LCP 2.4 s, TBT 0 ms, CLS 0.002, Speed Index 1.4 s. Desktop: all four scores
100; FCP 0.3 s, LCP 0.6 s, TBT 10 ms, CLS 0.001, Speed Index 0.6 s.
Report: https://pagespeed.web.dev/analysis/https-www-onlinequrancollege-com/x9ybzk2yq3?form_factor=mobile

The reports identify a 15.6 KiB blocking stylesheet, fonts discovered after
CSS, 14 KiB of legacy-JS candidates in the framework, unused framework code,
one mobile long task, logo sizing and minor font-related shifts. The previous
production release already addressed the responsive logo and application
layout-read loop. A 100 score does not mean every unscored diagnostic passes,
and 0 ms is the lower bound of TBT. These lab samples cannot establish field
Core Web Vitals or a permanent timing guarantee.

## Implemented and reviewed

- Subset Inter and Outfit for common English text while retaining variable
  axes, shaping and default glyph advances. Files fall from 48,256 to 31,708
  bytes and 32,292 to 24,212 bytes: 24,628 fewer font bytes. Original Latin and
  extended fonts remain on-demand fallbacks. The font browser test confirms
  only the common faces download initially, then full originals load for rare
  Latin glyphs. Modified family names and original OFL attribution are included.
  Reproduction: optional `python scripts/subset-latin-fonts.py` with fonttools
  and Brotli; production uses the committed generated files.
- Hero, announcement/breadcrumb and homepage editorial links now use the
  existing intent-prefetch navigation component. They wait for hover/keyboard
  focus instead of preloading country planners or forms during initial paint.
  Four country prefetch chains and the roughly 22 KiB planner chunk present
  in the earlier desktop run are absent in the accepted idle run. Keyboard
  focus still prefetches the trial, and clicking it reaches the form.
- Address the functional scope of pending PR #4: at least 12px College/course
  labels, visible wrapping mobile announcement, and a visible English meaning
  and reference for the Arabic verse. Arabic text remains in its Arabic
  language context; the English aria-label proposed in the old PR was omitted
  so it does not replace the verse for a screen reader. English wording was
  checked against https://legacy.quran.com/96/1 (Sahih International).
- All original hero/logo image assets remain byte-identical. The existing
  hero-source snapshot was deliberately updated for the visible meaning and
  navigation import; it continues to protect the approved source and artwork.
- Analytics, denied ad signals, cookie shield, banner decision, free-trial
  eligibility and database configuration remain unchanged.

## Verification

- Production build passes: 208 HTML files, 20 unique static assets and no
  missing asset references.
- 82 Node tests pass; ESLint has zero errors and 13 existing warnings.
- 48 local public viewport cases at 320/390/768/1440px, blog/analytics journeys
  and all 202 sitemap URL checks pass, with zero browser errors or form writes.
- Font/fallback/readability and focus-prefetch/trial-navigation checks pass at
  320/390/1440px. Arabic shaping and mobile/desktop screenshots were reviewed.
- Accepted Lighthouse 13.6 local sample: mobile 97/100/100/100, FCP 928 ms,
  LCP 2,673 ms, TBT 62 ms, CLS 0.0054; desktop 100/100/100/100, FCP 257 ms,
  LCP 716 ms, TBT 0 ms, CLS 0.0169. This is seed content with vendor scripts
  blocked, not a new Google/live score. No zero-mobile-blocking result or
  statistically proven TBT improvement is claimed. Font bytes and eliminated
  idle country requests are directly verified improvements.

Outputs are under ignored `artifacts/loading-followup-20261028/` in the
isolated validation checkout. Source release and live checks are recorded
after deployment. The earlier live-site technical audit found no broken
published route: all 202 sitemap pages returned 200; apex redirects to www.

## Limits and remaining dependencies

Google PageSpeed blocked this cloud browser with an unusual-traffic CAPTCHA
during the preceding release check. No workaround or fresh Google score is
claimed. Current live verification uses direct HTTP and browser checks.

Strict public CSP/Trusted Types migration is still not complete. Its previous
enforcement test broke legitimate framework/Speed Insights behavior; this
release does not add an unchecked policy or suppress that diagnostic. Existing
staff nonce CSP, public inline-handler blocking and HTML sanitization remain.

The external authoritative DNS zone is not accessible through the project
connection. The verified/working domains still report an IP recommendation;
no DNS record change is claimed. A particular reported 404 still needs its
exact URL to reproduce. Authenticated staff/SMTP/GA4 receipt/GSC/Semrush and
external DNS changes are not implied by these public-site checks.

## Verified production release

PR #6 was merged as `36187436fd3f3ac68c8b3c6cf6c17f854f336ffb` and deployed
READY as `dpl_DefE8AaqefyHSazecjguRUb2Rh8h` on 28 October 2026. The custom
www hostname resolves through the deployment API to that exact source and
alias. HTTP checks for six public routes/assets plus both new font files pass;
the live font files have the expected 31,708/24,212 byte sizes. The homepage
contains the English meaning, new font preload and existing inline-handler CSP.

Live browser font/fallback/readability/overflow/focus-prefetch/trial-navigation
checks pass at 320, 390 and 1440px with zero browser errors and zero form writes.
Cloud-browser inspection also confirms the rendered English meaning and
current homepage. PR #4 is closed as superseded by this deployed implementation.
These live functional checks do not turn the local Lighthouse samples above
into live scores. Google retesting remains unavailable in this blocked browser.

The release's preceding deployment is retained as the rollback target. This
recording update changes documentation only, not the released application code.
