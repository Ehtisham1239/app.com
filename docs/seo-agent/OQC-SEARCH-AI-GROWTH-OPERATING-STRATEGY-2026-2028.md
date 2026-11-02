# OQC Search, AI Discovery & 11X Growth Operating Strategy (2026–2028)

**Prepared:** 2 November 2026  
**Website:** https://www.onlinequrancollege.com  
**Repository:** https://github.com/Ehtisham1239/app.com  
**Planning horizon:** 24 months (November 2026–October 2028)  
**Status:** Strategy and controlled homepage source update committed. Production deployment, CMS/analytics access and market conversion validation remain pending. This document does not claim rankings, AI citations, revenue growth or deployments that have not been measured.

---

## 1. Executive direction

Retire keyword-volume-first SEO as the operating strategy. OQC will run one integrated growth system:

1. **Search visibility:** crawlability, indexation, technical quality, helpful pages and relevant search intent.
2. **Answer-engine discoverability:** clear, verifiable answers and source-worthy original material for Google AI Overviews/AI Mode, Perplexity and other answer experiences.
3. **Brand/entity trust:** consistent identity, real people and qualifications only where verified, transparent service terms, authentic third-party references and responsible reputation management.
4. **Conversion growth:** country-aware journeys, transparent fees, trial booking, admissions response, trial attendance, enrolment and retention.
5. **Academic authority:** accurate Quran-learning explanations, qualified review where claims are religious/academic, and demonstrable teaching methods rather than generic AI articles.

**Operating principle:** Standardise → Verify → Publish → Measure → Improve. AI is an assistant for research and production, never the source of truth or an automatic publisher.

No SEO programme can guarantee first-page rankings, AI citations, a fixed number of leads or 11X revenue. “11X” is an ambition to be measured against a documented baseline, not a forecast or promise.

## 2. Evidence rules and 2026 search reality

### 2.1 Confirmed Google guidance

- Google says AI Overviews and AI Mode use the same foundational Search systems and SEO best practices. AI experiences use retrieval and query expansion/fan-out; they are not a separate guaranteed “top 3” ranking list. Pages must be indexed and eligible for a Search snippet, and the site must be included in Search generative AI features in Search Console to be eligible. Eligibility never guarantees a citation.
- Google says there is no special AI schema or `llms.txt` file required for Google AI features. Continue crawlable, helpful, original content, accurate metadata, clear page structure and normal structured data where it matches visible content.
- Google’s spam policies define scaled content abuse by the purpose and lack of user value, regardless of whether content is produced by AI, people or a mixture. Expired-domain abuse and manipulative attempts to influence generative AI answers are also within spam policy.
- Google’s October 1, 2026 documentation update incorporated Search Quality Rater guidance that describes effort, originality, talent/skill and accuracy. These are quality-evaluation concepts, not a disclosed numerical ranking formula or a “score” to manipulate. Human review is OQC's editorial control; do not falsely attribute it as a newly mandated Google workflow.
- Google says Core Web Vitals are used by ranking systems, but good scores do not guarantee top rankings and page experience is broader than a single metric.
- Google says most 404s do not harm search performance when the URL should not exist. Fix submitted URLs, broken internal links and genuine moved content; retain 404/410 when content is truly gone and has no equivalent. Never redirect every error to the homepage.
- Google’s structured data guidance requires markup to reflect visible, accurate page content. Schema is descriptive, not a ranking shortcut.

### 2.2 Confirmed 2026 Search status incidents

Google's official Search Status Dashboard history shows seven 2026 incidents across Ranking and Discover as of 2 November 2026:

| Incident | Official dates | Category |
|---|---|---|
| February 2026 Discover update | 5 February 2026 | Discover |
| March 2026 spam update | 24–25 March 2026 | Ranking / spam |
| March 2026 core update | 27 March–8 April 2026 | Ranking / core |
| May 2026 core update | 21 May–2 June 2026 | Ranking / core |
| June 2026 spam update | 24–26 June 2026 | Ranking / spam |
| August 2026 spam update | 18–21 August 2026 | Ranking / spam |
| September 2026 spam update | 24 September–8 October 2026 | Ranking / spam |

