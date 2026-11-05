# OQC website lead notifications — 5 November 2026

## Scope implemented in source
- Main website free-trial form: after `submit_trial_application` confirms the lead is saved, the browser calls `/api/lead-notification` with only the returned reference and the visitor email.
- Main website contact form: after `submit_contact_message` confirms the enquiry is saved, the browser calls the same endpoint with only the returned reference and email.
- Public review form: after `submit_review` confirms the review is saved, the browser calls the same endpoint with only the returned reference and email. Review photos/videos remain private and are never attached to email.
- USA standalone landing pages continue to use the existing `/api/usa-lead-notification` route.
- Both routes send an internal notification to the comma-separated recipients in `LEAD_NOTIFICATION_TO`. The public form itself remains the CMS/database source of truth.
- The email body is built from the database row, not browser-supplied names, phone numbers, course, review or message content.
- A read-only, SECURITY DEFINER RPC exposes only a matching reference + email pair for 30 minutes; it does not grant direct table reads.
- Resend idempotency keys prevent repeat delivery for the same reference while the provider retains the key.
- Notifications are internal only; the parent/learner/reviewer is not emailed.

## Required provider configuration
The current Vercel project was inspected on 5 November 2026. It contains only the public Supabase URL, public publishable key and public site URL. No Resend API key, verified sender or lead-recipient variable is configured in the project at this checkpoint.

Configure these server-side variables in Vercel for Production, Preview and Development as appropriate:
- `RESEND_API_KEY`: a Resend key with Sending access only.
- `LEAD_NOTIFICATION_FROM`: a sender on a domain verified in Resend, e.g. `OQC Website <leads@onlinequrancollege.com>` only after the domain/sender is verified.
- `LEAD_NOTIFICATION_TO`: comma-separated internal recipients. Include the verified existing admissions recipient plus `marketing.iqratech@gmail.com`; the existing recipient's exact address is not present in the repository or current Vercel environment, so do not invent it.

Never expose or commit the Resend API key. Do not send test messages to real customers. Verify one clearly labelled synthetic submission in an approved test environment and confirm both internal inboxes receive exactly one message while the same lead is visible in Admin → Trials or Admin → Contacts.

## Failure behavior and known limitation
- Database persistence happens before the notification request, so a provider outage does not delete a submitted lead.
- The current browser request has a six-second timeout and logs only the reference/status, not form PII.
- The route logs provider failure outcomes without addresses, phone numbers, message bodies or secrets.
- There is no durable background retry queue in this implementation. If Resend is unavailable, the lead remains in the CMS but staff notification may be delayed until a retry/operational follow-up. Do not claim 100% delivery until a durable retry mechanism is implemented and verified.

## Release gates
1. CI, unit tests and PGlite migration tests pass.
2. Apply the SQL migration to the correct Supabase project after reviewing the migration and current schema.
3. Add the three Resend environment variables in Vercel without disclosing values.
4. Deploy the tested commit and verify the production revision.
5. Perform one synthetic contact, trial and review test in an approved environment; verify each CMS record + both recipient inboxes + no submitter email.
6. Reconcile the test records according to the approved test-data retention process.
