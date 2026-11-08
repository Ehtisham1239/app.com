# OQC brand, enquiry and SEO execution · 7 November 2026

## Implemented

- Homepage buttons have full-width mobile tap targets. The hero and enquiry cards reuse the official OQC mark and existing green and gold palette. The USA landing page uses the same cached mark.
- Optional trial preferences and contact fields open on demand. The main trial form precedes the supporting details on mobile. On the USA landing page, teacher preference and preferred lesson time are optional, while time zone and the existing admissions workflow are retained.
- The contact page identifies OQC in its H1, uses a dialable telephone link, and declares a ContactPage linked to the shared Organization entity. The existing metadata, canonical, robots, sitemap, international alternates, and image pipeline remain the technical audit targets.
- The trial, contact and review notification implementation continues to require production mail configuration. Public form persistence and mail delivery are separate.

## Baseline and evidence

The [5 November baseline](ORGANIC-GROWTH-BASELINE-2026-11-05.md) records 3 Search Console clicks and 579 impressions across USA, UK, Australia, Canada and UAE during its 90-day reporting window. The [keyword map](../../seo/OQC-500-KEYWORD-MAP-2026-11-05.csv) has 79 observed Search Console queries and 421 semantic candidates. It is dated evidence. New Search Console, GA4, Bing and competitor referring-domain exports were unavailable in this execution. Indexed pages, fresh field Core Web Vitals, qualified leads and paid enrolments were not remeasured.

Use the [competitor benchmark](COMPETITOR-BENCHMARK-ONLINE-QURAN-ACADEMIES-2026-11-02.md), [market research](LIVE-KEYWORD-COMPETITOR-RESEARCH-2026-11-05.md) and public offer checks as directional comparisons. Public checks covered [TarteeleQuran](https://www.tarteelequran.com/), [Tarteel Global](https://www.tarteelglobal.com/courses), [Academy for Quran](https://academyforquran.com/), [JoinQuran](https://www.joinquran.com/) and [IQRA Network](https://iqranetwork.com/). Their public pathways reinforce the value of clear course selection, regional schedules and transparent trial terms. These checks do not establish search rank or competitor backlinks.

## Citations and link acquisition

The [qualification register](CITATION-QUALIFICATION-2026-11-07.csv) has 50 unique domains, including 28 current checks and 22 historical entries. Five are potential free candidates pending eligibility and duplicate checks. One existing public profile was reverified. Traffic, authority, link attributes and 100-point scores remain unverified where source data is missing. There were zero new submissions and zero new verified links. The 130-domain qualified pipeline and 5,000-link target were not reached.

| Priority | Candidate | Verified evidence | Remaining checks |
|---|---|---|---|
| 1 | [Support Muslim](https://www.supportmuslim.com/) | Free basic visibility and education and online-services categories | Registration, exact category, duplicate search and public link |
| 2 | [The Ummah Directory](https://theummah.io/resources/businesses/submit/) | Public service-brand submission route | Confirm free profile, online-only eligibility and crawlable profile |
| 3 | [MuslimMap](https://muslimmap.co.uk/for-businesses) | Free standard listing and Quran classes category | Confirm address-free listing and exact website link |
| 4 | [Muslim Businesses UK](https://www.muslimbusinesses.co.uk/) | Public free tier | Confirm online-only eligibility and public website field |
| 5 | [Muslim Homeschooling Hub](https://themuslimhomeschoolinghub.com/) | Free tutor signup advertised | Confirm academy eligibility and public listing |
| Existing | [Trustpilot](https://www.trustpilot.com/review/onlinequrancollege.com) | Claimed public profile links to OQC | Verify admin access before edits. Avoid duplicate profiles |

**Citation profile for review:** Online Quran College offers live, one-to-one online Quran lessons for children and adults. Families can enquire about course options, teacher preferences and scheduling through the website. Delivery is online. Use [the canonical website](https://www.onlinequrancollege.com/), the contact information on [the official contact page](https://www.onlinequrancollege.com/contact), and the [official mark](https://www.onlinequrancollege.com/brand/mark-v2-128.png). Leave address fields blank where permitted. If a truthful online-only listing is unavailable, record the exclusion.

Google excludes online-only businesses without in-person customer contact from [Business Profile](https://support.google.com/business/answer/13763036?hl=en-en). Its [search spam policies](https://developers.google.com/search/docs/essentials/spam-policies) cover automated and low-quality directory links. [Bing’s guidance](https://www.bing.com/webmasters/help/link-building-7a3f99b7) favours naturally earned links. Track the exact referring URL, destination, attribute and verification date only after a link is live. The brief requires approval for external submissions and account creation. Editorial pitches, articles and distribution are outside this execution.

## 90-day backlog

| Window | Work and acceptance evidence |
|---|---|
| Days 1–14 | Obtain fresh Search Console, GA4 and Bing exports. Capture market, device, page, indexed URL and attribution baselines. Extend eligibility research for USA, Australia, UK, Canada and UAE, then New Zealand, Hong Kong and Singapore. |
| Days 15–30 | Compare canonical and sitemap reports, audit hreflang reciprocity and mobile layouts, and prioritize fixes by impact. Map verified commercial queries to existing country and course pages. Record measured field performance separately from lab audits. |
| Days 31–60 | Deduplicate existing brand profiles and qualify address-free directories. Review exact proposed listings with the owner, record decisions, and verify any approved published citation before counting it. |
| Days 61–90 | Reconcile organic landing-page activity with CMS enquiries, qualified trials and actual paid enrolments. Review referral evidence and decide which markets and citation channels merit the next cycle. |

## Release checks

- Local production build and ESLint passed. The full test suite passed 326 tests.
- The read-only technical, page quality and keyword-placement audits passed across all 51 URLs in the local seed-data sitemap. They checked 41 top images and found zero audit failures. This is not a production CMS crawl or an indexing measurement.
- The local build’s static asset integrity check covered 227 rendered HTML files with zero missing references. Production release status is tracked in the pull request and Vercel deployment.
