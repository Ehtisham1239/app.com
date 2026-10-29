# Requirements — Student Results & Certificate Portal

Source: the owner's master prompt (29 Oct 2026) and the owner's clarification: **the Results button lives in the CMS, results are integrated with certificates, and results are uploaded as a CSV or Excel sheet.**

Items marked **(decision)** are listed in `UNKNOWN_DECISIONS.md` and are not invented here.

## R1 CMS entry point
- A "Results" item in the admin sidebar (`src/components/admin/shell.jsx`), visible only with `results:read`.
- From a certificate, staff can see the linked result; from a result, staff can create or link a certificate (draft → issue through the existing certificate workflow).

## R2 Assessments
- Create and edit an assessment: code, title, course, assessment date, period label, maximum marks, grading scheme **(decision)**, optional criteria such as Reading, Tajweed, Memorisation **(decision)**.
- Status: `draft → active → closed`.

## R3 Spreadsheet import
- Upload `.csv` (required) and `.xlsx` **(decision: dependency)**; maximum size and row count enforced (proposed 2 MB / 2,000 rows).
- Downloadable template with the agreed columns (see `ARCHITECTURE.md` §4).
- Preview every parsed row before anything is saved as a result; row-level errors with row number and reason.
- Never create students automatically, never overwrite an existing result silently, never discard invalid rows silently.
- Batch state machine: `uploaded → validating → needs_review → ready_for_approval → approved → published`, with `validation_failed`, `rejected`, `cancelled`, `failed`.
- Duplicate protection: the same file hash or the same (assessment, student) cannot be imported twice without an explicit correction.

## R4 Review, approval and publication
- Separate permissions for create, review, approve and publish (`results:create|review|approve|publish`).
- Publication runs in one database transaction; results become visible to parents only when published.
- Corrections after publication create a new version and an audit event; the previous version is kept.

## R5 Parent portal
- Sign-in with **ERP Client ID + Client Code (decision: confirm ERP identifier and code issuing process)**.
- Parent sees only students linked to that guardian, only published results, and only issued certificates.
- Result card: student display name, course, assessment, date, marks/max, percentage, grade, approved teacher remarks, publication date, certificate availability.
- Certificate view for issued certificates only; draft and revoked are never shown as valid.
- **No download, print or export controls** on parent pages. This does not prevent screenshots; it only removes the controls.
- Sign out; sessions expire.

## R6 Public verification
- Keep `/verify-certificate`; it must not reveal marks, remarks, Client IDs, guardian data or notes. **(decision: whether to keep showing the student's full name)**

## R7 Audit
- Record import started/completed, validation failed, approved/rejected, published, corrected, certificate issued/revoked, parent sign-in failures (no codes or tokens logged).

## R8 Non-functional
- Mobile-first, accessible (semantic HTML, keyboard, contrast), OQC branding and existing components.
- Personalised pages: `Cache-Control: private, no-store`, `noindex`, never statically pre-rendered.
- No real student data in tests, screenshots or fixtures.
- No production migration, data change or deployment without the owner's explicit approval of that step.
