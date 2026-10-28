# OQC — All-blog SEO implementation and verification

28 October 2026 · Asia/Karachi  
Production site: https://www.onlinequrancollege.com/  
Scope: all 20 current published blogs and related public technical checks. Google Business Profile and prices are excluded.

## Result

All 20 published blogs were reviewed, received targeted CMS improvements and were verified live. Five overlong articles were edited to meet the owner's latest maximum of 1,000 words. Twelve older articles now begin with a concise answer to their main question. Three older articles received specific search titles and revised descriptions; the memorisation article's H1 now identifies Quran memorisation clearly. Existing article URLs and primary topic assignments were retained.

The five shortened articles retain their three practical FAQ questions, relevant course/trial links and accurate image disclosures. Articles were edited selectively rather than replaced with generic copies. The first three legacy religious article bodies remain unchanged. Their existing Quran 73:4 and Bukhari 5027 links were checked against their source pages; no Academics sign-off or new religious interpretation is claimed.

## Article register

Counts below use the rendered article body, including its headings and image disclosure, excluding global navigation, the hero, separate excerpt and related cards. A second check includes each title and excerpt; all remain below 1,000 words. BlogPosting uses the application's HTML-to-text algorithm, which counts some tag boundaries separately; those schema totals are independently checked and also remain below 1,000.

