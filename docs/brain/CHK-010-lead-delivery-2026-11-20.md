---
id: CHK-010
type: checkpoint
date: 2026-11-20
---
# CHK-010 Lead replies and form email delivery

Hub: [[000-OQC-SEO-Hub]] · previous: [[CHK-009-indexing-2026-11-20]]

**Observed:**
- Website form emails never reached anyone. A live test lead sent to `/api/lead-notification` got HTTP 503 `not_configured`, and the runtime log named `RESEND_API_KEY invalid (must start with re_)` (FROM and TO valid). Hostinger inbound mail logs show no lead email in any `@onlinequrancollege.com` mailbox for 7 days.
- `public.lead_sync_jobs`: 35 pending, 0 attempts. The worker's only scheduler was the Vercel cron, which stopped with the Hostinger move.
- GHL: `GHL_ADMISSIONS_SYNC`, `GHL_PRIVATE_INTEGRATION_TOKEN` and `GHL_LOCATION_ID` are not set on Hostinger, so the admin shows "GHL delivery unverified". No sync has ever run.

**Done (deployed, production verified where stated):**
- #370: admin WhatsApp/Call use the lead country's calling code (live data check: Kenya `0757…` → the same `+254…` the person gave elsewhere). Responsive-audit expectation for `/locations/monaco/monaco` fixed.
- #373: quotes/`;` tolerated in email settings; `not_configured` logs the broken setting name. PASS (log named the key).
- #375: GitHub schedule calls `/api/cron/lead-sync` every 10 min. No-op without `CRON_SECRET` (dispatched run: success + notice). PASS.
- #376: Admin → Technical health shows a "Lead delivery" card (email / GHL / worker, names only). The API answers 401 without login. PASS.
- Test leads MSG-2026-00020/21/22 archived; their outbox jobs set to `dead` (`internal_test`).

**BLOCKED (owner, hPanel → Node.js → Environment variables):** a real `RESEND_API_KEY` (`re_…`), `LEAD_NOTIFICATION_TO=info@onlinequrancollege.com`, GHL token + location + `GHL_ADMISSIONS_SYNC=true`, `LEAD_SYNC_SINCE`, and the same `CRON_SECRET` in GitHub secrets. Then redeploy.
**Next action:** after the owner saves the settings, send one test lead, confirm delivery in Hostinger inbound logs for `info@`, confirm "In GHL" in admin, and archive the test lead.
