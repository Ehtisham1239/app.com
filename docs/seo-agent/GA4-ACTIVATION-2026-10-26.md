# Owner GA4 activation — 26 October 2026

The owner supplied Measurement ID `G-57TGPTDNT4` and requested installation and completion of pending work.

## Completed

- The existing `app.com` Supabase project now has public setting `site.analytics` with analytics enabled, GA4 ID `G-57TGPTDNT4`, and an empty GTM container ID. The prior setting was absent. Anonymous read access to this one public setting was verified after saving it. No other CMS records, roles or policies were changed.
- Live home/contact pages revalidated and include the owner ID. The existing consent-controlled integration activates it without requiring a new deployment. Direct GA4 remains the only transport; no second pasted script or GTM transport was added.
- Source defaults retain the owner configuration for future releases. An administrator can still disable or edit analytics through the saved CMS settings.
- Consent controls in this source have at least 44px touch targets.
- The pending trial-eligibility correction from PR #1 is incorporated into the current pricing and trial pages, preserving their newer layout and metadata. Both pages explain that the Weekend plan is excluded from the seven-day free trial.

## Verification

- 64 automated tests passed; production build passed; lint reports zero errors and the existing 19 warnings. Changed-file lint passed.
- Local and live installation checks passed at 390px and 1440px. Each verifies zero Google library loads before consent or after rejection, one permitted loader with the exact owner ID, one configuration command, two manual path-transition page views, persisted rejection and loader removal after revocation. Zero browser errors and zero form submissions.
- Google libraries were replaced with inert browser-test stubs. No QA events were sent to the real GA4 property. These checks verify the installation and controller behaviour, not a receipt in GA4 Realtime or DebugView.
- Both locally built pricing and trial pages return 200 and contain the Weekend-plan exclusion.

## Release target

The production project remains `prj_q3qTOTMNxuDfgmd5XoCaoWVhQBVu`, account `team_8Xig9mSvNd3XLAzNbQgwPapo`, domain `https://project-umber-three-93.vercel.app`. Explicit team-scoped connector calls returned 404/empty listings; default-account discovery recovered the same exact project, account and production alias. Default-scoped project/deployment reads verified the target. No new project or domain was created.

The baseline production deployment is `dpl_E8w56fLzgwDAkVb8ZVdoSicGpcNc`, source `eaa95a57f11d2af335f61e9e6a368a5a5a5344da`. Preserve it as a rollback candidate. Final release metadata and post-deployment results are recorded after publishing this source.
