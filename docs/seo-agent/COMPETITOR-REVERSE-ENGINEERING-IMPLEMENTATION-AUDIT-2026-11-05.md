# OQC competitor reverse-engineering and implementation audit
**Audit date:** 5 November 2026  
**Markets:** United Kingdom, United States, Canada, Australia, United Arab Emirates  
**Repository:** https://github.com/Ehtisham1239/app.com  
**Canonical site:** https://www.onlinequrancollege.com  
**Method:** public-page observation, source-code review, existing SEO/citation registers, and current web-search sampling. This is not a paid rank-tracking export and must not be described as a definitive top-10 SERP ranking.

## 1. Executive findings

OQC already has a more complete technical/content foundation than a simple brochure site:
- Shared `WebSite` + `EducationalOrganization` JSON-LD graph with stable entity IDs, service area, knowledge topics, contact details, editorial principles and CMS-configured public profile URLs.
- Canonical metadata, Open Graph, server-rendered page content, sitemap filtering, explicit robots rules, course/location/blog/teacher routes and redirect controls.
- Five market hubs with local currency, date/time-zone planning, local guidance, visible official reference links and trial entry points.
- Pricing comparison and currency selection, fee FAQ, trial terms and country prefill.
- Parent academic workspace/results, teacher pages, editorial standards, learning guides and consent-gated testimonials.
- AI assistant discovery file at `/llms.txt`, linked public learning articles, and a public RSS feed.

**Main strategic gap is not missing generic SEO markup.** It is first-hand, independently verifiable academic and parent evidence that competitors can display more prominently: documented teacher experience, sample progress reporting, how assessments are conducted, safeguarding procedures that actually apply, and verified student/parent outcomes with explicit permission. OQC must not invent these to match competitor claims.

## 2. Competitor sampling and observed patterns

The competitor list below is a qualitative sample of public pages surfaced in the 5 Nov 2026 search run. Search results vary by location, device, query, time and personalisation. These entries are not a verified ranking order, and competitors' self-published claims are not independently validated by OQC.

### UK
| Competitor | Publicly visible pattern | What OQC can learn (not copy) | OQC response |
|---|---|---|---|
| Learn Quran Academy — https://learnquraan.co.uk/ | Since-2006 positioning, visible GBP packages, 3-day trial, teacher choice, student portal and progress recorded after lessons | Explain the actual progress loop and trial experience with evidence; make package comparisons easy | OQC already has monthly packages, trial terms, parent results area and Learn → Practice → Assessment → Feedback → Improve. Add a real redacted sample report only after academic/parent approval. |
| UK Quran Academy — https://ukquranacademy.com/ | Strong parent-facing language, weekly progress logs, safeguarding/DBS and Ijazah claims, student app, UK school-hour schedules | Parents look for practical visibility and safeguarding answers | OQC must publish only the checks and qualifications it can document. Do not echo unverified DBS/Ijazah claims. |
| Her Quran Academy — https://herquranacademy.com/online-quran-classes-uk/ | Female-teacher-only niche, UK time planning, GBP pricing, explicit online-only status | Clear audience segmentation and no-physical-centre disclosure | OQC already offers teacher preference and online-only disclosure; consider a clearly scoped sisters' learning guide only if teacher availability and audience fit are confirmed. |

### USA
| Competitor | Publicly visible pattern | What OQC can learn (not copy) | OQC response |
|---|---|---|---|
| Online Quran Academy USA — https://onlinequranacademy.us/ | Long-form comparison content (“top academies in Canada”), direct comparison criteria and broad market targeting | Useful informational content answers buyer questions before a trial | Create a transparent OQC-independent comparison methodology or “how to evaluate an online Quran teacher” guide; never self-award #1 or invent competitor weaknesses. |
| EQuran Academy — https://equranacademy.org/ | Pricing cards, progress-report claims, interactive placement test, Khatmah calculator and Hifz planner | Free learning utilities create useful entry points | OQC already has practice tools and printable trackers. Improve their discoverability and add a learner-level self-check only with academic review and clear non-fatwa/non-diagnostic framing. |
| Her Quran Academy — https://herquranacademy.com/faq/ | Simple local-currency/market answers and explicit parent-focused service information | Answer practical price, timezone, platform and parent questions clearly | OQC has FAQ and currency/market guidance. Keep answers synchronised with approved CMS pricing and actual operations. |

### Canada
| Competitor | Publicly visible pattern | What OQC can learn (not copy) | OQC response |
|---|---|---|---|
| Canadian Quran Academy — https://canadianquranacademy.com/pricing/ | CAD prices split by 30- and 45-minute lesson packages and weekly frequency | Make duration, weekly count and monthly total easy to compare | OQC's currency pricing and fee comparison should be checked for explicit lesson duration and equivalent class counts; no competitor price should be copied as OQC's price. |
| Canada Quran Academy — https://canada-quran.academy/pricing/ | CAD schedule tiers, monthly commitment framing and sibling discount | Explain cancellation, pause, rescheduling and family terms alongside price | OQC has policy links and sibling discount; ensure the exact terms are visible beside the pricing CTA and consistent with contract/CRM. |
| Her Quran Academy — https://herquranacademy.com/faq/ | CAD amounts, teacher/time-zone answers and parent-facing FAQ | Reduce enquiry friction by answering price and schedule questions | OQC's Canada hub already has local time-zone and CAD guidance; add a verified answer only when CMS and Admissions policy match. |

