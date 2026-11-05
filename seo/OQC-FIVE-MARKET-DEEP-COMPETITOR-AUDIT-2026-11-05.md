# OQC five-market competitor reverse-engineering and implementation audit
**Research snapshot:** 5 November 2026  
**Markets:** UK, USA, Canada, Australia, UAE  
**Scope:** Technical SEO, content, backlinks/entity citations, conversion, AEO/GEO/AI discoverability  
**Repository:** Ehtisham1239/app.com  
**Method:** Public competitor pages/search results + OQC source, live pages and read-only CMS evidence. This is not a localized rank-tracking export.

## 1. Executive finding

OQC already has a solid technical and international foundation:
- Five canonical market hubs with country/city time-zone handling and local currency support.
- Market guides explain online-only delivery, local time planning, course pathways, parent/guardian enquiries and market-specific privacy/marketing considerations.
- A country-aware free-trial journey with the 3-day offer restricted to eligible plans; the Weekend plan is excluded.
- Pricing pages with currency-aware plan display and a fee comparison flow.
- Teacher discovery backed by CMS records; a read-only aggregate check returned 6 active public teacher profiles.
- Organization/EducationalOrganization, WebSite, WebPage, Article/BlogPosting, FAQ and teacher-related structured data where supported by page content. Robots policy permits major search/answer crawlers including OAI-SearchBot and PerplexityBot.

The largest visible trust gap is evidence presentation: the CMS aggregate check returned 0 published testimonials and 0 published testimonials with a consent timestamp. Competitors emphasize parent progress updates, dashboards/portals, monthly assessment and learning tools. Those are competitor claims, not evidence that OQC offers the same features. OQC must not promise these until Academic/Operations verifies the workflow and records.

Next defensible improvements:
1. Parent decision support before enrolment.
2. Verified teacher evidence and an explainable progress-feedback process.
3. Clearer demonstration of OQC's actual learning method and practice resources.
4. Evidence-based editorial citations and earned links.
5. Search Console / GA4 conversion baselines before claiming ranking or revenue gains.

## 2. Competitor set and observable patterns

The following is a research sample, not a top-10 ranking, quality ranking or proof that each provider outranks OQC for target queries. Public claims are self-reported unless independently corroborated. Prices and features change.

| Market | Public competitors/pages sampled | Patterns worth testing at OQC |
|---|---|---|
| UK | Learn Quran Academy; UK Quran Academy; Madani Islamic Academy; Her Quran Academy; British Quran Academy | UK schedules and GBP; trial journey; teacher choice; progress-report messaging; parent-facing safeguarding and course pathways |
| USA | Nouf Quran Academy; Her Quran Academy USA; eQuran Academy; Khan Quran Academy; Academy for Quran | ET/CT/MT/PT scheduling; parent/child pathways; USD pricing; course/fee comparison; trial form |
| Canada | Nouf Canada; Her Quran Academy Canada; Canadian Quran Academy; OnlineQuran.pk Canada; Khan Quran Academy | Coast-to-coast time zones; CAD fees; province/city context; parent communication; sibling options |
| Australia | Nouf Australia; Her Quran Academy Australia; Australian Quran Academy; Academy for Quran; Khan Quran Academy | AEST/ACST/AWST and DST; AUD fees; state/city scheduling; family routines and parent information |
| UAE | Madani UAE; Khan Quran Academy fee page; AQ Online Academy; Madani Dubai; OQC UAE page as internal benchmark | GST/Asia-Dubai scheduling; AED clarity; emirate-specific usefulness; online-only disclosure; parent-facing course and fee answers |


### Existing ten-provider monitoring sets and keyword map
The repository already contains a dated 10-provider monitoring set for each of the five markets, plus keyword clusters mapped to the existing country, course, pricing and trial URLs: `docs/seo-agent/OQC-FIVE-MARKET-COMPETITOR-KEYWORD-EXECUTION-MAP-2026-11-03.md`. Those are research watchlists, not “top 10” rankings. The current audit samples selected live public pages for feature-pattern comparison; it does not claim those providers outrank OQC in a verified localized SERP.

### Historical OQC Search Console sample
A small 28-day GSC sample was recorded in the 3 November keyword register:
- UK query “online Quran classes UK”: average position 13.3, 18 impressions.
- USA query “quran classes”: average position 31.5, 16 impressions.
- Australia query “online Quran classes Australia”: average position 95.6, 11 impressions.
- No comparable historical query sample was recorded there for Canada or UAE.

