# Report remediation — 29 October 2026

Owner request: read the supplied full SEO audit, client summary and social marketing playbook and fix the confirmed issues. Both PDFs were extracted in full; the HTML playbook was read as an operating proposal. Its 9 October prices/claims and the SEO reports’ third-party estimates are historical evidence, not current facts or targets.

## Implemented

- Homepage H1 now explicitly identifies live one-to-one online Quran classes for children and adults. CMS and fallback settings agree. Original artwork, hero renderer, branding and analytics remain intact. Verified public HTTP 200 and the new H1.
- All six published course descriptions now include three topic-specific links plus the existing learning-path comparison. Existing CMS text was preserved; an atomic version/hash-guarded transaction changed only description_html. Public HTML confirms all six support sections and links. Source fallback follows the current CMS bodies, preserving bootstrap IDs.
- Course-specific FAQs already exist in CMS (two per course); they were preserved. A source fallback supplies useful course-specific questions only if no saved course questions exist, preventing empty/shared-only content without overwriting editorial choices. Visible FAQs and markup use the same list.
- Pricing card CTA now labels trial-ineligible/Weekend packages as enquiries. The selected Weekend request receives matching server/client headings, explanation, consent and submit text, with its package retained. No prices, discounts or eligibility terms changed.
- Optional teacher preference is visible on the enquiry form and joins the existing saved notes payload, with availability explicitly subject to coordinator confirmation. No preference or personal data is added to analytics.
- Valid planner date/time/zone and requested quote currency are shown in a visible request summary; existing validated note persistence is retained. Invalid DST times remain rejected; no slot is promised.
- Exact legacy /hifz-ul-quran-course route permanently redirects to /courses/hifz-quran and retains query values. Deliberate missing pages and the other three unverified legacy mappings are not blanket-redirected.

## Validation

91 unit/integration tests pass, including new course-support, eligibility and redirect cases. Lint: zero errors, 13 existing warnings. Production build passes with 212 generated HTML files and zero missing asset references. Browser checks cover all six courses at 390/1440px, teacher preference, planner summary, invalid validation, Weekend pricing-to-enquiry flow and redirect query preservation. No final real enquiry was submitted. CMS fixes are publicly verified; application changes require actual deployment verification, which is recorded separately rather than inferred from a commit.

## Reconciled findings and dependencies

| Report item | Evidence/status | Remaining dependency |
| --- | --- | --- |
| Missing GA4/GSC access | Both are connected; baseline and attribution limits were already documented | Current GA4 Admin key-event configuration and URL Inspection are separate capabilities; historical zero rows do not authorize settings changes |
| Internal linking | Six course descriptions fixed; existing reciprocal article-to-course links retained | Monitor meaningful query/page results over complete periods |
| Missing Hifz/Arabic/translation support | Existing Hifz revision, memorisation and Arabic-vs-translation resources now linked from their courses | New religious explainers require actual teaching input and qualified review; no filler pages created |
| UK depth and learning paths | Existing UK parent/adult sections, local-time planner, /learn comparison and country guides already cover much of the recommendation | Do not invent learner stories or unapproved local fees; prices excluded |
| City noindex | Deliberate approved default preserved | Actual local proof and consented testimonials before any indexation expansion |
| Tajweed path under /courses | Existing useful guide retained with clear learning-guide context | URL relocation is an optional taxonomy recommendation, not a demonstrated fault requiring a second migration |
| Technical foundation | Current robots/sitemap and earlier 29 October bounded crawl evidence retained; all 49 sitemap URLs checked in that crawl | Google-selected canonical/indexing and rich-result eligibility are separate checks |
| Performance | Supplied PSI homepage lab results and prior local lab are clearly separated from field data | No fresh production field CWV or explanation of desktop agentic 2/3 available; no score guarantee |
| Backlink profile | Screenshot is not a 729-domain export; researched prospects remain prospects | Actual link export for audit; verified sender and named outreach permission; no Ahrefs re-suggestion |
| Teacher proof/religious review | No invented teachers, credentials, reviewer or testimonial | Qualified staff evidence/consent and named Academics signoff |
| Other three legacy URLs | Fresh 404s documented in migration pack | Original content or editor-confirmed equivalent destinations; no title-only guesses |
| GHL/ERP and social campaigns | Current connected-source discovery returns GA4/GSC only | Authorized GHL/ERP endpoints, booking authority, field ownership, sender consent, operational owners and approved budget; no messages, ads or spending launched |

## Recovery

CMS pre/post values and course rollback fields are in content/seo-agent/2026-10-29-report-fixes/. Re-read current versions/hashes before rollback and preserve later staff edits. Restore only changed title/description fields. Source changes are isolated in the release diff; rollback does not require altering prices, tracking, domain/security configuration or unrelated content.

