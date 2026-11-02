# OQC Live SEO, AEO, GEO & Website Audit — 2 November 2026

**Website:** https://www.onlinequrancollege.com  
**Repository:** https://github.com/Ehtisham1239/app.com (main)  
**Supabase project:** `lgbwidraztavhhbnbfhr` (`app.com`, active/healthy)  
**Audit mode:** Public website review + repository source review + read-only CMS/database inspection + limited approved copy corrections.  
**Important:** GitHub source commits and CMS database updates are not proof of a successful production deployment. Live verification remains pending where the production deployment is blocked or the web fetcher did not return a fresh page.

## 1. Executive status

The new strategy is now Search + AI discovery + brand trust + conversion, not keyword density or mass blog publishing. The homepage remains the global homepage at `/`. Country hubs are under `/locations/{country}`; city pages are under `/locations/{country}/{city}`. No homepage replacement, mass URL rename, city deletion or blanket redirect was made.

### Work completed in source or CMS

- UAE added to homepage priority navigation and country discovery cards; the canonical homepage remains `/`.
- Country directory language changed from a blanket availability claim to country/city scheduling guides.
- City pages remain `noindex,follow` by default; priority country hubs remain indexable by default.
- PerplexityBot is explicitly allowed to crawl public content in `robots.txt`; private/admin/API/parent paths remain disallowed.
- Free-trial page source now renders one benefits list rather than separate desktop/mobile copies; an absolute “never sold or shared” marketing promise was replaced with a link to the privacy policy.
- Teacher page fallback copy no longer claims every teacher is independently verified/certified while no public teacher profiles are active; it asks Admissions to confirm the proposed teacher's credentials, language and availability.
- Pricing database copy no longer advertises “Certified tutor” on the first three public plans; it now says teacher availability is confirmed before enrolment.
- About-page “Since 2018” copy and “since 2019” meta description were removed because the two dates conflicted and documentary evidence was not provided.
- Organization identity setting no longer publishes an unverified founding date in JSON-LD.
- The `site.contact.location = United Kingdom` setting was removed. The contact/footer identity is online-only, not a walk-in office or a claimed branch.
- Privacy-policy contact wording no longer presents “United Kingdom” as a physical location.
- Regression tests added for country/city indexation, UAE guide coverage, single trial-benefits list and Perplexity crawler rules.
- 24-month operating strategy and competitor benchmark committed to GitHub.

## 2. Market URL architecture

### Global homepage
- Canonical: `https://www.onlinequrancollege.com/`
- The homepage remains the global brand and course overview, not a USA/UK/UAE/Australia doorway page.
- UAE, UK, USA, Australia and Canada are linked as country discovery destinations.

### Country hubs
- UK: `/locations/united-kingdom`
- USA: `/locations/united-states`
- Australia: `/locations/australia`
- UAE: `/locations/united-arab-emirates`
- Canada: `/locations/canada` (retained existing indexable hub; not part of the four-market primary campaign unless later re-prioritised)

The source-level `INDEXED_MARKETS` list includes these five hubs. UAE is generated from the source location registry and has a dedicated UAE market guide; it does not currently have a separate CMS `pages` record. This is intentional and does not prevent the source route or sitemap entry.

### City pages
- URL pattern: `/locations/{country}/{city}`
- City pages are noindex by default, unless a page is explicitly reviewed and approved.
- Database inspection found 165 published location CMS records: 161 noindex and 4 indexable country records. The four indexable CMS records are Australia, Canada, UK and USA. UAE is the fifth indexable hub from the source registry (no separate CMS row).
- All 165 location CMS records have a canonical URL. City pages are not being bulk-indexed.
- The directory lists 51 country guides; this is a guide directory, not a guarantee that every currency, teacher, payment method or time slot is available in all 51 countries. Admissions must confirm availability.

