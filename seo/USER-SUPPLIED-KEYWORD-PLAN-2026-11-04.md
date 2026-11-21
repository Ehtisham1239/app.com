# OQC keyword-plan integration — 4 November 2026

## Source of truth
This integration uses the owner-supplied 7-page Website Keyword Plan and 1-page Australia keyword additions, both supplied 4 November 2026. The documents provide keyword themes, not search volume, difficulty, CPC, current rank, SERP evidence or conversion data. All unmeasured terms remain hypotheses until validated in Search Console and market-specific SERP reviews.

## Canonical keyword-to-page architecture

| Intent / cluster | Source keyword themes | Canonical target | Implementation rule |
|---|---|---|---|
| Brand + primary commercial | Online Quran College; Online Quran Academy; Online Quran Education | Homepage / | Keep brand and broad academy positioning on homepage; do not duplicate broad head terms across every page. |
| Core service | Online Quran Classes; Learn Quran Online; Online Quran Lessons; Live Online Quran Classes; One-to-One Online Quran Classes | Country location pages; homepage for global brand/service | Country pages target country modifiers; homepage retains global proposition. |
| Children | Quran Classes for Kids; Quran Teacher for Kids; Online Quran Classes for Kids | /learn/quran-for-kids | Add country modifiers only where useful; do not create thin duplicate child pages per country. |
| Adults | Quran Classes for Adults; Quran Learning for Adults; Private Quran Lessons for Adults | /learn/quran-for-adults | Keep adult beginner intent distinct from children intent. |
| Noorani Qaida | Online Noorani Qaida Classes; Noorani Qaida Online; Learn Noorani Qaida Online | /courses/noorani-qaida | Beginner reading and Arabic-letter learning cluster. |
| Quran reading / Nazara | Quran Reading Lessons; Quran Nazara Classes; Online Quran Reading Classes; Quran Recitation Classes | /courses/quran-nazara | Keep reading/recitation intent distinct from Tajweed instruction. |
| Tajweed | Quran Classes with Tajweed; Online Tajweed Classes; Makharij; pronunciation | /courses/tajweed | Focus on rules, articulation and guided recitation practice. |
| Hifz | Online Hifz ul Quran Classes; Quran Memorization Online; Hifz with Revision; Memorize Quran Online | /courses/hifz-quran | Include Sabaq, Sabqi and Manzil only where actual teaching supports them. |
| Arabic | Online Arabic Language Classes; Learn Arabic Online; Quranic Arabic; Arabic Grammar; Nahw and Sarf | /courses/arabic-language | Distinguish Arabic language learning from Quran reading. |
| Translation / Tafseer | Online Quran Translation Classes; Quran Tafseer Online; Quran Meaning; Quran Understanding | /courses/quran-translation and existing Tafseer target if present | Verify actual route and course availability before publishing a new destination. |
| Hadith / Islamic Studies | Online Hadith Classes; Islamic Studies Online; Islamic Studies for Kids/Adults; Wudu and Salah | /courses/hadith-translation and /learn/islamic-studies-for-kids | Match the real course; do not imply scholarly fatwa services. |
| Fees / packages | Online Quran Classes Fees; Course Fees; Monthly Packages; Price; Private Tutor Fees | /pricing | Approved CMS price takes precedence; never infer or fabricate a fee. |
| Trial / enrolment | Book Online Quran Classes; Free Online Quran Trial; 3 Days Free Quran Classes; Admissions | /free-trial | State accurately: 3-day trial on eligible plans; Weekend plan excluded; no card needed on eligible plans. |
| Teacher preference | Female Quran Teacher; Male Quran Teacher; Online Quran Tutor; Qualified Teacher | Relevant country page + teacher information | Explain preference/enquiry process; do not publish unverified credentials or guaranteed availability. |
| Flexible schedule | Flexible Online Quran Classes; Learn Quran from Home; International Students | Country landing pages | Preserve actual time-zone conversion and daylight-saving logic; do not claim local physical branches. |

## Priority country mapping

