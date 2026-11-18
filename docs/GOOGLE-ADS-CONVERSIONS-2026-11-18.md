# Google Ads lead conversion tracking — 18 Nov 2026

Owner decisions (CEO, 18 Nov 2026) are recorded in `AGENTS.md`. This file is the hand-over for the
GTM, Google Ads and CMS steps that code cannot do, and the release order.

Status labels: **Observed** (seen on the live site or account), **Implemented** (in this branch),
**Locally verified** (tests and the local browser check), **Pending** (manual step, not done).

## 1. What was wrong (observed 18 Nov 2026)

| # | Finding | Evidence |
|---|---|---|
| 1 | Google Ads recorded **0 conversions in 90 days** across all 18 conversion actions. | Supermetrics, account 532-047-4280, ConversionAction report, last 90 days |
| 2 | The GA4 `generate_lead` tag and the Ads conversion tag `7H1rCIzPw7IdEMnFxdo9` fire on the custom event `thanku_generate_lead`. The site never sends that event. | Published `GTM-W7CMZS53` v14 (`gtm.js`), repo search |
| 3 | The Ads conversion tag `hT_qCL6MgbodEMnFxdo9` fires on `gtm.js` when the path contains `/free-trial/thank-you`. The form reaches the thank-you page by client-side navigation (no `gtm.js`), so genuine leads are missed. A refresh or direct visit to that page is what would fire it. | `gtm.js` v14 rules; `quick-trial-form.jsx` uses `router.push` |
| 4 | Ad consent was denied and the cookie shield kept `_gcl_*` in page memory, so the ad click could not be linked to a lead in the browser. | `src/lib/analytics.js`, live dataLayer |
| 5 | Careers applications fired the same lead event as enquiries. | `contact-form.jsx` (`/careers` uses `ContactForm`) |
| 6 | No lead event carried a transaction ID. | `conversion-events.js` (before) |
| 7 | `GTM-52PTXDRF` (v1) holds only the Ads Google tag `AW-16564445897`, which `GTM-W7CMZS53` already loads. | Published `gtm.js` of both containers |
| 8 | The container's Google tag `G-EMHY1G2CKB` has **automatic detection of user-provided data** on (email, phone, address). | `gtm.js` v14: `__ogt_1p_data_v2` with `vtp_autoEmailEnabled`, `vtp_autoPhoneEnabled`, `vtp_autoAddressEnabled` = true |
| 9 | Production runs on Hostinger (`server: hcdn`); the Vercel project is not live. | Response headers, Vercel project |

## 2. What this branch changes (implemented, locally verified)

- **One lead signal per confirmed lead, on the thank-you page only** (`src/lib/conversion-events.js`).
  The form stores a short-lived pending record after a database-confirmed save. The analytics
  controller sends the event after the thank-you page's `oqc_page_view`, only when the page and
  `?ref=` match, within 30 minutes, once per reference (references remembered on the device).
- dataLayer events (no personal data):

  | Event | When | Fields |
  |---|---|---|
  | `free_trial_submission` | `/free-trial` form (free trial or package enquiry) and the USA landing page | `form_id`, `form_type` (`trial`), `lead_type` (`free_trial` / `package_enquiry`), `market`, `lead_id`, `transaction_id` |
  | `contact_form_submission` | `/contact` with subject Course enquiry, Fees and payment, Class timings or Teacher request | same, `form_type` `contact`, `lead_type` `course_enquiry` |

  Never sent: careers applications, Existing student support, Partnership, Other, failed or spam
  saves, refreshes, revisits, direct visits. The pre-redirect `oqc_generate_lead` event is removed.
- **Consent:** default all denied → update `analytics_storage`, `ad_storage`, `ad_user_data` granted;
  `ad_personalization` denied; `allow_ad_personalization_signals` and `allow_google_signals` false.
- **Ads click cookies** `_gcl_*` are stored normally; `_ga*`, `_gid`, `_gat` stay in page memory.
- **Ad-click landings** (`gclid`, `gbraid`, `wbraid`) start the tags at once instead of waiting for
  interaction, so the click ID is stored before the visitor navigates.
- USA landing page: same consent and cookie rule; thank-you event renamed `generate_lead` →
  `free_trial_submission` with the same fields; pre-redirect `oqc_generate_lead` removed.
- CMS head code rejects `GTM-52PTXDRF` and any `AW-16564445897` / `gtag/js?id=AW-` snippet.