| Article | Previous body words | Verified body words | Work completed |
| --- | ---: | ---: | --- |
| [Noorani Qaida Home Practice: A Parent–Teacher Checklist](https://www.onlinequrancollege.com/blog/noorani-qaida-home-practice-checklist) | 1345 | 898 | Concise body; FAQs/links retained |
| [Choosing Online Quran Classes for Kids: A Parent’s Checklist](https://www.onlinequrancollege.com/blog/choose-online-quran-classes-kids) | 1358 | 915 | Concise body; FAQs/links retained |
| [Returning to Quran Study After a Long Break: An Adult’s Guide](https://www.onlinequrancollege.com/blog/returning-to-quran-study-adults) | 1336 | 875 | Concise body; FAQs/links retained |
| [Building a Family Quran Learning Routine: A Weekly Guide](https://www.onlinequrancollege.com/blog/family-quran-learning-weekly-routine) | 1436 | 915 | Concise body; FAQs/links retained |
| [Online Quran Class Fees in the UK: Comparing Lesson Value](https://www.onlinequrancollege.com/blog/online-quran-class-fees-uk-comparison) | 1342 | 856 | Concise body; FAQs/links retained |
| [An adult beginner’s first month of Quran study](https://www.onlinequrancollege.com/blog/adult-quran-beginner-first-month) | 510 | 548 | Direct opening answer |
| [Preparing a child for a first online Quran trial](https://www.onlinequrancollege.com/blog/prepare-child-first-online-quran-trial) | 506 | 544 | Direct opening answer |
| [Turning Tajweed feedback into useful practice](https://www.onlinequrancollege.com/blog/tajweed-practice-with-feedback) | 514 | 553 | Direct opening answer |
| [Planning Hifz revision alongside school](https://www.onlinequrancollege.com/blog/hifz-revision-with-school) | 495 | 531 | Direct opening answer |
| [Questions to ask before enrolling in a Quran course](https://www.onlinequrancollege.com/blog/questions-before-quran-course-enrolment) | 497 | 534 | Direct opening answer |
| [Noorani Qaida or Quran reading: where to start?](https://www.onlinequrancollege.com/blog/noorani-qaida-or-quran-reading) | 494 | 535 | Direct opening answer |
| [Quran Translation or Arabic: comparing learning goals](https://www.onlinequrancollege.com/blog/quran-translation-and-arabic-difference) | 509 | 548 | Direct opening answer |
| [Setting up an online lesson that is easier to follow](https://www.onlinequrancollege.com/blog/online-quran-lesson-setup-accessibility) | 521 | 561 | Direct opening answer |
| [A useful parent–teacher Quran progress conversation](https://www.onlinequrancollege.com/blog/parent-teacher-quran-progress-review) | 493 | 532 | Direct opening answer |
| [Planning Quran lessons for more than one child](https://www.onlinequrancollege.com/blog/family-quran-learning-multiple-children) | 485 | 522 | Direct opening answer |
| [Choosing an online Quran teacher from the USA](https://www.onlinequrancollege.com/blog/choose-online-quran-teacher-usa) | 553 | 590 | Direct opening answer |
| [Planning Quran lessons across Australian time zones](https://www.onlinequrancollege.com/blog/quran-lessons-australia-time-zones) | 541 | 578 | Direct opening answer |
| [How to Help Your Kids Learn Quran Online Successfully](https://www.onlinequrancollege.com/blog/help-your-kids-learn-quran-online) | 559 | 559 | Search title/description |
| [The Importance of Reciting Quran with Tajweed](https://www.onlinequrancollege.com/blog/importance-of-reciting-quran-with-tajweed) | 459 | 459 | Search title/description |
| [Quran Memorisation Techniques for Beginners](https://www.onlinequrancollege.com/blog/memorization-techniques-for-beginners) | 506 | 506 | Search title/description; clearer H1 |

## Verification evidence

- Fresh CMS read: all 20 records match the intended patch and advanced by exactly one version. Other selected fields—including slug, publication state, canonical, indexing setting, image, focus keyword and tags—were preserved.
- Live HTML: 20/20 HTTP 200, article body agrees with CMS, one expected H1, expected title/description, self-canonical and no noindex directive. No JSON-LD parse errors; BlogPosting headline and word count agree with source. This is source agreement, not an official rich-result certification.
- Each article's TOC targets, cover alt and dimensions, and trial pathway passed the raw-HTML checks. All 38 unique contextual same-origin destinations used across the final checks resolved, including referenced anchors.
- Live desktop browser: all 20 articles loaded; all cover images loaded after the page-load check; all TOC targets existed; no horizontal overflow at the browser's desktop viewport. The parent checklist was also visually inspected. No form was submitted.
- Sitemap technical check: all 49 declared URLs audited, zero findings, zero fetch errors and no robots skips. Robots and sitemap returned HTTP 200. Eight response/utility/pagination probes also ran; unknown routes retained real 404s and filter/utility pages retained intended noindex behavior.
- Source regression suite: 88 tests passed, including the new maximum-word-count guard. ESLint: zero errors, 13 existing warnings. Production build passed with 213 rendered HTML files and zero missing static asset references. Those build outputs are not a claim of 213 indexable pages.

CMS changes appeared after normal stale-while-revalidate refreshes. Initial HTML responses were sometimes stale and several early requests timed out. Targeted rechecks resolved the stale results; the final per-article register retains the verified response for every URL. No cache-control or security setting was weakened.

## Implementation and recovery

The CMS update was one atomic transaction guarded by article ID, slug, published status, prior version and prior body hash. A conflict would have rolled back the full batch. Only article bodies, reading time and the identified title/description fields were eligible for update. No pricing, analytics, permissions, business profile, user data or external messaging records were changed.

The source fallback mirrors the saved public article content. The release checker now enforces the new maximum instead of the previous minimum. The original commissioned release and its historical notes remain intact; this release supersedes their earlier word-length requirement.

Source references:

- Article changes and rollback fields: content/blog/2026-10-28-optimized/changes.json and before.json.
- Five revised HTML bodies: content/blog/2026-10-28-optimized/.
- Per-article action register: docs/seo-agent/BLOG-ACTION-REGISTER-2026-10-28.json.
- Read-only verification helper: scripts/audit-blog-content.py.
- Maximum-word regression guard: tests/blog-editorial.test.mjs.

For rollback, read the current versions first and restore only fields listed in each patch from before.json, guarded by current version and current body hash. Preserve any later staff edits; do not reset, reseed or republish unrelated data. A new application deployment is unnecessary for the verified CMS content changes. Source tooling/fallback updates do not establish a new Vercel deployment.

## Remaining limits and next actions

| Item | Actual status | Next action |
| --- | --- | --- |
| Mobile layout and fresh Lighthouse/field CWV | Not verified in this run. The local Chromium download was truncated; desktop browser coverage is separate. | Run approved mobile emulation and collect dated field/lab evidence when the environment is available. |
| New-blog performance | Connected Search Console returned a small legacy-UK query/page sample for 29 September–26 October; it does not establish new-blog rankings or uplift. Raw metrics stay out of the public repository. | Compare complete periods when meaningful article impressions and qualified lead evidence exist. |
| Academics review | Source links checked; qualified review of existing religious explanations remains pending. | Obtain an Academics review without inventing a reviewer or changing a religious meaning for SEO. |
| Backlink profile / acquired links | No connected backlink export or verified acquisition in this run. No outreach, link purchase or disavow occurred. | Audit a legitimate export when available; prepare relevant opportunities without sending messages. |
| Private hosting logs | Vercel project inspection/listing was unavailable (404/403); no authenticated CLI was present. Public content was verified independently. | Authorized account owner can resolve log access if needed; no permission change was attempted. |
| External Pathway/register document | No Claude Docs capability was available; local repository registers and supplied operating notes were used. | Reconcile with the external register when that specific capability is available. |

The 20-blog remediation and available public technical verification are complete. Ongoing search performance, qualified admissions, off-site authority and the explicitly blocked checks are not represented as completed or guaranteed outcomes.

## Primary guidance and content sources checked

- Google helpful content: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- Google Article structured data: https://developers.google.com/search/docs/appearance/structured-data/article
- Google spam policies: https://developers.google.com/search/docs/essentials/spam-policies
- Quran 73:4: https://quran.com/73/4
- Bukhari 5027: https://sunnah.com/bukhari:5027
- Current OQC CMS and all 20 public blog URLs listed above.