| Market | Canonical target | Source keyword family |
|---|---|---|
| United Kingdom | /locations/united-kingdom | Online Quran Classes UK; Online Quran Lessons UK; Quran Teacher UK; London/Birmingham/Manchester; kids/adults modifiers. |
| United States | /locations/united-states | Online Quran Classes USA; Online Quran Lessons USA; Quran Teacher USA; New York/Los Angeles/Chicago/Houston/Dallas. |
| Canada | /locations/canada | Online Quran Classes Canada; Online Quran Teacher Canada; Quran Lessons Canada; Toronto/Vancouver/Montreal/Calgary/Ottawa. |
| Australia | /locations/australia | Online Quran Classes Australia; Online Quran Teacher Australia; Quran Lessons Australia; Sydney/Melbourne/Brisbane/Perth/Adelaide; kids, academy and best-classes terms from the addendum. |
| United Arab Emirates | /locations/united-arab-emirates | Online Quran Classes UAE; Online Quran Teacher UAE; Quran Lessons UAE. |

City modifiers are not authorization to publish thin city landing pages. Existing canonical country pages remain the target unless a city page has unique, verifiable audience value and passes indexation review.

## Supporting / informational topics
The supplied plan includes Quran learning, education, Tajweed rules, pronunciation, recitation practice, memorization, revision, Sabaq/Sabqi/Manzil, Juz Amma, Arabic vocabulary/grammar, Hadith translation, interactive online learning and Quran study at home. Use these within relevant course pages and the existing editorial calendar. Create a separate article only where it answers a distinct informational query and does not compete with a commercial landing page. Topics such as total ayat in Quran, how many times Muhammad is mentioned, and para-specific searches require careful factual sourcing and should not be forced into commercial landing pages.

## Search intent and conversion alignment
1. Informational: learning pathways, Qaida vs Quran reading, Tajweed practice, Hifz revision, adult beginner plans and parent progress reviews.
2. Commercial investigation: teacher selection, course suitability, teacher preference, timetable, fees and learning format.
3. Transactional: pricing, free-trial request and enrolment.
4. Navigational / brand: Online Quran College and official contact/review destinations.

Each page should have one primary intent, a clear H1/title, a useful opening answer, relevant internal links, one primary conversion action and accurate structured data. Avoid repeating the same broad keyword in every title.

## Immediate implementation order
1. Protect the existing homepage and canonical country routes; no redirect or slug changes in this integration.
2. Validate existing course, audience, pricing and trial destinations against the live route inventory before adding links or pages.
3. Use GSC query/page exports to replace hypotheses with observed queries, impressions, clicks, CTR and position; retain country filters and date windows.
4. Refresh existing course and country pages first; remediate existing blog content before commissioning new articles.
5. Add internal links from relevant informational articles to one matching course page and the trial page.
6. Validate indexability, canonical, title uniqueness, breadcrumbs, sitemap membership, mobile rendering and CTA/form completion after each release.
7. Monitor qualified trial enquiries, enrolments and retention—not rankings or traffic alone.

## Guardrails
- Do not treat this keyword list as proof of search demand or ranking difficulty.
- Do not create keyword-stuffed, doorway or near-duplicate country/city pages.
- Do not publish fake local branches, regional prices, student counts, testimonials, teacher credentials or availability.
- Do not claim ranking improvements, AI citations, backlinks or traffic gains without measured evidence.
- Preserve approved analytics/GTM and consent decisions documented in AGENTS.md.
- Keep editorial articles to OQC's established maximum of 1,000 words unless the owner changes that limit.
- Religious references must be checked against reliable sources; disputed or fatwa-level content requires qualified scholar review.

## Status
Designed / repository-documented: source keyword themes, canonical intent clusters, priority-market mapping and execution guardrails.
Not yet implemented by this document: page-copy edits, metadata changes, new pages, link changes, CMS publication or deployment.
Blocked for evidence-based prioritisation: fresh GSC/GA4 exports, market-specific SERP validation and conversion baselines.
