# Results portal — release record and runbook

Status labels follow the engineering skill: **observed / implemented / locally verified / deployed / production verified**.

## What is live (30 Oct 2026)

| Part | Status | Evidence |
|---|---|---|
| CMS → Results (assessments, CSV/.xlsx upload, check, submit, approve, publish, corrections, withdrawals, certificate link) | Deployed | PR #20, #21 merged; Vercel production READY |
| CMS → Parent access (single parent, link children, issue/remove access code) | Deployed | PR #20 |
| Bulk upload of parents + bulk access codes | Deployed | PR #23 |
| Parent portal `/parents` (Client ID + access code, board-style marks sheet, issued certificates view-only) | Deployed | PR #20 |
| Database: `20261030000100_results_portal`, `20261030000200_results_fk_indexes`, `20261030000300_guardians_bulk_import` | Applied to production | `supabase_migrations.schema_migrations`; Supabase advisors run |
| Full workflow on the production database | Production verified at database level | Rolled-back transactions: assessment → upload → validate → submit → approve → publish → parent → code → sign-in → marks sheet; bulk upload dry run, save, re-upload, codes. Counts afterwards unchanged. |
| CMS screens and `/parents` in a browser on the live domain | **Not verified by Claude** | The build session's network cannot reach the live domain or the Supabase API; verify by signing in to the CMS. |

## Who can do what

| Permission | Roles | Allows |
|---|---|---|
| `results:read` | admin, academic, qa | See assessments, uploads, published results |
| `results:create` | admin, academic | Create assessments, upload and check files |
| `results:review` | admin, academic | Exclude rows, submit for approval |
| `results:approve`, `results:publish` | admin | Approve (must not be the uploader, except super admin) and publish |
| `results:update` | admin, academic | Correct or withdraw a published result |
| `guardians:*` | admin; admissions/academic partly | Parents, Client IDs, access codes, bulk upload |

The sidebar also shows Results to anyone with `certificates:read`; the database still enforces every action.

## Operating steps

1. **Parents:** Results → Parent access → **Bulk upload**. One row per child (`client_id, parent_name, relationship, email, phone, student_code, student_name`). Check file → Save (all rows or none). Then **Issue codes** and download the CSV once; send each parent their own code; delete the file.
2. **Results:** Results → **New assessment** (status "Open for results", optional grade bands) → **Upload results** (template: `student_code, marks_obtained`, optional `student_name, grade, teacher_remarks`) → Submit → Approve → **Publish to parents**.
3. **Parents** open *Parent portal (results)* from the site footer and sign in with Client ID + access code.

## Security notes

- Access codes: 12 characters, bcrypt-hashed, shown once; 5 wrong tries lock for 15 minutes; IP and Client ID rate limits.
- Parent sessions: random token in an httpOnly, SameSite=Strict cookie; 30 minutes idle, 8 hours maximum; the database stores only its SHA-256.
- `/parents` runs without the public site's chat, analytics or third-party scripts, with a strict CSP, `no-store`, `noindex`, frame denial.
- Parents see only their linked children's **published** results and **issued** certificates.
- No print or download controls for parents. This does **not** prevent screenshots.
- Supabase advisor warnings for `parent_*` (callable by anon) and `results_*`/`guardian_*` (callable by signed-in staff) are intentional; each function checks its token or permission.

## If something goes wrong

- **CMS says "not set up in the database yet"** after a migration: reload the API schema cache — `notify pgrst, 'reload schema';` in the SQL editor.
- **Wrong result published:** Published results → open the result → Correct (marks/grade/remarks with a reason) or Withdraw. History keeps every earlier version.
- **Code leaked or parent locked out:** Parent access → New code (old code stops; parent signed out) or Remove access.
- **Roll back the feature:** revert PRs #20–#23 in GitHub (Vercel redeploys). The database objects are additive and can stay; to remove them, drop the functions, the tables `student_result_history, student_results, result_import_rows, result_import_batches, assessments, private.parent_sessions, private.guardian_codes`, the column `guardians.client_id`, and the `results:*` rows in `app_role_permissions` — only after exporting any real results.

## Open owner decisions

- D1 grading policy per course (bands are entered in the CMS per assessment).
- D3 ERP Client ID format (any 3–64 letters, numbers, `.`, `-`, `_` is accepted today).
- D5 OTP as a second factor (not built; Client ID + code + lockout today).