The September update ran from 24 September 09:15 PDT to 8 October 01:00 PDT (13 days, 15 hours, 45 minutes). Google described it as global and applicable to all languages. Google did not publish a special new target list for this rollout; OQC must follow the standing spam policies, not speculation about undisclosed targets. As of 2 November 2026, the live Search Status Dashboard showed no currently rolling incident.

### 2.3 New measurement and crawler controls

- Google announced its Search Generative AI performance report on 3 June 2026 and said it had rolled out worldwide by 31 August. Use the report's page, country, device and date views once Search Console access is restored.
- Google documentation says AI Mode is counted in Search Console Performance totals; use the dedicated Generative AI report for more specific visibility analysis rather than assuming the AI answer source count or position.
- On 24 September 2026 Google announced multimodal Search reporting, including Lens, Circle to Search and image-based searches. Maintain useful image context, descriptive alt text, image performance and visible page relevance.
- Perplexity documents `PerplexityBot` as its search-index crawler and recommends allowing it for search-result visibility. `Perplexity-User` is a user-triggered fetcher and generally ignores robots.txt. Perplexity publishes current IP ranges for WAF configuration; never hardcode stale IP lists.
- On 30 October 2026 Google announced plans to support a shared AI-training preference control in robots.txt during 2027. The token is not treated as live support today. Do not invent syntax or add a training opt-out without an owner decision; training preferences and search/grounding visibility are separate policy choices.

### 2.4 Claims not to use as operating rules without primary evidence

Do not repeat as confirmed Google rules: “404 bloat automatically removes a site from AI answers”, a fixed 20% mobile-speed ranking uplift, a direct bounce-rate penalty, a universal 2–6 citation limit, mandatory AI author headshots, a secret “information gain score” for price pages, or a guaranteed citation outcome after a named update. AI content itself is not automatically spam; scaled content that lacks user value and oversight can violate spam policies. OQC's human fact-check requirement is our own editorial standard.

### 2.5 Working source register

- Google AI features: https://developers.google.com/search/docs/appearance/ai-features
- Google generative AI optimisation guide: https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
- Google AI performance report announcement: https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports
- Google spam policies: https://developers.google.com/search/docs/essentials/spam-policies
- Google AI-generated content guidance: https://developers.google.com/search/docs/fundamentals/using-gen-ai-content
- Google helpful-content guidance / rater concepts: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- Google page experience: https://developers.google.com/search/docs/appearance/page-experience
- Google 404 guidance: https://support.google.com/webmasters/answer/2445990
- Google Organization structured data: https://developers.google.com/search/docs/appearance/structured-data/organization
- Google Search Status Dashboard: https://status.search.google.com/
- Google shared AI-training preference announcement (30 Oct 2026): https://developers.google.com/search/blog/2026/10/ai-training-control
- Perplexity crawler guidance: https://docs.perplexity.ai/guides/bots

Recheck source dates before every major algorithm response. Log the claim, official source, date checked, interpretation, affected URLs and action.

## 3. Market architecture and page ownership

### 3.1 Homepage remains the global homepage

Canonical homepage: `/`  
Purpose: explain OQC globally, establish the brand, show courses, teacher/learning approach, fees, evidence, FAQs and one clear trial CTA. It is not to become a USA/UK/UAE/Australia landing page and must not be redirected.

### 3.2 Country hubs

Keep one canonical country hub per market:

| Market | Country hub | Currency | Local-time handling | Role |
|---|---|---:|---|---|
| UK | `/locations/united-kingdom` | GBP | GMT/BST and city/date planner | Priority market |
| USA | `/locations/united-states` | USD | Multiple US time zones and date-aware planner | Priority market |
| Australia | `/locations/australia` | AUD | State/territory daylight-saving differences | Priority market |
| UAE | `/locations/united-arab-emirates` | AED | Gulf Standard Time (Asia/Dubai) | Priority market |
| Canada | `/locations/canada` | CAD | Province/city/date planner | Retain existing market; not part of the four-market primary campaign unless re-prioritised |

Country pages are online-service information pages, not evidence of local branches. Do not create a country subdomain or a second website for each market.

### 3.3 City pages live under their country

