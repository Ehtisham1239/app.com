# OQC same-day SEO + qualified lead generation implementation sprint

**Prepared:** 8 November 2026  
**Repository:** `Ehtisham1239/app.com`  
**Execution branch:** `claude/oqc-full-growth-sprint-2026-11-08`  
**Canonical public site:** https://www.onlinequrancollege.com  
**Primary markets:** USA, UK, Canada, Australia, UAE  
**Business outcome:** more genuine, contactable, qualified enquiries, free-trial attendance and paid enrolments.  
**Stretch target:** 200 verified, qualified lead forms/day. This is a target, not a forecast or guarantee.

## Claude: execute this task today

You are the implementation engineer and SEO/growth operator for Online Quran College (OQC). Work in this existing repository. Do not merely return a strategy. Inspect the actual code and evidence, research current opportunities, implement safe improvements, run tests, and deliver a complete evidence-backed report and pull request.

### 0. Mandatory project rules

1. Read `AGENTS.md`, `.claude/skills/engineer-secure-software/SKILL.md`, and the relevant references it directs you to before editing. Read the full SEO operating spec at `docs/seo-agent/MASTER-OPERATING-SPEC.md`, current SEO instructions, operations register, latest blog/action register, latest evidence and claims/page/content/link registers. Do not assume older notes are current.
2. Inspect current `main`, this branch, open PRs and latest production/deployment records. Do not overwrite newer work, recreate completed tasks, or revert another contributor's changes. Use current source, not stale historical notes.
3. Keep all work in this one repository and existing Next.js/Supabase architecture. Do not create another app, repo, Vercel project, CMS or database.
4. Keep the canonical homepage at `/`, current canonical domain and existing country/campaign/course URL distinctions. Do not mass-change URLs, canonicals, redirects, robots, sitemap inclusion, DNS, hosting or domain ownership.
5. Follow owner-approved offer, currency, brand, privacy, analytics, trial and country-page decisions in `AGENTS.md`. Current offer: three-day trial; Weekend plan excluded. Current displayed currencies: GBP, USD, AUD and AED only. Do not invent prices, offices, credentials, enrolment numbers, ratings, reviews, testimonials, outcomes or availability.
6. Religious content (Qur'an, hadith, Arabic quotations, translations and rulings) requires the specified academic review. Do not create or publish religious claims without the required source and review marker.
7. No fake leads, fake form submissions, fabricated GA4/GSC data, invented keyword volumes/ranks, fake backlinks, paid ranking links, spam outreach, automated directory submissions or fabricated AI citations. Do not email, WhatsApp, message publishers, submit external pitches, buy ads/links or incur costs without explicit approval.
8. Do not add analytics banners or change the approved cookieless GA4/GTM consent architecture. Preserve the single GTM loader and event/dataLayer conventions. Do not expose private keys, service-role keys, credentials, student information or PII in logs, commits, reports or client code.
9. Use evidence labels consistently: observed, implemented, locally verified, deployed, production verified, blocked, or requires owner/academic approval. Never describe a draft or a test as live or complete.
10. Do not claim that 200 leads/day can be achieved today. Implement measurement and conversion foundations; calculate the actual gap from verified data.

## 1. Research first: today's live baseline

Collect fresh evidence and save dated outputs under an appropriately named `docs/seo-agent/evidence/2026-11-08-claude-sprint/` folder (or the actual current date if execution occurs later).

- Run the existing read-only SEO audit and keyword coverage tools before changing code:
  - `npm run seo:agent`
  - `npm run seo:keywords`
  - `npm run seo:keyword-map`
  - `npm run seo:search-engines`
  - `npm run verify:site`
  - `npm run audit:performance`
  - `npm run audit:responsive`
- Confirm sitemap URL count and exact list, robots/canonical/redirect behaviour, indexability, status codes, titles, descriptions, H1s, structured data, internal links, broken destinations, image alt text and visible keyword intent. Compare with current registers.
- Inspect the five market hubs and all existing campaign pages; do not create city pages or duplicate intent pages merely to increase URL count.
- Use authenticated, connected GSC and GA4 reporting tools if already available in the execution environment. Discover the correct account/property/stream afresh. Pull dated country/page/query/device/click/impression/CTR data and organic lead events. Do not assume a connected account based on documentation. If access is unavailable, mark it blocked and provide exact owner setup steps.
- Inspect current CRM/HighLevel or existing enquiry data only if authorized. Establish real counts for submissions, valid/contactable leads, qualified leads, trial bookings, trial attendance and paid enrolments. Do not infer qualification from a page view or GA4 event.
- Research competitors using public sources and record URLs and observation dates. Focus on actual course offer, country positioning, learning methodology, parent trust, teacher proof, content gaps, and conversion experience. Competitor examples are research, not facts about OQC.
- Research link/citation prospects for topical relevance, editorial quality, audience, real contact/publishing process and link policy. Maintain a prospect register only; do not contact or submit.
- Keyword research: cluster by intent and market (Quran classes online, kids/adults, Noorani Qaida, Tajweed, Hifz, Quran reading, female teacher preference where factually supported, trial intent, fees/schedule/parent concerns). Use GSC actual queries first; use a real keyword provider only if already connected. If no volume source is available, mark volume as unknown / check Keyword Planner; never invent numbers.

## 2. Technical SEO implementation

Fix verified, material defects only. Prioritize:

- crawlability, indexability, canonical consistency, sitemap and robots accuracy;
- server-rendered/visible primary content, metadata uniqueness and useful page identity;
- valid structured data only where appropriate and consistent with visible content;
- broken internal links, orphan pages, pagination and redirect loops/chains;
- responsive mobile layout, accessibility, image dimensions/format/loading and font loading;
- performance bottlenecks affecting LCP, INP and CLS;
- secure headers and privacy-safe form handling;
- correct country locale/spelling, currency and market-specific content;
- preserve redirects and all legacy route protections.

Measure Core Web Vitals where possible. Google good thresholds: LCP <= 2.5s, INP <= 200ms, CLS <= 0.1 at the 75th percentile. Clearly separate Lighthouse/lab results from real-user field data. Never claim a lab score proves field CWV.

Do not add `llms.txt`, fake FAQ rich-result promises, special GEO schema, hidden keyword blocks or mass-generated location pages. Follow Google's current AI search guidance: standard SEO eligibility, crawlability, helpful original content, good page experience and accurate structured data.

## 3. International SEO

Keep the five approved primary markets: USA, UK, Canada, Australia and UAE. Validate:

- existing canonical country hub routes and their sitemap/indexing status;
- correct locale spelling and market-specific language;
- hreflang only where actual equivalent regional pages exist, with reciprocal return links and valid language-region codes;
- market-specific course/schedule context and approved price/currency presentation;
- clear paths to existing course and free-trial forms;
- no doorway pages, false local office/GBP claims, fabricated local testimonials or unsupported city claims.

Do not create extra indexable city pages without the local proof requirements in the SEO operating spec.

## 4. Lead form and conversion implementation

Audit all current enquiry/trial forms and the end-to-end path before changing them.

- Ensure required fields are clear and minimal: parent/student name as appropriate, email, phone/WhatsApp, country, learner age group, course interest, preferred time and explicit contact consent where required.
- Validate client and server side; normalize email/phone safely; add accessible labels, inline errors, success/failure states and keyboard/mobile usability.
- Add or preserve anti-spam/rate-limit/honeypot protections and duplicate handling without blocking genuine families.
- Preserve privacy and data minimization. Never send sensitive child details to analytics.
- Ensure submissions persist to the existing approved backend/CRM and admissions notification workflow. Confirm exactly-once notification behaviour; avoid duplicate notifications and avoid emailing parents unless the approved workflow explicitly says so.
- Carry source, medium, campaign, landing URL and UTMs safely through the form; avoid storing PII in URLs or analytics.
- Preserve the approved GA4/GTM events and deduplicate `generate_lead` so a form success event only fires after a real successful server response, not on click or validation attempt.
- Add or repair funnel reporting for: form starts, successful submissions, valid/contactable enquiries, qualified leads, counselling, trial booked, trial attended and paid enrolment. CRM outcomes are the source of truth for qualification and enrolment.
- Add appropriate tests for valid/invalid submissions, spam, duplicate, consent, API failure, notification exactly-once, source attribution, no PII in analytics and mobile accessibility.
- Never submit real production forms during QA. Use isolated test fixtures/stubs and prove no live parent/admissions contact was triggered.

## 5. Content, topical authority and AI-search readiness

- Improve existing high-intent pages before creating new pages. Fix thin, duplicated, outdated or unsupported content using verified OQC facts.
- Create a prioritized editorial/content gap plan for each of the five markets and main course intents. Draft only content that can be fact-checked; mark academic/religious review clearly.
- Make pages useful for real parents and learners: what is taught, how lessons work, learner suitability, progress feedback, class schedule process, teacher selection process where supported, pricing/fees process and accurate trial conditions.
- Use concise answer-first sections and meaningful headings where helpful, but do not mechanically rewrite all copy into repetitive AI-answer blocks.
- Improve author/editorial accountability and source references where real and available. Never invent author qualifications.
- Keep blog length and editorial constraints in the current OQC operating spec. Do not mass-publish AI content.

## 6. Ethical authority and distribution

- Build/update a qualified prospect list of relevant Islamic education resources, parent resources, education publishers, community organisations and genuine partner opportunities.
- Score relevance, trust, real audience, editorial policy, contactability and risk. Separate existing links, verified profiles, prospects and acquired placements.
- Recommend editorial resources, useful research assets, partner resources and legitimate citations. Do not buy ranking links or create automated links.
- Prepare outreach drafts only. No messages or submissions without owner approval.

## 7. Analytics and growth measurement

Produce a baseline table with verified values and dates. Include:
- GSC clicks, impressions, CTR, average position (only when retrieved from GSC);
- GA4 organic sessions/landing pages and actual lead-success events;
- CRM lead totals, contactable/qualified leads, trial bookings/attendance, paid enrolments;
- country, device, course and source breakdowns where data supports them;
- conversion rates with numerator and denominator shown;
- missing tracking and attribution gaps.

Calculate the traffic requirement for 200 qualified leads/day using actual observed conversion rates. If no reliable conversion rate exists, show clearly labeled scenarios only. Keep 200/day as a stretch target; do not present traffic estimates as actual leads.

## 8. Same-day execution order

1. Read guardrails, registers, and current source state.
2. Run baseline audits and capture evidence.
3. Select the highest-impact, low-risk, verified issues.
4. Implement in small commits on this feature branch.
5. Add/adjust regression tests for every meaningful change.
6. Run `npm test`, `npm run lint`, `npm run build`, relevant browser and SEO audits.
7. Inspect git diff for accidental scope, secrets, PII, claims, generated artifacts and unrelated changes.
8. Update the SEO operations register, claims/page/content/link/agent logs and this sprint's evidence report.
9. Open a pull request against `main` with summary, risk, test results, evidence, blockers and rollback notes.
10. Do not merge or deploy to production, change DNS/hosting, database schema/data, external integrations or publish external content unless the existing owner-approved operating spec explicitly authorizes that exact action. If approval is required, stop at a tested PR and state the precise approval needed.

## 9. Definition of done for today

A task is complete only when there is evidence for it:

- fresh baseline audits saved;
- all verified P1 technical defects fixed or individually documented as blocked;
- forms and tracking tested without real production submissions;
- country hub/canonical/hreflang rules checked;
- all changes have regression tests;
- tests, lint and production build results recorded;
- updated registers and evidence report committed;
- pull request opened with a clear, prioritized change summary;
- deployment status clearly labeled (not deployed unless verified);
- remaining blockers and exact owner actions listed.

If a check cannot run due to missing credentials, browser/runtime issue, rate limit or external permission, do not fake a pass. Record command, exact error and a practical next step.

## 10. Required final response from Claude

Return:
1. What was researched, with dated source links.
2. What was actually implemented (files and commit/PR links).
3. QA results (exact commands and pass/fail counts).
4. Live verification (only if actually performed).
5. Verified current lead funnel baseline, or clearly named access blockers.
6. Progress toward 200 qualified leads/day, with assumptions separated from actuals.
7. Risks, owner/academic approvals required and rollback method.
8. A short next-24-hour priority list.

Do not finish with a generic SEO lecture. Deliver working changes, tests, evidence and a PR.
