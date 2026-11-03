# USA Google Ads landing page — integration (3 Nov 2026)

Status: **implemented on branch `claude/usa-landing-page-integration`, preview only.** Not on production until the owner approves.

## What it is

A dedicated paid-traffic page for US families, kept out of search (`noindex`), with its own thank-you page:

| URL | File |
| --- | --- |
| `/usa-quran-classes` | `public/usa-quran-classes/index.html` |
| `/usa-quran-classes/thank-you` | `public/usa-quran-classes/thank-you/index.html` |
| `/api/public-form-config` | `src/app/api/public-form-config/route.js` |

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

## Analytics

Same owner decision as the rest of the site (AGENTS.md, 26 Oct 2026): container `GTM-W7CMZS53`, analytics granted, ad signals denied, Google cookies kept in page memory, random `client_id` per page load. GTM loads only on `www.onlinequrancollege.com` / `onlinequrancollege.com`, so previews send nothing.

Events the container already handles: `oqc_page_view`, `oqc_contact_click` (phone, email, WhatsApp), and `oqc_generate_lead` with `form_type: trial`, `market: USA`, sent once at the confirmed save. The page's own `generate_lead`, `phone_click`, `trial_cta_click` and similar events stay in the dataLayer for a future Ads tag; the container does not use them today.

**Google Ads conversions are not connected.** With no ad cookies and query strings stripped from GA4 page locations, Google cannot link a lead to an ad click in the browser. The gclid is saved with each lead, so the privacy-consistent route is offline conversion import from the CMS. Adding an Ads conversion tag or cookies needs the owner's approval.

## Updating

Edit the two HTML files directly (each holds its own config block near the top). Keep the checks in `tests/usa-landing.test.mjs` passing: production mode, no inline event handlers (site CSP `script-src-attr 'none'`), noindex, cookieless GTM.

## Rollback

Revert the merge commit, or redeploy the previous production deployment in Vercel. No database, environment variable, DNS or domain setting is changed by this work.