These are low-volume OQC query averages, not competitor rankings, search-volume estimates or a current baseline. They should guide which URLs to inspect first, not be used as a forecast. A fresh authorized GSC export is required before setting market-level ranking targets.

### Market-specific examples from public pages
These are observable page patterns, not independently verified service quality or proof of a higher Google rank.

| Market | Public page pattern observed | OQC lesson |
|---|---|---|
| UK | Her Quran Academy's UK page combines one-to-one positioning, a local time finder, GBP plans, after-school/weekend messaging and two trial lessons. Learn Quran Academy has previously surfaced a student portal and monthly assessment messaging. | OQC already has GBP-aware guidance and GMT/BST handling. Keep its own 3-day eligible-plan offer; improve the clarity of the post-submit steps and publish progress details only when Operations confirms the real SOP. |
| USA | Her Quran Academy shows ET-to-Pacific scheduling, daylight-saving reminders, USD plans and two trial lessons; Nouf describes local-time and currency options across four US zones. | OQC already has multi-zone scheduling and USD display. Compare actual class duration/frequency beside fee; never promise competitor-style 7-day availability or a specific time slot unless Admissions confirms it. |
| Canada | Nouf's Canada page describes Eastern/Central/Mountain/Pacific scheduling, CAD billing, course selection and rescheduling; Her Quran Academy also presents Canadian time zones and CAD. | OQC already has a Canada hub, CAD-aware display and IANA city/time-zone planning. Ensure any converted amount is clearly an estimate unless the owner approves a CAD-denominated plan. |
| Australia | Her Quran Academy lists AEST/ACST/AWST and DST but shows USD pricing; Australian Quran Academy lists prices by lesson duration and weekly frequency, while the displayed dollar sign is not itself proof of AUD. | OQC's AUD display and city-aware time zones are useful. Show lesson duration/frequency with approved prices and never infer competitor currency from a bare “$”. |
| UAE | Her Quran Academy describes Gulf Standard Time, AED plans, online-only delivery and coverage across emirates. | OQC already has Asia/Dubai time, AED-aware display and an online-only disclosure. Keep UAE regulatory guidance linked to the official UAE Media Council and avoid implying a local centre or licence. |

