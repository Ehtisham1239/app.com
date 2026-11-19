---
id: CHK-006
type: checkpoint
date: 2026-11-19
---
# CHK-006 Screaming Frog GitHub Actions

Hub: [[000-OQC-SEO-Hub]] · decision: [[ADR-004-screaming-frog-actions]] · previous: [[CHK-005-speed-2026-11-19]]

**Implemented:** `.github/workflows/oqc-screaming-frog.yml`, `scripts/sf-crawl-summary.mjs`, `tests/sf-crawl-summary.test.mjs`.
**Locally verified:** new tests 4/4 PASS; workflow YAML parses. ESLint NOT RUN locally (no node_modules); CI lint covers it.
**Workflow run on GitHub:** see PR checks (result recorded in the PR).
**Next action:** owner adds secrets `SF_LICENCE_USERNAME`, `SF_LICENCE_KEY` (and `SF_EULA_VERSION` if the run says the EULA is not accepted), then runs "OQC Screaming Frog crawl" from the Actions tab.
