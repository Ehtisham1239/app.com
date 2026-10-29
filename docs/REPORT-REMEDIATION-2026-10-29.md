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
