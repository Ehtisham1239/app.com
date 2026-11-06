import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/admin";
import { permitsMutation } from "@/lib/request-origin";
import { SITE_URL } from "@/lib/config";
import { buildLeadEmail, notificationConfig, parseNotificationRequest, sendLeadEmail } from "@/lib/usa-lead-notification";

export const dynamic = "force-dynamic";
const MAX_BODY_BYTES = 2048;
const reply = (body, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex" } });
const log = (level, outcome, reference) => console[level](JSON.stringify({ event: "usa_lead_notification", outcome, reference: reference || null }));

export async function POST(request) {
  if (!permitsMutation(request)) return reply({ ok: false, error: "forbidden" }, 403);
  if (!/^application\\/json\\b/i.test(request.headers.get("content-type") || "")) return reply({ ok: false, error: "bad_request" }, 415);
  if (Number(request.headers.get("content-length") || 0) > MAX_BODY_BYTES) return reply({ ok: false, error: "bad_request" }, 413);

  let parsed = null;
  try {
    const raw = await request.text();
    if (raw.length <= MAX_BODY_BYTES) parsed = parseNotificationRequest(JSON.parse(raw));
  } catch { parsed = null; }
  if (!parsed) return reply({ ok: false, error: "bad_request" }, 400);

  const config = notificationConfig();
  const serviceDb = getServiceClient();
  if (!config || !serviceDb) {
    log("error", "not_configured", parsed.reference);
    return reply({ ok: false, error: "not_configured" }, 503);
  }

  let lead = null;
  try {
    const { data, error } = await serviceDb.rpc("lead_for_notification", { p_reference: parsed.reference, p_email: parsed.email });
    if (error) throw error;
    lead = data;
  } catch {
    log("error", "lookup_failed", parsed.reference);
    return reply({ ok: false, error: "unavailable" }, 503);
  }

  // This legacy endpoint remains restricted to the USA landing-page trial flow.
  if (!lead || lead.lead_type !== "trial" || lead.reference !== parsed.reference || lead.utm?.landing_page !== "/usa-quran-classes") {
    return reply({ ok: false, error: "not_found" }, 404);
  }

  const sent = await sendLeadEmail({
    config,
    message: buildLeadEmail(lead, { siteUrl: SITE_URL, sourceLabel: "USA landing page" }),
    reference: lead.reference,
    source: "usa_landing_page",
  });
  if (!sent.ok) {
    log("error", sent.reason, lead.reference);
    return reply({ ok: false, error: "email_failed" }, 502);
  }
  log("info", sent.alreadySent ? "already_sent" : sent.pending ? "send_in_progress" : "sent", lead.reference);
  return reply({ ok: true });
}
