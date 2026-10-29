# Proposed architecture — Student Results & Certificate Portal

Status: **PROPOSED, REQUIRES APPROVAL.** Nothing here is implemented.

Principle: reuse what exists — Supabase Auth for staff, `has_permission()`, the RLS policy generator, `SECURITY DEFINER` RPCs called with the publishable key, the PGlite test harness, and the existing `certificates` table. Do not add a service-role key, a second staff auth system or a new framework.

## 1. Data model (new, minimal)

```
assessments            id, code (unique), title, course_id → courses, assessment_date, period_label,
                       total_marks (>0), grading_scheme jsonb (decision), status, created_by, timestamps
assessment_criteria    id, assessment_id, label, max_marks, sort_order          (only if criteria approved)
result_import_batches  id, assessment_id, original_filename, file_sha256 (unique per assessment), status,
                       total_rows, valid_rows, invalid_rows, duplicate_rows,
                       created_by, reviewed_by, approved_by, published_by, timestamps
result_import_rows     id, batch_id, row_number, student_code, student_name, parsed jsonb,
                       errors text[], status, matched_student_id → students
student_results        id, assessment_id, student_id, marks_obtained, total_marks, percentage (generated),
                       grade, teacher_remarks, status (draft|published|withdrawn), version,
                       batch_id, certificate_id → certificates (nullable),
                       created_by, approved_by, published_at, timestamps
                       UNIQUE (assessment_id, student_id) for current version; history table for corrections
student_result_history id, result_id, version, snapshot jsonb, changed_by, reason, changed_at
```

Guardian credentials (only if Client ID + Code is approved):

```
guardians.client_id    text unique (ERP Client ID; an identifier, not a secret)
private.guardian_codes guardian_id PK, code_hash (pgcrypto crypt/bcrypt), issued_at, issued_by,
                       failed_attempts, locked_until
private.parent_sessions token_hash (sha256) PK, guardian_id, created_at, expires_at, revoked_at
```

Constraints: marks ≥ 0 and ≤ total; total > 0; grade in the approved scheme; FK indexes; `updated_at` triggers reuse `private.tg_set_updated_at`; certificate number reuse via the existing trigger.

## 2. Permissions and RLS

- New permission strings (fit the existing `module:action` check): `results:read, results:create, results:review, results:approve, results:publish, results:update, results:audit`. Proposed grants: `admin` → `results:*`; `academic` → read/create/review/update; approval/publication **(decision)**.
- Staff tables use `private.apply_staff_policies('assessments','results')` etc.
- `result_import_rows` and history: staff only; never granted to `anon`.
- State changes (approve, publish, correct) only through `SECURITY DEFINER` functions with `set search_path = ''`, an explicit `has_permission()` check and a single transaction.

## 3. Parent access path (no service role)

1. `POST /api/parent-session` (Next.js route handler) receives Client ID + Code over HTTPS.
2. It calls RPC `public.parent_sign_in(client_id, code)` with the publishable key. The function: rate-limits per Client ID (and per IP — see T3), compares `crypt(code, code_hash)`, returns the same generic error for unknown ID or wrong code, on success inserts a random 32-byte token's SHA-256 into `private.parent_sessions` and returns the raw token once.
3. The route stores the token in an **httpOnly, Secure, SameSite=Strict, path=/parents** cookie with a short lifetime (proposed 30 minutes idle / 8 hours absolute). This is a necessary authentication cookie, separate from the analytics cookie decision.
4. Parent pages are dynamic server components that read the cookie and call `public.parent_results(token)` / `public.parent_certificate(token, certificate_id)`. Each function resolves the token → guardian → `student_guardians` → students, and returns only `published` results and `issued` certificates, with a fixed, minimal column list.
5. `POST /api/parent-session` with DELETE semantics revokes the session.

Responses: `Cache-Control: private, no-store`; `X-Robots-Tag: noindex`; never in the sitemap.

## 4. Spreadsheet contract (proposed template)

| Column | Required | Notes |
|---|---|---|
| assessment_code | yes | must match an active assessment |
| student_code | yes | must match `students.student_code`; never creates students |
| student_name | recommended | mismatch is flagged for review |
| marks_obtained | yes | number ≥ 0, ≤ total |
| total_marks | optional | must equal the assessment total if present |
| grade | optional | must match the approved scheme; otherwise computed |
| teacher_remarks | optional | plain text, ≤ 1,000 chars, rendered as text (no HTML) |
| criteria columns | optional | only if criteria are approved |

Parsing happens in the browser for preview and again on the server/database for the authoritative check. Cells starting with `= + - @` are treated as text. No Client Codes in spreadsheets.

## 5. Admin screens

`/admin/results` (dashboard + assessments) · `/admin/results/assessments/[id]` · `/admin/results/import` (upload → preview → errors) · `/admin/results/batches/[id]` (review / approve / publish) · `/admin/results/students/[id]` (history, linked certificate) · audit view reuses `/admin/activity` filters.

## 6. Parent screens

`/parents` (sign in) · `/parents/results` (student selector → assessment selector → result card) · `/parents/certificates/[id]` (view only) · signed-out / expired / not-authorised states.
