# OQC five-market competitor reverse-engineering and implementation audit
**Date:** 5 November 2026  
**Markets:** United Kingdom, United States, Canada, Australia, United Arab Emirates  
**Scope:** Technical SEO, content, authority/citations/backlinks, conversion, AI-search discoverability  
**Method:** Publicly accessible competitor pages and current repository/CMS source review. This is a qualitative competitor teardown, not a paid rank-tracker export or a claim of exact Google position.

## Executive decision
OQC already has a stronger technical and conversion foundation than a generic SEO rebuild would imply. The current product/site includes:
- A shared EducationalOrganization + WebSite JSON-LD graph, stable entity IDs, canonical site origin, public contact point, service areas and subject taxonomy.
- Country/city route generation, canonical/noindex-aware sitemap inclusion, explicit search-agent robots policy, local time-zone scheduling and currency-aware fee guidance.
- Country hubs with locally relevant planning guidance, official regulator/government references, FAQ and Service JSON-LD, course paths, trial CTAs and further reading.
- A short trial form with country/time-zone capture, age band, teacher preference, explicit enquiry consent, marketing opt-in defaulting to false, attribution capture and a server-side RPC.
- Teacher profiles, consented on-site testimonials, Trustpilot outbound review link and a public editorial-standards page.

The highest-value competitor gap is therefore not “add more country keywords.” It is to make OQC's claimed learning process independently visible and verifiable: actual learner progression evidence, parent-facing progress communication, course-level milestones, teacher evidence and original practice resources. Do not claim a parent dashboard or per-lesson progress reports until the operational product really provides them.

## Market-by-market competitor teardown

