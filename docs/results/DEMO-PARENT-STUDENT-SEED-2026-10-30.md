# Owner-requested five demo student/parent pairs

Applied manually to app.com Supabase project lgbwidraztavhhbnbfhr on 30 October 2026 in response to the explicit request for five students/parents of seed data. This is separate from release QA, which did not write production learner records. Source: supabase/seed/demo-parent-students.sql (manual, not a schema migration).

Five synthetic students (`DEMO-OQC-S001` through `DEMO-OQC-S005`) and five synthetic parents (`DEMO-OQC-P001` through `DEMO-OQC-P005`) are linked one-to-one with primary relationships. Names are DEMO Student/Parent 01–05; parent contacts use reserved `@oqc.example.test` addresses and have no phone numbers. Notes identify the seed batch. Students are paused, not active enrolments. No real person's contact information, billing, bookings or religious/academic results were invented.

Verified live: 5 students, 5 parents, 5 links, all students paused, 0 codes, 0 monthly reports. Re-running the exact seed script preserves these counts without updates, duplicate rows or replacement of staff edits. The script rejects conflicting non-demo/archived keys. Existing reference counters are not consumed because explicit demo student codes are provided.

In CMS Parent portal management, search DEMO. Existing authorized staff can use Issue code to enable a demo parent's login when desired; no codes or sessions were issued automatically by this data seed. To test the review/publish workflow, staff can assign a demo learner and prepare a clearly identified demonstration report; no results were published as part of this seed request.
