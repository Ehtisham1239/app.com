// Internal email to admissions for each lead saved from the USA landing page
// (/usa-quran-classes). Owner request, 5 Nov 2026.
//
// Server-only: this module reads the Resend API key from the environment. Do not
// import it from client components or static pages.
//
// The email is built from the database row returned by
// public.usa_lead_for_notification, never from what the browser sent, and every
// send carries an Idempotency-Key tied to the lead reference, so retries and
// repeated calls cannot produce a second email for the same lead.
import { createHash } from "node:crypto";

export const RESEND_ENDPOINT = "https://api.resend.com/emails";
export const STAFF_TIME_ZONE = "Asia/Karachi";

const REFERENCE = /^TR-\d{4}-\d{5,7}$/;
const EMAIL = /^[^@\s<>"',;]+@[^@\s<>"',;]+\.[^@\s<>"',;]+$/;

// Browser request: only the reference the database returned and the email the
// visitor typed. Anything else is ignored.
export function parseNotificationRequest(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const reference = typeof body.reference === "string" ? body.reference.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const notificationToken = typeof body.notification_token === "string" ? body.notification_token.trim().toLowerCase() : "";
  if (!REFERENCE.test(reference) || !email || email.length > 254 || !EMAIL.test(email) || !/^[0-9a-f]{64}$/.test(notificationToken)) return null;
  return { reference, email, notificationToken };
}

// RESEND_API_KEY, LEAD_NOTIFICATION_FROM and LEAD_NOTIFICATION_TO (comma-separated)
// come from the Vercel environment. Returns null when any of them is missing or invalid.
export function notificationConfig(env = process.env) {
  const apiKey = String(env.RESEND_API_KEY || "").trim();
  const from = String(env.LEAD_NOTIFICATION_FROM || "").trim();
  const to = String(env.LEAD_NOTIFICATION_TO || "").split(",").map((item) => item.trim()).filter(Boolean);
  const fromAddress = (from.match(/<([^<>]+)>\s*$/) || [null, from])[1].trim();
  const valid = /^re_\S{8,}$/.test(apiKey)
    && from.length <= 200 && !/[\r\n]/.test(from) && EMAIL.test(fromAddress)
    && to.length > 0 && to.length <= 50 && to.every((address) => address.length <= 254 && EMAIL.test(address));
  return valid ? { apiKey, from, to } : null;
}

const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const oneLine = (value, max = 200) => String(value ?? "").replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s{2,}/g, " ").trim().slice(0, max);

const AGE_BAND = { child_4_7: "Child (4–7)", child_8_12: "Child (8–12)", teen_13_17: "Teen (13–17)", adult: "Adult (18+)" };
const TEACHER = { female: "Female teacher", male: "Male teacher", any: "No preference" };
const US_ZONES = {
  "America/New_York": "Eastern (ET)", "America/Chicago": "Central (CT)", "America/Denver": "Mountain (MT)",
  "America/Phoenix": "Arizona (MST)", "America/Los_Angeles": "Pacific (PT)", "America/Anchorage": "Alaska (AKT)", "Pacific/Honolulu": "Hawaii (HT)",
};

export function formatLeadTime(iso, timeZone) {
  try {
    return new Intl.DateTimeFormat("en-GB", { timeZone, day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true })
      .format(new Date(iso)).replace(/[  ]/g, " ");
  } catch { return ""; }
}

