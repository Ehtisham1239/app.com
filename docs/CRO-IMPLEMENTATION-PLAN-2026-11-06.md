# OQC conversion journey optimisation — 6 November 2026

## Scope and safety

This change is a first implementation slice for measuring the visitor-to-enquiry journey. It does not change advertising spend, ad account settings, analytics consent behaviour, payments, DNS, production data, or live deployment. All events are privacy-minimised and exclude form values, names, email addresses, phone numbers, and learner details.

## Existing implementation inspected

- The homepage already has a branded hero, course cards, course pathway, pricing, testimonials, FAQs and trial CTAs.
- The main trial form is a single-step form and stores leads in the existing CMS trial flow.
- First-party attribution already captures allowlisted UTM and click identifiers in session scope and stores them with the lead.
- Confirmed lead-save events already emit a minimal `generate_lead` event.
- The USA landing page documentation says its click ID is stored with the lead, but Google Ads conversions are not currently connected; offline conversion import is the planned route.
- Existing GA4/GTM implementation is cookieless by owner decision. This change preserves that behaviour and keeps ad storage, ad user data and ad personalisation denied.

## Added measurement events

| Event | Trigger | Safe parameters | Meaning |
|---|---|---|---|
| `oqc_trial_cta_click` | Click a link to `/free-trial` or `/usa-quran-classes` | CTA placement, destination, public page path | Visitor intent; not a lead |
| `oqc_trial_form_start` | First focus in the free-trial form | Public page path | Form engagement |
| `oqc_trial_form_submit_attempt` | First form submit attempt | Public page path | Attempt only; not a saved lead |
| `oqc_generate_lead` | Existing confirmed first-party CMS save signal | Form type and market | Lead saved; not a paid conversion |

The click and form events are sent through the existing GTM dataLayer adapter and are emitted only when the existing analytics controller is active on its allowed production host. They intentionally do not include visitor-provided text or query-string values.

## Important conversion distinction

A click is not a lead. A form attempt is not a saved lead. A saved lead is not a qualified lead. A trial booking or trial attendance is not a paid enrolment. Paid conversion must be emitted only after the actual payment provider/CMS records a verified successful payment and associates it with the original lead/campaign identifiers.

Before enabling Google Ads offline conversion import, verify:
1. Which payment provider and webhook are authoritative.
2. The exact CMS state/event that means payment is settled (not merely invoice created or payment initiated).
3. The attribution retention and click-ID fields, including consent and applicable privacy requirements.
4. Deduplication key, transaction ID, currency, value, event timestamp and refund/chargeback handling.
5. Google Ads conversion action configuration and a test import path that does not spend or change campaigns.

No synthetic paid-conversion event should be generated from a click or form submission.

## Connected CMS database check (read-only, 6 November 2026)

The connected Supabase project contains the required base tables for a manually recorded payment trail: trial applications, students, enrollments, invoices and payments. The current read-only aggregate check returned 8 non-deleted trial applications (6 new, 1 reviewed, 1 cancelled), 0 invoice rows, 0 enrollment rows and 0 payment rows. The payments table has no payment-provider webhook/event identifier or provider transaction status field; its current fields record amount, currency, method, reference, received timestamp and staff recorder. Therefore there is no verified historical paid-conversion baseline in this database yet. A payment row can be treated as a staff-recorded receipt only after the college confirms that staff enter it only after funds are actually received and reconciled. The current schema does not prove an online payment gateway is connected.

## Landing-page/CRO redesign direction

The redesign should preserve the OQC identity (emerald/forest, ivory, restrained gold) and current CMS content model while improving clarity, speed, trust and form completion.

1. **Market-intent match:** UK, USA, Canada and Australia campaigns should land on market-specific pages with the correct currency, local time-zone examples, course relevance and clear online-only delivery. Never imply a local walk-in branch.
2. **Hero hierarchy:** one outcome-led headline, one concise supporting sentence, one primary free-trial CTA, one secondary course/fees link, and verified proof directly below.
3. **Trust before persuasion:** publish only verified teacher qualifications, actual class process, accurate pricing, genuine testimonials with permission and valid external review evidence. Remove or substantiate every numerical, accreditation, availability and rating claim before using it as conversion proof.
4. **Form friction:** test a progressive two-step form against the existing form; collect only essential first-step details, explain why contact details are needed, retain accessible validation, and preserve existing spam protection and server-side validation.
5. **Mobile-first:** thumb-reachable CTA, readable type, short sections, no obstructive overlays, stable image dimensions, and visible privacy/consent wording.
6. **Decision support:** explain lesson length/frequency, trial eligibility, what happens after the form, response expectations, teacher preference availability and how payment/enrolment works. Do not promise a response time unless Admissions can meet it.
7. **Performance and accessibility:** keep responsive AVIF/WebP images, reduce layout shift, lazy-load below-the-fold media, preserve keyboard focus, labels, error announcements and reduced-motion support.

## Next validation gates

- Run the existing analytics and conversion-event test suites, then add event tests for CTA, form-start and submit-attempt deduplication.
- Confirm the GTM container has explicit triggers/tags for the three new dataLayer event names before expecting them in GA4 reports.
- Verify event receipt in GA4 DebugView/Realtime on a non-production test route or controlled test window; exclude test traffic from business reporting.
- Record baseline by landing page and market: sessions, CTA clicks, form starts, submit attempts, confirmed leads, qualified leads, trial attendance, paid students, revenue and refund rate.
- Only then run controlled page/form experiments. Do not declare a conversion uplift without a statistically and operationally credible comparison.

## Rollout

This branch is a review candidate only. No production deployment or merge is performed by this change. Review, run CI, inspect preview on desktop and mobile, verify events, then obtain explicit approval before production rollout.
