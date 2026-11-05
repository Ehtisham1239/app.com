# OQC deep competitor reverse-engineering and implementation audit
**Research date:** 5 November 2026  
**Markets:** United Kingdom, United States, Canada, Australia, United Arab Emirates  
**Repository:** https://github.com/Ehtisham1239/app.com  
**Website:** https://www.onlinequrancollege.com  
**Status:** Public-source competitor sample + repository/CMS audit + implementation in pull request. Not a verified Google top-10 ranking study.

## 1. Executive findings

OQC already implements much of the feature set visible on competitor websites:
- Five canonical country hubs, with online-only positioning and country-specific scheduling guidance.
- City/time-zone-aware scheduling, local currency display, approved local price data or clearly labelled approximate FX estimates.
- A three-day free trial on eligible plans; the Weekend plan is excluded.
- A short lead form that captures learner name, age band, country/city, phone, email, course interest, teacher preference and contact consent.
- Public teacher profiles (six currently active/public in the CMS), courses, learning guides, pricing comparison, parent/results portal route, FAQ and a Quran practice-tools page linking to Tarteel and Quran.com.
- Organization/Website, Service, Breadcrumb, FAQ, BlogPosting and teacher-list structured data in source.

The strategy is therefore not “copy competitors and add hundreds of pages”. It is to strengthen the proof behind the existing service, improve useful tools and keep the brand's public facts consistent. Country pages and keyword maps already exist; creating duplicate market pages or city doorway pages would add risk, not value.

## 2. Method and evidence boundary

This audit combines:
1. Public search-result and public-page sampling of providers in the five markets.
2. Existing OQC competitor watchlists and keyword maps.
3. Repository inspection of the homepage, country hubs, pricing, trial, teachers, learning guides, practice tools, sitemap, robots, metadata and JSON-LD.
4. Read-only Supabase inspection of public settings and the public teacher-profile count/content fields.
5. Existing Search Console query export covering 25–30 October 2026.

**Important:** The providers below are a competitor watchlist and feature sample, not a proven top-10 list by organic traffic or market share. Search results vary by location, device, query and date. Competitor marketing claims, qualifications, student totals, ratings and prices are not independently audited. No competitor code, copy, images, reviews, or private analytics were accessed or copied.

## 3. Market-by-market reverse engineering

### United Kingdom

**Providers sampled**
- Learn Quran Academy (learnquraan.co.uk): public page presents a 3-day trial, monthly child progress assessment, a student web portal, teacher preference and parent/student testimonials.
- UK Quran Academy (ukquranacademy.com): public page promotes UK scheduling, parent progress reports, a student app and safeguarding/credential claims. Its page also shows contact information in Pakistan and several numeric trust widgets displaying zero in the extracted page; these are not proof of UK establishment or credential verification.
- Quran Schooling, QuranHost, TarteeleQuran, Studio Arabiya, Mishkah Academy, Learn Quran Centre, Quran Teacher UK and Al-Azhar Quran Teaching remain in the watchlist from the 3 November market map.

**What appears to help conversion**
- UK-specific language and school-hour scheduling.
- Parent-visible feedback/progress process.
- Clear class frequency, duration, GBP price and trial eligibility together.
- Evidence-led teacher and safeguarding information.

**OQC response**
- UK hub, city/time-zone planner, GBP price handling, kids/adults paths, trial and pricing pages already exist.
- The opportunity is to show a real, anonymised progress-report example and explain the actual parent review cadence. Do not invent a report or promise weekly/monthly feedback unless Academic Operations confirms the process and supplies a consented sample.

### United States

**Providers sampled**
- eQuran Academy (equranacademy.org): advertises a short Tajweed placement test, Hifz planner, course tiers and progress reporting.
- Quran Academy USA (quranacademyusa.com): public FAQ describes a 30-minute teacher-led free trial without card details, beginner pathway and rescheduling terms.
- IQRA Network, Tafheem ul Quran Academy, Al Madina Quran Academy, TQAPK Academy, Musa Quran Academy, Tayyaba Quran Academy, Quran In Depth, Riwaq Al Quran and Studio Arabiya remain in the watchlist.

**What appears to help conversion**
- A concrete starting-level diagnostic rather than a generic “contact us”.
- Beginner/revert pathways and a clear trial experience.
- Transparent USD fees and rescheduling terms.
- A practical Hifz planning utility.