// Subject, HTML and plain-text bodies for one lead. Pure and deterministic, so a
// retry produces exactly the same request (required by Resend idempotency).
export function buildLeadEmail(lead, { siteUrl = "https://www.onlinequrancollege.com" } = {}) {
  const reference = oneLine(lead.reference, 20);
  const utm = lead.utm && typeof lead.utm === "object" ? lead.utm : {};
  const adult = lead.age_band === "adult";
  const course = oneLine(lead.course, 120) || "Not sure yet";
  const zone = oneLine(lead.timezone, 60);
  const usTime = formatLeadTime(lead.created_at, zone || "America/New_York");
  const clickId = ["gclid", "gbraid", "wbraid"].filter((key) => utm[key]).map((key) => `${key}: ${oneLine(utm[key], 120)}`).join(", ");
  const campaign = [utm.utm_campaign && `campaign ${oneLine(utm.utm_campaign, 120)}`, utm.utm_term && `keyword ${oneLine(utm.utm_term, 120)}`].filter(Boolean).join(", ");
  const repeat = lead.repeat_of
    ? `Yes — same email or phone and course as ${oneLine(lead.repeat_of, 20)} (${formatLeadTime(lead.repeat_of_created_at, STAFF_TIME_ZONE)} Pakistan time)`
    : "No";
  const adminUrl = `${String(siteUrl).replace(/\/$/, "")}/admin/trials/${encodeURIComponent(oneLine(lead.id, 64))}`;

  const rows = [
    ["Reference", reference],
    ["Received", `${formatLeadTime(lead.created_at, STAFF_TIME_ZONE)} Pakistan time${usTime ? ` · ${usTime} parent's time` : ""}`],
    [adult ? "Adult learner" : "Parent or guardian", oneLine(adult ? lead.learner_name : lead.guardian_name || lead.learner_name, 120)],
    ["Learner", oneLine(lead.learner_name, 120)],
    ["Email", oneLine(lead.email, 254)],
    ["Phone", oneLine(lead.phone, 30)],
    ["Course", course],
    ["Age group", AGE_BAND[lead.age_band] || oneLine(lead.age_band, 40)],
    ["Teacher", TEACHER[lead.teacher_gender_pref] || "No preference"],
    ["Time zone", US_ZONES[zone] || zone],
    ["Country", oneLine(lead.country, 80)],
    ["Source", oneLine(lead.source, 60) + (campaign ? ` (${campaign})` : "")],
    ["Google Ads click", clickId || "None"],
    ["Repeat request", repeat],
  ];
  const details = String(lead.notes ?? "").split(/\r?\n/).map((line) => oneLine(line, 400)).filter(Boolean).slice(0, 30);

  const subject = oneLine(`New USA trial request ${reference}${lead.repeat_of ? " (repeat)" : ""} – ${course}`, 180);
  const text = [
    "New trial request from the USA landing page (/usa-quran-classes).",
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    "Details from the form:",
    ...details.map((line) => `- ${line}`),
    "",
    `Open in Admin → Trials: ${adminUrl}`,
    "",
    "Internal notification. Nothing was sent to the parent.",
  ].join("\n");
  const cell = "padding:6px 10px;border-bottom:1px solid #e3ead8;vertical-align:top;text-align:left;";
  const html = `<!doctype html><html lang="en"><body style="margin:0;padding:16px;background:#f6f8f3;font-family:Arial,Helvetica,sans-serif;color:#1d2a1f;">
<div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #dfe7d6;border-radius:12px;overflow:hidden;">
<div style="background:#0D4A1C;color:#ffffff;padding:14px 18px;font-size:17px;font-weight:bold;">New USA trial request · ${escapeHtml(reference)}</div>
<table role="presentation" style="width:100%;border-collapse:collapse;font-size:14px;">
${rows.map(([label, value]) => `<tr><th scope="row" style="${cell}width:34%;color:#4a5a4c;font-weight:normal;">${escapeHtml(label)}</th><td style="${cell}font-weight:bold;">${escapeHtml(value)}</td></tr>`).join("\n")}
</table>
<div style="padding:12px 18px;font-size:14px;"><p style="margin:0 0 6px;color:#4a5a4c;">Details from the form</p><ul style="margin:0;padding-left:18px;">${details.map((line) => `<li style="margin:3px 0;">${escapeHtml(line)}</li>`).join("")}</ul></div>
<div style="padding:4px 18px 18px;"><a href="${escapeHtml(adminUrl)}" style="display:inline-block;background:#0C6C0C;color:#ffffff;text-decoration:none;padding:10px 16px;border-radius:999px;font-weight:bold;">Open in Admin → Trials</a></div>
<div style="padding:10px 18px;background:#fbf6e8;color:#6b5a2a;font-size:12px;">Internal notification from onlinequrancollege.com. Nothing was sent to the parent.</div>
</div></body></html>`;
  return { subject, html, text };
}

// Same lead reference and same sender/recipients → same key, so Resend returns the
// first result instead of sending again (keys are kept for 24 hours; the database
// only matches a lead for 30 minutes after it was saved).
export function idempotencyKey(reference, config) {
  const route = createHash("sha256").update(`${config.from}|${config.to.join(",")}`).digest("hex").slice(0, 12);
  return `oqc-usa-lead/${reference}/${route}`;
}

export async function sendLeadEmail({ config, message, reference, fetchImpl = fetch, timeoutMs = 10000 }) {
  let response;
  try {
    response = await fetchImpl(RESEND_ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${config.apiKey}`, "Content-Type": "application/json", "Idempotency-Key": idempotencyKey(reference, config) },
      body: JSON.stringify({ from: config.from, to: config.to, subject: message.subject, html: message.html, text: message.text, tags: [{ name: "source", value: "usa_landing_page" }] }),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    return { ok: false, reason: error?.name === "TimeoutError" ? "resend_timeout" : "resend_network" };
  }
  let body = {};
  try { body = await response.json(); } catch { body = {}; }
  const name = String(body?.name || "").replace(/[^a-z_]/gi, "").slice(0, 40);
  if (response.ok && typeof body?.id === "string") return { ok: true, id: body.id };
  // Another request with this key is still sending: that one delivers the email.
  if (response.status === 409 && name === "concurrent_idempotent_requests") return { ok: true, pending: true };
  // The key was already used for this lead: the email has been sent before.
  if (response.status === 409 && name === "invalid_idempotent_request") return { ok: true, alreadySent: true };
  return { ok: false, reason: `resend_${response.status}${name ? `_${name}` : ""}` };
}