Existing URL pattern: `/locations/{country}/{city}`. Keep city pages nested under the relevant country. They may explain local time-zone selection, school/family scheduling and local currency enquiry. They must not imply an office, local teacher base, local school, physical service area or local accreditation.

City pages default to `noindex,follow` unless the owner/editor has added genuinely unique, locally useful information and approved the page for indexation. Do not generate hundreds of near-identical city pages. Do not change existing URLs or add redirects as a substitute for quality work.

### 3.4 Country page quality gate

A country hub may be indexed only when it has:
- A clear answer to the market's main online-learning question.
- Accurate country-specific time, currency and consumer-information details.
- Relevant course pathways and age/learner use cases.
- A transparent explanation that lessons are online and there is no local branch represented.
- Accurate fee display (approved price first; approximate conversion labelled as approximate).
- A clear parent/guardian path for child enquiries.
- Relevant FAQs that answer real objections, not keyword variations.
- Internal links to courses, pricing, trial, teacher information, policies and useful guides.
- A visible editorial owner/reviewer where a real person has approved the material.
- A canonical URL, accurate metadata, appropriate language/locale and schema consistent with visible copy.

## 4. Brand positioning and modern trust system

### Positioning

**Online Quran College: live, one-to-one Quran learning for children and adults, delivered online with a structured learning pathway and family-aware scheduling.**

Brand traits: authentic, academically responsible, warm, premium, trustworthy, modern, parent-aware and globally accessible.

### Proof before promotion

Create a claims register. Each public claim must have:
- Exact wording and page/profile where it appears.
- Claim category: company, teacher, academic, safeguarding, price, outcome, review or operational.
- Documentary evidence and evidence owner.
- Last verification date and expiry/review date.
- Approval status: verified / needs evidence / remove or rewrite.

Review these live-site claims before amplifying them: “Since 2018”, “certified tutor”, formal certificates, tutor qualifications, “never sold or shared” personal-data statement, response-time promises, trial eligibility, sibling discounts and any student/family/country totals. If evidence or operational confirmation is unavailable, qualify or remove the claim through the CMS owner; do not invent proof.

### Author and reviewer policy

- Use a named author only when the person actually wrote or materially reviewed the content and has consented to public attribution.
- Use a real biography, real qualifications and real profile links only after verification.
- Do not create fictional scholars, AI-generated author portraits, fabricated LinkedIn profiles, fake first-hand experience or invented testimonials.
- Religious rulings/fatwa-level content requires qualified Mufti review. Quran/Tajweed pedagogy should be reviewed by a competent academic/teacher. General marketing copy needs editorial QA, not fake religious authority.
- Show the reviewer's role and review date only when the review actually happened.

## 5. Content architecture: answer-first, experience-backed

### 5.1 Page intent before keyword

Every URL gets one primary user task and one primary conversion action. Build the content map from Search Console queries, admissions questions, trial feedback, parent objections and course availability—not keyword tools alone.

### 5.2 Recommended page content sequence

1. **Direct answer:** one concise, plain-language answer to the page's main question.
2. **Who this is for:** learner age, current level and common need.
3. **How it works:** real OQC lesson process, class format and teacher interaction.
4. **Actionable steps:** how to choose a course, prepare, practise or arrange a trial.
5. **Evidence and limitations:** approved facts, real examples, transparent fees and what must be confirmed.
6. **FAQs:** genuine unanswered questions from parents/adult learners.
7. **Next step:** relevant course, pricing, trial or contact link.

Answer-first formatting improves clarity and extraction, but does not guarantee AI citation. Do not mechanically force the same template onto every page.

### 5.3 OQC content pillars

- **Beginner pathway:** Arabic letters, Noorani Qaida, reading readiness and adult beginners.
- **Recitation quality:** makharij, Tajweed learning, teacher feedback and practice routines.
- **Memorisation:** Hifz planning, Sabaq/Sabqi/Manzil where pedagogically accurate, revision and parent support.
- **Parent decision support:** choosing a teacher, child-safe online learning, trial preparation, progress questions and privacy.
- **Adult learner support:** starting later, confidence, time management and realistic practice.
- **Arabic and understanding:** Arabic foundations, translation and Tafseer with scholarly review where needed.
- **Service transparency:** fees, lesson duration, trial eligibility, scheduling, cancellations, payment and support.
- **Market-specific practical guides:** time zones, local clock changes, currency and consumer information for the approved markets.