**OQC response**
- US hub and time-zone guidance, trial, teacher preference, pricing, course paths and FAQs exist.
- OQC now adds an original Hifz arithmetic planner (see section 8). It does not grade recitation or prescribe an academic workload.
- A self-scored Tajweed placement test is deferred until Academics approves the rubric and answer key. No AI-generated religious assessment should be presented as authoritative.

### Canada

**Providers sampled**
- Her Quran Academy (herquranacademy.com/online-quran-classes-canada/): page highlights coast-to-coast time zones, local CAD pricing, after-school/weekend scheduling and an online-only disclosure.
- Canadian Quran Academy (canadianquranacademy.com/pricing/): publishes plan prices by lesson length and weekly frequency.
- Online Quran Academy USA, Online Quran Academy UK, Tafheem ul Quran Academy, The Quran Academy (Mississauga), EQuran School, Quran-Online.ca, Al Quran Desk, Canada Quran Academy, Ijaazah Academy and Quran4Kids remain in the watchlist.

**What appears to help conversion**
- Explicit coverage across Pacific, Mountain, Central, Eastern and Atlantic time zones.
- CAD fees with class duration and weekly lesson count.
- Clear parent contact and child privacy information.

**OQC response**
- Canada hub and time-zone-aware trial form exist; local currency and fee estimates are shown with approximation labels where no approved CAD rate exists.
- Do not claim French-language teaching, Canadian staff, a Canadian office or provincial registration without evidence.
- Validate the CAD prices in the CMS against Admissions' current approved offer before publishing a comparative price guide.

### Australia

**Providers sampled**
- Online Quran Learnings (onlinequranlearnings.com): public page provides country currencies and market-specific scheduling, with AUD pricing in its public content.
- Academy for Quran (academyforquran.com): advertises Australia alongside other markets, with one-to-one teaching, a trial and country price messaging.
- Her Quran Academy, QuranHost, IQRA Network, Riwaq Al Quran, Studio Arabiya, Quran Schooling, Al-Azhar Classes, Firdaws Academy, TarteeleQuran and Shaykhi Academy remain in the watchlist.

**What appears to help conversion**
- State-aware daylight-saving guidance, not one generic “Australia time”.
- AUD price clarity and after-school/weekend windows.
- Clear distinction between online coverage and a physical Australian office.

**OQC response**
- Australia hub includes city/date-aware scheduling and DST guidance, AUD fee display and online-only disclosure.
- Avoid claiming local staff, ABN, accreditation or an Australian teaching centre.
- The Australia keyword sample has the largest low-ranking commercial query gap in the supplied GSC extract (13 impressions, average position 89.7 for “online quran classes australia”, 25–30 Oct 2026). This is a small, short-window sample, not a stable ranking baseline.

### United Arab Emirates

**Providers sampled**
- Her Quran Academy (herquranacademy.com/online-quran-classes-uae/): public page highlights Gulf Standard Time, AED prices, after-school/weekend times and an online-only disclosure.
- Online Quran Learnings (onlinequranlearnings.com/uae/): page presents AED pricing, trial terms and a family-oriented course offer.
- QuranHost, IQRA Network, Riwaq Al Quran, Studio Arabiya, Al-Azhar Classes, Shaykhi Academy, Firdaws Academy, Quran In Depth and TarteeleQuran remain in the watchlist.

**What appears to help conversion**
- Clear Asia/Dubai scheduling and AED fees.
- Plain explanation that lessons are online, not a local branch.
- Clear trial, teacher preference, payment and cancellation terms.

**OQC response**
- UAE hub, Asia/Dubai time zone, AED quote guidance, trial flow and online-only/legal-eligibility disclosure exist.
- No UAE office, local staff, trade licence, educational-centre permit or Google Business Profile should be claimed or created without evidence and eligibility.
- No UAE query appears in the supplied 25–30 October GSC sample; this is a measurement gap, not proof of zero search demand.

## 4. Cross-market feature comparison

