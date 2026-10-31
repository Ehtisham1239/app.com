# Hatchium chat and website leads

The supplied Hatchium widget is embedded on public website pages. Configuration is set before the
async widget script loads after hydration, and Next.js loads it once across public-page navigation.
CMS pages do not embed it. The CMS Portal link performs a full-page navigation so the provider's
public-page runtime is not carried into the staff portal. WhatsApp remains available on the opposite
side. The owner can disable the widget or change its public key under Website settings → Website chat.

The public widget key is an embed identifier. It is not a ChatGPT API key or a server-side Hatchium
API credential. This integration does not send contact/trial form fields into the widget. Existing
forms keep saving to the authorised Supabase project and remain available in the CMS.

## Automatic lead forwarding — built, off until the webhook is set (31 Oct 2026)

Migration `20261031000100_lead_forwarding.sql` adds a database outbox:

- Triggers queue every new contact message and trial application in `private.lead_outbox`.
  Spam-marked messages are skipped. The payload carries coordinator fields only: no IP hash,
  user agent, spam score, internal notes or UTM data.
- A pg_cron job (`oqc-lead-forwarding`, every minute) POSTs each queued lead as JSON to the
  webhook. Requests use `pg_net`, a 10 s timeout, an `Idempotency-Key` (= `event_id`) and an
  optional Bearer token. 2xx marks the lead sent. Other results retry with backoff (1, 2, 4 … up to
  120 min) and stop as `failed` after 6 attempts. The CMS record is never changed.
- **Off by default.** Nothing is sent until an `https://` URL is stored in Supabase Vault.
- CMS → Website settings → Website chat shows On/Off and the sent, waiting and failed counts, plus
  the last error. Staff with `settings:update` can retry failed deliveries.

### To switch it on (owner)

1. Get the destination: a Hatchium lead/API endpoint and API key (ask Hatchium support), or a
   Make **Webhooks → Custom webhook** URL whose scenario adds the lead to Hatchium.
2. Supabase dashboard → SQL Editor, run (never paste these values into chat, Git or Website settings):
   ```sql
   select vault.create_secret('https://YOUR-WEBHOOK-URL', 'lead_webhook_url');
   select vault.create_secret('YOUR-API-KEY', 'lead_webhook_token'); -- only if the endpoint needs a key
   ```
   To change a value later, use `vault.update_secret`, or create a new secret with the same name;
   the newest one is used.
3. Update the privacy policy's "Website chat" section. Replace "Automatic forwarding of those forms
   to Make or the chat service is not currently enabled. We do not automatically copy website form
   fields into chat." with:
   "Contact and free-trial enquiries are stored in the college CMS and are also sent automatically
   to our enquiry service provided by Hatchium (via Make, if used) so the admissions team can follow
   up. Only the details you enter in the form are sent; technical data such as your IP address is
   not."
4. Submit one clearly labelled synthetic enquiry and confirm three things: the CMS card shows
   **Sent 1**, Make receives it (if used), and it arrives in the Hatchium inbox. Only then describe
   forwarding as working.

Leads submitted before the webhook is set wait in the outbox. They are sent when it is set. If
older enquiries should not be sent, clear them before step 2 with
`delete from private.lead_outbox where status = 'pending';`.

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
