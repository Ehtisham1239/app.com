---
title: MCP servers for Claude Code (SEO, AEO, GEO)
type: operation
created: 2026-11-22
updated: 2026-11-22
sources:
  - code: .mcp.json
  - code: .claude/agents/oqc-seo.md
  - ext: https://developer.chrome.com/docs/devtools/agents/get-started
  - ext: https://github.com/ChromeDevTools/chrome-devtools-mcp
verified_at: b27a322
---

# MCP servers for Claude Code

Owner rule (22 Nov 2026): only free tools. `.mcp.json` at the repository root registers one server,
`chrome-devtools` (Google's Chrome DevTools MCP, Apache-2.0). It opens a headless Chrome to record
performance traces and run Lighthouse checks on a live page, which covers Core Web Vitals and the
rendered HTML that search engines and AI crawlers see. It needs Node 20.19+ and Chrome; the server
runs locally and costs nothing.

## First use
1. Open the repo in Claude Code and approve the project server when asked.
2. Ask the `oqc-seo` agent for a performance check, for example "check the performance of
   https://www.onlinequrancollege.com/locations/australia".

> ⚠️ The server runs through `npx`, so it downloads and executes code. The version is pinned
> (`chrome-devtools-mcp@1.13.0`); raise it only on purpose after reading the release notes. Never switch
> it to `@latest`.

> ⚠️ Google collects usage statistics from this server by default. `--no-usage-statistics` and
> `CHROME_DEVTOOLS_MCP_NO_UPDATE_CHECKS=1` switch that off; keep both. Point it only at public pages:
> never at `/admin`, `/parents` or a signed-in session that shows student or results data.

> ⚠️ Nothing here is pre-approved on purpose. Do not set `enableAllProjectMcpServers` in
> `.claude/settings.json`: any later pull request could then add a server that every session trusts
> without asking. Add a server only from the vendor's own documentation, and never put a key in the file.

## Data sources outside the repo
Search Console and GA4 are read through the Windsor connector the owner connected in claude.ai, and
Semrush through its claude.ai connector. Neither is in `.mcp.json`:
- Semrush is paid, and its API units ran out on 31 Oct 2026 (`no_api_units`).
- Windsor has a free tier, but sources disagree on whether it includes MCP access (checked 22 Nov 2026,
  third-party pages only), so it is unconfirmed. It can also write (ads, posts, listings): use it to
  read Search Console and GA4 only.

## Not added (paid or no official address)
Ahrefs (paid plan from Lite), Ubersuggest, Botify, OpenSEO and OpenRush. Add one only if the owner
chooses to pay and the vendor documents a server address.
