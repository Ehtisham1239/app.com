---
title: MCP servers for Claude Code (SEO, AEO, GEO)
type: operation
created: 2026-11-22
updated: 2026-11-22
sources:
  - code: .mcp.json
  - code: .claude/agents/oqc-seo.md
  - ext: https://developer.semrush.com/api/basics/semrush-mcp/
  - ext: https://docs.ahrefs.com/mcp/docs/claude-code
  - ext: https://windsor.ai/documentation/windsor-mcp/how-to-connect-windsor-mcp-to-any-ai-client/
verified_at: 41fbab7
---

# MCP servers for Claude Code

`.mcp.json` at the repository root registers three remote servers for anyone who opens the repo in
Claude Code: `semrush` (keywords, competitors, backlinks), `windsor` (Search Console, GA4 and 350+
sources) and `ahrefs` (AI search visibility, Brand Radar, backlinks). Each address is taken from the
vendor's own documentation (see `sources`). No keys are stored in the file; every server signs in
with the user's own account through OAuth.

## First use
1. Open the repo in Claude Code and approve the project servers when asked.
2. Run `/mcp`, pick each server and sign in. Ahrefs needs a paid plan (Lite or above).
3. The `oqc-seo` agent uses them; its rules are in `.claude/agents/oqc-seo.md`.

> ⚠️ Nothing here is pre-approved on purpose. Do not set `enableAllProjectMcpServers` in
> `.claude/settings.json`: any later pull request could then add a server that every session trusts
> without asking.

> ⚠️ `windsor` can also write (post to social, edit ads and listings). Use it for reading Search
> Console and GA4 only. Changes to listings or ads need the owner's explicit approval in chat.

> ⚠️ Add a server only from the vendor's own documentation. A look-alike address in a committed
> `.mcp.json` would send every contributor's session to a third party. Never put a key or token in the
> file; a server that needs one must read it from an environment variable.

> ⚠️ Semrush calls use the account's API units. When the quota is spent the tools return `no_api_units`
> (seen 31 Oct 2026); say so and do not invent numbers.

## Not added
Ubersuggest, OpenRush, Botify and OpenSEO are in the claude.ai connector directory, but no official
server address was found for them, so they are not in `.mcp.json`. The owner can connect them in
claude.ai connector settings (paid accounts); add them here only with the vendor's documented address.
