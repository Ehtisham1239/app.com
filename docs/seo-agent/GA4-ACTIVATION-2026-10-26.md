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

## Published release and current production

PR #2 was merged as source `617d379cd7fd9db2187e3558208c351879cfd6c2`. Deployment `dpl_Ha8bhQn9ZG673vUyCz72GXWbYM3N` reached READY and included the existing public alias `https://project-umber-three-93.vercel.app`. PR #1 was closed as superseded after its trial-eligibility correction was incorporated.

The production project remains `prj_q3qTOTMNxuDfgmd5XoCaoWVhQBVu`, account `team_8Xig9mSvNd3XLAzNbQgwPapo`. Explicit team-scoped connector calls returned 404/empty listings; default-account reads recovered and verified this same project and alias. This GA4 release did not create another project or domain.

When work resumed, the alias had subsequently advanced to READY deployment `dpl_xAGB8jmEFf6HvT8hekyy8EfXcJmo`, source `cd848762647b02348c10adab347e34c6008dee22`. Its later canonical-host, checked-in image derivative, logo-colour, hero and form changes were preserved; the earlier release was not promoted over them. Local main was fast-forwarded to this source before recording the results.

Post-release public HTTPS checks on the current Vercel alias passed for all 205 sitemap pages, all 165 regional learning scenes, all 1,026 responsive image files and 12 legacy image redirects. Original homepage image/small-image/logo hashes still match. Live pricing and free-trial pages return 200 and contain the Weekend-plan exclusion. GA4 installation was rechecked at 390px and 1440px with zero browser errors, no real Google requests and no form submissions, with the same consent/load/revoke assertions described above. These checks do not establish receipt in GA4 Realtime.

The broader live Chromium viewport suite did not finish reliably: browser sessions closed during navigation and an image-decode/proxy check failed. A separate public-response audit and protected-image hashes passed, and the complete two-viewport GA4 installation run passed; these do not establish a complete live visual regression pass on the later contributor source. The 80-case browser result in the imagery report remains the earlier local-build result. No application rollback or visual change was made based on these environment-dependent probe failures.

The runtime-log API returned 403, and no authenticated CLI fallback is available. No clean server-log scan is claimed. Preserve the earlier READY deployment `dpl_E8w56fLzgwDAkVb8ZVdoSicGpcNc`, source `eaa95a57f11d2af335f61e9e6a368a5a5a5344da`, as an older rollback candidate, not as the current release.

## Custom-domain blocker

The source's canonical host is `https://www.onlinequrancollege.com`, but that address currently serves a different HTML site: HTTP 200, no Next.js asset references and no `G-57TGPTDNT4` in the returned document. The new app and the verified analytics installation are publicly available on `https://project-umber-three-93.vercel.app`. A canonical setting alone does not connect a domain.

The Vercel project-domain API lists both `onlinequrancollege.com` and `www.onlinequrancollege.com` as `verified: false`, with `pending_domain_verification`. A verification attempt for `www` returned HTTP 400 `existing_project_domain`: Vercel says it is attached to another project and requires the ownership challenge before it can be added here. No forced reassignment was attempted. Authoritative nameservers returned by the configuration API are `ns1.dns-parking.com` and `ns2.dns-parking.com`; this session has no write access to that DNS provider. No DNS, nameserver, email or domain-routing changes were made during this follow-up.

The owner can add these exact TXT values at the existing authoritative DNS provider. Both values share one record name; retain both as separate TXT values and preserve unrelated records.

| Type | Name | Value |
| --- | --- | --- |
| TXT | `_vercel.onlinequrancollege.com` | `vc-domain-verify=onlinequrancollege.com,dff8e7a8b2ec4779add9` |
| TXT | `_vercel.onlinequrancollege.com` | `vc-domain-verify=www.onlinequrancollege.com,d5ddd9376c2e199766e2` |

After propagation, verify both project domains, re-read their current recommended routing records, and check HTTPS and page identity before claiming the custom-domain launch. The current configuration API reports `ipStatus: required-change`; do not assume the existing custom-domain response is this app or blindly replace DNS from a generic example. GA4 reporting, custom-domain completion, Search Console indexing and field performance remain unverified.
