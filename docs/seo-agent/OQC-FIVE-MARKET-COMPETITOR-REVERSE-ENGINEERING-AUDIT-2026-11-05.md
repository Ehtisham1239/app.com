# OQC five-market competitor reverse-engineering audit — 5 November 2026

Markets: UK, USA, Canada, Australia, UAE. Scope: technical SEO, content, backlinks/citations, conversion and AEO/GEO/AI search.

## Executive conclusion
OQC already has a strong base: five market hubs, six course pathways, time-zone planning, online-only disclosures, pricing and trial journeys, visible FAQs, official guidance references, canonical/sitemap/robots controls, legacy redirects and automated SEO tests. The best strategy is to improve evidence, market-specific conversion and first-party measurement—not clone competitors or generate near-duplicate city pages.

## Highest-priority gaps
1. Search Console ownership/sitemap submission and GA4/GTM live event verification remain unconfirmed. Exact rankings, clicks, CTR, conversions and revenue attribution cannot be reported without these first-party data.
2. Pricing is uneven by market: USA has published USD packages; UK has a GBP quote path; Canada and Australia request approved local quotes; UAE shows approximate AED guidance. Finance-approved CAD/AUD/AED rates could reduce friction, but never invent prices.
3. Teacher trust: OQC avoids unsupported credentials and says Admissions confirms teacher fit. Competitors use public profiles and credential detail. Publish only HR-verified, teacher-consented profiles with exact evidence.
4. Parent progress proof: the site mentions monthly feedback. Add an anonymised, consented sample report and Academic-approved assessment rubric.
5. Legacy index cleanup: source includes permanent redirects for old UK/USA/Australia paths. A four-month-old indexed UK legacy page still exposes historical claims such as 3,000+ students, 24/7 support and teacher credentials. Treat this as a stale cached/indexed page, not proof of current live copy. Confirm the 301 and request re-indexing via GSC after access.
6. Official government/regulator links are useful references, not endorsements or acquired backlinks. Third-party profile ownership and edits require account-owner verification.

## Market-by-market competitor patterns

### UK
Examples reviewed: Learn Quran Academy, UK Quran Academy, Her Quran Academy, British Quran Academy UK.
Observed: GBP prices with weekly frequency; trial terms near CTA; parent progress reports/portals; school-hour scheduling and safeguarding language.
OQC action: retain the UK hub as country-intent owner. Consider a Finance-approved GBP rate card, verified teacher/safeguarding evidence and a sample progress update. Never copy DBS or qualification claims.

### USA
Examples reviewed: Her Quran Academy USA, Nouf Quran Academy USA, Quran Academy USA, QuraanClasses.us, Online Quran Lessons USA.
Observed: ET/CT/MT/PT scheduling; after-school windows; USD plans; parent observation/rescheduling policy; city/time-zone examples.
OQC action: USA hub already has multi-zone planning. Add serviceable after-school windows only after Admissions confirms staffing. Do not promise 24/7, all zones or parent observation unless operations support it.

### Canada
Examples reviewed: Canadian Quran Academy, Her Quran Academy, JoinQuran, OpenArabic comparison.
Observed: CAD pricing, class-duration comparison, multi-zone planning, sibling discounts and clear rescheduling terms.
OQC action: keep the honest CAD quote-first position unless Finance approves a rate card. Add concise Toronto/Vancouver time-zone examples linked to the existing planner; do not create duplicate city pages.

### Australia
Examples reviewed: Her Quran Academy, Learn Quran Academy, JoinQuran, QuranHost.
Observed: AEST/AEDT, ACST/ACDT and AWST clarity; AUD pricing; after-school windows; worksheets and Hifz/Tajweed resources.
OQC action: current hub already offers five time zones and requests approved AUD fees. Add one maintained teacher-reviewed Hifz revision planner or Tajweed practice checklist, with author/reviewer and references. Publish AUD fees only after approval.

### UAE
Examples reviewed: Her Quran Academy UAE, Bait ul Izzah Quran Academy, JoinQuran, QuranHost.
Observed: AED prices, Gulf Standard Time, after-school slots and explicit online-only disclosures.
OQC action: current hub uses Asia/Dubai time, lists seven emirates, provides approximate AED guidance and states no UAE branch/trade licence. Keep disclosure. Do not create GBP/local listings without genuine eligibility and premises.

## Cross-market comparison

