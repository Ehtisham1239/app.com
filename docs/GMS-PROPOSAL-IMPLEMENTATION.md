# GMS proposal: implementation and operating handover

Reference: **Online Quran College SEO Growth Proposal By GMS Digitals.pdf**, supplied by the owner
on 22 October 2026. The owner requested implementation excluding agency costing. The PDF is a
reference audit of an earlier version, not a current crawl or proof of its teacher/review claims.
Its two-market priority supplements the existing location coverage; no existing country pages were
removed. The owner’s selected canonical origin remains the Vercel production host. DNS is unchanged.

## Delivery map

| Proposal area | Initial delivery | Remaining dependency or recurring work |
| --- | --- | --- |
| USA / Australia | Distinct, substantive CMS regional guides, market FAQs, local spelling/language metadata and date-aware planning. US examples cover Eastern, Central, Mountain and Pacific clocks and Phoenix; Australia uses actual city-specific/half-hour/seasonal zones. | Review against current business availability and actual market demand. |
| Proposed country URLs | Permanent aliases `/online-quran-classes-usa` and `/online-quran-classes-australia` lead to the existing canonical `/locations/...` pages. | No duplicate regional landing pages created. |
| Course discovery | Existing six course pages gain regional links, course-specific FAQs and matching schema. Removed an unsubstantiated fixed workload in schema and stopped showing unrelated course prices as the course’s own fee. | Standalone new curricula, teacher credentials and prices need approved information. |
| Tajweed / kids / adults | Four editable learning guides, a `/learn` hub and a dedicated `/courses/tajweed` discovery guide connect to actual existing course enquiries. | Tajweed is presented in relation to existing reading study, not a newly invented qualification or independently priced offering. Islamic learning for kids asks about actual suitability rather than inventing a new programme. |
| Blog and content clusters | Twelve original practical launch articles, connected to guides, relevant courses and priority markets. Crawlable pagination and topic navigation keep older articles reachable. | The monthly publishing programme is ongoing editorial work, not a one-time claim of six months’ delivery. Refresh against real questions and teacher review where appropriate. |
| Keyword map | 60 suggested USA/Australia themes mapped to canonical targets, exported as CSV and editable as private CMS growth tasks. | These are hypotheses; search volumes, actual queries and rankings await authorised research data. |
| Technical/schema | Canonicals, sitemap/guide aliases, course/FAQ/breadcrumb/article relationships and the existing trial destination are aligned. No fabricated review schema or unsupported accreditation. | Validate supported rich-result eligibility with official tools; parseable markup alone does not guarantee a rich result. |
| Conversion | Existing persisted trial/contact forms and attribution preserved. Date-aware city prefill plus coarse first-party `oqc:lead-saved` success events. | External GA4 transport requires the owner’s property configuration and consent/event decisions. |
| USA vs Australia results | Protected CMS country-cohort report from actual saved forms: trials, contacts, reviewed trials, enrolled status and trial-to-enrolled percentage. | This is all-source enquiry reporting, not organic-session attribution or historical enrolment conversion. Role permissions constrain which enquiry types are counted. |
| Baselines and reporting | Private CMS source-evidence records distinguish Search Console clicks/impressions from GA4 organic sessions. Unknowns stay blank; evidence required. Six future monthly review tasks are seeded. | Owner property access/exports and elapsed reporting periods are required for real growth results. No traffic samples have been seeded. |
| Authority / competitors | Research and authority tasks plus an evidence register and outreach preparation guide. The three named competitors are retained as candidates from the supplied PDF. | Fresh SERP/competitor/backlink data, relevant opportunities and explicit outreach instructions are required. No links purchased, messages sent or published backlinks claimed. |
| AI / answer visibility | Clear original answers, useful learning paths and consistent entities; a repeatable observation protocol is documented. | No AI inclusion, citations, rankings or visibility uplift has been measured. |
| Performance | Production build, HTML crawl and responsive functional checks. | Representative direct-network lab data and CrUX/Search Console field data are still needed. Cloud proxy timings are not customer CWV. |
| Trust | Existing safeguards keep unapproved tutors/testimonials nonpublic; unsupported seeded/hardcoded establishment and credential claims removed where found. | Genuine testimonials, credential evidence and publication permission must come from the owner. No proposal Trustpilot/student figures were copied as verified facts. |
| Chat / Make | The separate user-requested Hatchium embed is deployed and has public-page contract checks and staff isolation. | Real provider conversation testing is blocked by the cloud allowlist. No Make webhook or documented lead-ingestion API was supplied, so automatic form forwarding is not active. |