### Australia
| Competitor | Publicly visible pattern | What OQC can learn (not copy) | OQC response |
|---|---|---|---|
| Australian Quran Academy — https://australianquranacademy.com/pricing/ | AUD class-frequency tiers and 30-/45-minute packages | Make class duration and monthly frequency comparable | Check OQC AUD plan display for the same dimensions and explain when converted figures are approximate. |
| Her Quran Academy — https://herquranacademy.com/online-quran-classes-australia/ | State/time-zone and daylight-saving explanation, explicit online-only service, parent scheduling | Local practical detail matters more than city keyword repetition | OQC's Australian guide already covers state and daylight-saving differences; validate against official time guidance and keep city pages differentiated. |
| Khan Quran Academy — https://khanquranacademy.com/fee | Multi-currency fees including AUD and AED in one table | One global fee table can reduce confusion | OQC already has currency conversion and a country fee planner; ensure original approved prices are not presented as competitor-matched or guaranteed FX quotes. |

### UAE
| Competitor | Publicly visible pattern | What OQC can learn (not copy) | OQC response |
|---|---|---|---|
| Learn Quran UAE — https://learnquranuae.com/pricing/ | AED-facing pricing and UAE-specific positioning | Local currency and practical schedule information reduce friction | OQC has AED support and a UAE hub; verify exact live fee and trial eligibility before publishing claims. |
| Her Quran Academy — https://herquranacademy.com/online-quran-classes-uae/ | Emirate-wide online-only disclosure, GST/Pakistan time relationship, AED prices | UAE timing is straightforward but should be explicit | OQC's UAE guide should explain Asia/Dubai and PKT accurately, without implying a local UAE branch. |
| Khan Quran Academy — https://khanquranacademy.com/fee | USD, GBP, CAD, AUD and AED comparison | Multi-market currency visibility | OQC already supports multiple currencies; do not label converted prices as fixed local billing unless finance confirms. |

## 3. Cross-market competitor patterns

1. **Price clarity:** weekly frequency, monthly class count, session length, currency and sibling terms are usually visible before the enquiry.
2. **Trial clarity:** competitors prominently explain the number of free days/classes, whether card details are required and what happens after the trial.
3. **Parent trust:** progress reports, teacher biographies, qualifications and safeguarding are used as differentiators. These claims require evidence and should not be repeated without it.
4. **Practical scheduling:** country/state/time-zone answers are more useful than pages that merely swap city names.
5. **Useful tools:** placement tests, Hifz planners and Khatmah calculators create genuine informational value when accurately scoped.
6. **Informational comparison content:** “how to choose” and transparent comparison guides can satisfy research intent, but self-serving “top 10” lists require clear methodology and disclosures.

## 4. OQC source-code parity review

| Area | Existing OQC implementation | Audit disposition |
|---|---|---|
| Organization identity | `EducationalOrganization` + `Organization` graph, stable IDs, sameAs from CMS, contact point, conditional postal address, publishing principles | Retain. Do not add LocalBusiness or a fictitious office. PR removes unverified CMS founding year from `foundingDate`. |
| Technical SEO | canonical metadata, sitemap route filtering, robots rules, public server-rendered content, legacy redirects | No blanket rewrite. Run exact production crawl and index inspection once deployment and GSC access are available. |
| AEO/GEO | `/llms.txt`, RSS, FAQ answers, editorial standards, direct country/course answers, structured data | Keep as supporting discovery aids; no special AI schema or AI-ranking guarantee. Improve evidence quality, not keyword repetition. |
| Content | five market guides, country hubs, learning guides, course pages, teacher profiles, blog and free learning resources | Prioritise first-hand, reviewed teaching material and verified evidence. Avoid city-page proliferation. |
| Conversion | three-day eligible-plan trial, currency-aware pricing, trial form, lead-saved event, WhatsApp/contact paths | Validate actual form completion and CRM attribution with consent and analytics access; don't infer conversion rate from source code. |
| Trust | consent-gated testimonials, Trustpilot link, parent results area, privacy/terms/refund/editorial policies | Add only approved, redacted examples and documented safeguarding/teacher credentials. |
| Backlinks/citations | market official references, citation trackers, existing social profiles and Trustpilot profile | Owner verification and genuine editorial submissions only. No mass directory links, fake NAP, paid undisclosed links or automated reviews. |

## 5. Implementation backlog — prioritised and gated

### P0 — Safe source-code correction
- Remove `foundingDate` derived from the ambiguous CMS `established` field.
- Keep legal entity and brand history separate.
- Regression test prevents the unsupported date from returning.
- Document the evidence and citation boundaries.