### 5.4 Editorial workflow

Research question → confirm OQC service fit → primary-source research → draft → academic/subject review where needed → factual/legal review → SEO and accessibility review → CMS preview → human approval → publish → test → monitor → update or consolidate.

No mass AI publishing. No minimum word count target. Keep articles concise where the answer is simple and comprehensive where the task needs it. Each article should add original value such as a teacher-approved practice sequence, original checklist, real anonymised process example, useful comparison or properly sourced explanation.

### 5.5 Internal linking

- Every new article links to 2–4 genuinely relevant existing resources where helpful.
- Course pages link to beginner guides, practice resources, relevant next-level courses and trial.
- Country hubs link to the most relevant course, price, trial and policy pages.
- Parent guides link to child-learning, privacy/safeguarding and trial-preparation pages.
- Use descriptive anchors; avoid repetitive exact-match anchor stuffing.
- Run a monthly orphan-page and broken-internal-link check.

## 6. Search and answer-engine optimisation

### Google Search / AI Overviews / AI Mode
- Ensure important content is available in crawlable HTML text.
- Allow crawling of public pages and resources; keep private portal, account, API and admin routes blocked from indexing.
- Use descriptive titles, accurate meta descriptions, canonical URLs, clear headings and accessible navigation.
- Structured data must match visible content. Keep the Organization entity truthful; do not use LocalBusiness or a fake postal address for an online-only operation.
- Use relevant Article, BreadcrumbList, Course/Service and FAQ markup only where eligible and accurate. FAQ markup is not a promise of a rich result.
- Measure clicks, impressions, query groups, country and landing-page conversions in Search Console/GA4 where those accounts are connected.

### Perplexity and other answer engines
- Keep public educational content accessible to the relevant crawlers, subject to owner policy and server controls.
- Publish original, attributable, source-rich material with clear dates and reviewer details.
- Cite primary sources for factual/legal/academic claims. Link to independent authorities rather than circularly citing OQC.
- Avoid pages designed only to manipulate an answer engine. No fabricated statistics, fake studies, fake experts or answer-engine bait.
- Maintain a fixed monthly prompt set and record: query, country, date, model/product, whether OQC appears, exact cited URL, competitor citations, factual errors and screenshot/evidence. Treat this as a sampled observation, not a complete share-of-voice metric.

### AI crawler policy
Review robots.txt, CDN/WAF and server logs before changing crawler access. Do not indiscriminately block search/answer crawlers or indiscriminately allow every bot. Distinguish search indexing, AI search retrieval and model-training preferences; apply owner-approved policies and verify current vendor documentation. Do not add invented `llms.txt` or special schema on the claim that Google requires it.

## 7. Technical SEO and website quality

### Crawl and indexation
- Inspect Search Console Page Indexing and URL Inspection for submitted URLs, valid pages, soft 404, server errors, blocked resources, canonical conflicts and duplicate pages.
- Fix submitted URLs that should exist, server failures, broken internal links and incorrect canonicals.
- Keep genuine removed content at 404/410 when no equivalent replacement exists. Add a 301 only when a real, close replacement exists and the move is intended.
- Never redirect unrelated URLs to the homepage, and never blanket-redirect all city pages.
- Keep XML sitemap limited to canonical, indexable, useful URLs with accurate lastmod dates.
- Check sitemap fetch, robots, canonical host and HTTPS consistency.

### Performance and mobile
Track field Core Web Vitals at the 75th percentile:
- LCP: good at ≤2.5s
- INP: good at ≤200ms
- CLS: good at ≤0.1

Use PageSpeed Insights, CrUX/Search Console where available, Lighthouse for diagnostics, and Vercel Speed Insights for route-level field observations. Prioritise real-user bottlenecks, image sizing/format, font loading, JavaScript cost, layout shifts, server response and mobile form usability. Do not promise a universal “under 2.5s on 4G” ranking threshold.