| Competitor pattern | OQC baseline | Gap / safe action |
|---|---|---|
| Country-specific currency and timetable | Implemented across five hubs | Recheck CMS fee approval and teacher availability periodically |
| Trial explained as a real teacher-led experience | Three-day eligible-plan trial and coordinator confirmation implemented | Use consistent wording on social profiles and stale indexed snippets |
| Parent progress reports / portal | Parent/results portal route exists; teacher page invites families to ask about feedback | Publish a sample only after Academics approves a consented, anonymised report and confirms actual cadence |
| Teacher credentials and profiles | Six public teacher profiles in CMS with public qualification text | Verify documents/consent internally; do not mark text-only claims as formally verified credentials in JSON-LD |
| Interactive Tajweed placement test | Not currently implemented | Defer until Academic team approves a rubric, answer key, accessibility and review process |
| Hifz planning calculator | Newly implemented in this PR | Arithmetic-only; teacher decides workload and revision method |
| Learning resource centre | Implemented at /learn and /quran-study | Add resources only when original, useful, academically reviewed and maintained |
| Local branch / office proof | OQC is online-only | Do not imitate competitors' local-office/GBP claims |

## 5. Search Console evidence and ranking interpretation

The supplied content/seo-agent/gsc-observed-queries-2026-10-30.csv contains a short 25–30 October sample:
- UK “online quran classes uk”: 18 impressions, average position 13.3.
- UK “learn quran online uk”: 16 impressions, average position 48.9.
- USA sample is mostly broad/local and low-volume; “quran classes” has 16 impressions at average position 35.6.
- Australia “online quran classes australia”: 13 impressions at average position 89.7; “quran online australia” has 4 impressions at average position 27.
- Canada “online quran classes canada”: 1 impression at average position 83.
- No UAE query is present in this extract.

These figures are not sufficient to calculate share of voice, competitor ranking, keyword volume, or a reliable trend. Fresh GSC query/page/country/device exports over at least 28–90 days are required. Search volume, difficulty, CPC, competitor organic traffic and current top-10 ranking positions are not verified here.

## 6. Technical SEO and AI-search audit

**Already present in source**
- Canonical www host, sitemap generation from published content, index/noindex controls, metadata, breadcrumb structure and route-specific page metadata.
- Robots policy permits major search crawlers and AI-search retrieval crawlers on public content while disallowing admin/auth/API/parent paths.
- Structured data: Organization/WebSite graph, Service on market pages, FAQPage where visible FAQs exist, BreadcrumbList, BlogPosting and teacher ItemList.
- Existing technical audit recorded 76 sitemap URLs with zero findings and 49 image responses checked; separate sample Lighthouse runs reported high lab scores. These are prior audit results, not live field Core Web Vitals or proof of indexing.
- Existing site includes a Quran practice tools page linking to the official Tarteel and Quran.com services, without implying ownership or partnership.

**Authenticity safeguards included in this PR**
- Remove the CMS established=2018 value from Organization foundingDate until the brand-history claim is supported by documentation and reconciled with the current legal entity.
- Do not emit teacher qualification text as formal hasCredential structured data unless the underlying credential evidence has been checked.
- Do not add aggregateRating or review schema based on the small Trustpilot profile, and do not create LocalBusiness schema for an online-only academy.
- Remove the unverified “usually within 24 hours” fallback from the trial confirmation UI.

**AI search**
Google's current guidance says AI Overviews/AI Mode rely on normal Search eligibility and helpful, reliable, people-first content; there is no special AI schema or required AI text file. Prioritise crawlability, indexability, visible text, accurate schema, internal linking and expert-reviewed original content. Do not add unnecessary llms.txt, fake citations, keyword blocks or AI-generated scaled pages. AI citation visibility is not claimed by this audit.

## 7. Content, authority citations and backlinks

**Content**
- OQC's existing content inventory audit recorded 32 published posts and 3 in review; the 12 posts dated 2–4 November were under the 1,000-word editorial ceiling and had SEO titles, descriptions, focus phrases and cover alt text.
- That 12-post audit found no external references in the HTML bodies. This is not automatically a defect: cite factual claims where a reliable primary source exists, and add Quran/Hadith references only after exact source verification and Academic review.
- No unreviewed Tafseer, disputed fiqh, or religious ruling should be auto-published. A Mufti/scholar review is required for disputed or fatwa-level content.

