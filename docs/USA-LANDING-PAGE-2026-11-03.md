# USA Google Ads landing page — integration (3 Nov 2026)

Status: page **on production since 3 Nov 2026** (owner approval). The admissions email added on 5 Nov 2026 (section below) is on branch `claude/usa-landing-resend-email`, preview only, until the owner approves it.

## What it is

A dedicated paid-traffic page for US families, kept out of search (`noindex`), with its own thank-you page:

| URL | File |
| --- | --- |
| `/usa-quran-classes` | `public/usa-quran-classes/index.html` |
| `/usa-quran-classes/thank-you` | `public/usa-quran-classes/thank-you/index.html` |
| `/api/public-form-config` | `src/app/api/public-form-config/route.js` |
| `/api/usa-lead-notification` (POST) | `src/app/api/usa-lead-notification/route.js`, `src/lib/usa-lead-notification.js` |

Two `beforeFiles` rewrites in `next.config.mjs` serve the static files at the clean URLs. Nothing else on the site changes: no shared layout, header, CSS or existing route is touched, and the page is not in the sitemap. Its design is the CEO-reviewed v9 preview; production copies were made with design and copy unchanged.

## Lead flow

The form saves to the website CMS (**Admin → Trials**) through `public.submit_trial_application`, the same database function as the site's own free-trial form. As on the site form, the browser calls it directly with the public publishable key, so the per-visitor rate limit (6 an hour) and the honeypot keep working. A server proxy was not used because every lead would then share Vercel's IP and one rate-limit bucket.

`/api/public-form-config` returns only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (already in every page's JavaScript). It is static and built from the Vercel environment.

Field mapping (tested in `tests/usa-landing.test.mjs`):

| Landing page | CMS trial record |
| --- | --- |
| Parent's full name | `guardian_name`; `learner_name` = "Child of <name>" (adult learners: their own name). The child's name is confirmed on the call. |
| Student's age 4–5, 6–8 / 9–12 / 13–17 / 18+ | `child_4_7` / `child_8_12` / `teen_13_17` / `adult` (exact band in notes) |
| Course | published course ID (from `src/lib/seed-content.json`); "Not sure yet" leaves it empty |
| Preferred teacher | `teacher_gender_pref` female / male / any |
| Typed class time, US time zone | notes; `timezone` = IANA zone (ET → America/New_York …) |
| gclid / gbraid / wbraid / utm_* | `utm` (session only), `source` = utm_source or "google-ads" or "usa-landing-page" |
| US phone | `phone` (+1…), `phone_is_whatsapp` = false (not asked) |
| SMS reminders checkbox | notes, with the exact consent text |

Leads are not forwarded to GoHighLevel: like every other website form, they stay in the CMS.

## Admissions email (5 Nov 2026)

Each lead saved from this page sends exactly one internal email to admissions through Resend. Nothing is emailed to the parent; there are no reminders or follow-ups.

1. The browser saves the lead as above and receives its reference (`TR-YYYY-NNNNN`).
2. The browser posts only `{ reference, email }` to `/api/usa-lead-notification`. The visitor sees success only after this step finishes (two attempts at most; if the email cannot be sent the lead is still in Admin → Trials and the failure is in the Vercel logs).
3. The route accepts same-site JSON only, then calls `public.usa_lead_for_notification(reference, email)` (`supabase/migrations/20261105104232_usa_lead_notification.sql`, applied to the database on 5 Nov 2026 with owner approval) with the publishable key. The function returns the row only for the matching email, within 30 minutes of the save, and only for leads from `/usa-quran-classes`; otherwise nothing.
4. The email is built from that database row (name, email, phone, course, age group, teacher, time zone, campaign and click ID, the form details, the timestamp in Pakistan and US time, a link to the record) and sent with `Idempotency-Key: oqc-usa-lead/<reference>/<hash of sender and recipients>`. Resend keeps keys for 24 hours, so a retry, a refresh or a replayed call returns the first result instead of sending again.
5. A repeat request from the same tab with identical details (Back button, second click) reuses the saved reference: no second lead, conversion or email. A genuine repeat from the same parent later is saved by the database as a flagged duplicate and its email says "(repeat)" with the earlier reference.

Logs record only the outcome and the lead reference (`{"event":"usa_lead_notification","outcome":…}`), never the email address, phone, request body, provider response or key.

Server-only environment variables (Vercel → Settings → Environment Variables; never `NEXT_PUBLIC_`):

| Variable | Value |
| --- | --- |
| `RESEND_API_KEY` | Resend API key with sending access only |
| `LEAD_NOTIFICATION_FROM` | Sender on a domain verified in Resend, e.g. `OQC Website <leads@onlinequrancollege.com>` |
| `LEAD_NOTIFICATION_TO` | Internal recipients, comma-separated |

If any is missing the route answers 503 `not_configured` and the lead is still saved.

## Analytics

Same owner decision as the rest of the site (AGENTS.md, 26 Oct 2026): container `GTM-W7CMZS53`, analytics granted, ad signals denied, Google cookies kept in page memory, random `client_id` per page load. GTM loads only on `www.onlinequrancollege.com` / `onlinequrancollege.com`, so previews send nothing.

Events the container already handles: `oqc_page_view`, `oqc_contact_click` (phone, email, WhatsApp), and `oqc_generate_lead` with `form_type: trial`, `market: USA`, sent once at the confirmed save. The page's own `generate_lead`, `phone_click`, `trial_cta_click` and similar events stay in the dataLayer for a future Ads tag; the container does not use them today.

**Google Ads conversions are not connected.** With no ad cookies and query strings stripped from GA4 page locations, Google cannot link a lead to an ad click in the browser. The gclid is saved with each lead, so the privacy-consistent route is offline conversion import from the CMS. Adding an Ads conversion tag or cookies needs the owner's approval.

## Updating

Edit the two HTML files directly (each holds its own config block near the top). Keep the checks in `tests/usa-landing.test.mjs` passing: production mode, no inline event handlers (site CSP `script-src-attr 'none'`), noindex, cookieless GTM.

## Rollback

Revert the merge commit, or redeploy the previous production deployment in Vercel. No database, environment variable, DNS or domain setting is changed by this work.
