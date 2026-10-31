# Two recovered legacy articles — approval-ready redirect proposal

Status: draft proposal, not merged or verified live. The operating specification requires specific approval for URL changes. This branch prepares the exact change without republishing old religious claims or assuming approval.

Archived original HTML was retrieved successfully (HTTP 200) for all three legacy URLs. The basic Islamic education page addressed broad educational foundations and learners, so a child-only destination is not justified and no mapping is added for it.

| Source | Exact proposed target | Content comparison |
| --- | --- | --- |
| /how-to-learn-quran-by-heart-2 | /blog/memorization-techniques-for-beginners | Original titled “How to learn Quran by Heart”, with practical memorisation, repetition and choosing a study time; current guide serves the same practical beginner memorisation intent. |
| /start-teaching-the-quran-to-your-children | /blog/help-your-kids-learn-quran-online | Original discusses parental example, regular reading, engaging children and online teaching; current parent guide provides relevant learning support. |

Snapshots: 20240229094015 and 20260513100607 respectively. Response/locator evidence: evidence/2026-10-31/archive-content-check.json and archive-recovery-attempt.json. Historical statements and religious quotations are not copied into the current site and are not presented as Academics-approved.

Implementation: two exact permanent rules in next.config.mjs; existing targets remain indexable canonical pages. No homepage catch-all, new pages or price changes. Next.js uses 308 and preserves queries. Five redirect regression tests pass, including unique sources, no chains/self/external redirects and relevant exact targets. The basic education path deliberately stays outside this proposal.

After specific owner URL approval, merge, verify deployment, then GET each old path with a harmless query and confirm one-hop 308 to the expected 200 canonical target. Until that evidence exists, these two migration issues are ready for review, not complete. Rollback removes only these two entries and their dedicated assertion; preserve later redirects and content.
