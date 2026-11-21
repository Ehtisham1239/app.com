# OQC competitor reverse-engineering benchmark — 4 November 2026

## Purpose and method

This is a public-facing-site pattern review, not a claim that any competitor has been proven to rank above OQC for every target query. Search-result visibility and pages retrieved on 4 November 2026 were used to identify useful patterns. Rankings vary by query, country, device, location and time; confirm positions in Google Search Console and repeat SERP checks for each market.

The review is limited to observable page architecture, information design, conversion paths and trust presentation. It does not copy competitor text, images, code, logos, brand assets, testimonials, or proprietary design. OQC must implement original material grounded in its own actual service and verified evidence.

## Competitor sample observed

| Competitor / source | Observable strengths | OQC learning (original implementation only) | Caution |
|---|---|---|---|
| Academy for Quran — https://academyforquran.com/ | Clear country coverage in hero, one-to-one service proposition, course cards, country-specific fee display, free-trial CTA | Make the OQC service model and supported countries immediately clear; connect course discovery to a trial CTA; consider market-specific pricing only where OQC has approved live prices | Do not copy claims such as student totals, scholar credentials, price points or country counts |
| Quran Plus School — https://quranplusschool.com/ | Parent-oriented trust cues, visible class monitoring, app mention, broad market navigation | Explain OQC's actual quality assurance, parent communication and progress feedback process with evidence; link to a genuine student/parent guide | Do not claim recordings, monitoring, app features, guarantees or reviews unless OQC actually provides them |
| Noor Ul Qalam — https://noorulqalam.com/online-quran-classes | Honest online-only positioning; explains country pages through time zones and languages; describes where service is available | Keep OQC's online-only model explicit; country pages should answer time-zone, language, scheduling and learner-fit questions without implying physical branches | Do not invent city offices, local staff or unsupported time-zone coverage |
| Online Quran Classes / Urwa Academy — https://www.onlinequranclasses.com/ | Detailed course navigation, teacher choice, parent/student progress reporting, alternate tutor and support information | Publish clear course pathways and explain actual teacher-preference, make-up, progress-report and support workflows | Verify all operations before promising replacement teachers, reports, payment methods or 24/7 staffing |
| Quraanic Academy — https://www.quraanic.com/ | Strong CTA hierarchy, trial explanation, structured course flow, teacher discovery filters and profile-level information | Reduce friction from landing page to trial; expose relevant course and teacher information in a scannable, accessible format | Never import fabricated profiles, ratings, student counts, institutional affiliations or credentials |
| Online Quran Classes — https://www.onlinequranclasses.com/ | Course taxonomy, female-teacher pathway, progress and scheduling details | Make female/male teacher preference and student progress process easy to understand | Confirm actual availability and avoid guaranteed matching |

Additional search-result comparison references:
- https://www.onlinequranlearnings.com/best-online-quran-academies/
- https://www.openarabic.org/online-quran-classes/
- https://quranhost.com/blog/best-online-quran-academies

These comparison articles are secondary sources and may contain affiliate or self-inclusion bias. Use them to discover competitors and questions, not as authoritative proof of competitor performance or service claims.

## Reusable patterns to implement at OQC

### P0 — trust, accuracy and conversion
1. Above the fold: one concise H1 describing live one-to-one online Quran learning; supporting line explaining kids/adults, teacher preference and global online delivery only where verified; one primary free-trial CTA and one secondary course-exploration CTA.
2. State the actual offer consistently: 3-day free trial on eligible plans; no card needed on eligible plans; Weekend plan excluded. Do not describe the trial as universally available.
3. Explain the OQC learning method as an original sequence: Learn → Practice → Assessment → Feedback → Improvement.
4. Add a visible, factual “How progress is supported” section only after the Academic team confirms the real assessment/reporting cadence and parent access.
5. Keep testimonials unpublished unless the record includes authentic source, permission/consent and exact wording. No invented star ratings or review aggregate schema.
6. Add a clear online-only service statement; country pages must not imply a physical branch or local office.

