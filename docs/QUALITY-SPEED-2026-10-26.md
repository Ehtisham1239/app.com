# Website quality and loading release — 26 October 2026

Target: `https://appcom-online-quran-college.vercel.app` in project
`prj_ohTvpaIwR1bWHFJWl23QiNfOoJG7`, repository `Ehtisham1239/app.com`.
Pre-release rollback: `dpl_FdoJHyqiFjxgUwCEmed4kPcJvmSc` (source `4617615`).

## Evidence and implementation

- Google's baseline PageSpeed report: mobile performance 88, FCP 2.3s, LCP
  3.5s, TBT 30ms, CLS 0; desktop performance 100, FCP 0.5s, LCP 0.7s,
  TBT 10ms, CLS 0. Accessibility, best practices and SEO are 100 on both.
  Report: https://pagespeed.web.dev/analysis/https-appcom-online-quran-college-vercel-app/jqcgcfql23?form_factor=mobile
  These are Lighthouse lab samples, not field Core Web Vitals. CrUX has no data.
- Moved CMS styles/utilities into the admin layout and limited public Tailwind
  scanning to actual website sources. Public pages no longer carry admin-only
  utility rules. Existing branding, spacing and content are preserved.
- Subset display Arabic fonts with the original OpenType shaping and mark
  positioning. Regular face falls from 108,560 to 32,940 bytes. Original full
  Amiri remains the fallback for other CMS characters. OFL licence is included;
  regeneration script requires optional fonttools[woff], not production Python.
- Three current CMS PNGs are 1,847,909 / 1,944,357 / 1,944,314 bytes. Preserved
  originals, created 400/800/1200px AVIF/WebP versions with their actual 16:9
  dimensions, and pinned public-source SHA256 values. Mobile AVIFs are
  7,644 / 8,212 / 8,454 bytes. Known covers serve immutable local assets;
  future unregistered CMS uploads still use the existing Next image optimizer.
- Navigation uses Next's link pending status for slow transitions, without
  replacing the complete initial server HTML. Forms have a 20-second browser
  request timeout, contact-submit guard, required-field semantics and focused
  trial-success confirmation. No real enquiry was submitted during QA.
- Public content loaders now throw on backend outages so ISR preserves its last
  successful page. A timeout can no longer become a cached empty listing or
  false 404. Successful missing/unpublished records remain authoritative; the
  bootstrap seed fallback is limited to an uninstalled schema.
- CMS loading ignores stale or unmounted requests, preserves true null results,
  hides the previous record while selecting another, and updates refs after
  commit. Internal-note drafts survive automatic read-status refreshes. Report
  date presets use Pakistan time consistently.
- Staff CSV exports quote/escape every cell and neutralize text formulas,
  whitespace prefixes and full-width operators. Actual numbers stay numeric.
  Spreadsheet-view exports use a quoted tab prefix; programmatic consumers
  will see that prefix as part of the value. No universal sanitizer guarantees
  safety in every spreadsheet application's repeated import/export workflow.
- Updated audit allowlist/release target, bounded browser QA timeouts and the
  analytics smoke test. The smoke now checks the owner's current GTM-owned GA4
  configuration, denied ad signals, client_storage none and one loader per
  session. It stubs vendors and does not establish a real GA4 reporting receipt.

## Validation

76 Node tests cover local database/RLS, CSV regression and content-outage cases.
An isolated real React/Chromium fixture passes five asynchronous CMS cases:
Strict Mode startup, out-of-order replies, empty results, retry and unmount.
48 Chromium viewport cases at 320/390/768/1440px pass with zero browser errors,
zero horizontal overflow, decoded images and no writes. Mobile/desktop blog
filtering, pagination, contents, reader actions and print checks pass. All 202
sitemap pages pass technical and page-quality checks; 194 top images respond.
Final release source, deployed status and post-release PageSpeed measurements
are recorded after the release. Evidence is in ignored `artifacts/quality-20261026`.

Production dependency audit reports zero known vulnerabilities. ESLint has no
errors and 13 existing effect-synchronization advisories. Supabase security
advisors identify intentional public submission/certificate RPCs and guarded
staff functions as SECURITY DEFINER callables, one private deny-all bootstrap
table, and disabled leaked-password protection. These are not represented as a
zero-warning security audit. No authentication policy or database grant was
weakened or changed by this release.

## External dependencies