Checks: `npm test` (all pass), `npm run lint`, `npm run build`, and
`node scripts/lead-conversion-smoke.mjs` against the local build (7 browser cases, all pass; GTM is
stubbed, so this does not prove the container's tags fire — that is step 3.4 below).

## 3. Pending manual steps (in this order)

### 3.1 Google tag settings — do before anything is published (hard gate)
In Google Tag Manager or Google Ads → Google tag **G-EMHY1G2CKB** → Configure your Google tag →
**turn off "automatically detect user-provided data"** (email, phone, address). With `ad_user_data`
granted, this setting would let Google collect hashed form details, which the owner's rules forbid.
Confirm afterwards that the published `gtm.js` no longer shows `vtp_isAutoEnabled":true`.

### 3.2 GTM-W7CMZS53 workspace changes (needs tech.iqratech@gmail.com access)
1. Data Layer Variables (v2): `transaction_id`, `lead_type`, `form_id` (`form_type` and `market` exist).
2. Custom Event triggers: `CE - free_trial_submission`, `CE - contact_form_submission` (event equals).
3. Ads conversion tag with label `7H1rCIzPw7IdEMnFxdo9`: trigger → `CE - free_trial_submission`;
   Transaction ID → `{{DLV - transaction_id}}`. Remove the `thanku_generate_lead` trigger.
4. Ads conversion tag with label `hT_qCL6MgbodEMnFxdo9` (thank-you path on `gtm.js`): **pause or delete**.
5. GA4 event tag `generate_lead`: triggers → both new custom events; add parameter `lead_type`.
6. Contact course enquiries (secondary): create the conversion action in Google Ads first (3.3),
   then an Ads conversion tag with its label on `CE - contact_form_submission`, Transaction ID as above.
7. Add a **Conversion Linker** tag on Initialization – All Pages.
8. Leave the phone-click tag (`jEInCNvx1rYdEMnFxdo9` on `oqc_contact_click` + phone) as it is.
9. Do not install `GTM-52PTXDRF`; it can be left unused or deleted by its owner.

### 3.3 Google Ads (account 532-047-4280)
- Confirm which conversion action owns label `7H1rCIzPw7IdEMnFxdo9` (Goals → Conversions → action →
  Tag setup → Use Google Tag Manager). Make that action the **only Primary** website lead action,
  named e.g. "Website – Free trial request", count **One**.
- Create "Website – Contact course enquiry" as **Secondary**, count One; give its label to 3.2.6.
- 8 actions currently count as Primary (several duplicate "Submit lead form" actions, smart-campaign
  call/direction actions). Review and set duplicates to Secondary or remove them, so bidding learns
  from one clear lead signal. Missing data: the label → action mapping is not visible through the API.
- Keep enhanced conversions **off** (no personal data to Google). Confirm auto-tagging is on.

### 3.4 Test in GTM Preview / Tag Assistant (before publishing the 3.2 changes)
Analytics runs only on `www.onlinequrancollege.com`, so a preview host cannot test the container.
After the code is live, open GTM Preview (Tag Assistant) with the unpublished 3.2 workspace on the
live domain:
1. Open `https://www.onlinequrancollege.com/free-trial?gclid=TEST-<date>` → `_gcl_aw` cookie present.
2. Submit a clearly marked test trial (e.g. learner "TEST – delete") → thank-you page →
   Tag Assistant shows `free_trial_submission` and the Ads tag `7H1r…` fired **once** with
   the TR- reference as Transaction ID; GA4 `generate_lead` fired once.
3. Refresh and revisit the thank-you page → no conversion tag fires.
4. Submit with the network offline / a validation error → no event.
5. Contact form "Existing student support" and `/careers` → no conversion tag.
6. Repeat 1–3 on `/usa-quran-classes`.
7. Delete the test leads in the CMS.

### 3.5 Privacy policy (CMS page `/privacy-policy`) — before the code goes live
The live policy says advertising storage is switched off and that attribution values are not sent
to an advertising platform. Both stop being true. The owner must approve replacement wording
(draft in the hand-over report). Not legal advice; UK/EU visitors are not shown a consent banner
by owner decision — get legal advice on PECR/GDPR.

### 3.6 Release order (each step needs the owner's explicit approval)
1. 3.1 Google tag setting off, and publish a GTM version whose **only** change is pausing the
   `hT_qCL6MgbodEMnFxdo9` tag (3.2.4). Otherwise, once ad consent is granted, that tag would start
   counting thank-you refreshes and direct visits.
2. Privacy policy updated (3.5).
3. Merge this PR and deploy to Hostinger (`npm run build:hostinger`).
4. 3.4 GTM Preview tests with the rest of 3.2 in the workspace.
5. Publish that GTM version.
6. Check Google Ads → Goals → Conversions → status after 24–48 h.

Rollback: revert the merge commit and redeploy; republish the previous GTM version (v14).
