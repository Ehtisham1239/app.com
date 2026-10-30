# Teacher form to reviewed parent result card — 30 October 2026

## Owner request and reference

Read the supplied OQC_Monthly_Progress_Workflow_and_UI document and its report illustration. Its six student areas are Adab, Qaida, Dua, Tajweed Accuracy, Student Engagement and Parent Visible Outcome. They are retained with Excellent, Good, Satisfactory and Needs Improvement, plus plain-text teacher remarks. The spoken Lesson Planning/Class Management examples belong to a different teacher-evaluation list that was not supplied; no official Six Dimensions rubric was invented or silently substituted for these student areas.

Teacher form → private saved monthly report → **Results → Monthly reports** → admin Review/Edit → Approve & publish → the linked parent's branded monthly result card. Existing numeric assessment uploads remain separate and available. No score, total or overall grade is invented from qualitative ratings.

## Implemented

- Teacher sees the linked primary Client ID/name automatically from the maintained student/guardian relationship. No repeated free-typing of identity and no broad guardian contact export. Drafts allow a missing link; server-side submission requires a linked Client ID.
- Existing scoped `progress_my_students(date)` RPC returns one minimal client identity for each authorized assigned learner. Its caller guard is preserved; anonymous execute is revoked, authenticated execute restored after the return-shape change. No private-schema privilege or role expansion was made.
- Submitted forms remain the same monthly report records, visible immediately in the existing submitted review queue. Results navigation now links Monthly reports and Teacher form; the Results landing page explains and links the monthly review queue. No copying into a disconnected result form.
- Admin uses existing Edit with a correction reason, reviews the shared OQC result-card preview and publishes a complete snapshot. Teachers cannot publish. Corrections retain the previous published version until republished; history is retained.
- Card title is Monthly Student Result Card, with OQC logo, green/gold palette, student code, Client ID/name, six ratings, remarks, reporting month and published revision. Parent views have no download/print controls or public PDF URL; staff's existing print action remains available.
- `parent_progress` derives Client ID/name from the verified guardian session. A co-guardian does not receive another guardian's client identity. Only that guardian's linked learners and published report snapshots are returned.
- About banner now uses the existing full-width green-fade treatment, gold title accent, course/teacher actions and responsive photo. Current CMS excerpt, cover and business facts are preserved, including the currently saved 2018 wording; no factual date was changed from the screenshot.

## Database and verification

Migration generated through Supabase CLI, applied successfully to app.com project lgbwidraztavhhbnbfhr and filename reconciled to the confirmed remote version **20261030085637_progress_client_identity.sql**. Before applying, all three existing routine-body hashes matched source. No student or report row was rewritten. Live read-only checks confirm the new return shape, anonymous deny, authenticated grant, linked-client guard and null response for an invalid parent token.

- **147 tests pass**, zero failures, including 8 monthly-progress database integration cases using synthetic fixtures. New tests cover missing-link submission and co-guardian identity isolation; previous access, draft/submit/edit/publish/snapshot rules remain covered.
- Production build passes: 212 rendered HTML, zero missing static asset references.
- Focused ESLint: zero errors.
- Nine actual React-screen browser checks with an explicitly synthetic PostgREST/RPC boundary pass, including loaded Client ID, Results navigation and edited-value publication. No real student result was published for QA.
- About hero: 320/390/768/1440px checks pass, decoded image, one H1, both action paths and no overflow; 200% text at 1440px also passes after the responsive header observer settles. Initial immediate post-font-change assertion was a timing issue; the bounded settle condition now tests the rendered state.
- Supabase security advisor categories/counts stayed unchanged: 3 private RLS/no-policy informational cases, 13 public and 48 authenticated security-definer notices, and existing leaked-password setting notice. Existing guarded RPC architecture was retained, not declared security certified; no unrelated account settings changed. References: https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable and https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable

## Release and recovery

Release through existing main integration to www.onlinequrancollege.com. Hosting completion will be recorded separately. Authenticated production teacher/admin/parent UI interaction still requires an existing signed-in session; local browser and database evidence are distinguished above. No credentials, PINs, learner records, outreach or account grants were created for testing.

Rollback must coordinate this source diff and the three routine definitions. Restore only these routines from the prior monthly_progress migration after checking for later edits; `progress_my_students`'s old return shape requires drop/recreate without CASCADE and restoration of its authenticated-only execute grant. Published snapshots and learner rows must be preserved. Do not reset or reseed production.

Visual QA also caught and fixed the About secondary action's white-on-white styling by using the existing light-outline button variant; the browser guard now checks its foreground/background colors as well as both destinations.