| Feature | Competitor pattern | OQC position | Recommendation |
|---|---|---|---|
| Trial | Free diagnostic/taster lessons | Three-day trial on eligible plans; Weekend excluded | Measure form start, valid submit, booking and attendance |
| Scheduling | Local zones and after-school slots | Date-aware country planners | Admissions-approved availability windows |
| Pricing | Local currency and class frequency | USD packages; other markets vary | Finance-approved rates or quote-first clarity |
| Teacher trust | Profiles and credential evidence | Teacher page; Admissions confirms | HR-verified profiles and consent |
| Parent visibility | Portals and progress reports | Monthly feedback promise | Sample anonymised report and rubric |
| Learning resources | Worksheets, Tajweed/Hifz tools | Blog and guides | Original, maintained resources |
| Reviews | Public reviews/testimonials | Consent-aware review flow | Neutral requests; no incentives or filtering |
| Local presence | Local phone/office claims | Online-only model | Do not simulate branches or fake NAP |

## Technical and AI-search audit

### Present in source / previous QA
- Shared WebSite and EducationalOrganization graph with stable identifiers.
- Canonical metadata, Open Graph/Twitter metadata, sitemap inclusion rules, robots rules and legacy redirects.
- Breadcrumb schema and Service schema for online market/city pages without false postal addresses.
- FAQ data tied to visible FAQ content; course, teacher and location schema generated from page data.
- Public crawling allowed for major search and AI-search bots while private/admin/API routes are blocked.
- Image optimisation, responsive image manifests and prior automated SEO/responsive/Lighthouse checks.
- SEO/content tests, route/canonical checks and production build workflow.

### Organization schema correction in related PR
CMS `site.identity.established` contained 2018 and was previously emitted as Organization `foundingDate`. Public company-record search identifies ONLINE QURAN COLLEGE LTD as incorporated in 2026. Brand history and legal-company incorporation are different facts. Related PR removes the unverified date and adds a regression test. Do not add company number, registered-office address, founding date or LocalBusiness markup without primary evidence and owner approval.

### Remaining technical checks
- Validate rendered JSON-LD on homepage and five hubs with Rich Results Test / Schema Markup Validator after deployment.
- Confirm indexable URLs are self-canonical, sitemap URLs return 200, redirects are single-hop, and old routes return 301/308.
- Run mobile trial flow, form errors, accessibility, image LCP/layout shift, Lighthouse and live sitemap crawl after deployment.
- Verify GSC ownership, sitemap submission and URL inspection; verify GA4/GTM Realtime/DebugView and consent behavior.
- Separate lab Lighthouse from field Core Web Vitals; lab scores are not field data.

## Content, AEO and GEO
Keep URL ownership: country hubs own country commercial intent; course pages own course intent; /free-trial owns conversion; guides/blog answer informational questions; city pages remain noindex by default unless unique value and demand justify indexing.

Priority original content:
1. What happens in OQC's three-day trial? Explain steps and eligibility accurately.
2. How Quran reading progress is assessed: Academic-approved rubric for baseline, makharij, accuracy, fluency, Tajweed and revision.
3. An anonymised, consented sample parent progress report.
4. Teacher-reviewed Hifz revision planner explaining Sabaq, Sabqi and Manzil.
5. Country time-zone guides with DST caveats and confirmed service coverage.
6. Parent checklist covering teacher fit, safeguarding, parent involvement, lesson duration, rescheduling and refunds.

AEO/GEO controls: direct answer first; named author/reviewer only with approval; primary sources for regulatory/privacy/time-zone claims; original OQC evidence for operational claims; visible HTML answers; JSON-LD describes accurate visible content only. No fake ratings, reviews, accreditation or AI-search markup tricks. Religious rulings and disputed Qur'an/Hadith interpretation require qualified scholar review and exact references.

## Backlinks and citations
Market hubs contain official guidance references. Existing social/Trustpilot URLs are recorded, but ownership is not independently verified. Government links are not endorsements or acquired backlinks.

Lawful plan:
1. Contribute original parent checklists and teacher-reviewed resources to relevant Muslim family/community organisations.
2. Seek genuine education/community partnership mentions where OQC provides real value.
3. Offer expert-reviewed explainers to relevant publishers; disclose affiliation and avoid paid followed links.
4. Keep organisation name, website and contact consistent on accounts OQC controls.
5. Use Ahrefs/Semrush/Moz only after authorised access; manually validate competitor link gaps.

Reject paid followed links, PBNs, bulk directories, automated comments/forum links, fake citations, fabricated press, review gating/incentives, copied competitor assets, or local listings without eligibility.

## Conversion and measurement
Track by market/page/source: organic landing → CTA click → trial form start → valid submission → qualified lead → trial booked → trial attended → paid enrolment → 30/60/90-day retention.

Events: trial_cta_click; trial_form_start; trial_form_submit (server-confirmed only); trial_qualified; trial_booked; trial_attended; enrollment_paid; contact_whatsapp_click; contact_email_click. Do not send learner names, phone/email, child details or Quran progress notes to GA4. Use consent-aware analytics and pseudonymous event IDs. A button click is not a booked trial or paid enrolment.

