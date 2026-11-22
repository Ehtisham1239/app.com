# OQC SEO + AEO/GEO + DevOps — Free-first implementation

## Safety
- This feature branch is a proposal. Do not merge or deploy without human approval.
- Existing SEO scripts are reused. No production credentials, CMS changes, database writes, or backlinks.
- Workflow uses read-only GitHub permissions, GET-based public audit, and uploads artifacts.
- The scheduled workflow becomes active only after an approved merge to the default branch.
- Audit may fail due to remote rate limits; do not bypass access controls.
- Pin third-party GitHub Actions to reviewed commit SHAs before merge.

## Existing baseline
- `npm run seo:agent`: technical + quality + keyword coverage + URL inventory.
- `npm run seo:keywords`, `npm run seo:keyword-map`, `npm run seo:search-engines`.
- `npm test`, `npm run lint`, `npm run build`, `npm run test:browser`.
- Actual GSC/GA4 and field Core Web Vitals require authenticated APIs and verification.

## Free-first connector matrix
| Integration | Mechanism | Scope | Status |
|---|---|---|---|
| GitHub | GitHub MCP | Repo read, branch and draft PR after review | Manual connection |
| Playwright | Playwright MCP | Browser checks on preview | Manual connection |
| Filesystem | Restricted MCP | Project directory only | Manual connection |
| Google Search Console | Search Analytics + URL Inspection API | Read-only property-scoped OAuth | Planned |
| GA4 | Analytics Data API | Read-only reporting | Planned |
| PageSpeed Insights | REST API | Mobile/desktop lab diagnostics | Planned |
| Chrome UX Report | CrUX API | Field CWV when data exists | Planned |
| Bing Webmaster Tools | API | Search/index diagnostics | Planned |
| Vercel | API/MCP | Preview status/logs, no production changes | Planned |
| Supabase | MCP/API | Read-only analytics, never service-role in agent | Planned |
| Looker Studio | UI | Reporting | Planned |
| n8n | Self-hosted | Optional scheduled workflows | Planned |
| Screaming Frog | Free desktop app | Up to 500 URLs per crawl | Optional |
| Lighthouse | Existing package | Lab performance | Existing |

## Market rules
Five priority acquisition markets: UK, USA, Canada, Australia, UAE.
Pakistan stays in sitewide reporting; exclude it from the targeted acquisition campaign.

## AEO/GEO rules
Use visible, verifiable facts, clear answers, internal links, appropriate schema, and original helpful content.
No guarantee of AI citations, rankings, 100/100 Lighthouse, or indexing. No bulk spam backlinks/citations.

## Release gates
1. Review existing GitHub workflows and audit output.
2. Verify target domain, crawl permissions, runtime, artifacts, and rate-limit behavior.
3. Run lint, unit tests, build, and browser checks.
4. Confirm secrets are absent from artifacts and logs.
5. Human review of draft PR, then merge separately if approved.
6. Monitor production and retain rollback instructions.

## Local setup
```bash
git clone https://github.com/Ehtisham1239/app.com.git
cd app.com
npm ci
npm run seo:agent
```
See official Claude Code MCP documentation for installing and connecting MCP servers. Never commit tokens or OAuth credentials.
