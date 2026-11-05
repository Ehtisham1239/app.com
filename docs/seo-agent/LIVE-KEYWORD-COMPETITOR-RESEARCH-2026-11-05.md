# OQC live keyword and competitor research — 5 November 2026

**Markets:** UK, USA, Canada, Australia, UAE  
**Status:** Research evidence and implementation priorities; not a ranking or traffic report.  
**Operating rule:** one primary intent per URL; improve the existing country/course pages before creating new URLs. OQC is online-only.

## 1. Search-demand signals

A 31 October 2026 research paper analysing Google Trends from December 2019 to January 2026 reports that **“online Quran learning”** generally had higher and more stable relative search interest than “learn Quran online” and “online Quran teacher”, with recurring Ramadan peaks and increasing visibility in parts of Europe and North America. Google Trends is a relative index, not absolute volume or enrolment demand. Source: https://ijtie.com/v403/n40313/

A Wusul market analysis published in October 2026, using Google Ads / DataForSEO estimates for September 2025–August 2026, reports:
- US and UK combined estimate of about 1,720 monthly searches for “online Quran classes” (their reported estimate; not independently validated in OQC accounts).
- US “online Quran classes” searches reportedly rise during July–October around the school year.
- UK and US Quran-app searches reportedly rise during Ramadan.
- US CPC estimate around $9 for the same term.

Source: https://wusul.io/muslim-media-and-education/

**Interpretation:** prioritize commercial class-intent pages year-round; schedule parent/school-year content and campaigns ahead of July–October for the US; prepare Ramadan resources early, but do not assume every country has identical seasonality. Validate volumes, query impressions, CTR, conversions and position through the connected GSC / Keyword Planner / SEO-suite exports before attaching numeric targets.

## 2. Keyword clusters and page ownership

| Priority | Intent cluster | Example terms | Existing owner |
|---|---|---|---|
| P1 | Global commercial | online Quran classes; online Quran learning; online Quran academy | Homepage |
| P1 | Country commercial | online Quran classes UK / USA / Canada / Australia / UAE; online Quran academy [country] | Existing five country hubs |
| P1 | Children / parent | online Quran classes for kids; Quran lessons for children; online Quran teacher for kids | Existing kids course page + relevant country hub |
| P1 | Course | online Tajweed classes; Noorani Qaida online; online Hifz classes; Quran reading with Tajweed | Existing matching course pages |
| P1 | Adult beginner | learn Quran online for adults; Quran classes for beginners; adult Quran lessons online | Existing adult/beginner course content |
| P2 | Decision / pricing | online Quran classes fees; Quran classes cost per month; Quran class trial | Pricing, FAQs and free-trial page |
| P2 | Teacher fit | one-to-one Quran classes; female Quran teacher online; teacher language preference | Teacher profiles and FAQs, only where current roster supports the claim |
| P2 | Time-zone logistics | Quran classes Eastern time; Canada time zones; Australia daylight saving; UAE Gulf Standard Time | Relevant country hub, not duplicate city doorway pages |
| P2 | Learning support | Quran progress report; Hifz revision plan; Tajweed practice feedback | Existing relevant learning guides and course pages |

### Market execution notes

- **UK:** GBP and GMT/BST-aware scheduling; parent and adult pathways; clear online-only delivery.
- **USA:** USD and ET/CT/MT/PT scheduling; prioritize parent-led child enquiries and school-year planning; no state-office or licensing implication.
- **Canada:** CAD and multi-time-zone scheduling; use Toronto/Vancouver/Calgary/Montreal modifiers within useful Canada content; no thin city pages.
- **Australia:** AUD and state/daylight-saving scheduling; make after-school planning useful without promising unverified slots.
- **UAE:** AED quote guidance and Asia/Dubai time; explicit online-only disclosure; no UAE office, local licence or local teacher claim.

## 3. Competitor patterns observed on 5 November

The following are public-page observations, not independent verification of competitor claims:

| Provider | Public pattern observed | OQC opportunity |
|---|---|---|
| JoinQuran — https://www.joinquran.com/ | Country-currency prices, weekly frequency, lesson duration, 3-day trial CTA and direct parent answers | Make OQC package comparison explain frequency, duration, trial eligibility, billing and next step together |
| OnlineQuran.pk — https://onlinequran.pk/ | One-to-one proposition, course categories, local currencies and a detailed pricing path | Improve course-to-market navigation and answer pricing questions before the trial CTA |
| Quran Academy — https://quranacademi.com/ | Parent-specific kids copy, learning stages, scheduling and progress communication | Explain OQC's actual assessment/feedback process with real operational evidence |
| Salam Campus — https://salamcampus.com/ | Strong concise first-screen offer and quick proof/benefit scan | Use a clearer first-screen hierarchy without importing unverified claims or discount language |
| eQuran Academy — https://equranacademy.org/ | Package tiers, learning tools and progress-report positioning | Consider an original, teacher-reviewed placement checklist or Hifz revision planner only if Academics can maintain it |

