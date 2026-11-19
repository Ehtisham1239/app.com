---
id: CHK-006
type: checkpoint
date: 2026-11-19
---
# CHK-006 Screaming Frog GitHub Actions

Hub: [[000-OQC-SEO-Hub]] · decision: [[ADR-004-screaming-frog-actions]] · previous: [[CHK-005-speed-2026-11-19]]

**Implemented:** free crawler `scripts/site-crawl.mjs` + `.github/workflows/oqc-site-crawl.yml` + `tests/site-crawl.test.mjs` (local HTTP server fixture); summary `scripts/sf-crawl-summary.mjs`; optional paid `.github/workflows/oqc-screaming-frog.yml` (manual only).
**Bug found by test and fixed:** relative `Sitemap:` line in robots.txt was not resolved, so sitemap-only pages were never crawled.
**Locally verified:** crawler + summary tests 7/7 PASS; workflow YAML parses. ESLint NOT RUN locally (no node_modules); CI lint covers it.
**Workflow run on GitHub:** see PR checks (result recorded in the PR).
**Next action:** merge the PR, run "OQC site crawl" from the Actions tab and read the job summary. Screaming Frog secrets are only needed if the owner later wants the paid run.
