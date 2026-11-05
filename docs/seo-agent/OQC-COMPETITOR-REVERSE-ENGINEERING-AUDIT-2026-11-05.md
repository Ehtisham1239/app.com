# OQC five-market competitor reverse-engineering & implementation audit
**Audit date:** 5 November 2026  
**Markets:** United Kingdom, United States, Canada, Australia, United Arab Emirates  
**Scope:** Technical SEO, content, backlinks/citations, conversion, AEO/GEO and entity trust  
**Repository:** https://github.com/Ehtisham1239/app.com  
**Canonical website:** https://www.onlinequrancollege.com

## 1. Executive conclusion

OQC already has a substantial SEO and conversion foundation. The correct strategy is not to clone competitor pages or mass-publish city pages. It is to improve the proof, local commercial clarity and external authority around the five existing market hubs.

### Strong existing OQC capabilities
- Five distinct indexable country hubs with country-specific guidance, local-time planning and service-area schema.
- A global homepage that remains the canonical root; no forced country redirect.
- Six live course categories and a course-selection/learning-guide hub.
- A three-day trial on eligible plans; Weekend plan excluded; the trial page explains the coordinator hand-off.
- Published monthly packages, currency conversion guidance, sibling discount and a plan comparison tool.
- Public teacher profiles, a female/male teacher request flow and a private parent/results route.
- Free printable Quran trackers and a public practice-resource page.
- Editorial standards, a public `llms.txt`, Organization/WebSite JSON-LD, BlogPosting, breadcrumb, FAQ and Service structured data.
- Search-agent access for Google, Bing, OAI Search, Claude Search and Perplexity while private routes remain disallowed.
- An existing ethical backlink prospect register and five-market keyword map.

### Highest-impact gaps
1. **Local price certainty:** the live pricing database currently stores USD amounts only. GBP/CAD/AUD/AED values are display conversions or estimates, not separately approved local price schedules. Competitors commonly show fixed local currency packages with lesson frequency and duration. OQC should not invent or hard-code local prices; the owner must approve actual local prices or explicitly retain the estimate-and-confirm model.
2. **Teacher evidence:** the CMS currently has six public active teacher records. All six contain qualification text, languages, years of experience and a verification note, but none has a public photo. A note is not independent proof of a credential. Publish only evidence that Admissions/Academics can substantiate and that the teacher has consented to share.
3. **Progress proof:** competitors foreground parent portals, lesson notes, monthly/weekly reports and progress tracking. OQC describes a learning cycle and has a parent/results route, but a clear public explanation or an approved anonymised example of the actual parent update would reduce uncertainty. Do not fabricate a student report or outcome.
4. **External identity citations:** Trustpilot is publicly claimed and currently shows 9 reviews and a 4.3 TrustScore, with one review in the last 12 months in the latest search snapshot. Facebook, Instagram and X are configured in CMS, but direct account/admin verification was not available. The PR therefore narrows Organization `sameAs` to the claimed Trustpilot profile until the other profiles are confirmed.
5. **Legal entity history:** CMS has a residual `established=2018` value, a LinkedIn page claims “Trusted since 2014”, a secondary company index lists a current same-name company incorporated in March 2026, and Companies House directly confirms a different same-name company (13629654) was dissolved in February 2024. These facts may refer to a brand, a new legal entity and a former entity; they must not be conflated. Do not publish a founding year, company number, registered address or legal-history claim until the owner reconciles documentary evidence.
6. **Ranking evidence:** the last available GSC query sample in the repository covers only 25–30 October 2026 and has very small impressions. There is no fresh authenticated GSC/GA4 export in this audit. Competitor SERP appearances are not proof of their exact rank, traffic or market share.

No ranking or AI-citation outcome is guaranteed. The goal is more qualified trial enquiries, attendance, admissions and retention, measured through GSC, GA4 and the admissions system.

## 2. Method and evidence boundaries

This is a deep public-footprint and source/CMS audit, not a paid SEO-suite crawl or a geo-localised top-10 ranking study.

Evidence used:
- Public competitor pages/search snapshots checked on 5 November 2026.
- OQC public search snapshots and the current source repository.
- Read-only Supabase settings, pricing and teacher-record aggregates.
- Existing OQC GSC query sample dated 25–30 October 2026.
- Existing citation, keyword, blog and competitor registers.

Competitor statements such as “certified”, “DBS checked”, student counts, teacher counts, awards, “best”, and prices are their own published claims. They have not been independently audited and must not be copied into OQC copy.

## 3. Competitor reverse-engineering by market

The competitors below are a representative watchlist surfaced in market research, not a verified ordered Google ranking. Public pricing changes frequently; compare only when class duration, frequency, trial terms, currency and billing basis match.