## Actual release status

Source changes saved on main: 4e26fe87a3a34395f00adc9281f14e19f60ca536. Remote ref verified. This is not a production deployment claim. Public post-commit probes still show the old free-trial headings, no teacher-preference field or preference summary, and HTTP 404 for the Hifz alias. The connected Vercel account returns 404/not_found for the documented project in its intended team; no authenticated CLI is available. Do not create a replacement project, change DNS, weaken protection or claim release success. Correct least-privilege access to the existing appcom-online-quran-college project is needed to release this tested source and verify it live.

The homepage title and all six CMS course support sections were independently verified in live HTML after normal revalidation. Those seven content changes are live. The application enquiry and redirect changes remain committed and locally verified, awaiting deployment.

Social-playbook interviews, staff rotas, real testimonial/teacher approvals, GHL/ERP lifecycle integration, paid campaign budgets and consented outreach require their actual owners, account access and business decisions. Current connector discovery supplies GA4 and Search Console only; it does not establish GHL, ERP, ad or messaging access. No ad, interview invitation, campaign, reminder or third-party message was launched.

## Source documents

- Online Quran College SEO Audit Full Report.pdf (28 October 2026): all 15 pages extracted and read, including the complete issue matrix.
- Online Quran College SEO Audit Client Summary..pdf (28 October 2026): all three pages read; used as a summary of the same findings.
- OQC_Social_Media_Marketing_Playbook.html (9 October 2026): read as a strategy and proposed operational playbook, not a completed-results report. Historical vendor prices/claims were not copied into the live website.


## End-to-end release attempt — 29 October 2026

The remaining 58 discovered public URLs were checked with the existing crawler parser, respecting robots and access/rate stop conditions. All 58 returned 200; title, description, single H1, single canonical, JSON-LD parsing and image-alt checks returned no new findings. Together with the earlier 150-page check this completes the 208-URL discovered inventory for these bounded raw-HTML checks. All 49 sitemap URLs were in the earlier check. This is not full browser/device, Google indexation, external-service or field-CWV certification.

The exact team and existing project were confirmed by listing: ehtisham1239s-projects / appcom-online-quran-college. A production deployment of the reviewed d6309d582759c19e058deb8a15c7cb1652b10c45 commit was actually requested. Vercel rejected creation with HTTP 403: no permission to create a Production Deployment for this project. No deployment ID or production release was created. This is a platform authorization failure, not a code build failure or an automatic-approval-review rejection. No installed Vercel CLI, configured Vercel token or outbound-identity manifest was present for the documented alternative. No access control was bypassed.

The required next action is production-deployment permission for the connected account on this existing project, or an owner-authorized deployment of the exact reviewed main revision. Seven CMS content changes remain live; application/form/redirect source changes remain tested and committed but unverified on production. Other unresolved dependencies remain as listed above: original content for three legacy mappings; real staff/Academics and consented proof; and actual GHL/ERP/campaign/sender access and business decisions. No missing dependency is called solved.


## Production release and follow-up — 29 October 2026 (later session)

Production deployment `dpl_6veAa3SU6MaHG4XEeCZSaDYuwL6n` of commit `21d54f07fd51c7fb21d73d4e143201edf979d49d` (branch `claude/wizardly-noether-ott39z`, which contains main `8684090`) was created through the connected Vercel account, built READY and is aliased to www.onlinequrancollege.com and onlinequrancollege.com. The earlier HTTP 403 no longer occurred. The project still has no connected Git repository, so pushes do not deploy automatically.

Verified on the live domain after release:

- `/hifz-ul-quran-course?utm_source=test` resolves to the Hifz course page (H1 "Hifz ul Quran").
- `/free-trial` shows the teacher-preference field and "Book my free trial".
- `/locations/netherlands` H1 now reads "Online Quran classes in the Netherlands". The new `locationHeading` corrects only the exact seeded CMS title; staff-edited titles are kept. Live CMS titles for the US and UK were already corrected.

Canada hub (audit: "Canada / Australia not verified"; "bring UK and CA/AU to the US standard"): the CMS body was two short paragraphs (568 visible words against about 1,090 for the US and Australia). A Canada guide covering household planning, provincial clocks, course choice and CAD quotes was written to the live CMS with a body-equality guard (version 4 → 5). All 11 internal links return 200. No price, address, testimonial or teacher-language claim was added. Before/after bodies are in `content/seo-agent/2026-10-29-report-fixes/canada-hub/`; the seed fallback matches.

Not done, and why:

