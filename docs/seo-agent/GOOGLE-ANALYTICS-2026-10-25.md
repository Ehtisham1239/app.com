# GA4 and Google Tag Manager integration — 25 October 2026

Target: https://project-umber-three-93.vercel.app. Repository: Ehtisham1239/app.com. Reporting timezone: Asia/Karachi.

## Scope and access evidence

The owner explicitly requested GA4 and Tag Manager support. That authorises this website integration and its existing deployment workflow, including an optional analytics transport after visitor consent. It does not authorise inventing account IDs, accepting Google terms, creating campaigns, changing account permissions, or claiming a new GA4 property is connected without evidence.

Baseline main: `dc8690646c62705256fb39a1e56c7fde08f99319`. Baseline live application: `88d8a0d939ad9fe6ec7296fddd7e5e7ddc226bc0`, READY deployment `dpl_HWA4ngycSX2bwc8JHGGro2jyxzuk`, retained rollback candidate. Source, public CMS analytics/tracking settings and production environment names were inspected. No GA4/GTM ID or analytics setting was present. The correct Supabase project is the existing `app.com` project; the other college project was not modified. No production database record, environment value, schema, Google account or campaign was changed.

## Implemented behaviour

- Admin → Website settings → Google Analytics & tags now accepts public `G-…` and `GTM-…` IDs and an enabled toggle. It rejects script snippets, malformed IDs and enabling without a usable destination. The standard existing staff settings permission and public-settings loader are retained.
- `site.analytics` defaults to disabled with empty IDs. No test or invented destination is installed. Missing/malformed configuration cannot inject arbitrary script sources or break public pages.
- A GTM ID selects GTM mode. A separate direct GA4 script is not loaded alongside it. A GA4-only ID selects direct GA4 mode. Supplying both IDs does **not** create or publish a Google tag inside a GTM container automatically.
- Basic consent mode blocks Google library loading before an explicit analytics opt-in. Reject/allow choices persist for up to 180 days. Preferences can be reopened, rejection works without Google loading, and revocation denies analytics, removes default GA cookies where accessible and reloads to unload already-loaded vendor code.
- Advertising storage, advertising user data and advertising personalisation remain denied. No unconditional GTM noscript iframe is included: it would bypass the JavaScript consent gate.
- One manual page-view event is generated per path transition, with same-path query changes deduplicated. Query strings/fragments, unsafe paths, staff/auth/API routes and certificate verification routes are excluded. External referrers are reduced to their origin; same-site referrers use public paths.
- Existing `oqc:lead-saved` signals are forwarded only after configured consent, with an allowlist containing enquiry type and broad market label. This event means a saved enquiry, not a qualified enquiry, attended trial or paid enrolment. Phone/email/WhatsApp clicks are separate `contact_click` events without contact destination values.
- Privacy information reflects the actual enabled/disabled state and describes the integration and preference storage. Existing CMS policy prose, forms, pricing, country navigation, verification files and chat behaviour are retained.

This consent UI is an implementation, not a legal-compliance certification. Arbitrary tags later published in an owner-controlled GTM container remain the owner's configuration; do not enable unreviewed advertising, form-scraping or personal-data tags.

## Destination setup before activation

### Direct GA4

1. Use the owner's actual Web data-stream Measurement ID. Confirm the intended property, production hostname, time zone and currency in Google Analytics.
2. This application sends manual page views with `send_page_view: false` in its Google configuration. Disable automatic page views/history-based page changes in the GA4 stream to prevent duplicate counting. Review/disable automatic form interactions and other enhanced-measurement features that would independently inspect form data or unsanitised URLs.
3. Save the ID and enable analytics in the existing admin settings. Allow for public revalidation, then verify consent, requests and actual events in Tag Assistant and GA4 DebugView/Realtime.

### GA4 through GTM

