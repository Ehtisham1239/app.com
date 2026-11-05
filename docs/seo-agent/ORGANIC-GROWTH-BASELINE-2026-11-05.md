# OQC organic growth baseline and authority review — 5 November 2026

## Executive status
The site has a broad technical/content foundation, but the connected 90-day data does **not** show strong organic acquisition yet. The immediate growth work is to improve commercial page relevance, resolve analytics/lead attribution, and earn a small number of relevant independent references. A quota of 500 backlinks or 509 directory citations is not a safe or credible substitute.

## Search Console — last 90 days
Domain property: `sc-domain:onlinequrancollege.com`. Country filter: USA, UK, Canada, Australia and UAE.

| Market | Clicks | Impressions | CTR | Average position |
|---|---:|---:|---:|---:|
| USA | 1 | 200 | 0.50% | 32.65 |
| UK | 1 | 176 | 0.57% | 25.95 |
| Australia | 1 | 172 | 0.58% | 40.38 |
| Canada | 0 | 25 | 0% | 52.84 |
| UAE | 0 | 6 | 0% | 19.50 |
| **Total** | **3** | **579** | **0.52%** | — |

The 500-keyword map includes 79 relevant unique phrases observed in the five-market GSC query export after excluding unrelated login/portal/competitor and irrelevant local-intent phrases. The other 421 are semantic candidates, not volume-verified demand.

### Observed opportunity examples
- UK: `online quran classes uk` — 18 impressions, average position 13.33; `how much do online quran classes cost in the uk?` — 7 impressions, average position 9.
- USA: `quran classes` — 38 impressions across several legacy/city URL rows; average positions vary widely. Consolidate intent to the correct country/course canonical page; do not expand fake local presence.
- Australia: `online quran classes australia` — 14 impressions across hub/city URLs; page positions vary. Strengthen the country hub and internal links rather than cloning thin city pages.
- USA Tafseer/translation phrases are mostly low-impression and weakly ranked; improve the actual course page only if the current course offering supports the wording.

Search Console reports query/page rows, not market-wide monthly search volumes or keyword difficulty. Do not present GSC impressions as monthly search volume.

## GA4 — last 90 days, five priority markets
Connected GA4 property: `560748871`.

- USA homepage: 46 direct sessions, 4.35% engagement rate, 3.83 seconds average engagement.
- USA `/free-trial`: 41 direct sessions, 0% engagement, 0 seconds average engagement.
- USA `/pricing`: 34 direct sessions, 0% engagement, 0 seconds average engagement.
- USA `/locations/united-kingdom`: 36 direct sessions, 0% engagement, 0 seconds average engagement.
- The report contains 198 USA `first_visit` and 198 `session_start` events, but only one USA `generate_lead` event. The connected report returned zero conversions in this 90-day data pull.
- Treat this as a measurement/traffic-quality anomaly, not proof of bot traffic. Verify GTM consent behaviour, internal traffic filters, referral exclusions, session quality and event firing with a safe synthetic submission. Never submit a real parent/learner lead as a test.

### Measurement actions
1. Confirm `generate_lead` fires after a real successful database save, not on button click.
2. Add contact and trial events with only allowlisted non-PII values; never send name, phone, email, message, student name or reference to GA4.
3. In GA4 Admin, mark the approved `generate_lead` event as a key event and confirm it appears in reports.
4. Verify source/medium and market dimensions; investigate the unusually large direct-only US traffic and zero-engagement landing pages.
5. Reconcile website events with CMS saved leads and actual paid enrolments before reporting conversion rate.

## Performance evidence and limits
The previous PR #123 QA recorded strong Lighthouse lab scores on the tested routes (roughly 95–100 Performance, 97–100 Accessibility, 100 Best Practices and 100 SEO) and no horizontal overflow across its tested responsive widths. Those are lab checks from that release, not fresh measurements for this PR, not CrUX field Core Web Vitals, and not a ranking guarantee. Current GA4 FCP/TTFB/LCP/CLS/INP rows are event counts, not percentile measurements. Fresh field CWV requires Search Console/CrUX data; a fresh direct-network lab run is still required after deployment.

## Citation and backlink audit
The existing global citation tracker contains 32 register rows, but these are a mix of:
- Existing social URLs linked from the site footer (Facebook, Instagram, X), whose admin ownership/profile details are not yet verified in the tracker.
- A public Trustpilot profile, with admin access not verified.
- Apple Business brand verification and optional LinkedIn/YouTube/Pinterest profiles that require owner sign-in or a real content programme.
- Research-only editorial/resource prospects (RISE, ISRE, ISLA), not submitted or accepted.
- Search tools, duplicate platform rows, ineligible local directories, and explicitly excluded mass-link lists.

Therefore 32 tracker rows are **not 32 verified citations or backlinks**, and no 500 live backlinks / 509 verified citations have been earned by this audit. OQC's owner-confirmed model is online-only with no customer-facing local office. Do not create Google Business Profile listings, fake country/city addresses, or bulk local directory submissions.

### Ethical authority programme
- Verify one global identity across the three existing social profiles and the public Trustpilot page.
- Complete Apple Business organisation verification only through the owner's account and accepted proof; no map pin or false address.
- Build genuine academic/resource partnerships and useful parent/learner resources; submit only where editorial relevance and eligibility are confirmed.
- Earn independent editorial links from relevant education/community sources; no paid do-follow links, automated profile blasts, link exchanges or fabricated references.
- Count a backlink only when the external page is live, publicly accessible, relevant, indexable where applicable, and actually links to the canonical OQC URL. Record source URL, target URL, anchor context, date, status and evidence.
- Count a citation only when a real third-party source mentions the correct OQC identity and is publicly verifiable. Do not count duplicate platform records, search-engine tools or unsubmitted pitches.

## Priority execution order
1. Complete PR #125: global lead email route + 500-keyword map; pass tests, lint and build.
2. Configure Resend server-side variables and apply the reviewed SQL migration; safe synthetic tests only.
3. Fix the GA4 conversion/engagement measurement anomaly and reconcile CMS leads.
4. Improve the highest-value existing country hubs and course pages based on GSC query/page evidence.
5. Refresh the free-trial page and form usability after the current UI-cleanup PR is tested and deployed.
6. Add genuinely useful FAQ answers to the relevant pages; do not generate 500 thin FAQ entries.
7. Review every published blog for primary-source references, expert attribution where appropriate, clear author/date, and accurate internal links.
8. Re-run responsive QA, Lighthouse, direct-network performance and Search Console/CrUX checks after release.
9. Pursue editorial backlinks through owner-approved, relevant partnerships; report verified links, not outreach volume.

## Claims not made
- No guarantee of top rankings, organic traffic volume, AI citations, 500 backlinks or 509 third-party citations.
- No verified monthly search volumes or keyword difficulty in this report.
- No verified current field Core Web Vitals percentile results.
- No external citation profile has been newly created, claimed, verified or submitted in this run.
