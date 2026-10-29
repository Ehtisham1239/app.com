# Student Results & Certificate Portal — Phase 0 project audit

Date: 29 October 2026. Read-only. No code, database or production setting was changed for this audit.

Labels: **VERIFIED** (direct evidence), **UNVERIFIED** (not confirmed), **REQUIRES APPROVAL** (owner decision).

## 1. Repository identity and state

| Item | Evidence | Label |
|---|---|---|
| Repository | `git remote get-url origin` → `https://github.com/Ehtisham1239/app.com` | VERIFIED |
| Working branch | `claude/wizardly-noether-ott39z`, reset to `origin/main` (`f9e9f91`); working tree clean before the audit | VERIFIED |
| Production | Vercel project `appcom-online-quran-college` deploys `main` from Git (deployment `dpl_GpaDGcm3go38LvduC1BqGbF4QFwq`, READY, source `f9e9f91`) | VERIFIED |
| Live database | Supabase project `lgbwidraztavhhbnbfhr`; `list_migrations` returns the same 29 migrations as `supabase/migrations/` (20261013000100 … 20261024000100) | VERIFIED |

## 2. Stack (installed versions from `node_modules/*/package.json`)

| Package | Version |
|---|---|
| next | 16.4.3 |
| react / react-dom | 19.3.0 |
| @supabase/supabase-js | 2.117.3 |
| @supabase/ssr | 0.12.7 |
| sanitize-html | 2.18.1 |
| @electric-sql/pglite (dev) | 0.5.11 |
| playwright (dev) | 1.64.1 |

JavaScript ES modules; npm with `package-lock.json`. No TypeScript, no CSV/XLSX parsing library (VERIFIED: `package.json`).

## 3. Application structure

- Public site: `src/app/(site)/…`; CMS: `src/app/admin/(panel)/…` with a generic resource editor (`src/app/admin/(panel)/[resource]`, `src/lib/admin/resources.js`, `src/components/admin/resource-form.jsx`).
- Admin navigation: `src/components/admin/shell.jsx` (items gated by permission strings, e.g. `{ href: "/admin/certificates", perm: "certificates:read" }`).
- Admin data access: browser Supabase client with the staff session (`src/lib/admin/db.js`); authorization enforced by RLS.
- `src/proxy.js` guards `/admin/:path*` and `/auth/:path*` (session refresh, nonce CSP, `no-store`). `next.config.mjs` adds `X-Robots-Tag: noindex, nofollow` and `Cache-Control: private, no-store` to `/admin/*`.
- **No Supabase service-role key is used anywhere in the app** (VERIFIED: the only env names referenced are `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`/`ANON_KEY`, `NEXT_PUBLIC_SITE_URL`, Vercel/test variables). Privileged public operations use `SECURITY DEFINER` RPCs (`submit_trial_application`, `submit_contact_message`, `verify_certificate`).

## 4. Authentication and permissions (VERIFIED)

- Staff only: Supabase Auth users ↔ `public.profiles` (one per auth user, `role` → `public.app_roles`).
- Roles (live): `super_admin, admin, admissions, academic, qa, finance, content_editor, teacher`.
- Permissions: `public.app_role_permissions(role, permission)` with format `module:action` or `module:*` (check constraint in `20261013000100_core.sql`). `public.has_permission(text)` is `SECURITY DEFINER`, `search_path = ''`.
- RLS generator `private.apply_staff_policies(table, module)` (`20261013000600_security.sql`) creates `staff read/create/update/delete` policies per module.
- `certificates:*` is granted to `admin` and `academic`; `super_admin` has `*`.
- **There is no parent or student login.** `public.guardians` has no link to `auth.users` and no ERP Client ID column.

## 5. Existing academic and certificate model (VERIFIED, `20261013000300_admissions_academics.sql`)

- `students` (`student_code` unique, `full_name`, `status`, soft delete), `guardians`, `student_guardians` (many-to-many, `is_primary`), `enrollments` (student × course × teacher), `progress_records`, `certificates`.
- `certificates`: `number` (auto `OQC-CERT-YYYY-NNNN` via trigger in `20261013000500_logic.sql`), `student_id`, `enrollment_id`, `course_id`, `title`, `achievement`, `issued_on`, `signed_by`, `status` ∈ `draft | issued | revoked`, `notes`.
- Admin UI: `src/app/admin/(panel)/certificates/page.jsx` (list, create draft or issue; can create a student by name), `…/certificates/[id]/page.jsx` (preview with `window.print()` and A4 print CSS).
- Public verification: `public.verify_certificate(p_number)` returns number, student full name, title, course, issue date and signer for **issued** certificates only; used by `src/components/site/verify-certificate.jsx`.

## 6. Results / assessments

- **No assessment, marks, grading or results-import workflow exists** (VERIFIED: no matching tables, routes or components; `grep` for assessment/marks/grade/import finds only unrelated copy).
- CSV support is export-only: `src/lib/csv.js` (`csvCell`, `serializeCsv`, formula-injection safe). No parser.

## 7. Live data shape (read-only counts, no personal data read)

students 1 · guardians 0 · student_guardians 0 · certificates 1 (status `revoked`) · staff profiles 3. RLS enabled on `certificates` with the four staff policies.

Consequence: the parent portal has **no guardian records, Client IDs or links to work with yet**. Data onboarding is part of the plan.

## 8. Testing and quality tooling (VERIFIED)

- `npm test` → `node --test tests/*.test.mjs` (99 passing at last run).
- `tests/database.test.mjs`: loads every migration into **PGlite** with `supabase/tests/local_shim.sql`, switches roles (`anon`, `authenticated`) and JWT `sub` to test RLS and RPCs. This is the safe, production-free workflow for the new RLS tests.
- `npm run lint` (0 errors, 13 known warnings), `npm run build`, `npm run verify:site` (Playwright site suite), `scripts/browser-smoke.mjs`.
- No Supabase CLI or shadow database in the repo.

## 9. Rate limiting and request context (VERIFIED, `20261013000100_core.sql`)

`private.hit_rate_limit(bucket, max, window)` and `private.request_ip_hash()` (reads `request.headers` forwarded by PostgREST). An RPC called **from the Vercel server** sees the server's IP, not the parent's — see the threat model (T3).

## 10. Files likely to change

New: `supabase/migrations/2026110x…_results_portal*.sql`, `src/lib/results/*` (CSV/XLSX parsing, validation, grading), `src/app/admin/(panel)/results/**`, `src/app/(site)/results/**` (or `/parents`), `src/app/api/parent-session/route.js`, tests `tests/results-*.test.mjs`, DB tests in `tests/database.test.mjs` or a sibling file.

Changed: `src/components/admin/shell.jsx` (nav item), `supabase/migrations` role seeds (new permissions), `src/app/admin/(panel)/certificates/*` (link results ↔ certificates), `src/lib/admin/resources.js` (guardian Client ID field), `next.config.mjs` (no-store/noindex headers for the parent portal), `public/robots` rules if needed.

## 11. Repository file map (relevant parts)

```
supabase/migrations/        29 SQL migrations (core, academics, logic, security, seeds…)
supabase/tests/local_shim.sql  auth/storage shim for PGlite tests
src/proxy.js                admin session + CSP
src/lib/admin/              db client, resources, access
src/app/admin/(panel)/      CMS screens (certificates/, [resource]/, …)
src/components/admin/       shell, resource-form, ui
src/app/(site)/verify-certificate/  public verification page
src/lib/csv.js              CSV export helpers
tests/                      node:test suites incl. database.test.mjs (PGlite)
```