### Structured data and accessibility
- Organization/WebSite identity is global and consistent.
- No false LocalBusiness, postal address, map pin, geo-coordinates or country branch.
- Keep visible text and JSON-LD consistent.
- Use meaningful image alt text; decorative images use empty alt text.
- Preserve keyboard navigation, form labels, focus states, contrast, headings and responsive layouts.
- Validate structured data and inspect rendered HTML after every major template change.

### Security and privacy
- Public pages only in the sitemap.
- Keep `/admin`, `/auth`, `/api` and parent/student private areas out of public indexing.
- Check consent, child data collection, retention, marketing opt-in and analytics configuration against actual implementation and applicable laws.
- Never promise “never shared” unless vendors, processors, legal terms and actual practices support the statement.

## 8. Country execution playbooks

### United Kingdom
- Lead with UK family scheduling, GMT/BST, GBP fee transparency and parent-led child enrolment.
- Explain that OQC is online-only; do not imply UK classroom, city office or local branch.
- Review UK privacy/marketing statements and the exact contracting/payment entity.
- Use UK-specific content only where it reflects real user needs; avoid generic city doorway pages.

### United States
- Lead with multi-time-zone scheduling, local date selection, USD fee transparency and parent/guardian-led child enquiries.
- Explain online-only delivery and avoid state-licensing or local-office claims unless verified.
- Review child privacy, marketing and consumer claims with qualified counsel where needed.
- Keep the country hub distinct from generic “near me” physical-provider pages.

### Australia
- Lead with state/territory clock differences, school/family scheduling and clear AUD pricing.
- Explain online-only delivery; do not claim ABN, local branch, accreditation or local staff without proof.
- Review Australian Consumer Law, privacy and marketing claims.
- Create city content only when it adds genuinely distinct time-zone or customer-help information.

### UAE
- Lead with Asia/Dubai time, AED quote clarity, family scheduling and transparent course/trial details.
- Clearly distinguish online Quran lessons from locally licensed in-person education centres.
- Do not claim UAE trade licence, education permit, office, local branch or local teacher presence without documentary evidence.
- Verify any local regulatory statement before publishing; legal review required for licensing claims.

### Market sequencing
Primary: UK → USA → Australia → UAE. Canada remains technically available as an existing hub but should receive active campaign investment only after capacity and economics are reviewed. This is a sequencing decision, not a claim about market size or demand.

## 9. Conversion and growth operating system

The SEO outcome is qualified learners, not traffic alone.

**Funnel:** Organic discovery → landing-page engagement → trial start → qualified trial booking → trial attended → payment/enrolment → activation → retention → referral.

Track by country, device, landing page, course and source:
- Organic impressions/clicks/CTR/average position by query group and page.
- Organic landing sessions and engaged sessions.
- Trial CTA clicks, form starts, form completions and qualified enquiries.
- Response time, contact rate, trial scheduled, trial attended and no-show rate.
- Trial-to-paid conversion, revenue per enrolment, payment currency and refund/cancellation rate.
- 30/60/90-day retention, attendance, parent satisfaction and referral rate.
- CAC, CPL, cost per qualified trial, cost per enrolment, LTV and LTV:CAC when spend and revenue data are reliable.

Do not invent baseline values. Establish the baseline from at least 28–90 days of valid analytics and admissions data. Segment by country before changing budget. Do not optimise to raw form volume if the leads are unqualified or teachers lack capacity.

## 10. Two-year roadmap (Nov 2026–Oct 2028)

### Phase 0 — Baseline and release safety (Weeks 1–2)
- Restore deployment permissions and deploy the already committed identity correction and homepage UAE navigation change.
- Run tests, lint, production build, route smoke tests and production verification.
- Confirm live URLs, sitemap, robots, canonicals, schema, noindex rules, 404 behaviour and no unexpected redirects.
- Obtain read access to Search Console, GA4, GTM, Vercel analytics and admissions/ERP reporting.
- Export URL/query/country baseline and create a claim evidence register.

**Exit gate:** production release verified; baseline data available or gaps formally recorded; no unverified metric presented as fact.

### Phase 1 — Foundation and content repair (Months 1–3)
- Audit all indexable URLs: homepage, courses, course details, pricing, trial, about, teachers, blog, FAQ, legal and five market hubs.
- Audit titles, descriptions, H1/H2, canonical, indexability, schema, images, internal links, content freshness and conversion CTA.
- Review every public claim for evidence; rewrite/remove unsupported claims through CMS owner.
- Fix broken internal links, submitted URL errors, soft 404/server issues and genuine canonical conflicts.
- Improve mobile forms, pricing clarity and trial flow.
- Update highest-value existing articles first; preserve strong URLs and content.

