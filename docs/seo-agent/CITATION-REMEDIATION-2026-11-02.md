# OQC citation remediation and release evidence — 2 November 2026

## Scope
Owner asked to complete pending citation work and correct the identity/location issue. Source of truth: Ehtisham1239/app.com, main branch. Production domain: https://www.onlinequrancollege.com.

## Findings observed
- Live Contact page no longer contains the previously reported “Suite 404, Virtual Learning District” text.
- Current live Contact page still displayed “Registered in United Kingdom”; the footer displayed “United Kingdom”. Owner operating context is an online-only academy with no customer-facing physical office.
- Current live Contact page displays info@onlinequrancollege.com and +44 7864 710821. These were not changed.
- Public Trustpilot page is marked “Claimed profile · May 2024”; it displays 8 reviews and states there has been no recent history of asking customers for reviews. No account-admin access was established.
- Official website footer links to Facebook, Instagram, X and Trustpilot. The linked social pages' owner/admin access and profile facts have not been independently verified.
- Google Business Profile is excluded because Google requires in-person customer contact and lists online-only businesses as ineligible.
- Apple Business is the current product name (Apple Business Connect transitioned to Apple Business). Apple documentation describes brand management for businesses without physical locations, but OQC account sign-in and organisation verification remain owner-controlled.

## Source changes committed
- Contact page: replace country-registration label with “Online-only academy · no walk-in office”.
- Footer: remove country-only location and display the online-only service model.
- Organization JSON-LD: no longer derives a PostalAddress from a country-only setting; PostalAddress is emitted only when an explicit streetAddress and valid two-letter country code are configured.
- Regression test: cover country-only, incomplete address and complete address cases.
- Global citation strategy: one global identity; no fake local NAP; no generic local directory blast; Trustpilot and existing social profiles audited as existing assets; Apple Business included as an owner-verification task.
- USA and Australia packs/trackers rewritten to remove obsolete local NAP and directory submission instructions.
- Consolidated global citation tracker created.

Relevant source commit (application code + regression test): `6ff6c3473782622d42e015623a02d720aa71abd2`.
Latest documentation commit: `48b1497af8234f8402dc946e79eaf1ee8a8be63c`.
New tracker: docs/seo-agent/GLOBAL-CITATION-TRACKER-2026-11-02.csv.

## Verification and release status
- GitHub source updates were accepted on main.
- Automated regression test was added but could not be run in this session; no local repository runtime was available.
- GitHub commit status for the application/test commit reports Vercel: pending.
- Vercel deployment inspection/listing returned permission/not-found errors; an explicit preview deployment attempt returned HTTP 403 (“don't have permission to create a Production Deployment for this project”).
- Therefore this remediation is **implemented in source, not production verified**. The public domain must be checked again after an authorized deployment. Do not state that the Contact/footer/schema changes are live yet.

## External actions not completed
- No social/Trustpilot account was accessed or modified.
- No new directory or platform profile was created.
- No review invitations, emails, WhatsApp messages or editorial submissions were sent.
- Apple Business organisation verification requires the owner's account and accepted business/domain evidence.
- RISE, ISRE and ISLA editorial opportunities remain research/pitch only; owner approval and, where applicable, academic review are required before submission.

## Exact next actions
1. Restore/authorize the Vercel project deployment permission or deploy the latest main revision from an owner-authorized Vercel session.
2. Run `npm test`, `npm run lint` and `npm run build` in the repository environment; resolve any failures.
3. Verify production Contact/footer text, Organization JSON-LD, canonical URLs and no PostalAddress when no full address is configured.
4. Owner signs into the existing Facebook, Instagram, X and Trustpilot profiles to confirm admin ownership and reconcile details; do not create duplicates.
5. Owner completes Apple Business verification if desired; no physical location pin should be invented.
6. Obtain explicit owner approval before any external editorial/resource submission.
