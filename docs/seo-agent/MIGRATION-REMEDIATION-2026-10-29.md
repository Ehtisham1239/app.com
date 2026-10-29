# Legacy URL remediation — 29 October 2026

Status: **Four live 404s confirmed; proposed mappings only.** No redirect, deployment, indexability directive or historical content was changed. Discovery source: pages 2 and 5 of `Online_Quran_College_SEO_Audit_2026-10-28.pdf`, read from the owner's current report. Its older GA4 figures have not been repulled and are not today's traffic evidence.

Fresh evidence is in `evidence/2026-10-29/migration-check.json`. All four paths returned HTTP 404 with no redirect Location. This confirms missing routes, not lost revenue, current Google indexation or the correct replacement intent.

| ID | Legacy path | Candidate treatment | Dependency and confidence |
| --- | --- | --- | --- |
| MIG-01 / P1 | `/hifz-ul-quran-course` | Proposed direct permanent redirect to `/courses/hifz-quran`, currently HTTP 200 and index/follow | Strong topic similarity; owner/editor must confirm it replaces the old course, including audience and offering. Mapping is not yet approved. |
| MIG-02 / P1 | `/basic-islamic-education` | Recover old content and identify an equivalent approved current offering; possibly restore the original intent | Current `/learn/islamic-studies-for-kids` is only a candidate in the sitemap. Its child-specific audience may differ from the missing page. Do not redirect on title similarity alone. |
| MIG-03 / P1 | `/how-to-learn-quran-by-heart-2` | Review original article against `/blog/memorization-techniques-for-beginners` or a suitable revision guide | Existing candidate articles are live-checked, but original scope, audience and inbound-link context are unavailable. No target selected. |
| MIG-04 / P1 | `/start-teaching-the-quran-to-your-children` | Review original article against `/blog/help-your-kids-learn-quran-online` or `/learn/quran-for-kids` | Original content and editor-approved equivalence are needed; no target selected. |

## Ready implementation for MIG-01 after approval

Add an exact-path entry in `next.config.mjs`'s existing redirects array, following the installed Next.js documentation before editing:

```js
{ source: '/hifz-ul-quran-course', destination: '/courses/hifz-quran', permanent: true }
```

This snippet is an unpublished proposal. Do not apply it until equivalence and this URL change are authorized. Keep unknown/removed content at an honest 404/410 where no useful replacement exists. Do not redirect all missing paths to the homepage or remove the deliberate missing-page 404 behaviour.

## Acceptance and rollback

1. Record the exact approved source, target, approving editor and original-content evidence. Check overlap with existing rules before editing.
2. Test exact source and a harmless `?utm_source=oqc-migration-qa` variant locally. Confirm one 301/308 hop, preservation of useful query values and a 200 self-canonical indexable final target.
3. Run redirect-specific tests plus existing SEO checks/build. Retain the prior config diff as rollback; preserve unrelated later changes.
4. Release through authorized hosting access, verify the live redirect, then record the deployed version and actual HTTP evidence. A source commit alone is not deployment proof. Search Console URL Inspection is separate from HTTP verification.

## City noindex decision reconciled

The current London destination returns 200 and noindex/follow. The repository instructions explicitly retain city noindex until approved local evidence exists. Preserve that decision; do not treat deliberate noindex as an automatic fault or remove it to chase historical impressions. The general city strategy can be reviewed separately with the owner and actual local proof.

## Other later-audit findings

The PDF also flags planner date/time handoff, Weekend enquiry wording, teacher-preference copy/form mismatch and historical key-event reporting. These are imported audit observations, not newly verified fixes. Queue a targeted source/browser review next; exclude price changes and do not change analytics settings from historical reporting alone. No enquiry has been submitted.
