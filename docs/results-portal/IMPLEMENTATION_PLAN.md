# Implementation plan — Student Results & Certificate Portal

Each phase ends with a report (VERIFIED / IMPLEMENTED / TESTED / UNVERIFIED / BLOCKED / REQUIRES APPROVAL) and does not start the next phase without approval.

## Phase 0 — Read-only discovery ✅ (this delivery)
Audit, requirements, architecture, decisions, threat model, plan. No code or database change.

## Phase 1 — Decisions and design (needs owner answers D1–D15)
- Confirm grading, criteria, Client ID source, code issuing, roles, certificate policy, CSV/XLSX.
- Component-level design notes using existing admin components (`PageHeader`, `Card`, `StatusBadge`, `adm-input`) and the public site's brand tokens.

## Phase 2 — Database and security foundation (local only)
- One additive migration `2026110x000100_results_portal.sql`: tables, constraints, indexes, permissions seed, RLS via `private.apply_staff_policies`, `SECURITY DEFINER` RPCs (`results_publish_batch`, `results_correct`, `parent_sign_in`, `parent_results`, `parent_certificate`, `parent_sign_out`), grants.
- Second migration only if Client ID + Code is approved: `guardians.client_id`, `private.guardian_codes`, `private.parent_sessions`.
- PGlite tests for every table/role/RPC (anonymous denied, cross-guardian denied, drafts hidden, publish permission, revoked certificate handling, lockout).
- **Gate:** owner approves applying the migration to the live database.

## Phase 3 — Admin assessments and import
- `src/lib/results/parse-csv.js` (RFC 4180, BOM, quoted fields, caps), `validate.js` (pure, unit-tested), optional `parse-xlsx.js` (D9).
- Screens under `src/app/admin/(panel)/results/`; sidebar item with `results:read`.
- Template download (generated CSV).

## Phase 4 — Parent portal
- `src/app/api/parent-session/route.js`, `src/app/(site)/parents/**` (dynamic, no-store, noindex), result card in OQC brand, no print/download controls.

## Phase 5 — Certificates
- Link result ↔ certificate; "Create draft certificate" from a result using the existing certificates insert; parent view for issued certificates only; existing admin print stays staff-only.

## Phase 6 — Verification and hardening
- `npm test`, `npm run lint`, `npm run build`, `npm run verify:site`, new Playwright flow with synthetic data on a local build; accessibility checks (keyboard, labels, contrast) at 390/1440 px.

## Phase 7 — Release preparation
- `TEST_PLAN.md`, `DEPLOYMENT_RUNBOOK.md` (migration steps, rollback = drop new objects only; no change to existing tables except the optional `guardians.client_id`), `CHANGELOG.md`.

## Phase 8 — Production (separate written approval for each)
1. Apply migration(s) to Supabase `lgbwidraztavhhbnbfhr`.
2. Merge and deploy via Vercel Git.
3. Onboard guardians and Client IDs; issue codes.
4. First real import and publication.

## Smallest safe set of changes for a first release
CSV-only import → single total marks + approved grade bands → staff publish → Client ID + Code sign-in with lockout → read-only result card and issued-certificate view. XLSX, criteria and OTP follow only if approved.

## Effort estimate (indicative)
Phase 2: 1 session · Phase 3: 1–2 sessions · Phase 4: 1 session · Phase 5–7: 1 session. Depends on decision turnaround.
