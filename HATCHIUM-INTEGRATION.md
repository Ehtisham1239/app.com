# Hatchium chat and website leads

The supplied Hatchium widget is embedded on public website pages. Configuration is set before the
async widget script loads after hydration, and Next.js loads it once across public-page navigation.
CMS pages do not embed it. The CMS Portal link performs a full-page navigation so the provider's
public-page runtime is not carried into the staff portal. WhatsApp remains available on the opposite
side. The owner can disable the widget or change its public key under Website settings → Website chat.

The public widget key is an embed identifier. It is not a ChatGPT API key or a server-side Hatchium
API credential. This integration does not send contact/trial form fields into the widget. Existing
forms keep saving to the authorised Supabase project and remain available in the CMS.

## Automatic lead forwarding — awaiting destination

The owner confirmed that no Make webhook or documented lead API endpoint is available yet.
No endpoint, API action or delivery confirmation has been invented. No existing leads were exported.
Automatic form forwarding is not active.

To supply the missing destination:

1. In the owner's Make account, create a scenario with **Webhooks → Custom webhook** and create a
   webhook for OQC website enquiries. Store its URL securely as server-side configuration; do not
   put it into public Website settings, browser JavaScript or Git.
2. Add the intended Hatchium action if Make provides one, or an HTTP action using the API endpoint
   and authentication documented by Hatchium. Ask Hatchium support for the lead-ingestion API if it
   is not available in the account. The widget embed key alone does not document this operation.
3. Once the destination and required fields are known, implement server-side forwarding for new
   successful contact/trial submissions, with event IDs, persisted delivery status, bounded retries
   and a duplicate-handling rule. Keep the CMS record even if the provider is unavailable. Avoid
   forwarding internal notes, abuse-protection data or unnecessary learner information.
4. Test with an explicitly labelled synthetic enquiry and confirm both Make receipt and its final
   arrival in the intended Hatchium inbox before describing the full flow as working. Confirm the
   public privacy notice accurately describes the activated forwarding.

A Make webhook accepting an event proves receipt by Make; it does not alone prove delivery to
Hatchium or to this ChatGPT conversation. Those are separate integration steps.

## Validation

`node scripts/hatchium-smoke.mjs <base-url>` checks configuration order, single loading during
public navigation, CMS isolation, browser errors and the site's behaviour if the widget download
fails. The external widget is deliberately stubbed in these contract checks; it is not a real chat
conversation or a provider availability test. Real vendor script access requires app.hatchium.ai
in the cloud environment network policy. Keep TLS verification enabled.

Local checks passed: configuration existed before the stubbed vendor script executed, the script
loaded once across public navigation, CMS sign-in had no widget runtime, and the contact form
remained usable when the script download failed. There were no browser page errors. All 24 existing
automated tests and the production build passed; lint has no errors and 19 existing warnings.

Migrations `20261022000500` and `20261022000600` add the accurate chat privacy notice and public
widget settings. Public widget settings are not a place for Make URLs or API secrets. Prior policy
copy remains in CMS revisions and the release backup outside Git. No lead records are changed.

The cloud environment currently blocks app.hatchium.ai with a proxy 403. Its network allowlist
addition was saved in the environment draft, preserving existing hosts. The owner must review/save
that draft and publish the environment to enable direct provider testing from this cloud machine.
This is separate from publishing the website and does not establish that the provider's script or
a real chat conversation has been tested.