### Redirect policy
No redirect rules were changed. Existing exact-intent legacy WordPress mappings in `next.config.mjs` were left untouched, including the old country/city, course, guide and recovered article paths. The existing review short links remain exact mappings to `/reviews`. `/ramzan-course` remains a 404 because no equivalent page was found. No unrelated URLs were redirected to the homepage, and no blanket redirect was added.

## 3. Public-page review

The following public URLs were opened and their visible page content inspected where the web fetcher returned a page:

| Page | Observed purpose / finding | Next action |
|---|---|---|
| `/` | Global homepage with courses, brand and market navigation; canonical root preserved | Confirm UAE nav/card after deployment |
| `/about` | Explains OQC and online one-to-one lessons; contained conflicting “Since 2018” copy | CMS excerpt/meta corrected; live cache/deployment verification pending |
| `/teachers` | No public teacher profiles visible; copy previously made strong qualification/verification claims | Source fallback copy softened; DB has 6 teacher records but 0 public active profiles |
| `/pricing` | Published package data; first three plans contained “Certified tutor” | CMS feature copy corrected; verify live rendered plans |
| `/free-trial` | Separate desktop/mobile benefits markup duplicated the same four statements in DOM; absolute privacy claim | Source now uses one list and privacy-policy wording; production check pending |
| `/faq` | Covers trial, lesson format, fees, sibling discount, cancellations and country FAQs | Review policy consistency and current operations periodically |
| `/learn` | Course-selection guide and supporting learning guides | Keep as central course-intent hub; strengthen teacher-reviewed resources |
| `/courses/noorani-qaida` | Course page answers audience, class format, expected learning path and links to markets | Maintain evidence and academic review for learning claims |
| `/locations` | Lists 51 country guides and city navigation; clearly states online-only service | Directory copy updated in source to clarify guide purpose and availability caveat |
| `/reviews` | Private feedback form and direct Trustpilot option; states no incentives or rating manipulation | Keep genuine consent and moderation controls; no review generation |
| `/contact` | Previously displayed “Registered in United Kingdom” from a location setting | Removed the setting; live page needs post-release check |
| `/locations/united-kingdom` | Country hub with GBP and UK time information | Retain |
| `/locations/united-states` | Country hub with USD and multiple US time zones | Retain |
| `/locations/australia` | Country hub with AUD and state/time-zone guidance | Retain |
| `/locations/united-arab-emirates` | Source route and UAE guide exist; directory lists seven emirates; direct page fetch did not return a fresh page in this audit | GitHub production smoke test includes UAE; verify HTTP 200 after deployment |
| `/robots.txt`, `/sitemap.xml` | Generated by Next.js source; web fetcher did not return a usable current robots/sitemap response in this pass | Verify via production HTTP and Search Console after deployment |

The web fetcher returned some pages with cached content and later returned cache-miss errors on repeat opens. A fetcher cache miss is not evidence of a site 404. The GitHub Actions production smoke test is the authoritative route check after a deployment.

## 4. CMS/database findings and corrections

The active Supabase project is `app.com` in `ap-southeast-2`. Read-only inspection found:
- 20 published blog posts (5 June–28 October 2026); all have `author_id = null`.
- 6 published courses; all have titles and SEO titles/descriptions.
- 6 teacher records, but 0 are currently public and active.
- 165 published location CMS records; 161 noindex and 4 indexable. UAE is source-generated and has no separate CMS page row.
- First three public pricing plans contained “Certified tutor”; the other three did not.

### Database copy updates applied and verified by SELECT

1. `public.pages` About record: excerpt and SEO description no longer assert a founding year.
2. `public.settings` `site.contact`: removed the `location` property (“United Kingdom”).
3. `public.settings` `site.identity`: removed `established = 2019`, so JSON-LD no longer publishes a founding date without evidence.
4. `public.pricing_plans`: replaced “Certified tutor” on the first three public plans with “Teacher availability confirmed before enrolment”.
5. `public.pages` Privacy Policy: removed the “United Kingdom” location label from the contact line; UK governing-law wording in Terms was not changed.

All five updates were read back successfully. These are CMS content/settings changes, not schema changes. No student, parent, teacher-private or admissions records were modified.