1. Use the owner's actual Web Container ID. Configure and review its Google tag with the real GA4 Measurement ID, then publish the intended workspace version. Do not publish campaigns or advertising tags as part of this change.
2. Set `send_page_view` to false for the Google tag and disable automatic/history page views and automatic form measurement in the GA4 stream. Use the following single custom-event route rather than adding an additional history trigger or direct GA4 installation.

| Website dataLayer event | GA4 event name | Allowed parameters |
| --- | --- | --- |
| `oqc_page_view` | `page_view` | `page_location`, `page_path`, `page_title`, `page_referrer` |
| `oqc_generate_lead` | `generate_lead` | `form_type`, `market` |
| `oqc_contact_click` | `contact_click` | `contact_channel` |

3. Map those fields using data-layer variables. Configure tags to require analytics consent and keep all advertising consent denied. Do not configure user IDs, enhanced conversions, automatic form-variable capture or personal-data parameters. Review cookie/retention and any extra container tags separately.
4. Enable the reviewed container ID in the admin settings, then verify the published version in Tag Assistant and GA4 DebugView. A loaded GTM script alone does not prove GA4 delivery.

The existing server page-cache revalidation is used; IDs do not require a rebuild. No public write/debug endpoint was added. Never paste API secrets or account passwords into these fields.

## Verification

62 automated tests and the clean production build pass. ESLint has zero errors and the same 19 existing React advisories. Five analytics tests cover activation guards, URL privacy, consent-gated loading, page-view deduplication, exclusive GTM mode, allowlisted lead parameters, expired choices and blocked storage.

Four local production-build browser cases exercise real UI/controller code in direct GA4 and GTM modes at 390px and 1440px. Each checks rejection persistence, zero library loads before consent, one permitted loader, three path-transition page views, one simulated first-party saved-lead signal, one separate phone click, PII exclusion, advertising denial and revocation/reload/cookie cleanup. Google libraries were intercepted and replaced with inert stubs. No real GA4/GTM account received QA events and no form/database write was made. Consent screenshots were visually inspected.

Temporary local-only QA routes were moved out of `src/` and the release was rebuilt cleanly. No fixture route or runtime test ID is in the release source. The reusable browser runner explicitly refuses non-local targets. Existing unit/conversion tests continue to pass.

Final deployment and live checks are recorded in `GOOGLE-ANALYTICS-EVIDENCE-2026-10-25.json` after release. Actual activation, Tag Assistant and GA4 DebugView/Realtime remain pending the owner's real IDs and property/container access; implementation tests are not a collection receipt.

## Semrush overview supplied with this request

Reported by the owner: a 100/100-page crawl, Site Health 87%, AI Search Health 83%, seven errors, 222 warnings, crawlability 97%, HTTPS 18%, performance 100%, internal linking 89%, markup 97%; international SEO and CWV shown as not implemented. The overview's relative update label was “4h ago”; no exact audit timestamp, affected URLs, certificate hostname or failing properties were supplied.

The specific authenticated campaign issues URL could not be read through the available public lookup. Plugin discovery did not find a Semrush integration. These counts are **Reported**, not independently reproduced or resolved. The separate live public checks cover 205 canonical pages; they do not substitute for a fresh Semrush run, official rich-result test, independent origin TLS/SNI check or field CWV. Re-audit the current release with capacity for at least 205 pages and export the affected issue URLs/properties. Installing analytics does not establish a new audit score or resolve a TLS/schema finding by itself. Semrush's 222 warnings are unrelated to the 19 existing source-code compiler advisories.

## Primary documentation checked

- https://developers.google.com/tag-platform/security/guides/consent?consentmode=basic
- https://developers.google.com/analytics/devguides/collection/ga4/views?client_type=gtag
- https://developers.google.com/analytics/devguides/collection/ga4/single-page-applications
- https://developers.google.com/analytics/devguides/collection/ga4/measure-spa-gtm
- https://developers.google.com/tag-platform/security/guides/csp
- Installed Next.js 16.4.3 script, client/server component and metadata documentation.
- Supabase changelog and current settings-write API documentation; no new API, schema, role, RLS policy or dependency was introduced.
