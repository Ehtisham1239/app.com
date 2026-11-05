# OQC five-market competitor reverse-engineering and implementation audit
**Date:** 5 November 2026 | **Markets:** UK, USA, Canada, Australia, UAE  
**Production domain:** https://www.onlinequrancollege.com  
**Method:** public competitor pages and public OQC source/CMS review. This is not a verified ranking report or paid backlink-index export.

## Executive summary
OQC already has five indexed country hubs with local currency/time-zone/course/trial paths; city time-zone pages; Service/Organization/WebSite/FAQ/Breadcrumb/ItemList structured data; market hreflang; sitemap/robots; `/llms.txt`; course and audience guides; published market articles; trial funnel; teacher profiles; consent-based testimonials; and Trustpilot link. Protect and improve this architecture rather than duplicating it.

The strongest public competitor conversion patterns are parent-visible progress reporting, trial-level assessment clarity, self-serve learning tools, and local schedule/price answers. OQC has strong local-time and trial foundations. The main visible gap is a clearer evidence-backed explanation of how parents receive feedback and progress updates. A non-diagnostic course finder is a useful future product feature; actual recitation assessment must remain with a qualified teacher.

## Competitor sample — public page observations, not a ranking list
Claims below (credentials, student counts, ratings, “best”) are competitor self-claims and were not independently verified. No competitor copy, code, assets, reviews or private analytics were copied.

| Market | Public competitors/pages inspected | Visible patterns |
|---|---|---|
| UK | Learn Quran Academy (learnquraan.co.uk); UK Quran Academy (ukquranacademy.com); Her Quran Academy UK (herquranacademy.com/online-quran-classes-uk); Online Quran Tuition (onlinequrantuition.co.uk) | GBP pricing; multi-day trial; teacher choice; parent progress logs; student portal/app; safeguarding messaging; after-school timetable. |
| USA | Quran Academy USA (quranacademyusa.com); eQuran Classes (equranclasses.com/pricing); Her Quran Academy USA; QuraanClasses.us | USD packages; multi-time-zone planning; parent portal/attendance visibility; weekly/monthly reports; child/adult/revert pathways; cancellation/payment FAQs. |
| Canada | Online Quran Academy USA Canada comparison guide (onlinequranacademy.us/top-10-online-quran-academies-in-canada); Academy for Quran (academyforquran.com); Her Quran Academy Canada; Huda Quran Academy (hudaquranacademy.com) | Canada comparison intent, CAD context, multi-time-zone planning, progress updates. The comparison guide is provider-published and is not neutral independent ranking evidence. |
| Australia | Academy for Quran; eQuran Academy (equranacademy.org); Huda Quran Academy; Her Quran Academy Australia | State-specific daylight-saving explanations, local currency context, weekly tests/progress reporting, self-serve Hifz/reading tools. |
| UAE | Her Quran Academy UAE; Salam Campus UAE (salamcampus.com/online-quran-classes-uae); Madani Islamic Academy UAE; OQT Services (oqtservices.ae) | AED/USD pricing context, Gulf Standard Time, local after-school routines, UAE-specific FAQs, explicit online-vs-physical-centre distinction. |

### What the better competitor journeys do
1. **Parent-visible progress loop:** explain what parents receive after lessons/weeks/months—attendance, lesson notes, memorisation/revision progress and next practice. OQC has a strong Learn → Practice → Assessment → Feedback → Improve framework, but should only describe the actual feedback delivery process after Academic/Admissions confirms it.
2. **Trial as a learning experience:** competitors explain level discussion, teacher matching and personalised next steps. OQC already has a three-day eligible-plan trial and coordinator confirmation; do not imply guaranteed teacher or slot availability.
3. **Self-serve tools:** placement tests, Hifz planners and Khatmah calculators help users. OQC has printable trackers and course comparisons; an interactive course-starting-point finder is a sensible next build, but it must not pretend to assess Tajweed or issue religious guidance.
4. **Local routine, not keyword repetition:** useful market pages explain time-zone exceptions, school/work schedules, currency and what the coordinator confirms. OQC's five market hubs already do this; avoid thin city doorway pages.
5. **Specific trust evidence:** safeguarding procedures, teacher credential checks, progress reporting and clear refunds outperform generic “best academy” slogans. Publish only verifiable processes.

## OQC gap map

### Technical
**Present in source:** canonical metadata helpers; sitemap inclusion guards; robots access for major search/answer bots; five-market hreflang; Service schema for remote tuition; Organization/WebSite graph; FAQ/Breadcrumb/ItemList schema; city/time-zone planner; noindex handling; RSS and generated `/llms.txt`.

**External gates:** authenticated GSC property/sitemap and URL Inspection; per-market index coverage; fresh live canonical/redirect crawl; field Core Web Vitals p75 (LCP/INP/CLS). Lighthouse lab samples are not field CWV. Search snippets can be stale and are not proof of current HTML.

### Content
Five country hubs, course pages, audience guides, five market-planning articles, FAQs, pricing and free-trial content already exist. The five market articles inspected in CMS are published, indexable and approximately 497–919 words, within the OQC 1,000-word editorial ceiling.