## 5. Content and authoring quality

- There are 20 published blog posts; all have a null `author_id`. No fake author or reviewer was created.
- The articles cover parent checklists, adult beginners, Tajweed practice, Hifz revision, fees, country time zones and learning routines. Body lengths observed in the CMS range from roughly 2,850 to 5,986 plain-text characters.
- Before future content is amplified, an actual human writer/reviewer should be recorded where the system supports it. Religious interpretation/fatwa-level content needs qualified scholarly review; Tajweed/Quran pedagogy needs an appropriate academic/teacher review.
- No mass AI publishing, invented first-hand testing, fabricated statistics, stock imagery presented as real students, fake author headshots or unsupported teacher credentials.
- The location directory labels its editorial imagery as AI-generated illustrations, not documented students or local branches.

## 6. Technical SEO and structured data

### Verified in source
- Organization/WebSite JSON-LD is generated at the site layout.
- Organization schema uses contact identity details but no LocalBusiness type or physical postal address.
- PostalAddress is emitted only if a complete street address and two-letter country code are configured.
- Country/city pages use Service schema with `areaServed` (Country or City), not a false local business address.
- Country/city pages emit breadcrumbs and visible FAQ schema.
- Sitemap is generated from fixed public pages, approved location records, published courses/pages/blogs/teachers and excludes noindex/alternative canonical records via `shouldIncludeInSitemap`.
- Robots disallows `/admin`, `/auth`, `/api/` and `/parents`; PerplexityBot now has an explicit public allow rule with those private paths still blocked.
- 404 pages have noindex,follow metadata.
- Vercel Speed Insights is imported in the public site layout, but no measured CrUX/Search Console/Core Web Vitals baseline was available.
- No Search Console crawl/indexing export was available; no 404 count or error trend can be claimed.

### Important no-change decisions
- No global redirects to the homepage.
- No mass redirect of city pages.
- No bulk 404-to-200 substitution.
- No fake NAP, geo-coordinates, map pins, LocalBusiness schema or GBP listings.
- No `llms.txt`, special AI schema or made-up AI ranking score; Google says no special AI schema/file is required for its generative search features.
- No unverified shared AI-training token was added to robots.txt; the October 30 proposal is planned for 2027 and its syntax/support must be rechecked before implementation.

## 7. Google 2026 update and AI-search interpretation

### Seven ranking/Discover incidents shown in Google's official history
1. February 2026 Discover update — 5 February.
2. March 2026 spam update — 24 March.
3. March 2026 core update — 27 March to 8 April.
4. May 2026 core update — 21 May to 2 June.
5. June 2026 spam update — 24 to 26 June.
6. August 2026 spam update — 18 to 21 August.
7. September 2026 spam update — 24 September to 8 October.

The September update's official status incident ran from 24 September 09:15 PDT to 8 October 01:00 PDT (13 days, 15 hours, 45 minutes). It applied globally and to all languages. Google did not publish a new special target list for that update; OQC should follow the standing spam policies rather than repeat speculative target claims.

Google's October 1 documentation update incorporated Search Quality Rater guidance on effort, originality, talent/skill and accuracy. These are quality-evaluation concepts, not a published direct ranking formula or a score owners can optimise mechanically.

### AI search
- Google says generative search features use core Search systems and retrieval; normal SEO remains foundational.
- A page must be indexed and eligible for a Search snippet and the site must be included in Search generative AI features in Search Console to be eligible for AI features. Eligibility does not guarantee citation.
- Google announced a Generative AI performance report in Search Console on 3 June 2026 and said it was rolled out worldwide by 31 August 2026. Use its page, country, device and date views when GSC access is available.
- Google documentation says AI Mode traffic is counted in Search Console performance totals; the dedicated Generative AI view provides more specific visibility data.
- Google's September 24 update added multimodal Search reporting (Lens, Circle to Search, image upload and similar visual searches) in Search and generative AI performance reporting.
- No reliable fixed “2–6 citations” rule, direct bounce-rate penalty, 20% mobile-speed ranking-weight uplift or automatic AI removal for ordinary 404s was verified.
- Perplexity documents PerplexityBot as its search-index crawler and recommends allowing it; Perplexity-User is user-triggered and generally ignores robots.txt. WAF access, if one exists, must be verified separately using official current IP ranges.
- Google announced a shared AI-training preference control for robots.txt on 30 October 2026, with planned support in 2027. Do not add a guessed token now. Training preference and search visibility are separate owner decisions.