### UK
| Public competitor | Observable strengths | What OQC should learn (not copy) |
|---|---|---|
| [Learn Quran Academy](https://learnquraan.co.uk/) | Clear 1:1 promise, named teachers, published low-entry GBP packages, three-day trial, student portal and per-lesson progress reporting claims, FAQs and contact numbers | Put verifiable teacher evidence and the actual progress-feedback process close to the trial CTA. Independently substantiate every number/credential before publishing. |
| [UK Quran Academy](https://ukquranacademy.com/) | Strong UK-family positioning, safeguarding language, weekly parent progress logs, interactive Tajweed explorer, student app, city discovery and clear trial path | Build useful original learning tools and evidence-backed safeguarding information; do not claim DBS/Ijazah unless each tutor's status is checked and documented. |
| [Learn Quran UK](https://learnquran.uk/learn-quran-pricing/) | Transparent GBP package/lesson counts, free trial conditions, cancellation details and payment options | Make lesson length, weekly frequency, cancellation/rescheduling and total monthly value easy to compare. |
| [Almuallim](https://almuallim.uk/) | UK-focused positioning, course progression, teacher vetting narrative, clear monthly starting price and dedicated revert pathway | Add learner-intent pathways only where OQC can deliver them; substantiate qualifications and vetting. |

### USA
| Public competitor | Observable strengths | What OQC should learn (not copy) |
|---|---|---|
| [IQRA Network](https://iqranetwork.com/pricing) | Detailed tiering, teacher/coach support, dashboard, e-syllabus, recordings, quarterly coaching and progress reports | The strongest defensible trust advantage is a tangible academic support system, not generic “best academy” language. |
| [Online Quran Classes USA](https://onlinequranclassesusa.com/) | Audience-specific pages for children, adults and ladies, price calculator, family discount and clearly surfaced trial options | Reduce decision friction by matching the landing path to learner type and showing accurate package totals. |
| [QuranRoof](https://quranroof.com/about-us/) | Explicit international-market coverage, Pakistan-based delivery disclosure, course list and trial offer | Clear delivery-location and service-model disclosure can improve trust; do not invent a US office or local licence. |
| [OnlineQuran.pk USA page](https://onlinequran.pk/usa/) | USD plans, cost-per-class presentation, family benefits and localised offer messaging | Explain package economics with OQC's own approved prices, not competitor-matched claims. |

### Canada
| Public competitor | Observable strengths | What OQC should learn (not copy) |
|---|---|---|
| [Quran-Online.ca](https://quran-online.ca/) | Canada-origin positioning, provincial coverage, contact information, trial and multi-country coverage | A Canada page needs meaningful province/time-zone guidance and accurate entity identity, not just city keyword lists. |
| [EQuran School](https://www.equranschool.com/) | Extensive course and FAQ coverage, tutor gender options, scheduling, child/parent explanations and family discounts | Create concise, genuinely useful answers to common parent questions; do not reproduce bloated repetitive copy or unsupported student totals. |
| [The Quran Academy Canada](https://www.thequranacademy.com/) | Local community programmes plus online Tajweed, instructor-led programmes and clear community context | Differentiate online-only service clearly from local in-person programmes. |
| [Online Quran Academy USA — Canada guide](https://onlinequranacademy.us/top-10-online-quran-academies-in-canada/) | Long comparison content with named providers and decision criteria | OQC can publish a transparent buyer's guide only with a declared methodology, current source links, fair representation and clear commercial disclosure. Avoid self-awarded “#1” claims. |

### Australia
| Public competitor | Observable strengths | What OQC should learn (not copy) |
|---|---|---|
| [Her Quran Academy — Australia](https://herquranacademy.com/online-quran-classes-australia/) | Australia-specific time-zone finder, AEST/ACST/AWST, female-only positioning, transparent USD plans and two free lessons | Localise practical timetable information by time zone and learner segment; avoid implying a physical Australian centre. |
| [Nouf Quran Academy — Australia](https://www.noufquranacademy.com/online-quran-classes/australia) | State/time-zone-aware schedules, local currency and course-level descriptions | OQC already has time-zone logic; make the actual city/date workflow and coordinator confirmation easier to understand. |
| [EQuran School](https://www.equranschool.com/) | Broad Australia coverage, FAQs, teacher options and course breadth | Make Australian details accurate and useful; do not pad pages with city names. |
| [Academy for Quran](https://academyforquran.com/) | Country pricing displayed in local currency and clear one-to-one offer | Present OQC-approved AUD prices and package terms consistently. |

### UAE
| Public competitor | Observable strengths | What OQC should learn (not copy) |
|---|---|---|
| [Her Quran Academy — UAE](https://herquranacademy.com/online-quran-classes-uae/) | AED pricing, Gulf Standard Time, after-school/weekend use cases and explicit online-only disclosure | Surface AED package clarity and the UTC+4 schedule context; do not claim a UAE centre. |
| [EQuran School](https://www.equranschool.com/) | UAE named among served countries, parent-focused FAQ, female/male teacher choice and broad course set | Answer UAE-specific questions only where current operating data supports the answer. |
| [Academy for Quran](https://academyforquran.com/) | Localised GBP/USD/CAD/AUD pricing and a consistent one-to-one positioning | Keep local currency information consistent with OQC's actual approved fee table. |
| [QuranRoof](https://quranroof.com/about-us/) | Explicitly states Pakistan-based operations and UAE among international markets | Clear cross-border delivery disclosure builds trust; verify contracting entity and payment recipient. |

**Interpretation:** Public competitor copy contains claims that are not independently audited (student totals, ratings, tutor credentials, “certified,” “DBS checked,” “Al-Azhar,” and “since” dates). These are observed claims, not facts endorsed by this audit. They are not safe to imitate without OQC-specific evidence.

## Cross-market feature benchmark
| Feature | Competitor pattern | OQC current source review | Decision |
|---|---|---|---|
| Live 1:1 classes and teacher preference | Common | Present in core site and trial journey | Maintain; prove through clear class methodology and teacher profiles |
| Free trial | Common; duration/eligibility varies | Three days on eligible plans; Weekend excluded | Keep the qualification visible wherever the offer appears |
| Local time zones | Competitors publish city/time-zone finders | OQC has city/date/time-zone logic and country hub planner | Preserve; run DST boundary tests for all five markets |
| Local currency/pricing | Strong in UK/US/Australia/UAE examples | OQC uses live plan data, local currency and approximate conversion labels | Keep approved prices authoritative; avoid stale static price copy |
| Teacher credential proof | Competitors make strong claims | OQC teacher profiles expose specialism/qualifications/languages as CMS data | Add evidence and review dates to internal teacher records before stronger public claims |
| Progress visibility | Portals, dashboards, per-lesson notes and periodic reports appear in several competitor offers | OQC has a parent portal route and a structured learning framework; public evidence of actual per-lesson reporting/dashboard functionality is not established by this source review | P1 product/operations validation; do not advertise unverified capabilities |
| Learning tools | Placement tests, Hifz planners, interactive Tajweed explorers and downloadable resources | OQC has Quran study/practice tools and learning guides | Expand only tools with academic QA and a working user benefit |
| Trust | Testimonials, independent review profiles, safeguarding claims | OQC uses permission-based testimonials and links to Trustpilot; profile admin status is not verified | Maintain consent log; verify Trustpilot admin and review totals before displaying metrics |
| Family discounts | Common | Must be taken from approved live packages | Add only if commercially approved and supported by billing logic |
| Country-specific support | Common | Five country hubs and guidance exist | Refresh sources annually and review legal statements before major changes |

## Technical SEO / AI-search audit
### Already implemented in repository
- Canonical metadata generation, OG/Twitter metadata, crawlable internal links and metadata title fitting.
- Sitemap generated from published courses/pages/posts/teachers and indexable location CMS rows; canonical/noindex policy filters non-indexable rows.
- Robots rules explicitly allow search crawlers including Googlebot, Bingbot, Applebot, DuckDuckBot, YandexBot, OAI-SearchBot, Claude-SearchBot and PerplexityBot, while disallowing private routes.
- Organization/WebSite graph with stable IDs; location pages use Service, BreadcrumbList and FAQPage JSON-LD; blog articles use BlogPosting with author/date/image metadata.
- Article pages include visible author, publish/update dates, editorial-standards link, table of contents and related resources.
- Country hubs expose official source links, local time-zone explanations, course links, trial CTAs and local fee guidance.
- Prior repository audit documented 165 location-route SEO smoke checks, 76 sitemap URL crawl checks, 49 image checks, and selected-page Lighthouse lab results of 98–100 performance, accessibility 100 and SEO 100. These are historical automated checks, not current CrUX field data or a fresh whole-site score.

### Important structured-data correction
A source branch removes the unverified CMS `site.identity.established` value from Organization `foundingDate`. The CMS value is 2018 while a public company register result indicates the legal entity was incorporated in 2026; brand start and company incorporation are not interchangeable. The regression test, lint and production build passed on the branch. Do not add a legal company number, registered-office address, LocalBusiness markup or founding date until official evidence is verified.

### Remaining technical verification gates
1. Complete the live performance and responsive CI jobs attached to the schema-fix PR.
2. Run Rich Results Test and URL Inspection against the deployed homepage, each market hub and representative blog page after merge/deploy.
3. Recheck canonical, redirect, sitemap and robots responses on the production host; do not infer from source alone.
4. Verify GSC domain property ownership, sitemap processing, Manual Actions and Indexing reports; verify GA4 Realtime/DebugView and conversion events. These account-level states are not proven by repository configuration.
5. Check field Core Web Vitals in Search Console/CrUX separately from Lighthouse lab metrics.

## Content / AEO / GEO implementation plan
1. **Progress evidence centre:** Publish an accurate explanation of how a learner is assessed, what feedback families receive, how practice is assigned and how progress is reviewed. Add anonymised examples only with explicit parent/student permission and no identifying details.
2. **Course outcome pages:** For Noorani Qaida, Tajweed, Hifz, Quran reading, Arabic/translation and Islamic studies, publish syllabus scope, prerequisites, sample milestone, practice routine, assessment method and who reviews academic content. A scholar/academic lead must review religious claims.
3. **Teacher evidence:** Standardise each teacher profile fields (qualification name, awarding institution, language, subject, experience, evidence checked date). Only publish the verified subset; no blanket “certified” claims.
4. **Parent and safeguarding information:** Publish the real child-enquiry process, parent participation, communication boundaries, complaint path, data retention and safeguarding escalation. Obtain management/legal review before making compliance claims.
5. **Country pages:** Keep the five hubs distinct through genuine market-specific facts (time-zone, currency, scheduling, parent/legal guidance); do not mass-generate city pages or repeat generic paragraphs.
6. **AI-answer usefulness:** Give direct, concise answers followed by evidence, limitations, author/reviewer, last-reviewed date and source links. Maintain crawl access for search-answer bots, but never add hidden prompts, keyword stuffing or AI-only text.
7. **Original tools:** Prioritise a Tajweed practice/lesson planner and Hifz revision planner only if academic QA validates the method, calculations and instructions. Tools should work for users, not exist as doorway pages.

## Authority / backlinks / citations
- **Do not pursue mass directory links, paid ranking links, reciprocal link farms, fabricated local citations or fake review generation.** OQC is an online-only service and has no eligible walk-in branch; Google Business Profile and address-dependent local directories remain excluded.
- Keep official country-hub references visible and relevant. They support reader guidance; they are not backlinks to OQC and do not imply endorsement.
- Prioritise editorial/resource relationships where OQC can contribute a genuinely useful reviewed resource: RISE Islamic schools resource route, ISRE Australia resource recommendations, and ISLA editorial contribution route. All require owner approval and academic review; no outreach or submission is claimed as completed.
- Verify existing Facebook, Instagram, X and Trustpilot profile ownership/admin access before changing profile details. LinkedIn/YouTube can be created only with owner approval and real organisational control. Wikidata/Wikipedia are not targets without independent notability evidence.
- Build linkable original assets (parent guide, printable Qaida practice sheet, Tajweed glossary, Hifz revision planner) and offer them to relevant educators/communities without requiring a followed link.

## Conversion audit and experiments
**Strengths:** Trial page explains eligibility and next step; form captures the minimum booking context and country/time zone; teacher preference is optional; consent is explicit; marketing opt-in is false by default; successful submission confirms a coordinator follow-up and reference.

**Priority experiments (one at a time):**
- Test hero CTA label and a compact “what happens in the three-day trial” sequence; preserve Weekend-plan exclusion.
- On each country hub, compare CTA placement immediately after local fee guidance versus after teacher/course explanation.
- Measure form start, validation error, submit success, coordinator contact, trial scheduled, trial attended, paid enrolment and 30-day retention. Do not optimise solely for form submissions.
- Segment by market, device, course, age band and source only where privacy/consent rules permit.
- Do not promise a 24-hour callback unless Admissions consistently meets and monitors that service level.

## Prioritised implementation backlog
| Priority | Work | Acceptance evidence | Release gate |
|---|---|---|---|
| P0 | Remove unverified foundingDate from Organization JSON-LD | Regression test + CI + Rich Results/URL inspection | Merge after all required CI checks pass |
| P1 | Confirm parent portal and progress-report operational truth | Working parent journey, sample report, access-control and safeguarding review | Owner + academic + product approval |
| P1 | Teacher credential evidence register | Documentary evidence and review date for each public claim | Academic lead approval |
| P1 | Five-market conversion event funnel | GA4 debug evidence for each event; no PII in analytics | GSC/GA4 admin verification |
| P2 | Publish original progress methodology and sample anonymised report | Academic sign-off, privacy consent and visible author/reviewer | Owner approval |
| P2 | Original Tajweed/Hifz practice tools | Functional tests and scholar review | Academic approval |
| P2 | Resource/editorial outreach | Approved pitch, relevant audience, publisher permission | Owner approval |
| P3 | Additional third-party profiles | Verified organisation ownership and consistent facts | Owner approval |

## Legal and search-policy guardrails
- Competitor pages were used only to observe public product patterns and user-experience features. No competitor copy, imagery, code, testimonials, private data or proprietary assets are reproduced.
- Google requires structured data to represent visible page content and warns that correct markup does not guarantee rich results: https://developers.google.com/search/docs/appearance/structured-data/sd-policies
- Google prohibits manipulative link schemes, keyword stuffing and scaled low-value content: https://developers.google.com/search/docs/essentials/spam-policies
- Google Search Essentials recommends helpful, reliable, people-first content: https://developers.google.com/search/docs/essentials
- No ranking guarantee is possible. Positions vary by query, country, device, search features and time. Exact keyword rankings/clicks/impressions require verified Search Console data.

## Audit outcome
**Ready for controlled implementation:** schema authenticity correction and this evidence-based audit document.  
**Not authorised/verified by this audit:** external profile edits, GBP creation, paid/editorial link placement, unsupported claims, new country office/address, or public claims about unverified dashboards, tutor credentials, student counts or response-time SLAs.  
**Pause condition:** after approved PR changes are merged, production deployment is READY, and live smoke/SEO checks are recorded, provide a final release report and stop. No recurring monitoring is started by this document.
