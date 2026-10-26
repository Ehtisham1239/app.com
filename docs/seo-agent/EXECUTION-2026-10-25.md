# OQC SEO agent execution — 25 October 2026

## Scope and approval record

The owner supplied the version-1.0 eight-page `Custom_GPT_and_SEO_Workflow_Reference(2).pdf` and explicitly requested end-to-end execution in the existing website project. This continues the written website implementation and deployment scope; it does not migrate the original college domain, install an unrelated application or authorise advertising/analytics/database changes. The PDF is used as an operating reference. No separate Custom GPT has been installed and no continuously running hosted LLM agent is claimed.

## Completed implementation

- Saved reusable [agent instructions](INSTRUCTIONS.md), a four-market 32-query research map and a knowledge/claims register. USA has first priority, followed by UK, Canada and Australia. Query demand, difficulty and positions remain null; observed competitor topics do not prove top-ten rankings.
- Added the executable `npm run seo:agent` workflow. It audits owned public URLs, checks schema/metadata/hero assets, exports a URL inventory and records observed trial/claim wording. It is read-only toward the website, rejects unrelated origins and stops incomplete/access-wall crawls. Output is local ignored evidence; it never deploys, submits leads or changes accounts.
- Added short original UK/Canada learning and scheduling guidance on their existing country pages, with contextual course/trial links and official clock references. Existing CMS copy and canonical routes are preserved; no extra city pages or unverified offers are published.
- Corrected Canadian country/city language and Open Graph regional identity to en-CA/en_CA. The setup example now uses the approved Vercel canonical origin instead of the reference college domain.
- Added Winnipeg, Halifax, St. John’s and Regina as Canadian planner options without adding indexed landing pages.
- Protected Vancouver and Alberta bookings after 1 November 2026 from obsolete device time-zone databases. Current provincial guidance specifies UTC-7 and UTC-6 respectively, rather than a November fallback. Historical dates, Toronto and US Pacific seasonal behaviour remain supported. Numeric UTC labels avoid obsolete seasonal abbreviations. Review this compatibility policy if provincial rules change.

## Evidence and QA

The current production baseline is independently recrawled: 206 HTML responses are HTTP 200, all 205 sitemap URLs are visited, no findings, no remaining discovered URLs and no access-wall stop. This is the pre-release source, not proof of the new release.

53 automated tests pass; lint has zero errors and 19 existing warnings; production build passes. Local end-to-end audit passes all 205 public pages and 196 top-image responses with zero technical or quality findings. Eight regional desktop/mobile layouts pass, including a mobile fixture that cannot use native Vancouver/Edmonton time-zone data. Future lesson conversions, enquiry query continuity, en-CA metadata, no horizontal overflow, unchanged original homepage image and the deferred home form pass. There are no browser errors or unexpected writes. The first browser test run had an incorrect homepage image locator; corrected harness results are recorded separately. Screenshots of UK desktop and Canada mobile guidance were visually reviewed.

Public trial wording observed locally is consistently seven days on pricing/contact/free-trial/about; this is a wording observation, not independent business sign-off. The two previously reported student/reach patterns are absent on those four templates in that run; no site-wide proof of enrolment counts or tutor credentials is inferred.

## Integration boundaries and next evidence

GitHub branch/source and the exact Vercel project/team/READY alias are verified. Only three environment-variable names and their environment targets were inspected. No values, private student records or provider secrets are in this record. GSC/GA4 property access and Semrush entitlement/current exports remain unavailable; plugin discovery found optional Windsor.ai access but did not establish an authorised account connection. Business-approved facts and conversion definitions remain owner-dependent. Monthly performance and 90-day outcomes require elapsed time and comparable real data.

## Release and rollback

Application source `c5922ecbf050e475406f024b0f974643601d2484` was built as preview `dpl_Gc9QF9xwuuYfb7b44gspC7BT5Go9` (READY, 70.061 seconds). Protected preview application inspection was blocked: authenticated fetch returned 403 during `read_protection_bypass`, and an ordinary request redirected to Vercel sign-in. No mapped CLI executable was available and no protection setting was changed. Preview runtime QA is not claimed.

The same source is production READY as `dpl_6UFtHaH7jnE6jFDV6zbMB7k9fvRV` (74.385 seconds) at [the verified stable alias](https://www.onlinequrancollege.com). Local QA passed before this release, within the owner’s existing deployment authorisation. Post-release `npm run seo:agent` passes all 205 public sitemap pages and 196 top-image responses, with zero technical or quality failures. Eight live regional browser layouts pass, including the mobile old-clock-data simulation, future Vancouver/Calgary/St. John’s/Halifax conversions, currency/date/zone enquiry continuity, correct country metadata, no horizontal overflow and unchanged homepage behaviour. There are zero browser or transport errors and no form submissions or unexpected writes. Canadian city pages also return en-CA/en_CA; the preserved Google verification file matches its local contents.

The live offer scan observes seven-day trial wording consistently on the four scoped templates. It is not business approval or a full claim/credential audit. The [dated URL inventory](URL-INVENTORY-2026-10-25.json) contains the verified 205 paths. Later documentation-only commits preserve this deployed application code.

Runtime-log inspection returned a separate 403 for the correct project/team; the CLI was unavailable. No server-log cleanliness, monitoring integration or drain configuration is claimed. These permissions do not invalidate the independently passed public HTTP and browser checks. Prior production rollback candidate: `dpl_4c7z9bMxkEMMDe7ct7xwW79kazJb`, application source `57ffe60f364a6ae3a8c9e8fa387d1ba0852ee96a`. This preserves the requested homepage illustration, homepage separation and previous interaction fixes. Releasing or rolling back application source does not require a schema or environment change.

Official clock references: [British Columbia](https://www2.gov.bc.ca/gov/content/governments/celebrating-british-columbia/daylight-saving-time), [Alberta](https://www.alberta.ca/albertas-new-time-system-abt), [UK clocks](https://www.gov.uk/when-do-the-clocks-change), [NRC review notice](https://www.cnrc.canada.ca/en/certifications-evaluations-standards/canadas-official-time/time-zones-daylight-saving-time). Source and verification boundaries accompany the machine-readable evidence.

## PDF workflow closure

| Phase | Result |
| --- | --- |
| Access and scope | Repository, production source, team/project and environment names verified; analytics account access remains unverified. |
| Baseline | Fresh 206-page baseline crawl complete; no authenticated performance baseline available. |
| Prioritise/research | Canadian clock compatibility and locale/configuration fixes implemented; four-market topic map records 32 hypotheses and source limitations. |
| Draft/implementation approval | Scoped source and original short copy prepared under the owner’s explicit website execution instruction. No trial/price/credential changes inferred. |
| QA | 53 tests, build, lint with zero errors/19 existing warnings, local audit and eight browser layouts pass. |
| Release | Preview build READY; protected preview inspection blocked. Production READY and public post-release audit/browser checks pass. Rollback recorded. |
| Measurement | Blocked on authorised GSC/GA4/Semrush evidence, conversion definitions and elapsed comparable periods. No traffic/rank/enrolment increase invented. |