### P1 — First-hand evidence package (requires OQC owner/academic input)
- One approved teacher-authored teaching note per core course, with named author only after identity/qualification review.
- One redacted sample parent progress report using synthetic/demo data clearly labelled as an example; never expose a real child's information.
- A factual safeguarding explainer reviewed by the responsible safeguarding lead; state only the actual policy and process.
- A clear teacher qualification standard, evidence source and review date for each published credential.
- A correction/contact route for content and Quran/Hadith reference issues.

### P1 — Conversion measurement (requires GSC/GA4/CRM access)
- Verify `generate_lead` event for trial and contact form success; no event on failed/abandoned form.
- Measure trial form start → submit → coordinator response → trial booked → attended → paid enrolment, by country and device.
- Validate campaign attribution and consent behaviour; do not send names, phone numbers, child details or free-text messages to analytics.
- A/B test only after baseline is available; do not change offer/price without Finance approval.

### P2 — Editorial and internal-link work
- One authoritative “How to choose an online Quran teacher for your child” guide, with a transparent checklist and sources; do not rank competitors without a reproducible methodology.
- One “What a parent should expect from a Quran progress report” guide, linked to a redacted approved example.
- One market-specific schedule explainer per country only where local rules create genuinely different answers.
- Add course ↔ country ↔ guide links only where they help users; keep homepage global and avoid doorway pages.

### P2 — Ethical backlink and citation acquisition
- Owner verifies existing Facebook, Instagram, X and Trustpilot profile access/details before profile edits.
- Owner approves and academic reviewer approves any Islamic school/resource submission.
- Submit genuinely useful resources to relevant educational organisations only when eligibility is met and the content is accepted editorially.
- Build relationships with parent/community/education publishers through original guides and teacher expertise; no guaranteed links.
- Do not create Google Business Profile, local directory NAPs, virtual-office citations or country-specific company claims for an online-only service without eligibility.

## 6. External evidence and policy references

Competitor pages (observational sources; self-published claims not independently verified):
- https://learnquraan.co.uk/
- https://ukquranacademy.com/
- https://herquranacademy.com/online-quran-classes-uk/
- https://onlinequranacademy.us/
- https://equranacademy.org/
- https://canadianquranacademy.com/pricing/
- https://canada-quran.academy/pricing/
- https://australianquranacademy.com/pricing/
- https://herquranacademy.com/online-quran-classes-australia/
- https://learnquranuae.com/pricing/
- https://herquranacademy.com/online-quran-classes-uae/
- https://khanquranacademy.com/fee

Primary policies and official sources:
- Google spam policies: https://developers.google.com/search/docs/essentials/spam-policies
- Google AI-generated content guidance: https://developers.google.com/search/docs/fundamentals/using-gen-ai-content
- Google Search Essentials: https://developers.google.com/search/docs/essentials
- Google Organization structured data: https://developers.google.com/search/docs/appearance/structured-data/organization
- Google structured-data policies: https://developers.google.com/search/docs/appearance/structured-data/sd-policies
- Google AI search owner guidance: https://blog.google/products-and-platforms/products/search/new-controls-website-owners/
- UK ICO / ASA, US FTC, Canada CRTC / OPC, Australia ACMA / ACCC and UAE official guidance are linked from the corresponding public OQC market guides.

## 7. Release and verification status

- Source correction and regression test were added to PR #111.
- The GitHub test-and-lint job, including production build, passed for commit `35e925c9ddb471f6f078bf9b22d69b23cdf9e2f8`.
- Responsive and live-performance audit jobs were still running at the last status check; do not mark the full CI suite green until completed.
- Vercel deployment listing returned a 403 access-denied response for the connected team/project during this run. No preview URL or production promotion is claimed.
- Live production page fetches through the available web fetcher returned cache misses; production crawl and canonical-host smoke test remain unverified.
- Search Console, Bing Webmaster and GA4 account data were not freshly authenticated. No current rankings, click-through rates, AI citations or qualified conversion rates are claimed.
- External profiles, third-party citations and outreach remain owner-controlled; no external edits/submissions were performed.

## 8. Success criteria for final closeout

1. PR checks all pass (tests, lint, production build, responsive audit and live performance/crawl jobs).
2. Preview is inspected for JSON-LD, canonical tags, robots, sitemap, mobile trial flow and all five market hubs.
3. Production deployment is READY, exact commit is confirmed, and canonical domain smoke tests pass.
4. Google Rich Results Test / Schema validator confirms syntactically valid entity graph; no claim that schema itself increases ranking.
5. Search Console URL Inspection and sitemap status are checked by an authorised account holder.
6. GA4/CRM trial funnel is tested with no personal data leakage.
7. All remaining owner/academic/finance approval gates are listed with evidence.

**No guarantee of first position, featured snippets, Knowledge Panel, AI Overviews or LLM citations is made.** The programme optimises for relevant discovery, factual trust and qualified trial-to-enrolment performance.