## 8. Competitor benchmark

A separate competitor report has been committed:
[COMPETITOR-BENCHMARK-ONLINE-QURAN-ACADEMIES-2026-11-02.md](https://github.com/Ehtisham1239/app.com/blob/main/docs/seo-agent/COMPETITOR-BENCHMARK-ONLINE-QURAN-ACADEMIES-2026-11-02.md)

The reviewed category leaders commonly expose local-currency package details, trial steps, lesson duration, weekly frequency, parent feedback/progress and teacher preference. Some add interactive placement/Hifz tools. OQC should compete on verified teaching quality, honest price terms, a clear trial, real progress evidence and market-aware scheduling—not unsupported “best” claims, fake student totals or copied testimonials.

## 9. Release, test and access blockers

### GitHub
- Main repository: `Ehtisham1239/app.com`
- Existing GitHub Actions workflow: `.github/workflows/oqc-quality-checks.yml`
- Workflow runs `npm ci`, `npm test`, `npm run lint`, then a production smoke test after pushes to main.
- New regression tests have been committed but their result must be checked after the latest push. No local repository clone was possible in this environment because GitHub DNS was unavailable; do not claim local tests/build passed.

### Vercel
- Previously known project ID: `prj_ohTvpaIwR1bWHFJWl23QiNfOoJG7`
- Project lookup in current Vercel scope returned 404; production deployment listing returned 403 permission denied.
- No deployment was created in this audit. Production build and smoke-test success are therefore not confirmed.
- The latest source changes are in GitHub `main`; the live website must not be described as fully updated until Vercel production deploys and the smoke test passes.

### External analytics / accounts
- Search Console, GA4 and GTM performance exports were not available.
- No Perplexity citation baseline has been measured.
- No external social, Trustpilot or Apple Business admin access was assumed.
- No external profile was created, no review invitation was sent and no editorial outreach was submitted.

## 10. Release acceptance checklist

- [ ] GitHub Actions test-and-lint job passes on the final commit.
- [ ] Vercel deployment succeeds and commit SHA is recorded.
- [ ] Production smoke test returns HTTP 200 for homepage, /reviews, /free-trial, UK, USA, Canada, Australia, UAE, robots.txt and sitemap.xml.
- [ ] Homepage canonical remains `/`; UAE market link is visible.
- [ ] Contact/footer show online-only service and no unverified office/country location.
- [ ] About page no longer claims an unsupported start year.
- [ ] Pricing no longer says “Certified tutor” without evidence.
- [ ] Teacher page contains no unsupported verification claim while no public teacher profiles exist.
- [ ] Free-trial benefits render once; privacy wording points to the policy.
- [ ] Robots permits PerplexityBot on public content and blocks private routes.
- [ ] Sitemap contains only canonical indexable pages; city pages remain noindex by default.
- [ ] No unintentional redirects; existing exact-intent legacy mappings still work.
- [ ] Search Console property ownership and Search Generative AI feature inclusion verified.
- [ ] Generative AI performance report, country/page data, GA4/GTM and qualified-trial funnel baseline recorded.
- [ ] Core Web Vitals field data checked at the 75th percentile.
- [ ] Every public credential, founding-date, student-count, privacy, trial and outcome claim has an evidence owner and review date.

**Completion rule:** Only mark production work “Done” after CI, deployment and live post-release verification. This audit records source/CMS work completed and the remaining blockers without claiming rankings, citations, leads, revenue growth or production deployment that have not been measured.
