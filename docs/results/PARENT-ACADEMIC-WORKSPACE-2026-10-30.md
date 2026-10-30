# Separate CMS Parent Portal and academic record views — 30 October 2026

## Owner scope and implementation

The owner requested result certificates and lesson plans within the parent portal, plus a separate Parent Portal entry in the CMS. The preceding release already persisted plans with monthly reports and returned approved snapshots to linked guardians. This change exposes that existing integration through distinct views and a separate staff workspace; it does not create another result database or bypass review.

- CMS sidebar has a separate **Parent Portal** group near the top, with Portal overview (`/admin/parent-portal`) and Parent accounts (existing `/admin/results/parents`). The overview links parent access/recovery, results/lesson-plan review, issued certificate management and published assessment results according to the current user's permissions.
- Overview lists the latest 20 **published snapshots** of monthly records and latest 20 **issued certificates**. A working draft plan is never substituted for the parent's published plan. Errors have a Retry action; permissions are checked before queries and existing database RLS remains authoritative.
- Parent `/parents` has separate **Results**, **Lesson plans** and **Certificates** views with shareable local query/anchor navigation. Results retains the branded monthly result card and numeric assessment marks. Lesson plans shows the published plan with month, learner, teacher, publication date/version and matching result-card link. Certificates indexes approved monthly result cards and issued certificates; existing scoped certificate detail pages return to that index.
- Month links keep the selected view and open the same approved report. Unknown view/report selections fall back to the linked learner's current approved record. Empty, unlinked and temporarily unavailable states remain distinct.
- Uses existing OQC logo, deep green and gold styling. Desktop/mobile layouts and sidebar were visually checked. No public PDF/download or parent-edit control was added.

## Data and access boundaries

No database schema or permission changes were needed. Existing `parent_results` and `parent_progress` validate the private parent session, scope children, and supply published data; the same `ParentSessionGuard` remains around the academic UI. The new server-safe presentation component receives only those scoped records. Parent roles/codes, admin publishing permissions, certificate issuance/revocation and review history are unchanged. No seeded or real learner report was published, assigned or edited in this run; the five requested demo pairs remain as recorded in the preceding seed checkpoint.

## Verification

- `npm test`: **151 tests pass**, zero failures, including existing guardian isolation, publication snapshots, plan publication/correction and credential-recovery database tests with synthetic fixtures.
- New actual-component browser suite: **15 checks pass**, zero uncaught errors. It exercises view/month/result/certificate navigation, unknown selectors, empty/unavailable states, 390/1440px layouts, actual CMS sidebar/workspace, failed-query retry, published-versus-draft display and permission-limited queries.
- Existing parent/account/recovery component suite: **7 checks pass**. Existing teacher/admin review suite: **9 checks pass**. These use explicitly synthetic adapters, not production learner writes or a real logged-in account.
- Focused ESLint: zero errors. Existing shell hooks warnings are outside the changed navigation block.
- Production build succeeds; **212 rendered HTML files, zero missing static references**. The new protected workspace is included in the app build, without a public sitemap entry.
- Manually checked source schema before querying; certificate records use status `issued` and have no deleted_at column. New queries match the existing table fields.

Authenticated production staff/parent UI verification still needs an existing signed-in app session. Local actual-component screenshots/test evidence and the deployed public entry/protected-route check must not be described as a completed real-account live journey. Hosting release details will be recorded separately.

## Operation and rollback

CMS → Parent Portal → Portal overview provides the four relevant management destinations. Review and publish a teacher's monthly report using the existing workflow; parents then choose Results, Lesson plans or Certificates after signing in. Certificate drafts and revoked certificates remain private.

Rollback this source revision through the existing Vercel integration if required; no database rollback is necessary. Preserve later staff edits and existing published records. Do not reset the database or re-seed demo records for rollback.

## Concurrent staff edits preserved

Before release, main advanced from db95248 to **c4387cf355fd6656122f0d3f72f808b7dcd416c1** through PR #27 (CMS visual refresh). The sidebar changes were merged without conflicts; the newer shared UI components, admin stylesheet and dashboard banner were retained exactly. The final build and tests were repeated against the combined source. This feature does not revert that staff design update.