| Market | Competitor examples and visible tactics | What appears to help their conversion | Legal OQC adaptation |
|---|---|---|---|
| UK | Learn Quran Academy (learnquraan.co.uk): GBP packages, 3-day trial, student portal and lesson progress notes. UK Quran Academy (ukquranacademy.com): UK schedules, trial, parent progress messaging and an app. Her Quran Academy: after-school/weekend planning and UK local-time guidance. | Local GBP prices, explicit lesson frequency, parent visibility, trial steps and teacher choice. | Keep the existing UK hub; show approved GBP amounts if owner supplies them, with classes/week and minutes beside each amount. Explain the real parent update process and keep the Weekend trial exclusion prominent. |
| USA | QuranMentors (quranmentors.com): USA-focused 1:1 trial funnel and course coverage. eQuran Academy (equranacademy.org): placement-test and Hifz-planner tools, USD plans and progress messaging. Her Quran Academy: scheduling across US time zones. | Time-zone coverage, placement/goal guidance, interactive tools, transparent plan tiers and family-focused content. | Keep the existing US hub and date-aware time planner. Extend the existing course-choice table rather than cloning a competitor quiz; any new assessment must be teacher-reviewed and clearly labelled as a self-check, not a Tajweed grade. |
| Canada | Her Quran Academy: Atlantic-to-Pacific scheduling and CAD prices. Online Quran Academy USA (onlinequranacademy.us): Canada comparison content. OnlineQuran.pk: CAD plan display with frequency and lesson length. | CAD clarity, multi-time-zone scheduling, parent/guardian information and decision-stage comparison content. | Keep the Canada hub as the sole commercial country destination. Add actual CAD prices only after approval; keep CASL and child-privacy guidance linked to official sources. |
| Australia | Her Quran Academy: AEST/ACST/AWST scheduling. OnlineQuran.pk: AUD plan display and family offer. Australia Quran Academy: AUD package tiers and pay-as-you-learn messaging. | State-specific daylight-saving clarity, AUD price presentation, school-time scheduling and flexible terms. | Keep the existing Australia planner and state guidance. Make the fee estimate label unmistakable unless Admissions approves AUD-denominated packages. |
| UAE | Her Quran Academy: AED prices and Gulf Standard Time. Salam Campus: UAE page, parent portal, AED plans and free first class. Khan Quran Academy: AED price matrix across weekly frequencies. | AED prices, GST/Asia-Dubai scheduling, clear online-only service, parent portal and first-class trial. | Keep the UAE hub and its seven-emirate coverage. Use Asia/Dubai time and AED estimates honestly; do not claim UAE licensing, local offices, local teachers or in-person services. |

### Cross-market competitor patterns
1. Local price display is useful only when it is the real amount payable, not an unlabelled FX conversion.
2. Parents want to understand what happens after a lesson: feedback, revision, progress review and how to raise a concern.
3. A free trial converts better when the page says what the learner will experience and what happens next.
4. Teacher fit is more than “male/female”: families need to ask about language, relevant experience, qualifications and availability.
5. Interactive utilities can earn links when they solve a real problem and are accurate. OQC already has a course-choice guide, printable Hifz/Noorani Qaida trackers and time planners; avoid launching redundant thin tools.
6. Competitor comparison articles can attract queries, but self-ranked “top 10” pages are not independent proof. OQC should publish a comparison only with transparent criteria, date stamps, sourced facts and disclosure.

## 4. OQC current implementation map

### Technical and information architecture
- Canonical root remains `/`; country hubs are `/locations/{country}`.
- The five priority hubs are UK, USA, Canada, Australia and UAE.
- City routes are noindex by default unless specifically reviewed; do not mass-index all city URLs.
- Sitemap generation filters noindex and alternate-canonical content.
- Robots rules allow public search agents and disallow private/admin/API/parent routes.
- Organization and WebSite JSON-LD are in the shared layout; country pages use Service, Breadcrumb and visible FAQ data; articles use BlogPosting and Breadcrumb.
- No LocalBusiness or physical postal address is asserted for the online-only service.
- `llms.txt` lists public pages, courses, market hubs, learning articles and editorial standards.
- Previous QA recorded a 76-URL sitemap crawl with zero findings and 49 image responses checked. This is a prior code/QA result, not proof of current indexing or field Core Web Vitals.

### Content
- The 4 November CMS audit records 32 published articles and 3 in review. The 12 newer posts checked in that audit are under the OQC 1,000-word editorial ceiling and have SEO titles, descriptions, focus keywords and cover alt text.
- The free printable resources page already offers Ramadan, Hifz, Noorani Qaida and Makharij trackers. This is a stronger linkable asset than another generic “best academy” article.
- The five market hubs already have distinct time-zone, privacy/consumer and local-enrolment guidance with visible official source links.
- Religious content still requires academic review; disputed or fatwa-level content requires qualified scholar review. Search citations are not evidence for a religious ruling.

