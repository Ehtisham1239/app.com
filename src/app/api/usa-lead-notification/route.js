import { NextResponse } from "next/server";
import { publicDb } from "@/lib/supabase/public";
import { permitsMutation } from "@/lib/request-origin";
import { SITE_URL } from "@/lib/config";
import { buildLeadEmail, notificationConfig, parseNotificationRequest, sendLeadEmail } from "@/lib/usa-lead-notification";

// Emails admissions once for each lead saved from the USA landing page.
// The browser saves the lead itself (public.submit_trial_application, so the
// database's per-visitor rate limit sees the parent's address) and then sends
// only { reference, email } here. The lead is confirmed in the database and the
// email is built from the database row; Resend's Idempotency-Key makes repeated
// calls for the same reference return the first result instead of sending again.
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 2048;
const reply = (body, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex" } });
// Only the outcome and the lead reference are logged: never the email address,
// phone number, request body, provider response or API key.
const log = (level, reason, reference) => console[level](JSON.stringify({ event: "usa_lead_notification", outcome: reason, reference: reference || null }));

export async function POST(request) {
  if (!permitsMutation(request)) return reply({ ok: false, error: "forbidden" }, 403);
  if (!/^application\/json\b/i.test(request.headers.get("content-type") || "")) return reply({ ok: false, error: "bad_request" }, 415);
  if (Number(request.headers.get("content-length") || 0) > MAX_BODY_BYTES) return reply({ ok: false, error: "bad_request" }, 413);

  let parsed = null;
  try {
    const raw = await request.text();
    if (raw.length <= MAX_BODY_BYTES) parsed = parseNotificationRequest(JSON.parse(raw));
  } catch { parsed = null; }
  if (!parsed) return reply({ ok: false, error: "bad_request" }, 400);

  const config = notificationConfig();
  if (!config || !publicDb) {
    log("error", "not_configured", parsed.reference);
    return reply({ ok: false, error: "not_configured" }, 503);
  }

  let lead = null;
  try {
    const { data, error } = await publicDb.rpc("usa_lead_for_notification", { p_reference: parsed.reference, p_email: parsed.email });
    if (error) throw error;
    lead = data;
  } catch {
    log("error", "lookup_failed", parsed.reference);
    return reply({ ok: false, error: "unavailable" }, 503);
  }
  // Unknown reference, different email, older than 30 minutes or not from this page.
  if (!lead || lead.reference !== parsed.reference) return reply({ ok: false, error: "not_found" }, 404);

  const sent = await sendLeadEmail({ config, message: buildLeadEmail(lead, { siteUrl: SITE_URL }), reference: lead.reference });
  if (!sent.ok) {
    log("error", sent.reason, lead.reference);
    return reply({ ok: false, error: "email_failed" }, 502);
  }
  log("info", sent.alreadySent ? "already_sent" : sent.pending ? "send_in_progress" : "sent", lead.reference);
  return reply({ ok: true });
}
