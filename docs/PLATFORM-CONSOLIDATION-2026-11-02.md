# OQC single-repository platform consolidation

**Date:** 2 November 2026  
**Canonical code repository:** `Ehtisham1239/app.com`  
**Website:** `https://www.onlinequrancollege.com`  
**Target architecture:** one Next.js application, one GitHub repository, one primary Vercel production project, one existing Supabase project.

## Owner direction

Keep the OQC public website, CMS, staff portal, parent portal and ERP/operations portal source in one GitHub repository. Host the application surfaces through the existing OQC Vercel deployment rather than creating duplicate projects. Preserve already implemented and verified features; do not rebuild them. Do not modify unrelated projects or repositories.

## What is already in this repository

- Public website: `src/app/(site)/`
- CMS and staff admin: `src/app/admin/`, `src/components/admin/`, `src/lib/admin/`
- Parent entry and private parent routes: `src/app/(site)/parents/` and related session/API routes (verify exact route tree before edits)
- Results and certificates workflows: `src/app/admin/(panel)/results/`, `src/app/admin/(panel)/certificates/`, result/parent migrations and tests
- Existing CMS records, content, SEO, campaign, media, pricing, forms and admin workflows
- Existing Supabase migrations and test harness: `supabase/migrations/`, `supabase/tests/`
- Existing app target record: `content/deployment-target.json`

The repository's own release and integration records describe the CMS, parent portal, results and learning-plan workflows as implemented. These are the source of truth to preserve, subject to current code and live verification.

## Single application route map

| Surface | Route convention | Status |
|---|---|---|
| Public website | `/`, `/courses`, `/pricing`, `/free-trial`, `/blog`, etc. | Existing |
| CMS / staff workspace | `/admin` and `/admin/[resource]` | Existing |
| Parent portal | `/parents` and protected parent subroutes | Existing; verify current tree and release |
| Results / certificates | `/admin/results`, `/admin/certificates`, parent-facing issued results/certificates | Existing |
| Full ERP operations portal | Proposed routes under `/admin/operations` or existing module routes | Source integration pending; do not create duplicate blank modules |

The route map is a logical application map, not a claim that every proposed ERP module already exists.

## Hosting and data architecture

- One primary Vercel project should be connected to `Ehtisham1239/app.com` and deploy the production branch.
- All public and authenticated surfaces should be routes in that application. Preview deployments should come from the same repository/branch workflow.
- Reuse the existing Supabase project `lgbwidraztavhhbnbfhr` and its schema, Auth, RLS, Storage and migrations. Do not create a second database or copy production learner data.
- Keep server secrets in Vercel environment variables only. Never commit service-role keys, passwords, access codes, tokens or private customer data.
- Preserve current authentication, permissions, RLS, noindex/no-store headers and privacy controls.
- Use additive migrations only after review, tests and explicit production database approval. No destructive schema/data migration as part of repository consolidation.

## Vercel inventory observed in the connected account

The Vercel project listing returned these project names:
- `appcom-online-quran-college` — recorded in `content/deployment-target.json` as the website project and linked to this repository in the repository's deployment record.
- `oqc-portal` — separately listed; its project details and deployments could not be read in this session.
- Other projects were not inspected or changed.

The connected Vercel API returned 404 when resolving both listed project names/IDs and 403 when listing deployments, despite the list response. Therefore current project linkage, domain assignment, environment parity and deployment state are not independently verified in this session. Do not create a replacement Vercel project or change aliases/domains until the actual project access is resolved.

## Required ERP portal source migration

The prior standalone IQR Systems Portal source is not present in the current repository tree inspected on 2 November 2026. Existing repository results/parent portal code is present, but it is not evidence that the separate ERP portal source has been imported.

Required source inputs:
- Original portal source archive or Git repository (for example, the earlier `Portal.zip` containing `generate_portal.py`, `build_html.py`, `portal_data.json`, `IQR_Systems_Portal_v1.0.html`, and `SYSTEM_*.md` files), if that is the portal intended for consolidation.
- Any portal-specific schema/API contracts and a safe inventory of required modules.
- No passwords, service-role keys, learner exports or live access codes in the archive.

Integration workflow:
1. Inventory archive files and dependencies; identify any duplicate CMS/admin/result/parent features already implemented here.
2. Convert the portal into maintainable Next.js route groups/components under this repository; do not embed a giant standalone HTML app or create a second authentication stack.
3. Reuse current Supabase Auth, `profiles`, `app_roles`, permissions and RLS. Map legacy portal roles and workflows explicitly before migration.
4. Map portal modules to existing tables or propose additive schema changes with ownership, permissions, audit events and rollback.
5. Preserve existing business rules and data. No destructive migration or bulk production data move without separate approval.
6. Add synthetic-data unit, database/RLS and browser tests for each migrated workflow.
7. Deploy to a Vercel preview from this same repository; verify staff roles, mobile navigation, workflows and audit trail.
8. Only after parity and owner sign-off, route production users to the consolidated portal. Keep the old Vercel project intact until a documented rollback window closes.

## Skip-existing rule

For every module and deployment setting, classify it as:
- `EXISTS_AND_VERIFIED` — reuse without rebuilding.
- `EXISTS_NOT_VERIFIED` — inspect and test before touching.
- `MISSING` — implement in this repository only if in approved scope.
- `DUPLICATE` — select one canonical implementation after data/behavior comparison; do not delete until parity and rollback are proven.
- `BLOCKED_ACCESS` — document the exact missing permission; do not invent status or recreate resources.

## Current blockers and next actions

1. **Standalone ERP portal source:** not found in the inspected repository tree or retrievable files. It must be supplied or its original GitHub source identified before the actual portal can be merged.
2. **Vercel project access:** list results are visible, but project detail calls return 404 and deployment listing returns 403. Resolve the correct team/project authorization before changing Vercel configuration or deploying.
3. **Project consolidation:** do not delete, archive, transfer or disconnect `oqc-portal` until its repository, routes, domains, environment variables and production data dependencies are verified.
4. **Production verification:** no new production deployment, domain reassignment or Supabase schema change is claimed by this document.

## Completion criteria

- All website, CMS, parent/results portal and ERP portal source lives in `Ehtisham1239/app.com`.
- One primary Vercel project builds and serves all approved application routes.
- Existing custom domain and canonical URL point to the correct verified deployment.
- Existing Supabase project is reused; no duplicate production data stores.
- Auth, roles, RLS, audit history, uploads, forms and workflows pass regression tests.
- Old project is retained until successful production parity and rollback verification.
