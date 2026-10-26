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

73 Node tests pass, including local database/RLS checks and CSV regression cases.
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
