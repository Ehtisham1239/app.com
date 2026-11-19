---
id: ADR-004
type: decision
date: 2026-11-19
---
# ADR-004 Screaming Frog crawl runs in GitHub Actions

Hub: [[000-OQC-SEO-Hub]]

**Decision (owner request in chat, 19 Nov 2026):** run Screaming Frog SEO Spider headless from `.github/workflows/oqc-screaming-frog.yml` (weekly Monday 02:23 UTC + manual + a smoke run on PRs that touch the workflow). Read-only against the live site; output is a job summary plus the `screaming-frog-crawl` artifact (CSVs + `.seospider`, 90 days). The scheduled run fails only on 5xx.
**Why not commit reports to main:** a push to main triggers deploys and the quality gates; artifacts keep crawl data out of the site history.
**Observed (vendor docs):** CLI flags `--crawl --headless --save-crawl --output-folder --export-tabs --overwrite --export-format`; licence in `~/.ScreamingFrogSEOSpider/licence.txt` (username line 1, key line 2); EULA via `eula.accepted=<n>` in `spider.config`; `.deb` and `.sha256` at download.screamingfrog.co.uk (25.1 released 4 Nov 2026).
**Assumption:** EULA number 15 is accepted by 25.1 (docs say it may need raising); override with repo variable `SF_EULA_VERSION`.
**Observed (PR #353 run 44537834545):** install with checksum PASS; EULA 15 accepted by 25.1; headless CLI exits "Could not locate licence file" without a licence, so the free version cannot run it. Secrets `SF_LICENCE_USERNAME` / `SF_LICENCE_KEY` are required; PR runs skip the crawl without them, scheduled/manual runs fail with a clear error.
