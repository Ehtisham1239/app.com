# Online Quran College -- documentation

Marketing site, CMS and lead handling for onlinequrancollege.com (Next.js, Supabase, Hostinger).

This directory is a wiki maintained by an LLM: linked markdown pages, nothing outside the
repository. The rules are in [`CLAUDE.md`](CLAUDE.md).

## Start here

1. [[lead-sync]] -- how leads reach HighLevel and admissions (more pages are added as work touches new areas)

---

## concepts

<!-- TODO: pages under Domain and product concepts. Mostly survive code changes. `- [[page-name]] -- one line` -->

## architecture

<!-- TODO: pages under System structure, data model, main flows. `- [[page-name]] -- one line` -->

## subsystems

- [[lead-sync]] -- durable outbox delivering leads to HighLevel and admissions email
- [[assistant-facts]] -- /llms-full.txt facts file that trains the Hatchium chatbot

## decisions

- [[ai-admissions-audit-and-plan]] -- audit of the chatbot, courses and booking, and the phased plan for an AI admissions assistant

## reference

<!-- TODO: pages under Schemas, APIs, env vars -- documents you look values up in. `- [[page-name]] -- one line` -->

## operations

- [[mcp-servers]] -- free project MCP server (Chrome DevTools) for the SEO agent, and why paid ones are left out
- [[meta-description-audit]] -- Bing title/description length audit and where each kind of description is fixed

## history

<!-- TODO: pages under Development history, lessons, migrated records. `- [[page-name]] -- one line` -->

---

## Using this wiki

```
/docs-sync     right after a deploy or release -- reads only what changed since verified_at
/docs-lint     integrity check (orphans, broken links, broken sources, stale, unverified)
/docs-query    ask the docs. If it is not there, the answer says so
/docs-status   commits not yet reflected, stale pages, recent work
```

Every page carries `verified_at`, the commit it was checked against. Change code, run
`/docs-sync`.