**Exit gate:** critical technical defects resolved, content claims approved, priority landing pages meet QA checklist.

### Phase 2 — Four-market relevance and authority (Months 4–6)
- Deepen UK, USA, Australia and UAE country hubs with evidence-backed local usefulness.
- Keep city URLs nested and noindex by default until unique value is approved.
- Create 2–4 high-quality supporting resources per market only where query/admissions evidence justifies them.
- Improve course-to-market internal links and conversion tracking.
- Audit and claim genuine brand profiles; no generic local-directory blasts.
- Start a small editorial outreach programme based on actual OQC expertise and relevant organisations.

**Exit gate:** market pages have distinct purpose, accurate claims, working local scheduling and tracked trial journeys.

### Phase 3 — Authority and content compounding (Months 7–12)
- Publish a steady editorial cadence based on real query demand and academic review capacity.
- Build original learning resources, teacher-reviewed checklists, parent guides and transparent course comparisons.
- Earn independent citations through genuine editorial contributions, partnerships and useful resources.
- Refresh pages when source guidance, fees, course availability or operational practices change.
- Run quarterly content consolidation decisions: keep, improve, merge only with close equivalence, or retire with proper 404/410; do not redirect unrelated pages.
- Review brand mentions and answer-engine citations monthly.

**Exit gate:** demonstrable improvement against baseline in qualified organic trials and trust/quality indicators, not just article count.

### Phase 4 — Conversion optimisation and expansion (Months 13–18)
- Run controlled experiments on trial CTA, form friction, pricing explanation, parent reassurance and country page layout.
- Compare country cohorts on qualified trial rate, trial attendance, enrolment, retention and CAC.
- Improve teacher-capacity matching and admissions response before scaling paid or organic acquisition.
- Expand topic coverage only where there is evidence of demand and academic/operational capacity.
- Develop video demonstrations and original learning explainers where the content team can maintain accuracy and consent.

**Exit gate:** repeatable acquisition-to-enrolment process and capacity-aware growth by market.

### Phase 5 — Sustainable scale and moat (Months 19–24)
- Strengthen OQC's owned educational resource library and expert-reviewed content.
- Deepen real partnerships, editorial references, parent education and teacher development content.
- Use cohort LTV and retention to set acquisition investment ceilings.
- Automate reporting, content QA alerts, technical checks and change logs; keep human approval for claims and publication.
- Reassess market allocation and whether a new market deserves investment based on unit economics.
- Document a new two-year strategy using measured outcomes.

**Exit gate:** stable operating cadence, trustworthy reporting, positive unit economics where measured, content maintenance ownership and no reliance on mass AI publishing.

## 11. Reporting cadence and decision rules

**Weekly:** critical crawl/build issues, broken links, form errors, trial conversion, admissions response, country lead quality and teacher capacity.

**Monthly:** Search Console country/page/query report; GA4 funnel; content updates; answer-engine prompt sample; backlink/editorial quality; Core Web Vitals; claims and schema changes.

**Quarterly:** market profitability, LTV/CAC, content keep/improve/retire decisions, authority quality, competitor positioning, safeguarding/privacy review and strategy reprioritisation.

Every report separates:
- **Known:** verified in source systems or primary evidence.
- **Observed:** sampled result with date/method.
- **Estimated:** calculation with stated assumptions.
- **Unknown:** data unavailable.
- **Requires owner approval:** legal, brand, claims, credentials, external account or budget decision.

## 12. Competitor intelligence

Do not copy competitor content or assume competitor claims are true. For each competitor, record:
- Exact URL and date checked.
- Target market and audience.
- Course/service offer and pricing transparency.
- Trial/onboarding process and CTA.
- Evidence of teacher qualifications, academic review and safeguarding.
- Content formats and genuinely useful resources.
- Technical experience and mobile journey.
- Independent editorial references and brand mentions.
- Gaps OQC can address with original evidence.