## Where the owner works in CMS

- **SEO growth**: current workflow summary, actual country lead cohorts and recent manual source records.
- **Growth plan**: keyword themes, target URL, priority, review date, status and evidence reference.
- **SEO baselines**: manually enter real figures with the property/source, country filter, period and evidence URL.
- **Pages**: edit the regional guides and four learning-guide records. View links resolve to canonical public routes.
- **Blog**: edit the twelve launch articles using the existing draft/review/publish workflow.
- **FAQs**: course questions and market categories `Market:united-states` / `Market:australia`.
- **SEO tools**: existing content diagnostics, indexing controls, sitemap and official search-tool entry points.

## Four launch content clusters

1. **Regional discovery**: US teacher selection and Australian time-zone planning → country pages → relevant course → trial.
2. **Families and first steps**: placement, first trial, device setup, progress review, siblings and enrolment questions → parent/reading guides.
3. **Recitation and revision**: Tajweed feedback and Hifz review → reading/Tajweed/Hifz discovery.
4. **Adults and understanding**: adult beginner routine and translation versus Arabic → adult/translation/language routes.

Blog categories are navigation labels; a content cluster can span related categories. No article claims
an individual teacher’s expertise or an outcome that has not been verified.

## Measurement contract

`oqc:lead-saved` is dispatched only after the public form RPC returns a real-looking saved reference,
excluding the RPC’s honeypot acknowledgement and missing references. Its detail is only:

```json
{"event":"generate_lead","form_type":"trial or contact","market":"USA, Australia or Other"}
```

The event has no name, email, phone, learner age, city, message, record ID or campaign field. It makes
no network request or storage entry. It is not a working GA4 connection or a Make webhook. A future
adapter must preserve these boundaries and be verified against successful backend operations.
The existing CMS enquiry totals, not unconnected browser events, remain the current reporting source.

Do not mix Search Console clicks/impressions with GA4 sessions as if they were the same metric.
Compare equivalent periods and country filters, label manual exports, and record source limitations.
The proposal’s +10% month-on-month traffic chart is a target; it is never populated as observed data.

## Release and rollback

Database migrations `20261022000700` and `20261022000800` add private growth tables/reporting and
idempotent content inserts. Existing page text is retained and augmented once with a marked regional
section; existing guide/article edits are preserved. RLS and completion/source checks are tested.
Public seed fallbacks contain public content only; no private tasks, baseline records or lead data
are bundled into the website. New public content can be reviewed/changed in the existing CMS.

To roll back the app, redeploy the previous reviewed source through the documented release script.
If needed, restore affected page bodies selectively through revisions or the pre-release public-copy
backup, preserving newer owner edits. Do not delete enquiries, reset users or replace approved rates.
Private planning data can remain safely stored even when the app code is rolled back.

## Verified local release checks

31 automated tests passed, including private growth access, evidence/source constraints, true cohort
counts, repeated content seeds, seasonal zones and the non-PII event contract. Production build passed;
lint has zero errors with 19 existing warnings. The local production crawl checked 205 public URLs,
205 distinct titles and 385 internal destinations, with four guide aliases, twelve launch articles,
visible FAQ/schema matching, blog pagination and a stubbed successful-form event. The authenticated
CMS create/edit and mobile checks passed with an isolated temporary content editor; its synthetic
record and account were deleted. No owner password was reset and no public dummy enquiry was saved.