### Teacher and trust data
Read-only CMS aggregate on 5 November:
- 6 public active teacher records.
- All 6 have qualification text, language entries, years-of-experience values and an internal verification note.
- 0 have a public photo URL.
- This does not independently validate the documents behind the qualification text. Do not use “certified”, “Ijazah”, “Al-Azhar”, “DBS” or similar claims unless the relevant evidence has been checked and can be disclosed accurately.

### Pricing and conversion data
Read-only CMS pricing aggregate on 5 November:
- Six published public plans.
- Each plan has a USD price only in `pricing_plan_prices`.
- Standard plans store 2, 3 or 4 classes per week, 30 minutes per class and 3 trial days; the Weekend plan stores 0 trial days.
- The public pricing UI can show currency conversions, but these are not independent approved GBP/CAD/AUD/AED price records.
- The public offer is a three-day trial on eligible plans, with the Weekend plan excluded; teacher and timetable availability are confirmed by Admissions.
- A 15% sibling discount is described on the public pricing page.

### Analytics and measurement
- CMS has GTM `GTM-W7CMZS53` and GA4 `G-57TGPTDNT4` configured.
- Source implements page views, lead-saved signals, contact clicks and Web Vitals; it avoids sending query strings, form values and certificate numbers.
- No fresh authenticated GA4 DebugView or report export was retrieved in this pass.
- The current cookieless implementation grants analytics storage in code without a consent banner. This needs owner/legal review for UK GDPR/PECR and applicable market requirements; do not treat this audit as legal certification or silently change the owner’s analytics decision.

## 5. Search performance baseline and priorities

The repository's last supplied GSC query sample covers 25–30 October 2026. It is a short, low-volume sample, not a current ranking report:

| Market | Example query | Impressions | Average position | Interpretation |
|---|---|---:|---:|---|
| UK | online quran classes uk | 18 | 13.3 | Best visible commercial starting point; strengthen the UK hub and trial path. |
| USA | quran classes near me | 7 | 29.4 | Low sample; improve commercial country intent, not generic local-office language. |
| Canada | online quran classes canada | 1 | 83.0 | Too little data to infer trend; build authority and validate indexing. |
| Australia | online quran classes australia | 13 | 89.7 | Largest recorded commercial gap in the sample; prioritise the Australia hub and relevant links. |
| UAE | No query row in this supplied sample | — | — | Treat as no baseline in this file, not proof of zero impressions. |

**Priority order:** UK (closest visible commercial intent), Australia (poor average position despite impressions), USA (build country-intent visibility), Canada (early signal), UAE (newer hub; establish a baseline). Re-evaluate after fresh GSC query/page/country/device data is available.

## 6. Backlink and citation audit

### Verified / visible
- Trustpilot public profile is marked claimed and currently displays 9 reviews and a 4.3 TrustScore in the latest search snapshot. It shows one review in the last 12 months; the latest visible review is dated 2 November 2026. This is a small review sample, not a broad reputation survey.
- Country pages link to official government/regulator sources for relevant guidance. These are editorial references, not endorsements of OQC and not acquired backlinks.
- Existing website CMS links include Facebook, Instagram and X, but direct page retrieval/admin verification was unavailable. They remain ordinary linked profiles until the owner confirms them.

### Prospects (not acquired)
- ISRE (Australia): resource recommendation invitation observed; academic fit and submission conditions need confirmation.
- ISLA (USA): blog contribution examples exist; non-member eligibility and editorial policy need confirmation.
- RISE (Canada/international): resource submission channel exists; fit and AI policy need confirmation.
- Ihsaan Home Academy: excluded because its published policy rejects AI-generated guest posts.
- MCB, ISNA Education Forum and Muslim Teachers Association remain held pending direct eligibility/editorial verification.

No outreach, directory submission, paid placement or external profile creation was performed. The current register records no acquired backlink from these prospects. Google Business Profile and local directories remain excluded for the online-only model unless actual customer-facing premises and platform eligibility change.

## 7. Entity, schema and citation implementation in this PR