Competitor set must be confirmed using actual Search Console queries and SERPs for each country; do not invent a competitor list or market share.

## 13. Implementation status and live audit (2 Nov 2026)

### Verified repository and route state
- Repository `Ehtisham1239/app.com`, branch `main`.
- Homepage canonical remains `/`; UAE was added to the homepage priority navigation and country discovery cards.
- Country/city routing uses `/locations/{country}` and `/locations/{country}/{city}`.
- `INDEXED_MARKETS` includes UK, USA, Australia, Canada and UAE. City pages default to `noindex,follow`.
- The location directory contains 51 country guides. The directory is explicitly described as a time-zone/currency guide list, not a guarantee of a local branch, teacher or payment method in every country.
- 165 published location CMS records were inspected: 161 are noindex and 4 indexable; the indexable CMS records are Australia, Canada, UK and USA. UAE is source-generated from the location registry, has its own guide and is indexable by default, but has no separate CMS page row.
- UAE guide includes Asia/Dubai time, AED quote guidance, all seven emirates, online-only caveat and official UAE references.
- Existing location schema uses `Service` with `areaServed`; it does not claim a physical local business.
- Organization schema has no LocalBusiness type or postal address unless a complete address is explicitly configured.
- Robots disallows `/admin`, `/auth`, `/api/` and `/parents`. PerplexityBot is explicitly allowed on public content while those private paths remain disallowed.
- Existing exact-intent legacy redirects were not changed. No homepage redirects, blanket city redirects, mass URL renames or bulk 404 redirects were added.
- 20 published blog posts and 6 published course records were inspected. All 20 blog posts currently have `author_id = null`; do not fabricate authors. Teacher table contains 6 records but 0 public active teacher profiles.
- GitHub Actions workflow `.github/workflows/oqc-quality-checks.yml` runs tests, ESLint, a production Next.js build and production route smoke tests after pushes to `main`. Latest successful run: [41474018032](https://github.com/Ehtisham1239/app.com/actions/runs/41474018032), commit `39dfa9c103f5ce56dba7b8fed3ad583a8b99f1db`: 192/192 tests passed, ESLint passed, build passed (230 static pages), and the production smoke test returned HTTP 200 for homepage, /reviews, /free-trial, UK, USA, Canada, Australia, UAE, robots.txt and sitemap.xml. The smoke test validates the current production host, not that the latest commit is deployed.

### Source changes committed
- Homepage UAE discovery card and priority navigation; root canonical unchanged.
- Location directory copy now describes country/city guides rather than implying universal availability.
- Free-trial page source now renders one benefits list; the absolute “never sold or shared” statement has been replaced with privacy-policy wording.
- Teacher fallback page no longer claims all teachers are certified/verified while there are no public active teacher profiles; it asks Admissions to confirm the proposed teacher's credentials, language and availability.
- Robots source explicitly permits PerplexityBot on public pages and keeps private routes blocked.
- Regression tests added for market indexation, UAE market-guide completeness, Perplexity robots policy and trial benefits/privacy copy.

### CMS/database copy corrections applied and verified
- About page excerpt and SEO description no longer publish conflicting “Since 2018” / “since 2019” claims.
- `site.identity.established` was removed, so Organization JSON-LD no longer emits an unverified founding date.
- `site.contact.location = United Kingdom` was removed; this is an online-only service, not a physical office.
- Privacy Policy contact line no longer describes the United Kingdom as a physical location; the separate Terms governing-law clause was not changed.
- “Certified tutor” was removed from the first three public pricing plans and replaced with “Teacher availability confirmed before enrolment”.
- The CMS values were read back after updates. No student, parent, teacher-private or admissions records were changed.

### Live website observations
- Public pages inspected include homepage, About, Teachers, FAQ, Location Directory, Learn, Noorani Qaida, Reviews, Contact, Pricing and the four priority market routes where the fetcher returned content.
- The location directory lists UAE and its seven emirates; direct UAE route fetch did not return a fresh response during this pass. This is not proof of a 404; GitHub production smoke test includes the UAE route.
- Prior live page observations showed the old UK location label and old teacher/pricing copy. CMS data was corrected, but the web fetcher returned cache-miss responses on the later verification attempt; do not claim the updated rendering is confirmed live yet.
- The free-trial and teacher source changes require production deployment before they can be seen on the live site.
- Sitemap/robots fetch could not be validated by the external web fetcher in this pass; verify by production HTTP and Search Console.
- No Search Console/GA4/GTM performance export or Perplexity citation baseline was available.

### Competitor research
- Public competitors reviewed include Learn Quran Academy, JoinQuran, Academy for Quran, eQuran Academy, 92 Campus, Her Quran Academy, Huda Quran Academy, Khan Quran Academy and Virtual Quran Center.
- Common category expectations: country-aware fee display, weekly frequency and class duration, trial explanation, parent progress feedback, teacher preference and local-time scheduling.
- Some competitors show interactive placement/Hifz tools; this is an opportunity for original teacher-reviewed utilities.
- Competitor self-claims, prices and credentials were not independently verified. OQC must not copy student counts, reviews, accreditations or “best” claims.
- Detailed comparison: `docs/seo-agent/COMPETITOR-BENCHMARK-ONLINE-QURAN-ACADEMIES-2026-11-02.md`.

### Access and release blockers
- Vercel Git status on the latest source commit is failing with a `build-rate-limit` link; project lookup in the current scope returned 404 and production deployment listing returned 403 permission denied. No deployment was created in this pass.
- GitHub Actions results for the latest commits must be checked. No local clone/build was possible in this environment because GitHub DNS resolution was unavailable.
- `npm test`, `npm run lint` and `npm run build` are not yet confirmed passing.
- Search Console, GA4, GTM, admissions conversion data and Perplexity visibility baseline remain unavailable.
- No external social, Trustpilot or Apple Business admin access was assumed.

### Evidence documents
- Live audit: `docs/seo-agent/OQC-LIVE-SEO-AEO-GEO-AUDIT-2026-11-02.md`
- Competitor benchmark: `docs/seo-agent/COMPETITOR-BENCHMARK-ONLINE-QURAN-ACADEMIES-2026-11-02.md`
- Citation implementation: `docs/seo-agent/CITATION-AUTHORITY-IMPLEMENTATION-2026-11-02.md`
- Citation tracker: `docs/seo-agent/GLOBAL-CITATION-TRACKER-2026-11-02.csv`

### Changes intentionally not made
- No blanket redirects, URL renames, city page mass deletion, or homepage redirect.
- No Google Business Profile or fake country/city business listings.
- No invented NAP, physical address, local phone, map coordinates, branch, ABN, trade licence, accreditation or staff claims.
- No fake author, testimonial, review, backlink, editorial submission or AI-generated first-hand experience.
- No mass AI-generated article publication.
- No guessed shared AI-training token or special Google AI schema.
- No Search Console, GA4, GTM or external platform access was assumed.

## 14. Release checklist

Before declaring the programme live:
- [ ] Vercel project access restored; connected Git deployment works.
- [x] `npm test` (192/192), `npm run lint` and `npm run build` passed in GitHub Actions.
- [ ] Vercel production deployment succeeds and deployed commit SHA is recorded (currently blocked by build-rate-limit / deployment access).
- [ ] Homepage still canonical at `/`; UAE link visible; no duplicate homepage.
- [x] UK, USA, Australia, UAE and retained Canada country hubs return HTTP 200 in the production smoke test.
- [ ] All intended city pages remain nested under the correct country and default to noindex.
- [ ] No unintended redirects; 404/410 behaviour tested.
- [x] Sitemap and robots endpoints return HTTP 200 in the production smoke test; content-level robots/sitemap validation remains part of post-deploy verification.
- [ ] Canonicals, metadata, schema and visible identity agree.
- [ ] Contact/footer no longer imply an unverified physical location.
- [ ] Trial page single benefits list and privacy wording verified live; pricing and claims verified.
- [ ] Mobile form, course links, pricing and trial CTA smoke-tested.
- [ ] Search Console Generative AI feature inclusion and report access verified; GA4, GTM and admissions data access verified.
- [ ] Baseline dashboard and monthly answer-engine prompt register created.

**Completion definition:** A plan or Git commit is not a live deployment. Mark each task Done only after its source, test evidence, production URL and post-release verification are recorded.
