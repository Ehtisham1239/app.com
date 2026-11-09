import { NextResponse } from "next/server";
import { enabledHighLevelConfig, syncHighLevelAdmission } from "@/lib/server/highlevel";
import { getServiceClient } from "@/lib/supabase/admin";
import { permitsMutation } from "@/lib/request-origin";
import { readBoundedText } from "@/lib/site-health-fetch";
import { SITE_URL } from "@/lib/config";
import { buildContactEmail, buildLeadEmail, buildReviewEmail, notificationConfig, sendLeadEmail } from "@/lib/usa-lead-notification";

export const dynamic = "force-dynamic";
const MAX_BODY_BYTES = 2048;
const EMAIL = /^[^@\s<>"',;]+@[^@\s<>"',;]+\.[^@\s<>"',;]+$/;
const reply = (body, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex" } });
const log = (level, outcome, reference) => console[level](JSON.stringify({ event: "lead_notification", outcome, reference: reference || null }));

function parseRequest(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const reference = typeof body.reference === "string" ? body.reference.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!/^(?:TR|MSG|REV)-\d{4}-\d{5,7}$/.test(reference) || !email || email.length > 254 || !EMAIL.test(email)) return null;
  const token = typeof body.notification_token === "string" ? body.notification_token : "";
  if (!/^[0-9a-f]{64}$/.test(token)) return null;
  return { reference, email, token };
}

export async function POST(request) {
  if (!permitsMutation(request)) return reply({ ok: false, error: "forbidden" }, 403);
  if (!/^application\/json\b/i.test(request.headers.get("content-type") || "")) return reply({ ok: false, error: "bad_request" }, 415);
  if (Number(request.headers.get("content-length") || 0) > MAX_BODY_BYTES) return reply({ ok: false, error: "bad_request" }, 413);
  let parsed = null;
  try {
    parsed = parseRequest(JSON.parse(await readBoundedText(request, MAX_BODY_BYTES)));
  } catch (error) {
    if (error instanceof RangeError) return reply({ ok: false, error: "bad_request" }, 413);
  }
  if (!parsed) return reply({ ok: false, error: "bad_request" }, 400);

  const config = notificationConfig();
  const highLevel = enabledHighLevelConfig();
  const serviceDb = getServiceClient();
  if ((!config && !highLevel) || !serviceDb) {
    log("error", "not_configured", parsed.reference);
    return reply({ ok: false, error: "not_configured" }, 503);
  }
  let lead = null;
  try {
    const { data, error } = await serviceDb.rpc("lead_for_notification", { p_reference: parsed.reference, p_email: parsed.email, p_token: parsed.token });
    if (error) throw error;
    lead = data;
  } catch {
    log("error", "lookup_failed", parsed.reference);
    return reply({ ok: false, error: "unavailable" }, 503);
  }
  if (!lead || lead.reference !== parsed.reference || !["trial", "contact", "review"].includes(lead.lead_type)) return reply({ ok: false, error: "not_found" }, 404);

  let crm = null;
  if (highLevel && lead.lead_type !== "review") {
    crm = await syncHighLevelAdmission(lead, lead.lead_type, { config: highLevel, trialSiteUrl: SITE_URL });
    log(crm.ok ? "info" : "error", crm.ok ? "highlevel_synced" : `highlevel_${crm.reason}`, lead.reference);
  }
  if (!config) {
    if (!crm) return reply({ ok: false, error: "not_configured" }, 503);
    return crm.ok ? reply({ ok: true }) : reply({ ok: false, error: "crm_failed" }, 502);
  }

  const isContact = lead.lead_type === "contact";
  const isReview = lead.lead_type === "review";
  const message = isContact
    ? buildContactEmail(lead, { siteUrl: SITE_URL })
    : isReview
      ? buildReviewEmail(lead, { siteUrl: SITE_URL })
      : buildLeadEmail(lead, { siteUrl: SITE_URL, sourceLabel: "website form" });
  const sent = await sendLeadEmail({
    config, message, reference: lead.reference,
    source: isContact ? "website_contact" : isReview ? "website_review" : "website_trial",
  });
  if (!sent.ok) {
    log("error", sent.reason, lead.reference);
    return reply({ ok: false, error: "email_failed" }, 502);
  }
  log("info", sent.alreadySent ? "already_sent" : sent.pending ? "send_in_progress" : "sent", lead.reference);
  return reply({ ok: true });
}
