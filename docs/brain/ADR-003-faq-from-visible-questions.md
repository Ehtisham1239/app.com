---
id: ADR-003
type: decision
status: accepted
date: 2026-11-19
---
# ADR-003 FAQPage data from an article's visible questions

Context: [[EVD-003-aeo-geo-2026-11-19]]. Options: (A) hand-write FAQs per post in the CMS, (B) generate from the visible question headings and the paragraph printed under each, (C) leave as is. **Chosen B**: no new claims, markup always matches the page, works for every future post that uses question headings. Max 6 pairs, answers cut near 320 characters at a sentence end, numbering stripped; the fee quick answer stays first. Code `articleQuestionAnswers` in `src/lib/article-answers.js`; tests in `tests/article-resources.test.mjs` and `tests/article-answers.test.mjs`.
Consequence: 24 of 45 posts carry FAQPage (was 1). Google shows FAQ rich results only for some sites, so the benefit is mainly Bing and AI answer engines reading structured Q&A.
