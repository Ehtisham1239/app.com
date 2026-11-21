---
title: Lead sync (HighLevel + admissions email outbox)
type: subsystem
created: 2026-11-20
updated: 2026-11-20
sources:
  - code: src/lib/server/lead-outbox.js
  - code: src/app/api/cron/lead-sync/route.js
  - code: supabase/migrations/20261112140000_lead_sync_outbox.sql
  - code: .env.example
verified_at: 791a638
---

# Lead sync

Every saved free-trial request and contact message gets a row in `lead_sync_jobs`. A worker
(`processLeadSyncBatch`, `src/lib/server/lead-outbox.js`) delivers each lead to HighLevel (upsert by
email) and sends one internal email to admissions through Resend. Retries are safe: HighLevel upserts
by email and the email carries an idempotency key tied to the lead reference.

The worker runs only when something calls `POST /api/cron/lead-sync` with
`Authorization: Bearer <CRON_SECRET>` (`src/app/api/cron/lead-sync/route.js`). Nothing schedules that
call by itself; a Hostinger account cron has to.

## Switching it on

Env vars (Hostinger Node.js environment, then rebuild): `GHL_LOCATION_ID`, `GHL_PRIVATE_INTEGRATION_TOKEN`,
`GHL_ADMISSIONS_SYNC=true`, `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`, optional `LEAD_SYNC_SINCE`.
The route answers 503 `not_configured` until they exist.

> ⚠️ Leads queued while the connector was off stay pending. Turning it on sends all of them to HighLevel
> and admissions, and a HighLevel workflow may message those contacts. Set `LEAD_SYNC_SINCE` (ISO date)
> first to close older leads without delivery; an unreadable value makes the route return 503
> `bad_lead_sync_since` instead of delivering.

> ⚠️ A lead closed by `LEAD_SYNC_SINCE` writes no CRM status row, so it can never show up in HighLevel
> later without resetting its job row.

> ⚠️ Never paste the HighLevel token into chat or commit it; the Hostinger env-replace API overwrites all
> variables and masks values on read, so set variables in hPanel, not through the API.

Related: owner decision "USA landing page" in `AGENTS.md` (one admissions email per saved lead).
