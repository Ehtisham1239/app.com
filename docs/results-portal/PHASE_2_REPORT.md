# Phase 2 report — database and security foundation (local only)

> Historical checkpoint. The foundation and later UI have since been merged and the database installed. See [30 October completion and release](RELEASE_2026-10-30.md) for current verified status and remaining data-onboarding requirements.

Date: 29 October 2026. Followed `.claude/skills/engineer-secure-software`.

## Status

| Item | Status |
|---|---|
| Migration `supabase/migrations/20261030000100_results_portal.sql` | **IMPLEMENTED**, **LOCALLY VERIFIED** (PGlite) |
| Applied to live Supabase `lgbwidraztavhhbnbfhr` | **NOT APPLIED** — REQUIRES APPROVAL |
| Merged to `main` / deployed | **NO** — kept on a branch for review |
| Production data, settings, deployment changed | **No** |

## What the migration adds (additive only)

- Permissions: `admin` → `results:*`; `academic` → read/create/review/update; `qa` → read.
- Tables: `assessments`, `result_import_batches`, `result_import_rows`, `student_results`, `student_result_history`; `guardians.client_id` (nullable, unique); `private.guardian_codes`, `private.parent_sessions`.
- RLS on every new public table; Supabase's default anon grants revoked; staff can insert batches/rows but **cannot update status directly** — every transition goes through a `SECURITY DEFINER` function with `search_path = ''` and an explicit permission check.
- Workflow functions: validate → exclude rows → submit → approve/reject (approver ≠ uploader unless super admin) → publish in one transaction; cancel; versioned correction with reason; withdraw; link certificate (same student only).
- Parent functions: `guardian_issue_code` (staff, 12-character random code, bcrypt hash, shown once, ends old sessions), `parent_sign_in` (same answer for unknown ID/wrong code/lockout; 5 failures → 15-minute lock; per-ID and per-IP rate limits), `parent_results`, `parent_certificate`, `parent_sign_out`. Sessions: random 32-byte token, SHA-256 stored, 30 min idle / 8 h absolute.
- Audit: existing `private.tg_audit` on assessments, batches and results; code issuing logged without the code.

## Tests actually executed

| Command | Result |
|---|---|
| `node --test tests/results-portal.test.mjs` | 10/10 pass |
| `node --test tests/*.test.mjs` | 109/109 pass |
| `npm run lint` | 0 errors (13 existing warnings) |

The new tests imitate Supabase's default table grants first, so they prove the migration's revokes. Covered: anonymous denial on all tables/functions; staff without permission; validation errors (unknown code, name mismatch, marks over maximum, non-numeric marks, grade outside scheme, duplicates, existing result); direct status updates refused; academic cannot approve/publish; uploader cannot self-approve; single publication; formula-like remarks stored as text; read-only published results; correction history; code hashing; identical sign-in failures; lockout; cross-family isolation; withdrawn results, draft/revoked/other-family certificates hidden; idle expiry; sign-out; re-issued code ends sessions; public verification fields unchanged.

## Provisional choices (reversible; based on recommendations in UNKNOWN_DECISIONS.md)

D6 admin approves/publishes · D7 certificates stay manual (link only) · D8 one result per assessment, corrections versioned · D9 CSV first (no parser dependency added) · D12 30 min idle / 8 h absolute · lockout 5 failures / 15 min. Grade bands are **not invented**: each assessment stores the owner's bands; empty means marks only (D1).

## Known limitations

- Per-IP limit sees the Vercel server IP when the sign-in RPC is called from the server (threat T3); the per-Client-ID lockout is the primary control.
- No UI yet (Phases 3–5). No XLSX. No OTP.
- Live database has 0 guardians; Client IDs must be added before parents can sign in.

## Next approval needed

1. Answers or acceptance for D1, D3, D4/D5 (grading bands, ERP Client ID format, code delivery).
2. Permission to continue with Phase 3 (admin import screens) and Phase 4 (parent portal) **locally**.
3. Separately, later: permission to apply this migration to the live database.