**Next content improvements:** keep one commercial URL per country; refresh only when official guidance changes; add “what parents receive after a lesson” only after process verification; clarify prerequisites and suitable next step on course pages; show review dates for time-zone/privacy/consumer references. Do not copy competitor comparison text or publish “top 10” claims as objective facts.

### Backlinks and citations
Existing foundation includes official profiles linked from site/CMS, public Trustpilot profile, relevant government/regulator outbound references on country hubs, and prior market citation trackers.

**Important:** outbound government links are reader citations, not inbound backlinks, endorsements or local business citations. A backlink is acquired only when a real third-party publisher independently publishes a link.

**Lawful priorities:** offer original printable Quran learning trackers to relevant education/community resource pages; pursue genuine editorial references from Islamic education publishers and parent resources; publish author/editor identity and correction policy; disclose relationships/sponsorship; track publisher, URL, editorial context, link type, date and qualified referral leads.

**Excluded:** paid do-follow links, link farms, mass directory submissions, automated profile creation, reciprocal-link schemes, spam comments/forums, fake reviews, fabricated citations, and local listings requiring in-person customer contact. OQC is online-only and must not invent offices or branches.

### Conversion
**Present:** one-to-one offer; free-trial CTA; country-specific trial parameters; local time/currency; course comparison; teacher profiles; consent-based reviews; pricing; contact route; market lead-event mapping.

**Highest-value next improvement:** explain the trial sequence clearly: parent/guardian submits for a child; learner goal/current level is discussed; coordinator confirms teacher/language/time; teacher feedback is shared; family decides whether to enrol. Do not promise availability before confirmation.

**Future product feature:** a non-diagnostic “Find a starting course” wizard based on learner goal and familiarity. It recommends a course to discuss; it must not grade recitation. Qualified teachers conduct actual level assessment.

**Measurement:** GSC query/page/country data; GA4/GTM event health; Admissions/ERP truth for qualified enquiry, trial scheduled/attended, paid enrolment and retention. Do not optimize raw form submissions alone. Confirm event delivery in GA4 DebugView/Realtime and reconcile to CRM.

### AEO/GEO
**Present:** `/llms.txt`, answer/search crawler access, factual course/market summaries, official profile list, sitemap/RSS, visible FAQs and structured entities.

**Implemented in this PR:** publish each indexed market's official government/regulator reference URLs in `/llms.txt`, explicitly identifying them as independent public guidance and not endorsements. This improves source discoverability; it does not guarantee an AI citation or ranking.

## PR implementation
- `src/app/llms.txt/route.js`: use the same `MARKET_GUIDES` data as visible country pages and list primary source URLs for AI-readable discovery.
- `tests/llms-txt.test.mjs`: regression coverage for the source section and non-endorsement language.
- No prices, teacher credentials, ratings, founding year, student totals, addresses, licences or competitor content changed.
- No external profiles created and no outreach sent.

## Competitor source register
- UK: https://learnquraan.co.uk/ | https://ukquranacademy.com/ | https://herquranacademy.com/online-quran-classes-uk/ | https://onlinequrantuition.co.uk/online-quran-academy/
- USA: https://quranacademyusa.com/ | https://equranclasses.com/pricing/ | https://herquranacademy.com/online-quran-classes-usa/ | https://www.quraanclasses.us/
- Canada: https://onlinequranacademy.us/top-10-online-quran-academies-in-canada/ | https://academyforquran.com/ | https://hudaquranacademy.com/
- Australia: https://equranacademy.org/ | https://academyforquran.com/ | https://hudaquranacademy.com/ | https://herquranacademy.com/
- UAE: https://herquranacademy.com/online-quran-classes-uae/ | https://salamcampus.com/online-quran-classes-uae/ | https://madaniislamicacademy.com/online-quran-classes-in-uae/ | https://oqtservices.ae/

## Official references
- Google Organization structured data: https://developers.google.com/search/docs/appearance/structured-data/organization
- Google structured-data policies: https://developers.google.com/search/docs/appearance/structured-data/sd-policies
- Google Search spam policies: https://developers.google.com/search/docs/essentials/spam-policies
- Google Business Profile eligibility: https://support.google.com/business/answer/13763036
- US DOT daylight-saving guidance: https://www.transportation.gov/regulations/daylight-saving-time
- Australian Fair Work Ombudsman daylight-saving guidance: https://www.fairwork.gov.au/tools-and-resources/library/K600489_Daylight-saving-in-Australia
- UAE Government education-institute licensing guidance: https://u.ae/en/information-and-services/education/licensing-private-educational-institutes

## Release gates
PR CI must pass. Inspect preview `/llms.txt` output and country hub pages. Production deployment must be READY and canonical-host smoke tests must pass before calling the change live. GSC, GA4, field CWV and third-party profile ownership remain unverified until authenticated evidence exists. After final verification, pause; do not schedule monitoring or send outreach without a new instruction.