1. Remove the CMS `established` field from Organization `foundingDate`. The current CMS value is 2018, but public evidence is inconsistent; no founding date is asserted.
2. Keep the EducationalOrganization/Organization entity, canonical website, logo, contact data, five online service areas, subject expertise and editorial-standards link.
3. Keep the postal-address guard: no address is emitted unless a complete street address and country code are configured.
4. Restrict Organization `sameAs` to the claimed Trustpilot profile with the exact OQC domain path. Facebook, Instagram and X remain normal outbound links until owner verification.
5. Change `llms.txt` wording from “only official profiles” to a transparent disclosure that configured links are present but the existence of a website link alone does not prove account ownership.
6. Do not add AggregateRating/Review schema from Trustpilot data, invent a local business entity, add a physical address, or insert unverified credentials.

## 8. Prioritised implementation register

| Priority | Work | Current status | Closure evidence |
|---|---|---|---|
| P0 | Authentic Organization schema and profile identity gate | Implemented in this PR branch | Tests pass; deployed JSON-LD contains no foundingDate and only verified sameAs. |
| P0 | Confirm legal contracting entity, company number, founding/brand history and public registered-office wording | Owner evidence required | Official Companies House record plus owner confirmation of the entity that contracts with families. |
| P0 | Decide actual GBP/CAD/AUD/AED prices or retain explicitly labelled estimates | Owner/Admissions decision | Approved written price schedule by currency, class frequency and duration. |
| P1 | Verify teacher credentials and consent for public profiles/photos | Academic/HR approval | Evidence register, consent, profile QA; no AI-generated teacher portraits. |
| P1 | Publish a truthful explanation/sample of the actual parent progress update | Academic/Operations approval | Approved redacted sample or clearly illustrative template and documented operating cadence. |
| P1 | Obtain fresh GSC and GA4 evidence | Requires account access | Property verified, sitemap success, current query/page/country/device exports, trial and enrolment events checked. |
| P1 | Privacy review of cookieless analytics behaviour | Legal/owner review | Written decision and any required consent implementation. |
| P2 | Submit genuinely useful resources to ISRE/ISLA/RISE | Draft/research only | Owner-approved sender and content, publisher acceptance, public URL recorded. |
| P2 | Add verified social profiles to Organization sameAs | Owner-controlled | Admin/ownership confirmation and matching public brand/contact details. |

## 9. Source register

### OQC public pages
- https://www.onlinequrancollege.com/
- https://www.onlinequrancollege.com/locations/united-kingdom
- https://www.onlinequrancollege.com/locations/united-states
- https://www.onlinequrancollege.com/locations/canada
- https://www.onlinequrancollege.com/locations/australia
- https://www.onlinequrancollege.com/locations/united-arab-emirates
- https://www.onlinequrancollege.com/pricing
- https://www.onlinequrancollege.com/free-trial
- https://www.onlinequrancollege.com/teachers
- https://www.onlinequrancollege.com/free-quran-learning-resources
- https://www.onlinequrancollege.com/editorial-standards
- https://www.onlinequrancollege.com/llms.txt

### Competitor pages reviewed
- https://learnquraan.co.uk/
- https://ukquranacademy.com/
- https://herquranacademy.com/online-quran-classes-uk/
- https://quranmentors.com/
- https://equranacademy.org/
- https://herquranacademy.com/online-quran-classes-usa/
- https://herquranacademy.com/online-quran-classes-canada/
- https://onlinequranacademy.us/top-10-online-quran-academies-in-canada/
- https://onlinequran.pk/canada/
- https://herquranacademy.com/online-quran-classes-australia/
- https://onlinequran.pk/australia/
- https://australia-quran.academy/pricing/
- https://herquranacademy.com/online-quran-classes-uae/
- https://salamcampus.com/online-quran-classes-uae/
- https://khanquranacademy.com/fee

### Trust, policy and identity references
- Trustpilot OQC profile: https://www.trustpilot.com/review/onlinequrancollege.com
- Google Organization structured data: https://developers.google.com/search/docs/appearance/structured-data/organization
- Google structured-data policies: https://developers.google.com/search/docs/appearance/structured-data/sd-policies
- Google spam policies: https://developers.google.com/search/docs/essentials/spam-policies
- Companies House former same-name record (13629654): https://find-and-update.company-information.service.gov.uk/company/13629654
- Secondary current-company index (requires official registry confirmation): https://companystack.co.uk/company/17075457
- LinkedIn page surfaced in search with “Trusted since 2014” wording: https://www.linkedin.com/company/online-quran-college-ltd

## 10. Release and evidence status

This report is based on current source/CMS inspection and dated public search snapshots. It does not assert:
- that competitors are objectively ranked in the order listed;
- that OQC has acquired any new backlink;
- that Google has indexed every URL;
- that AI answer engines cite OQC;
- that the current Google ranking has improved;
- that teacher credentials have been independently authenticated;
- that a production deployment has completed.

Update the release row only after the exact PR head SHA passes required tests, Vercel preview is ready, owner approval is recorded, and production smoke tests verify the canonical site.