Sources: [Her Quran Academy UK](https://herquranacademy.com/online-quran-classes-uk/), [Her Quran Academy USA](https://herquranacademy.com/online-quran-classes-usa/), [Nouf Canada](https://www.noufquranacademy.com/online-quran-classes/canada), [Her Quran Academy Australia](https://herquranacademy.com/online-quran-classes-australia/), [Australian Quran Academy pricing](https://australianquranacademy.com/pricing/), [Her Quran Academy UAE](https://herquranacademy.com/online-quran-classes-uae/), [Learn Quran Academy](https://learnquraan.co.uk/).

### High-value examples inspected
- Learn Quran Academy presents a student portal, monthly assessment, teacher choice and a three-day trial.
- UK Quran Academy presents progress reports, a student app, teacher claims, parent visibility and a multi-step trial path. Its opened page also showed inconsistent-looking counters (zero active students / zero Trustpilot rating alongside testimonials), a reminder to treat competitor claims cautiously.
- Nouf Quran Academy describes local schedules for US, UK, Canada and Australia time zones and currencies.
- Madani Islamic Academy's UAE page describes GST scheduling, course/pricing details and parent-progress messaging. Company, teaching-history, review and safeguarding claims remain competitor self-claims.
- Khan Quran Academy's fee page lists USD/GBP/CAD/AUD/AED options and claims monthly assessment and progress reports.
- OQC's UAE page already uses Asia/Dubai time and explicitly says it does not represent a UAE teaching centre or branch.

## 3. OQC audit by workstream

### A. Technical SEO
**Confirmed in source**
- Canonical market and city routes exist.
- Country metadata supports locale/hreflang for priority markets.
- Sitemap is generated from approved page/location/content data; robots rules disallow private/admin routes while allowing relevant search/answer crawlers.
- Structured data uses shared helpers and visible CMS/page content.
- Free-trial page emits WebPage and FAQ data; pricing and teacher pages emit relevant schema.
- Previous implementation records report route/canonical/redirect and mobile checks. Selected-page Lighthouse results do not replace sitewide field Core Web Vitals.

**Unknown / requires access**
- No current Search Console export was available. Indexed URL count, canonical selection, query positions, CTR, country rankings and crawl issues are unknown.
- No GA4 realtime/debug or conversion export was available. Trial-to-attendance-to-paid attribution requires access.
- No live Rich Results Test / Search Console URL Inspection result was produced in this audit.
- Allowing AI crawlers does not guarantee citation, visibility or ranking.

**Decision:** retain the existing URL architecture. Do not create city pages or bulk redirects as a competitor imitation. Validate production HTML, schema and canonical URLs after CI; validate key URLs in Search Console once access is authorized.

### B. Content and search intent
**Strengths:** course, audience, teacher, pricing, FAQ, blog and country routes already exist. Market guides include time-zone, parent enquiry, privacy/marketing and local regulator guidance. OQC's distinct framework is Learn → Practice → Assessment → Feedback → Improvement.

**Gaps:** competitors explain what happens after a lesson through reports, dashboards, portal notes, quizzes and homework. OQC's teacher page explains that parents can ask about qualifications and feedback but did not previously provide a visible pre-enrolment checklist. Public teacher profiles should be backed by internal evidence and consent. Published testimonial evidence is absent from current CMS aggregate counts; do not add testimonial cards or review aggregate schema until records and consent exist.

**Safe implementation in this PR:** add an original parent decision checklist to teacher discovery. It asks families to confirm teacher fit, progress feedback, child privacy/participation, schedule, trial eligibility and fees. It explicitly labels these as questions to confirm—not features OQC guarantees. It does not invent a report cadence, recording policy, DBS check, portal, safeguarding certification or dashboard.

**Next evidence-gated content work**
1. Academic team approves a public description of the real learning cycle, including what is assessed and by whom.
2. Operations documents whether progress updates are shared, their cadence, recipients and channel. Publish only after the SOP is in use.
3. Teacher evidence register: approved public name/photo, specialism, qualification proof, language, experience evidence and consent.
4. Review evidence workflow: source or first-party feedback record, exact wording, consent timestamp, course/country where permitted and moderation record.
5. Refresh existing blog content before creating new articles; internal editorial ceiling remains 1,000 words, with primary sources and qualified review for Islamic/legal topics.

### C. Backlinks and entity citations
Existing register records Facebook, Instagram, X and Trustpilot URLs as website-linked profiles, but admin ownership/profile edits are marked unverified. Search Console and Bing Webmaster are search tools, not business-directory citations. Apple Business, LinkedIn, YouTube and editorial resource opportunities remain owner-controlled and not completed. GBP and physical-address directories are excluded because OQC is online-only and has no eligible customer-facing branch.

**Legal strategy:** create useful parent/teacher resources that relevant Islamic education organizations and educational resource sites may choose to reference. Prepare original academic explainers and printable practice resources with academic review. Check eligibility/editorial rules before submission. No paid links, mass submissions, link exchanges, PBNs, fake author accounts or automated outreach. Maintain one accurate global brand identity; do not create city NAP citations or fictitious local offices.

**Measurement limitation:** no Ahrefs/Semrush/Majestic backlink export or verified referring-domain report was available. Domain Rating, competitor backlink counts, link gaps and toxicity scores are unknown.

### D. Conversion
**OQC already has:** country-aware trial form; accurate three-day trial wording for eligible plans; Weekend exclusion; no-card wording for eligible plans; course and teacher preference; currency-aware pricing and comparison; market CTAs that carry country/currency context.

**Competitor patterns:** short staged registration, clear next steps, local fees, trial details, parent reassurance, teacher matching, progress visibility and family pricing. Competitor app/portal/report claims are not OQC features unless verified in OQC portal and SOP.

**Safe experiments:** measure start → validation error → successful submit → coordinator contact → trial scheduled → trial attended → paid enrolment. Use consent-compliant analytics and do not send child personal data to ad platforms. Test one CTA/form change at a time. Show approved local fee values only; label FX estimates as approximate. Add a “what happens after you submit” SLA only after Admissions confirms it.

### E. AEO/GEO and AI discovery
**Confirmed:** robots policy allows relevant search/answer crawlers; the site has direct answers, FAQs, course pages, market explanations, teacher entities and article metadata. Organization schema authenticity is included in this consolidated release PR (#115).

**Improve:** keep answers visible in HTML, concise, source-backed and consistent with actual delivery. Publish author/reviewer qualifications only when documented. Attach primary government/regulator sources to privacy, time-zone, marketing and consumer claims. Build original methodology pages and practice resources after academic review. Do not use Review/AggregateRating markup for unverified or third-party ratings. Measure AI referrals/citations only where analytics/referrer evidence exists; do not invent an “AI ranking” score.

## 4. Priority implementation register

| Priority | Action | Evidence owner | Acceptance |
|---|---|---|---|
| P0 | Parent pre-enrolment checklist on teacher page | Web implementation; non-claiming copy | CI, mobile layout and link checks pass |
| P0 | Complete the Organization schema correction in this release PR (#115) | CI + Vercel | No unverified foundingDate; live schema validates |
| P1 | Teacher evidence register/profile review | HR + Academic + consent | Every public claim has evidence and permission |
| P1 | Document actual student progress feedback SOP | Academic + Operations | Cadence/channel/sample approved before copy |
| P1 | Test country trial conversion funnel | GSC/GA4/CRM access | Landing → trial → attendance → admission events reconciled |
| P1 | Revalidate country hub content/indexability | SEO + local sources | Unique useful content; accurate IANA zones; no doorway pages |
| P2 | Earned editorial resource programme | Owner approval + academic review | Genuine editorial acceptance/link; no paid manipulation |
| P2 | AEO/GEO author and citation improvements | Academic/legal reviewers | Source accuracy and visible page content verified |

## 5. PR and test plan

This audit is paired with consolidated implementation PR #115 that:
- adds the parent pre-enrolment checklist to src/app/(site)/teachers/page.jsx;
- adds regression assertions in tests/seo.test.mjs;
- includes this report as the decision record.

Required checks: automated tests, ESLint, production build, responsive audit (mobile/tablet/desktop), live performance audit, preview smoke tests for /teachers, /free-trial and all five market hubs, and a content review confirming no unverified safeguarding, progress-report, recording, portal or branch claims.

Production deployment is not claimed until all required checks pass, the PR is merged, Vercel production deployment reports READY for the merged commit, and production smoke tests pass.

## 6. Evidence sources sampled

### Competitor pages
- https://ukquranacademy.com/
- https://learnquraan.co.uk/
- https://www.noufquranacademy.com/online-quran-classes
- https://herquranacademy.com/online-quran-classes-uk/
- https://herquranacademy.com/online-quran-classes-usa/
- https://herquranacademy.com/online-quran-classes-canada/
- https://herquranacademy.com/online-quran-classes-australia/
- https://canadianquranacademy.com/pricing/
- https://australianquranacademy.com/pricing/
- https://khanquranacademy.com/fee
- https://madaniislamicacademy.com/
- https://madaniislamicacademy.com/online-quran-classes-in-uae/
- https://madaniislamicacademy.com/online-quran-classes-in-dubai/
- https://equranacademy.org/
- https://academyforquran.com/

### Google policy references
- https://developers.google.com/search/docs/essentials
- https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- https://developers.google.com/search/docs/essentials/spam-policies
- https://developers.google.com/search/docs/appearance/structured-data/sd-policies
- https://developers.google.com/search/docs/appearance/structured-data/organization
- https://developers.google.com/search/docs/appearance/structured-data/review-snippet

## 7. Status and boundaries
- Public competitor pattern review: completed for this research sample.
- OQC source/CMS audit: completed for the files and aggregate records inspected.
- Parent checklist code change: prepared in PR branch; CI pending.
- Backlink metrics and exact SERP positions: unknown / require GSC or backlink-tool access.
- Production deployment: not yet claimed.
- Ranking outcome: not guaranteed and not measurable from this audit alone.


## Stale search-index snapshot requiring owner-console verification
A public search/open snapshot of the homepage returned a legacy cached page containing old student-count, country-count, 24/7 support, tutor-count and testimonial claims. The newer indexed homepage snippet presents the current online-only positioning, three-day eligible-plan trial and current course/fee flow. A separate older pricing snippet still advertises a seven-day trial, while the newer pricing page shows the three-day offer and Weekend-plan exclusion. These older snapshots are not proof that the current production HTML contains the old claims.

**Action:** after deployment, fetch the canonical homepage, UK landing page and pricing URL directly; compare their rendered content and canonical/redirect headers. Then use authenticated Search Console URL Inspection to request recrawl of the canonical URLs and monitor snippets. If stale claims are only in Google's cache, do not re-add them to current copy. If they remain in live HTML, remove or substantiate them before recrawl. Search Console access and recrawl confirmation remain unverified in this audit.
