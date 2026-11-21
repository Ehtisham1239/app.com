# OQC Teacher Excellence Center

## Scope

A protected extension of the existing OQC Admin Portal at `/admin/teacher-excellence`. It is not a public marketing page and must not appear in the public sitemap, navigation or search index.

The feature reuses the existing `teachers`, `courses`, Supabase Auth, `profiles`, permission and audit architecture. It does not create a duplicate teacher directory or public teacher biographies.

## Design rules

- A teacher can have multiple actual role assignments and multiple subject assignments.
- Each subject assignment stores its own rubric snapshot. Tajweed, Hifz, Qaida, Arabic and Islamic Studies have distinct starter rubrics; the trainer can refine the weights in the data model before assessments are recorded.
- A score is evidence of a particular subject assessment, not a universal score for a person's worth or character.
- Quran accuracy concerns are recorded as a separate critical flag and must be escalated; a high aggregate score must never mask them.
- Parent feedback is optional and deliberately low-volume. It is a supporting signal, not proof or a high-frequency rating system.
- Teacher self-service can read only the teacher's own role/subject assignments, assessments, assigned training and weekly plans. Internal issues remain management-only.

## Access

The migration adds a `master_trainer` application role and `teacher_excellence` permissions. Super Admin, Admin and Academic can manage the module; QA can read/create records; Master Trainer can read/create/update; teachers receive scoped self-read access only.

**Required owner/admin setup after the migration:** assign the existing authenticated Aisha Jilani account the `master_trainer` role, set it active, and link the correct existing `teachers.id` to `profiles.teacher_id`. Do not create a duplicate teacher or guess the account identity. Verify the mapping with the owner before enabling access.

## Included capabilities

- Role and responsibility mapping
- Multiple subject assignments per teacher
- Subject-specific assessment with weighted rubric snapshot
- Critical Quran accuracy flag
- Teacher issue register with priority, evidence, root cause, action, owner and due date
- Starter training curriculum with practical tasks
- Training assignment and progress records
- Individual weekly development plans
- Restricted teacher self-view

## Starter training curriculum

1. Ikhlas and teaching intention
2. Amanah and respect for the Quran
3. Teacher adab and professional conduct
4. Mercy, patience and learner dignity
5. Correcting mistakes with wisdom
6. Trust, honesty and accountability
7. Student character and learner development
8. Respectful parent communication
9. Islamic conflict resolution and teamwork
10. Mentor leadership and teacher motivation
11. Class observation and evidence-based feedback
12. Practical mentoring capstone

The migration seeds topic titles and practical tasks, not Quran/Hadith rulings. Detailed religious content and references require qualified scholarly review before being taught as authoritative material.

## Data and deployment safety

The migration is additive. It does not rewrite teacher profiles, existing course assignments, admissions data, public pages, DNS or production configuration. Apply it to the live Supabase project only through the normal reviewed release process after the branch CI and database tests pass. Do not expose service-role credentials to the browser.

## Acceptance checks

- A teacher may be mapped to multiple roles and subjects.
- Subject assessments retain the rubric snapshot used at assessment time.
- Hifz and Tajweed assessments use different criteria.
- A P1 issue remains visibly escalated irrespective of average score.
- Teachers cannot query another teacher's records or internal issues.
- Parent feedback is not treated as verified unless reviewed and marked verified.
- The route remains behind existing admin authentication and noindex/no-store protections.
- Existing public pages, forms, lead workflows, canonical URLs and sitemap remain unchanged.
