# OQC production deployment and SEO release gates

## Current source and release evidence

- Repository: `Ehtisham1239/app.com`
- Production source branch: `main`
- Current branch work: `feat/oqc-teacher-excellence-center`
- Framework: Next.js 16.4.3, React 19.3.0, Node >=20.9 and <25.
- The repository includes `npm run build:hostinger`; it uses webpack and caps worker threads for Hostinger shared Node.js constraints.
- Current Vercel production deployment observed during this work: READY, source commit `7e768aea78b3bc6f417dd9b3d03048b1cb6da8be`.
- GitHub `main` was at `cce4acae77019864724824cf4a611b86c84494ef` during this work. The deployed Vercel source therefore lagged the current branch.
- Canonical public host: `https://www.onlinequrancollege.com`; apex redirects to www.

## Hostinger deployment is not yet executed

Hostinger account operations are not connected in this ChatGPT session. No Hostinger website/server was selected, no backup was taken, no environment variables were read, no DNS record was changed and no production deployment was run.

Before selecting a target, connect the Hostinger MCP server at `https://mcp.hostinger.com` in ChatGPT connector settings and sign in. Then audit all Hostinger websites, plans, Node.js applications, VPS instances, databases, domains and DNS zones. If multiple viable targets exist, confirm the exact target before deployment.

## Pre-deployment gates

1. Merge the reviewed feature PR only after CI, lint, build, PGlite migration/RLS tests and protected-route checks pass.
2. Audit the selected Hostinger target and confirm Node.js support/version, build limits, storage, memory, process manager, deployment directory, database reachability and backup/restore path.
3. Create and verify a restorable backup of current application files and database before overwriting any site.
4. Inventory required environment variable NAMES and secret sources. Never copy secret values into Git, logs or chat. Confirm Supabase URL/public key, site origin, mail provider and any integrations required by the app.
5. Build with `npm ci` then `npm run build:hostinger`; inspect logs and static output before switching traffic.
6. Deploy to a temporary/staging hostname first. Test public routes, CMS login, staff permissions, Supabase reads/writes, trial/contact forms, notifications, media, currency display and redirects.
7. Confirm HTTPS/SSL on staging and canonical host handling before DNS cutover.

## DNS and email preservation gates

Before any DNS change, export/snapshot the complete current zone and compare records. Explicitly preserve all MX, SPF, DKIM, DMARC, email-routing, ownership-verification and third-party service TXT/CNAME records. Do not replace a zone with only website A/CNAME/TXT records. Do not change nameservers or delete records without a fresh owner approval after showing the exact before/after changes.

The owner preference is to manage OQC DNS records through Hostinger. The authoritative current DNS provider and exact production records must be read from the connected account; do not infer a TXT value or invent an A/AAAA/CNAME target.

## SEO launch verification

- Keep `https://www.onlinequrancollege.com` as canonical origin unless a separately approved migration plan explicitly changes it.
- Preserve all existing public paths, query behaviour, 301/308 redirects, metadata, canonical tags, hreflang, robots directives, sitemap URLs and verification files.
- Keep `/admin/*`, auth and private portal routes authenticated, `noindex` and `no-store`; never add them to sitemap or public internal links.
- Check representative homepage, course, pricing, free-trial, contact, five country hubs, blog and approved city URLs.
- Validate HTTP status, redirect chain, canonical, title/description, robots, JSON-LD, hreflang, sitemap, image responses, mobile layout, Core Web Vitals lab data and form/lead event flows.
- Keep unapproved/unsupported city pages `noindex,follow`; do not create doorway pages or unsubstantiated local-office claims.
- Confirm Google Search Console and Bing Webmaster ownership, sitemap fetch, URL inspection and analytics events using account access. A successful HTTP response is not proof of indexing.
- Use synthetic leads only in a confirmed test environment; never create test leads in production without approval.

## Cutover and rollback

Only after staging acceptance and a reviewed DNS diff: schedule the cutover, apply the approved web-record changes while preserving email/verification records, verify apex-to-www redirect and HTTPS, then smoke-test all priority routes and forms. Keep the old deployment and DNS snapshot available for rollback. Do not decommission Vercel/Cloudflare or delete old resources until the Hostinger production path is stable and the owner approves retirement.

## Status at branch preparation

- Repository audit: VERIFIED
- Existing Vercel production deployment: VERIFIED READY
- Teacher Excellence Center source: DRAFT READY on feature branch; CI/database tests still required
- Hostinger account connection and target audit: BLOCKED
- Hostinger staging build/deployment: NOT STARTED
- DNS cutover: NOT STARTED / REQUIRES APPROVAL
- GSC/Bing indexing and GA4 live receipt: requires authenticated account verification
