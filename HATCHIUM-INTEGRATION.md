# Hatchium chat and website leads

The supplied Hatchium widget is embedded on public website pages. Configuration is set before the
async widget script loads after hydration, and Next.js loads it once across public-page navigation.
CMS pages do not embed it. The CMS Portal link performs a full-page navigation so the provider's
public-page runtime is not carried into the staff portal. WhatsApp remains available on the opposite
side. The owner can disable the widget or change its public key under Website settings → Website chat.

The public widget key is an embed identifier. It is not a ChatGPT API key or a server-side Hatchium
API credential. This integration does not send contact/trial form fields into the widget. Existing
forms keep saving to the authorised Supabase project and remain available in the CMS.

## Making the chatbot answer every visitor question (21 Nov 2026)

The widget only answers well from what it has been trained on. Hatchium's training happens in the
owner's Hatchium dashboard; this repository cannot configure it. The site gives the bot one source
that stays current on its own.

### 1. Train it on the live facts file

Add this URL as the main knowledge source in the Hatchium dashboard (website/URL training):

**`https://www.onlinequrancollege.com/llms-full.txt`**

It is generated from the CMS (`src/app/llms-full.txt/route.js`, data from `organizationFacts` in
`src/lib/org-facts.js`) and refreshes within an hour of a CMS edit. It contains:

1. Identity and contact: email, UK phone, WhatsApp, the USA admissions number, and reply times.
2. How it works, benefits and the sibling discount.
3. Every published course: summary, ages, level and typical duration.
4. Every package: classes a week, minutes, the published monthly fee, and whether it has the 3-day
   trial (Weekend has none).
5. Teacher profiles and the teacher-preference rule.
6. The five market countries.
7. All published FAQs: rescheduling, missed classes, payments, cancellation, certificates, Hifz pace.
8. Help for enrolled families: parent portal, access codes, certificate check, reviews.
9. Answering rules for the assistant.
10. Policy links.

If the dashboard also accepts page URLs, add these for wording and context:
`/at-a-glance`, `/pricing`, `/faq`, `/free-trial`, `/contact`, `/courses` and each `/courses/<slug>`,
`/learn`, `/teachers`, `/locations` and the five hubs, `/refund-policy`, `/terms-and-conditions`,
`/privacy-policy`.

Retrain (or "refresh sources") in Hatchium after any change to prices, packages, FAQs, courses or
contact details. The file updates itself, but Hatchium keeps its old copy until it re-reads it.

### 2. Paste these instructions into the bot's instructions / persona field

> You are the admissions assistant for Online Quran College, which teaches live one-to-one online
> Quran, Tajweed, Hifz, Arabic and Islamic studies classes for children and adults. Answer only from
> your trained sources. If the answer is not there, say you are not sure and offer WhatsApp
> (+44 7864 710821) or the contact form. Never guess. Quote published fees in USD and say the
> coordinator confirms the final fee and payment currency; local-currency figures are approximate.
> The free trial is 3 days and needs no card; the Weekend plan has no trial. Never promise a
> completion date, a particular teacher or a class slot: Admissions confirms availability. Do not
> give religious rulings (fatwa), medical or legal advice; suggest asking a qualified scholar or the
> teacher. Never ask for card numbers, passwords, parent-portal access codes or a child's private
> details. Progress reports and results are only in the parent portal. To book, send people to the
> free-trial form. Reply in the visitor's language (English, Urdu, Roman Urdu or Arabic), briefly
> and kindly.

The same rules are in section 11 of `/llms-full.txt`, so the bot reads them even if this field is
left empty.

### 3. Test it before telling families

Ask the live widget each question below, in English and in Roman Urdu. A correct answer matches
the expected answer.

| Question | Expected answer |
| --- | --- |
| Is there a free trial? | Yes, 3 days and no card needed; the Weekend plan is excluded. |
| How much are classes? | US$30–50 a month by package (30-minute classes, 2–4 a week); the coordinator confirms the final fee. |
| Can I get a female teacher? | You can request one; Admissions confirms availability. |
| My child is 4, can she start? | Usually from about 4½–5, with Noorani Qaida; the teacher confirms during the trial. |
| How long does Hifz take? | It varies, typically several years for the whole Quran; there is no guaranteed date. |
| Can I reschedule? | Yes, with at least 4 hours' notice; the make-up class must be completed within 30 days. |
| What if we miss a class? | The teacher waits 10 minutes; a missed class is not refunded or made up automatically. |
| Is there a sibling discount? | 15% for each additional child from the same household. |
| How do I see my child's report? | In the parent portal, with the Client ID and access code. |
| I forgot my access code | Use "Forgot your access code?" in the parent portal; the bot must never ask for the code. |
| Is this certificate real? | Check it on the verify-certificate page using its number. |
| Do you have a centre in Sydney? | No, classes are online only. |
| Is music haram? (or another ruling) | The bot does not give a ruling and suggests asking a qualified scholar. |
| What is your bank account? | The bot does not share payment details in chat; it refers the visitor to WhatsApp or the contact form. |

Before submitting a test enquiry, label it clearly as a test, because every saved enquiry is
emailed to Admissions and HighLevel (see `docs/subsystems/lead-sync.md`).

## Automatic lead forwarding — awaiting destination

> Update (21 Nov 2026): saved leads are now delivered by the lead-sync outbox to HighLevel and an
> admissions email (`docs/subsystems/lead-sync.md`). If Hatchium should also receive leads, add it
> as another destination in `src/lib/server/lead-outbox.js`; do not build a second outbox. The
> notes below are kept for history.

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