## Five-market watchlist
This is a monitoring list, not a ranked top-ten list or endorsement. Recheck current relevance and claims before comparing.

| Market | Competitor watchlist |
|---|---|
| UK | Learn Quran Academy; UK Quran Academy; Her Quran Academy; British Quran Academy UK; TarteeleQuran; Quran Schooling; QuranHost; Studio Arabiya; Mishkah Academy; Al-Azhar Quran Teaching |
| USA | Her Quran Academy; Nouf Quran Academy; Quran Academy USA; QuraanClasses.us; Online Quran Lessons; IQRA Network; Online Quran Academy USA; Tafheem ul Quran; Riwaq Al Quran; Studio Arabiya |
| Canada | Canadian Quran Academy; Her Quran Academy; JoinQuran; Quran Academy USA; Online Quran Academy USA; Tafheem ul Quran; EQuran School; Quran-Online.ca; Al Quran Desk; Ijaazah Academy |
| Australia | Her Quran Academy; Learn Quran Academy; JoinQuran; QuranHost; IQRA Network; Riwaq Al Quran; Studio Arabiya; Quran Schooling; Al-Azhar Classes; Shaykhi Academy |
| UAE | Her Quran Academy; Bait ul Izzah Quran Academy; JoinQuran; QuranHost; IQRA Network; Riwaq Al Quran; Studio Arabiya; Al-Azhar Classes; Shaykhi Academy; Quran In Depth |

## Prioritised backlog
| Priority | Work | Acceptance evidence |
|---|---|---|
| P0 | Organization schema correction | CI pass; rendered JSON-LD has no unverified foundingDate |
| P0 | Legacy URL/index cleanup | HTTP 301/308; GSC inspection after access |
| P0 | GSC + GA4/GTM verification | Ownership, sitemap, DebugView/Realtime and consent |
| P1 | GBP/CAD/AUD/AED pricing decision | Finance-approved dated rates or quote-first decision |
| P1 | Parent progress evidence | Academic-approved rubric and anonymised sample |
| P1 | Teacher profiles | HR verification, consent and qualification evidence |
| P1 | Trial funnel events | Server-confirmed submit and CRM lifecycle events; privacy review |
| P2 | Learning resources | Author/reviewer approval, references and accessible format |
| P2 | Editorial/community outreach | Manual prospect review, real contribution and transparent affiliation |
| P3 | City-page indexation | Demand + unique content + genuine utility + QA |

## Measurement criteria
Populate only from verified GSC/GA4/CRM exports. Report weekly by market: GSC clicks/impressions/CTR/average position; GA4 organic landing and consented funnel events; CRM qualified leads, attended trials, paid enrolments, revenue and retention; indexation/canonical/redirect health; field CWV where CrUX exists; relevant editorial referring domains with evidence. Never use raw backlink volume as the only success metric.

## Public sources reviewed

OQC:
- https://www.onlinequrancollege.com/
- https://www.onlinequrancollege.com/locations/united-kingdom
- https://www.onlinequrancollege.com/locations/united-states
- https://www.onlinequrancollege.com/locations/canada
- https://www.onlinequrancollege.com/locations/australia
- https://www.onlinequrancollege.com/locations/united-arab-emirates
- https://www.onlinequrancollege.com/pricing
- https://www.onlinequrancollege.com/free-trial
- https://www.onlinequrancollege.com/courses
- https://www.onlinequrancollege.com/faq

Competitors:
- https://learnquraan.co.uk/
- https://ukquranacademy.com/
- https://herquranacademy.com/online-quran-classes-uk/
- https://herquranacademy.com/online-quran-classes-usa/
- https://herquranacademy.com/online-quran-classes-uae/
- https://www.noufquranacademy.com/online-quran-classes/usa
- https://quranacademyusa.com/quran-classes-fees-in-the-usa/
- https://canadianquranacademy.com/pricing/
- https://www.joinquran.com/global-online-quran-classes
- https://baitulizzah.online/
- https://www.openarabic.org/online-quran-classes/

Google:
- https://developers.google.com/search/docs/appearance/structured-data/organization
- https://developers.google.com/search/docs/appearance/structured-data/sd-policies
- https://developers.google.com/search/docs/essentials/spam-policies
- https://search.google.com/search-console
- https://analytics.google.com/

## Release boundary
This audit makes no claim about competitor rankings, traffic, backlink counts or OQC keyword positions. It does not authorise external outreach, paid links, public teacher credentials, local listings or unapproved local-currency prices. Merge/deploy only after required automated/live checks pass and release approval is confirmed.