**Existing authority citation strategy**
- Market hubs link to relevant government/regulator sources (UK GOV.UK/ICO/ASA, USA DOT/FTC, Canada NRC/CRTC/OPC, Australia Fair Work/ACMA/ACCC, UAE Government/ADDED). These are visible references for legal/time-zone guidance, not endorsements or backlinks to OQC.
- Existing global citation tracker and link prospects identify resource-submission opportunities with ISRE, ISLA and RISE. No outreach or placement is recorded as completed.
- Exclude publishers whose stated policy rejects AI-generated work; never relabel AI-authored copy as human-written.
- Do not buy links, use mass directory submissions, reciprocal link schemes, automated profile creation or irrelevant guest posts.
- Google Business Profile and customer-location directories are excluded because OQC is online-only and has no eligible in-person customer-contact location.

**External profile consistency risk**
- Public LinkedIn snippets contain historical claims such as “trusted since 2014”, “1,000+ students” and a 5-day trial. These conflict with current website/CMS messaging and are not independently substantiated in this audit. Owner should review the LinkedIn About section and old posts, then align only after documentary evidence is available. No LinkedIn edit was made.
- A public About-page search snapshot still displays 2018 and 25+ countries, while the currently inspected CMS About body does not. Treat the search result as a potentially stale indexed snapshot; verify the public HTML and request recrawl through the owner’s Search Console property. Do not reintroduce those figures in schema or new copy without evidence.

## 8. Implementation in this PR

1. **Original Hifz and revision planner** at /quran-study/hifz-planner:
   - Uses only page counts and days per week entered by the visitor.
   - Calculates new pages per selected study day, estimated study weeks and revision pages per revision day.
   - Uses no hard-coded Mushaf page total.
   - Sends no entered values to the server or analytics.
   - Explicitly states that it is arithmetic only and the teacher sets the academic workload.
   - Linked from /quran-study and included in the XML sitemap.
2. **Trial conversion trust:** removes the unsupported 24-hour response-time fallback.
3. **Teacher structured-data authenticity:** qualification text remains visible on public profile pages but is not mapped to EducationalOccupationalCredential without evidence-backed verification.
4. **Organization authenticity:** no unverified CMS founding year is emitted.
5. **Regression tests:** arithmetic edge cases, invalid input, sitemap/link visibility, teacher credential schema guard and no response-time promise.

## 9. Prioritised next actions

| Priority | Action | Owner / evidence gate |
|---|---|---|
| P0 | Complete CI, Vercel preview and production smoke for this PR; deploy only after owner approval | Engineering |
| P0 | Verify GSC property and export 28–90 days of query/page/country/device data; submit sitemap and inspect five country hubs | Owner access |
| P0 | Reconcile legal entity number, registered office, company incorporation and brand-start history against the correct official Companies House record | Owner / Finance |
| P1 | Reconcile LinkedIn and stale indexed About snippets with current website claims | Owner-controlled profile + GSC |
| P1 | Academic review of Hifz planner wording and any future Tajweed placement rubric | Head of Academics |
| P1 | Create a real, anonymised parent progress-report example and confirm cadence before publishing | Academic Operations + consent |
| P1 | Qualify and send one resource pitch at a time to ISRE/ISLA/RISE after sender authorisation and owner approval | Owner / Outreach |
| P2 | Monitor AI search visibility and Search Console Web search queries; report actual citations/mentions only when captured | SEO operations |

## 10. Official policy references

- Google Search Essentials: https://developers.google.com/search/docs/essentials
- Google AI features and website guidance: https://developers.google.com/search/docs/appearance/ai-features
- Google generative AI optimisation guide: https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
- Google spam policies: https://developers.google.com/search/docs/essentials/spam-policies
- Google Organization structured data: https://developers.google.com/search/docs/appearance/structured-data/organization
- Google structured data policies: https://developers.google.com/search/docs/appearance/structured-data/sd-policies
- Google Business Profile eligibility: https://support.google.com/business/answer/13763036
- Companies House register: https://find-and-update.company-information.service.gov.uk/

## 11. Release boundary

The report and source changes are committed on the existing PR branch. A PR preview deployment is not a production release. CI and the responsive/live-performance checks must finish successfully, and the owner must approve the production release. Search Console access, live AI citations, new external backlinks, external profile edits, legal entity reconciliation and religious academic sign-off remain open evidence gates.