### P1 — country and course relevance
1. Preserve the five canonical market hubs: UK, USA, Canada, Australia and UAE.
2. Each country page should contain genuinely useful local information: timezone/daylight-saving implications, likely scheduling windows (only if operationally supported), currency/payment information (only if approved), learner and parent FAQs, relevant course links, and the same accurate trial terms.
3. Give each course page a distinct learning outcome, intended learner, prerequisites, lesson approach, practice/assessment method, and suitable next step. Keep Noorani Qaida, Quran reading/Nazara, Tajweed and Hifz intent distinct.
4. Use contextual internal links between audience pages, course pages, market hubs, pricing and trial pages. Avoid repeating identical keyword anchors sitewide.
5. Use concise, descriptive titles/H1s and useful meta descriptions; avoid repetitive “best/top/No.1” claims.

### P2 — authority and helpful content
1. Show real teacher profiles only with approved names/photos, actual subjects, verified qualifications and consent. Link credential evidence where publication is authorized.
2. Publish transparent academic methodology and safeguarding/parent information only after operational and legal review.
3. Refresh existing articles before creating new ones. Each article should answer a real learner/parent question, cite reliable primary sources, name a qualified reviewer where appropriate, and link to one relevant course and trial page.
4. Keep the established editorial ceiling at 1,000 words unless the owner changes it; usefulness and completeness matter more than a target word count.
5. Earn relevant citations through genuine partnerships, educational resources, expert contributions and legitimate organizational profiles. No paid link schemes, bulk directory spam or fabricated local citations.

### P3 — measurement and experimentation
1. Verify Google Search Console and GA4/GTM ownership and data collection; create country + page + query baselines before claiming ranking gains.
2. Track qualified trial submissions, trial attendance, paid enrolments, retention and refund outcomes by landing page and country.
3. Measure mobile Core Web Vitals and real-user performance; compare before/after releases.
4. Test one conversion hypothesis at a time (CTA wording/placement, form length, trust explanation) and retain only measured wins.
5. Monitor index coverage, canonical selection, sitemap discovery, 404/redirect changes and duplicate-host indexing.

## OQC-specific risks to resolve before copying any pattern

- Existing public crawler snapshot for the homepage is stale (crawler labels it crawled 3 months ago). It contains claims such as “5,000+ students”, “25+ countries”, named teacher qualifications, individual testimonials and “4.9/5 Trustpilot”. These claims are NOT verified by this snapshot and must not be republished or assumed current.
- Current Supabase review evidence previously showed zero published testimonials with consent recorded. Until verified, suppress testimonials and review aggregate markup.
- Public Trustpilot profile previously observed had 8 reviews and a 4.3 score; confirm the current profile directly before displaying any score. Do not aggregate third-party ratings into OQC-owned review schema.
- OQC is online-only. No fake GBP listing, office address, city branch or local citations.
- User-supplied keyword plan is a theme list only; it does not establish volume, difficulty, CPC, rank or conversion potential.
- GSC/GA4 exports are still required to determine which page/query/country combinations deserve first priority.

## First implementation sequence

1. Complete and archive the current live responsive + Lighthouse + sitemap audit from GitHub Actions run 41845327649.
2. Compare actual production HTML and CMS content against the repository's current canonical page architecture. Do not use stale search-engine crawler snapshots as proof of current live content.
3. Audit every homepage trust claim, teacher profile, testimonial and review badge against source evidence; remove or rewrite unsupported claims.
4. Improve homepage conversion hierarchy and add a factual OQC learning-framework explanation.
5. Strengthen the five country hubs and course pages with unique, useful content and contextual links.
6. Validate schema against visible content; do not mark up self-serving organization reviews or fake testimonials.
7. Deploy, run route/redirect/indexability/mobile/performance checks, and monitor actual conversions.

## Evidence and policy sources

- Google Search Essentials: https://developers.google.com/search/docs/essentials
- Helpful, reliable, people-first content: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- Google spam policies (including scaled content, scraping and doorway abuse): https://developers.google.com/search/docs/essentials/spam-policies
- Crawlable links and internal linking: https://developers.google.com/search/docs/crawling-indexing/links-crawlable
- Review snippet structured data policies: https://developers.google.com/search/docs/appearance/structured-data/review-snippet
- General structured data policies: https://developers.google.com/search/docs/appearance/structured-data/sd-policies

## Status

- Competitor pattern research: completed for the sample above.
- Legal adaptation backlog: documented.
- Code/content implementation from this benchmark: not yet applied by this file.
- Production deployment: latest Vercel project record reports READY; GitHub production smoke checks passed.
- Full responsive, Lighthouse and sitemap audit: pending at last check in run 41845327649.
- Ranking / first-page outcome: not yet measurable without GSC baseline and sustained monitoring.
