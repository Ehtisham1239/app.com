# OQC website lead notifications — 5 November 2026

## Scope implemented in source
- Main website free-trial, contact and review forms save first, then call the internal-only notification route with only the saved reference and submitter email.
- The route reads the matching record from Supabase and builds the email from database fields, never browser-supplied PII.
- The USA standalone landing page retains its existing dedicated notification route.
- Notifications go only to internal recipients in `LEAD_NOTIFICATION_TO`; no email is sent to parents, learners or reviewers.
- Resend idempotency keys prevent duplicate provider sends for the same reference while the provider retains the key.

## Security model
- `lead_for_notification(text,text)` is a SECURITY DEFINER function because it must read the just-submitted record without granting table access.
- EXECUTE is revoked from PUBLIC, anon and authenticated and granted only to `service_role`.
- The main-site API route calls it through a server-only Supabase client using `SUPABASE_SERVICE_ROLE_KEY`. This key must never be exposed to the browser or stored under a `NEXT_PUBLIC_` name.
- The function matches both reference and normalized email, restricts records to 30 minutes, excludes deleted/spam records, and returns only the fields needed for the internal notification.
- Do not apply the migration to production until the target project and resulting function privileges have been verified.

## Required server-side configuration
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase project service-role secret, Production/Preview/Development as required. Add directly in Vercel's encrypted environment-variable UI; never paste it into chat or commit it.
- `RESEND_API_KEY`: Resend key with Sending access only. Leave unset until the owner supplies it securely.
- `LEAD_NOTIFICATION_FROM`: sender on a domain verified in Resend.
- `LEAD_NOTIFICATION_TO`: comma-separated internal recipients. The existing production recipient list is managed separately in Vercel.

## Failure behavior and verification
- Database persistence occurs before notification. Missing service-role or Resend configuration returns a safe not-configured response; the saved lead remains in the CMS.
- Logs contain only the event outcome and reference, never names, email addresses, phone numbers, message bodies or secrets.
- There is no durable background retry queue in this implementation; do not promise 100% delivery until retry handling is designed and tested.
- Use synthetic test records only. Verify the database row, one internal notification per reference, no submitter email, and no exposure of the privileged RPC to anon/authenticated.

## Release gates
1. CI, unit tests and PGlite migration tests pass.
2. Review and apply the migration to the correct Supabase project only after explicit release approval.
3. Add server-side secrets directly in Vercel; never disclose them in chat.
4. Deploy only the reviewed, tested commit after explicit approval.
5. Run synthetic end-to-end form tests and reconcile test records under the approved retention process.