- A separate Tafseer beginner guide was not written. The published "Quran Translation or Arabic" article already covers choosing between translation/tafseer and Arabic study; a second overlapping article would compete with it. A genuine tafseer guide needs input from a qualified teacher.
- Backlink review: the Semrush account returned "not enough API units", so the 729-domain profile was not exported.
- GBP/CAD/AUD prices, city-page indexation and Academics sign-off remain owner decisions, as listed above.

### Owner decisions and further fixes (same day)

Owner decisions: open a pull request to bring `main` level with production; keep GBP/CAD/AUD as quote requests until fees are approved; keep city pages noindex; write Hifz/Arabic/Tafseer drafts for teacher review.

- Three review drafts were saved to the CMS with status `review` and `seo_noindex = true`: `is-my-child-ready-for-hifz`, `arabic-for-quran-readers`, `quran-translation-tafseer-beginners` (378–422 words, no quotations or rulings, all internal links 200). Public RLS only exposes `published` posts; the live URL returns 404. Source copies are in `content/seo-agent/2026-10-29-report-fixes/review-drafts/`. A qualified teacher must approve before publishing.
- 404 pages carried both Next.js's `noindex` and the root layout's `index, follow` robots tags. `src/app/not-found.jsx` now sets `noindex, follow` for robots and googlebot; normal pages are unchanged.
- The 13 `react-hooks/set-state-in-effect` lint warnings were reviewed and left as they are: they sync admin form state from loaded data and are not defects. Changing them would need staff-login testing of the admin panel.

## Organic traffic and 50-keyword pass — 29 October 2026

Search Console (sc-domain:onlinequrancollege.com) holds data from October 2026 only: 5 clicks, 118 impressions, average position 19.1 for 1–28 Oct. Google still showed old WordPress URLs, led by `/online-quran-classes-uk` (42 impressions) and the UK city pages (`-manchester` average position 10.7, `-bradford` 5.4, `-leicester` 9.3).

- **Legacy UK city URLs.** `/online-quran-classes-{london,birmingham,manchester,leeds,bradford,leicester}` redirected to city pages that are noindex by owner decision, so their search standing went to pages that cannot rank. They now redirect to the city page only when it is indexable by default, otherwise to the indexed `/locations/united-kingdom` hub (currently the hub). `/login`, still indexed, now redirects to `/admin/login`.
- **50-keyword map.** `content/seo-agent/keyword-map-50-2026-10-29.json` assigns 50 phrases to one target page each: 13 come from Search Console queries and 37 from reviewing Google results for the services offered. No search volumes are claimed (Semrush had no API units). `npm run seo:keyword-map [origin]` checks visible placement. Before: 30/50 present. After: 50/50 present on indexable pages, 20 in the title or H1.
- **Content edits.** Twelve short, natural edits were made across ten CMS records with version and text guards. They include a UK section naming London, Birmingham and Manchester learners, a "How much do online Quran classes cost in the UK?" answer, and course and guide wording. Three code edits cover the homepage, teachers and trial pages. Exact replacements for rollback are in `content/seo-agent/2026-10-29-report-fixes/keyword-edits.json`. The live UK hub also had a "from home in United Kingdom" heading, now corrected.
- **Released.** PR #10 merged; Vercel built `main` (49e06e5) from Git and aliased it to www. Live checks: `/online-quran-classes-manchester` lands on the UK hub with the new section; `/login` reaches the admin sign-in.
- **Google Business Profile (owner-approved).** Three listings exist. Two pointed to the wrong website: `project-umber-three-93.vercel.app` (not part of this Vercel project) and `http://onlinequrancollege.com`. Both now point to `https://www.onlinequrancollege.com/`. All three now use the website's phone number, +44 7864 710821. Google validated each change before it was applied; Google may review edits before they show. Merging the duplicate listings must be requested in Business Profile by the owner.
- **Not done.** IndexNow submission failed from this container: the live domain does not resolve here. Run `npm run seo:notify -- <paths> --submit` from a normal network for the changed pages. Search volumes need Semrush API units.
- **Internal links and titles.** The homepage "Explore learning paths" cards linked the US and Australia hubs but not the UK, the market with the most Search Console impressions. A UK card now leads the row (4 cards; 2 columns on tablet, 4 on desktop). CMS SEO titles: UK hub "Online Quran Classes UK | Live One-to-One Lessons | OQC" (matches the top query, average position 13.3); About "About Online Quran College | Online Quran Academy". Both are recorded in `keyword-edits.json`.
- **Founding year (owner-confirmed 2019):** the About meta description said "since 2018" and the Organization schema said `foundingDate: 2010`. Both now read 2019 (CMS `site.identity.established` and the About `seo_description`; seed synced).
