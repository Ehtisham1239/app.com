# Blog SEO follow-up — 12 Nov 2026

Source: read-only query of the 37 published English articles in the app.com Supabase project, 12 Nov 2026. Nothing in production was changed by the audit.

## In this change (migration `20261112130000_blog_seo_trial_links_and_depth.sql`)
- Nine articles without a `/free-trial` link get one closing sentence (same "free trial on an eligible plan" wording the other articles use).
- Five thin articles (299–388 words) get practical study-routine sections inserted before their closing questions list. No religious rulings, interpretations, sources or credentials are added.
- Guarded, idempotent, published/English rows only; `updated_at` moves only for rows that change. Dry run on production data: each anchor heading occurs once and nine articles currently lack the trial link.

## Not in this change — needs owner decision
1. **Repeated sections.** Several articles still carry an older block followed by an appended block covering the same ground (e.g. adult-quran-beginner-first-month, hifz-revision-with-school, family-quran-learning-multiple-children, tajweed-practice-with-feedback, parent-teacher-quran-progress-review). Consolidating means choosing which wording survives, so it should be edited in the CMS or reviewed line by line.
2. **Qualified review.** Tafseer, Hifz and Tajweed articles have no named reviewer on record. Add one before expanding religious claims.
3. **External references.** Only three articles cite any external source. Add verified primary sources, not invented ones.
4. Search Console data is still needed to confirm which articles actually underperform.