Both custom hostnames are added to this project but remain ownership-unverified
at the external DNS provider. The Vercel canonical origin stays active until
ownership, routing and HTTPS can be verified. GitHub automatic deployment is not
connected; a source commit/push alone is not a release. Runtime-log inspection
returned 403; real server-error scans, authenticated staff journeys, actual
enquiry delivery, GA4 receipts, GSC indexing/rankings and field CWV are unverified.
Speed Insights' production script responds HTTP 200. Local QA stubs that
Vercel-only script and Google/chat scripts; no third-party QA events are sent.

## Verified first production release

Source `b8c0c54d38cd63b8a33de68df02fa294fef5d25b` reached production READY as
`dpl_5QMkrYBSC6nb9sDK3uKcmMuDxJSL`; the stable alias and Git metadata agree.
The live audit passes 202/202 sitemap pages, zero technical/quality/topic
failures, and 194 top-image responses. Cloud browser verifies the actual home
page, trial navigation, invalid-submission blocking and first-error focus.

At 21:12 PKT Google's mobile report scores 98 performance / 100 accessibility /
100 best practices / 100 SEO, with FCP 0.964s, LCP 2.326s, TBT 6ms and CLS 0.002.
Render-blocking estimated savings are 90ms, versus 1,130ms in the initial lab
sample. Desktop scores 99 / 100 / 100 / 100, FCP 0.321s, LCP 0.671s, TBT 81ms
and CLS 0.001. These are individual lab samples; they are not timing guarantees
or field p75 measurements.
Report: https://pagespeed.web.dev/analysis/https-appcom-online-quran-college-vercel-app/j93ihk7b75?form_factor=mobile

## Navigation and staff-security follow-up

Navigation lists now defer prefetch until pointer hover or keyboard focus,
using Next's documented Link behavior. Primary hero links retain their existing
prefetching. Pending navigation feedback remains accessible and does not shift
layout.

Staff/auth responses get a fresh 128-bit nonce, strict-dynamic script policy,
no unsafe-inline/eval script allowance in production, denied framing, and
private/no-store caching. Staff pages render per request so Next can nonce its
framework scripts. Public pages keep static/ISR rendering. Session-refresh
cookies are preserved on redirects as well as ordinary responses.

80 Node tests pass. A fresh isolated production build passes asset integrity;
48 public viewport cases and mobile/desktop blog journeys pass. The staff
browser test verifies distinct response nonces, actual nonced framework scripts,
mobile login hydration, anonymous redirects and blocking of a nonce-less script
injected into parser-delivered HTML. No account was signed into and no form was
submitted. Authenticated staff editor/report journeys remain unverified.

Global `require-trusted-types-for 'script'` was tested as a candidate response
header only in a local browser profile. It blocked the legitimate
`/_vercel/speed-insights/script.js` TrustedScriptURL sink and the mobile menu
disappeared (`compatible:false`). That breaking header was not deployed. No
unchecked pass-through Trusted Types policy was added to hide the incompatibility;
public HTML sanitization remains in place. A complete global Trusted Types
migration is not claimed by this release.

## Final production measurements and CSP boundary

Source `ab2d27496d0bf572c764933ccb278a6daad1306e` reached production READY as
`dpl_3bM629J15Bmx3zV3dm6PRmw7mL9Q`. At 21:44 PKT the latest Google lab run
scores mobile 95 / 100 / 100 / 100 (performance/accessibility/best practices/SEO)
and desktop 100 / 100 / 100 / 100. Mobile FCP 1.676s, LCP 2.701s, TBT 52ms,
CLS 0 and Speed Index 1.867s; desktop FCP 0.321s, LCP 0.654s, TBT 30ms,
CLS 0.001 and Speed Index 0.544s. The previous sample remains recorded above:
98 mobile is not substituted for the latest score. Lab variability and CrUX
No Data preclude a timing guarantee. Remaining mobile diagnostics include a
15.6 KiB CSS request, 50 KiB estimated unused JS, 14 KiB legacy JS and one long
task. Zero blocking/all-100 mobile/1ms loading are not claimed.
Report: https://pagespeed.web.dev/analysis/https-appcom-online-quran-college-vercel-app/i4we3hxt9v?form_factor=mobile

Cloud browser verified the production homepage and anonymous Portal redirect to
the working sign-in form. The supplementary remote scripted security run did not
finish before the execution environment became unavailable, so the successful
local security smoke is not represented as a successful live injection test.

Source inspection confirms header/mobile/footer Portal links already use native
anchors. The login's return-to-website link now also uses a native anchor, so
returning to public pages obtains a new document and the public response CSP.
This avoids retaining the staff-only document policy across Next client routing.
The final anchor-only follow-up requires a fresh remote production build; no
additional local browser run was possible after the environment disconnected.