**Patterns worth implementing, not copying:**
1. Country/currency selector that does not misrepresent FX estimates as approved local fees.
2. Package comparison with classes per week, minutes per lesson, monthly billing and trial eligibility.
3. A short explanation of what happens during the trial and what is confirmed by Admissions.
4. A parent-focused explanation of learner level, feedback, progress review and safeguarding—only the real OQC process.
5. A useful original learning tool that solves a parent/student problem and can earn genuine editorial references.

**Do not copy:** competitor wording, page designs, imagery, testimonials, student counts, teacher credentials, accreditation or discount claims. Do not publish comparative “best” claims without like-for-like evidence.

## 4. Immediate OQC implementation decisions

1. Keep the five existing indexable country hubs as the market owners. Do not bulk-index thin city records.
2. Keep course pages as the owner of course intent; connect country hubs to the most relevant existing courses.
3. Keep /free-trial as the conversion destination. Disclose: 3-day trial on eligible plans; Weekend plan excluded; no card needed on eligible plans.
4. Explain teacher preference as a request that is recorded; availability must be confirmed before enrolment.
5. Keep /contact as the contact-intent page and include the exact topic in visible main content.
6. Do not add hidden keyword lists or meta-keywords. Improve visible usefulness, titles, headings, internal links and answers.

## 5. Technical and performance evidence snapshot

The 5 November 2026 read-only audit (GitHub Actions run 288, fetched 11:26 UTC) checked 83 declared sitemap URLs:
- robots.txt and sitemap.xml returned HTTP 200; robots referenced the sitemap.
- 83/83 sitemap URLs were audited; no technical crawl findings were recorded.
- Public page quality audit reported zero metadata / hero-image quality failures; 56 top-image responses were checked with no failures.
- Lighthouse lab mobile performance: homepage 97, pricing 95, free-trial 97, UK hub 98, USA hub 96. Accessibility, best-practices and SEO scored 100 on every tested route.
- Desktop performance, accessibility, best-practices and SEO scored 100 on all five tested routes.
- Mobile LCP ranged from approximately 0.92s to 2.12s; mobile TBT ranged from 150ms to 219ms. These are single-run lab measurements, not field CWV or guaranteed repeatable scores.

Audit artifacts: [run 288 performance/SEO report](https://github.com/Ehtisham1239/app.com/actions/runs/42018380097/artifacts/13410931685) and [390px responsive screenshots](https://github.com/Ehtisham1239/app.com/actions/runs/42018380097/artifacts/13410712085). The responsive audit passed 312 checks across 24 pages, 12 widths and four device profiles, with no horizontal overflow. The live-production keyword audit found /contact did not yet contain its primary contact topic; PR #121 adds visible contact wording. Because PR checks crawl current production rather than an un-deployed preview, the keyword finding is now recorded report-only on PRs and will be enforced again after the change reaches production.

## 6. Ethical backlink work — current state

Existing prospect research is recorded in `content/seo-agent/link-prospects-2026-10-28.json` and `content/seo-agent/resource-pitch-2026-10-28.md`:
- RISE: a public resource-submission route was observed; draft pitch exists. AI-content policy and editorial suitability remain unconfirmed. Not sent.
- ISRE: resource recommendation invitation observed in a specific context; fit requires confirmation. Not sent.
- ISLA: contribution examples exist, but eligibility is conditional; do not purchase membership for a link. Not sent.
- Ihsaan Home Academy: excluded because its published policy rejects AI-generated submissions.
- Generic local directories and Google Business Profile are excluded for OQC's online-only model.

**No new backlink is claimed.** A placement counts only after the public referring page is verified, the link points to the intended canonical OQC resource, its context and rel attribute are recorded, and the page is accessible. Outreach requires owner-approved sender/channel and academic review of educational resources. No paid links, PBNs, bulk directory submissions, fake identities or mass automated outreach.

## 7. Measurement requirements and next actions

- Obtain fresh GSC query/page exports by country and device; prioritize impressions with weak CTR and high-intent queries with low average position.
- Obtain Google Ads Keyword Planner or a verified SEO-suite export before assigning monthly search volume, CPC or difficulty.
- Compare the five country hubs and course pages against the same competitor set monthly; record exact URL/date and distinguish public claims from verified facts.
- Rerun mobile Lighthouse after each performance change; inspect long tasks and script attribution before removing or deferring any script.
- Track trial form starts, valid submissions, attended trials, paid enrolments and retention by landing page/country; do not optimize to traffic alone.

**Success standard:** VERIFIED COMPLETE only after code checks, preview QA and production URL/commit verification. Research, draft outreach and proposed placements remain RECOMMENDED / DRAFT READY until accepted and independently verified.
