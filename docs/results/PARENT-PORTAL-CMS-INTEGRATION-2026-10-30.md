# Parent portal, CMS access management and learning plans — 30 October 2026

## Delivered workflow

Existing Client ID / access-code authentication is retained. CMS Records → Parent portal and Results → Parent portal open `/admin/results/parents`. Staff can open the public parent entry or monthly review queue directly from that workspace. Existing assessment results and certificates remain available to the same linked parents.

Teacher form → save learning/home-practice plan with monthly ratings/remarks → submit → admin review/edit (correction reason required) → approve/publish → linked parent's monthly result card shows the **published plan and result snapshot**. An unpublished correction does not change the parent's previous published version. Existing snapshots are preserved; older cards explain when no plan was published. The plan is optional, plain text, at most 2,000 characters, and does not create invented curriculum, religious guidance, scores or grades.

## New parent access and recovery

- **Create parent account:** authorized staff enter name and at least one registered email/phone, choose an existing student, and optionally supply an ERP Client ID. Blank Client ID generates `OQC-P-` plus a random suffix. One transaction creates guardian, child relationship and hashed access credential. Staff see the new code once for verified delivery. Both guardians:create and guardians:update are required server-side.
- Creation has a per-form UUID and database transaction lock/idempotency registry. A retry after a successful-but-lost response returns the same parent account without revealing the raw code again. Use the existing Issue/New code action if delivery was lost. No idempotency credential is stored in the registry.
- **Forgot password / access code?** and **Request new access** appear beneath public sign-in. These submit recovery/activation requests using the existing Client ID and registered email/phone. This is an enrolled-parent request route, not anonymous enrolment or automatic child association.
- Unknown and matching details receive the same acknowledgement and no account data or code. Contact matching filters requests; it is **not identity verification**. Pending requests deduplicate by guardian and recent requests have a 15-minute cooldown. Staff with guardians:read can review the queue; guardians:update is required to resolve it.
- Staff verify the parent through the registered channel, explicitly confirm reset, and receive a new once-shown code. The old code and sessions are revoked by the existing credential routine. No credentials or registered contact details are returned to the public request caller.
- Delivery is manual through OQC's verified existing communication channel. **No automatic email/SMS delivery integration was configured or claimed.** No separate email-password auth system or open self-signup was added.
- Failed requests preserve entered data for retry. Creation retry reuses its UUID, reset errors remain retryable from the pending queue, and read-only staff have no create/reset controls.

## Migration and safety evidence

Supabase CLI generated the migration, then it was applied successfully to **app.com / lgbwidraztavhhbnbfhr** and reconciled to actual remote history as `20261030093005_parent_portal_accounts_and_planning.sql`.

Before applying, the live progress_save, progress_admin_update and private.progress_snapshot routine bodies exactly matched the latest repository definitions (MD5 `0beacaefe811c2ad4c4c6b2c8a9529d0`, `9f5ae65a327c50c923bdfd7e810a894f`, `69f67d6e9c25ff17e7252296c4f125f9`). No later staff edits were overwritten. New plan arguments have defaults; older UI calls continue working and preserve an existing plan when the argument is omitted. No existing learner/report snapshot was rewritten.

Live read-only checks confirm plan column, request-table RLS, anonymous request-table denial, authenticated-only management RPC grants, anonymous execute only for the deliberately public non-disclosing request routine, and null results for an invalid parent token. Server permission checks remain mandatory even when UI controls are hidden.

Security advisor counts changed as expected for the added guarded routines/private registry: RLS/no-policy informational cases 3→4 (new private registry has no client grants), anonymous security-definer notices 13→14 (public request), authenticated security-definer notices 48→51 (public request plus guarded create/resolve); existing leaked-password-setting notice remains 1. These notices are documented, not presented as security certification. No unrelated auth settings were changed. Reference: https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable and https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable

## Verification

- 151 automated tests pass, including 12 monthly-progress database cases with synthetic users/learners: assigned-teacher scope, guardian isolation, draft/review/publication, plan snapshots, public request non-disclosure/deduplication, unauthorized mutation denial, revocation and idempotent linked account creation.
- Seven actual parent/CMS React-screen browser checks plus nine teacher/admin workflow checks pass against a clearly synthetic service adapter. New recovery failure/retry, activation request, automatic creation return values, verified reset, read-only UI, live plan preview/edit/publish and 390/1440px layouts are covered. Zero uncaught browser errors.
- The browser harness now loads global CSS before the CMS stylesheet, matching Next's actual cascade-layer order. Screenshots were visually inspected after this correction; this is a QA-fixture correction, not a production styling change.
- Focused ESLint has zero errors; the unchanged admin shell retains three existing hooks warnings.
- Production build passes; 212 rendered HTML files and zero missing static asset references.

Authenticated live staff/parent sessions are unavailable in the agent's browser. Real-account creation, reset and student-report publication were **not** performed for QA. This limitation does not replace the synthetic database/browser evidence or imply a real signed-in production journey was tested. Hosting/public-entry verification is recorded separately after release.

## Operation and rollback

Use CMS Parent portal to create/link access, view requests and issue/revoke codes. Results & learning plans opens the existing monthly queue; submitted plans must be reviewed before publication. A real parent should then sign in through `/parents` and see only linked learners' published versions.

Application rollback can restore the preceding production code while keeping the additive plan column/tables and optional-argument routines. Do not drop tables or discard published plans to roll back the UI. A full database rollback requires coordinated routine restoration from the prior migrations and preservation/export of new plan/request records; never reset/reseed production. Keep later staff changes when preparing any rollback.

## Production release verified

Application commit **2e19f82204d863a6991edf225771c4b4872219ef** deployed as **dpl_ETdxaUR4ZsKrBQKu7HsUvuM3fhWp**, Ready / Production, build duration 1m14s. Domain https://www.onlinequrancollege.com/parents shows the new recovery/activation controls and results/learning-plan copy. Both controls open the correct live request interface. Signed-out CMS management redirects to the login page with the correct return path. No public recovery form was submitted for QA. No app-origin browser errors observed; extension metadata errors are excluded.

GitHub reports deployment success and the signed-in Vercel dashboard confirms the exact commit, environment and domain. The Vercel MCP connection still cannot resolve this project (404); production runtime-log inspection remains unavailable and is not claimed. Authenticated private screens remain verified through synthetic actual-component/database tests, not a real logged-in production account. See evidence/2026-10-30-parent-integration/release.json.
