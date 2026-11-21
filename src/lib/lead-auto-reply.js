// Automatic acknowledgement email to the person who just submitted a free-trial
// request or a contact message (owner request in chat, 21 Nov 2026; amends the
// 5 Nov "nothing is emailed to parents" rule).
//
// Server-only (it sends through Resend with the same key as the admissions email).
// Rules:
//  - one fixed message per lead: only the greeting name and the time-zone city come
//    from the form, and both are filtered; no reference/TR number is ever included;
//  - sent only to the address stored on the lead row, never one supplied by the browser;
//  - a separate Idempotency-Key per lead, so retries and repeated calls cannot send it twice;
//  - best effort: a failure here never changes the visitor's response or the staff email;
//  - LEAD_AUTO_REPLY=off (or false/0/no) turns it off without a code change.
import { createHash } from "node:crypto";
import { escapeHtml, oneLine, sendLeadEmail } from "./usa-lead-notification.js";

export const AUTO_REPLY_REPLY_TO = "info@onlinequrancollege.com";
const EMAIL = /^[^@\s<>"',;]+@[^@\s<>"',;]+\.[^@\s<>"',;]+$/;
const WHATSAPP = [
  { label: "UK", display: "+44 7864 710821", digits: "447864710821" },
  { label: "USA", display: "+1 786 964 5678", digits: "17869645678" },
];

export function autoReplyEnabled(env = process.env) {
  return !/^(off|false|0|no)$/i.test(String(env.LEAD_AUTO_REPLY ?? "").trim());
}

// A name is greeted only when it looks like a name (letters, marks, spaces, . ' -).
// Anything else (links, @, digits, markup) gets the plain greeting instead.
export function greetingName(value) {
  const name = oneLine(value, 60);
  return name && /^[\p{L}\p{M}][\p{L}\p{M} .'’-]*$/u.test(name) ? name : "";
}

// "America/Chicago" -> "Chicago time". Unknown or invalid zones return "".
export function timeZoneCity(zone) {
  const text = String(zone ?? "").trim();
  if (!text.includes("/")) return "";
  try { new Intl.DateTimeFormat("en", { timeZone: text }); } catch { return ""; }
  const city = text.split("/").pop().replace(/_/g, " ");
  return /^[A-Za-z][A-Za-z .'-]{1,40}$/.test(city) ? `${city} time` : "";
}

function recipientName(lead) {
  if (lead.lead_type === "contact") return greetingName(lead.name);
  return greetingName(lead.age_band === "adult" ? lead.learner_name : lead.guardian_name || lead.learner_name);
}

// Subject, HTML and plain text. Pure and deterministic (Resend idempotency needs identical retries).
export function buildAutoReplyEmail(lead, { siteUrl = "https://www.onlinequrancollege.com" } = {}) {
  const contact = lead.lead_type === "contact";
  const name = recipientName(lead);
  const greeting = name ? `Assalamu alaikum ${name},` : "Assalamu alaikum,";
  const zone = contact ? "" : timeZoneCity(lead.timezone);
  const when = zone ? `in ${zone}` : "in your local time, together with your country or time zone";
  const paragraphs = contact
    ? [
      "Thank you for contacting Online Quran College. We have received your message, and a member of our admissions team will reply within one working day.",
      `If you would like to arrange a 3-day free trial in the meantime, just reply to this email with the days and times that suit you ${when}.`,
    ]
    : [
      "Thank you for contacting Online Quran College about your 3-day free trial request.",
      `Which days and times suit you ${when}? Please reply to this email or message us on WhatsApp. We will confirm a teacher and send the class link.`,
    ];
  const subject = contact ? "Thank you for contacting Online Quran College" : "Your 3-day free trial request – Online Quran College";
  const site = String(siteUrl).replace(/\/$/, "");
  const closing = "JazakAllah khair,";
  const signoff = "Admissions Team, Online Quran College";
  const reason = "You are receiving this one-time message because a request was submitted with this email address on onlinequrancollege.com.";
  const text = [
    greeting, "", ...paragraphs.flatMap((p) => [p, ""]),
    "WhatsApp: " + WHATSAPP.map((n) => `${n.label} ${n.display}`).join(" · "),
    `Email: ${AUTO_REPLY_REPLY_TO}`, "",
    closing, signoff, site, "", reason,
  ].join("\n");
  const html = `<!doctype html><html lang="en"><body style="margin:0;padding:16px;background:#f6f8f3;font-family:Arial,Helvetica,sans-serif;color:#1d2a1f;">
<div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #dfe7d6;border-radius:12px;overflow:hidden;">
<div style="background:#0D4A1C;color:#ffffff;padding:14px 18px;font-size:17px;font-weight:bold;">Online Quran College</div>
<div style="padding:18px;font-size:15px;line-height:1.55;">
<p style="margin:0 0 12px;">${escapeHtml(greeting)}</p>
${paragraphs.map((p) => `<p style="margin:0 0 12px;">${escapeHtml(p)}</p>`).join("\n")}
<p style="margin:0 0 12px;">WhatsApp: ${WHATSAPP.map((n) => `<a href="https://wa.me/${n.digits}" style="color:#0C6C0C;font-weight:bold;">${escapeHtml(n.label)} ${escapeHtml(n.display)}</a>`).join(" &middot; ")}<br>Email: <a href="mailto:${AUTO_REPLY_REPLY_TO}" style="color:#0C6C0C;">${AUTO_REPLY_REPLY_TO}</a></p>
<p style="margin:0;">${escapeHtml(closing)}<br>${escapeHtml(signoff)}<br><a href="${escapeHtml(site)}" style="color:#0C6C0C;">${escapeHtml(site.replace(/^https?:\/\//, ""))}</a></p>
</div>
<div style="padding:10px 18px;background:#fbf6e8;color:#6b5a2a;font-size:12px;">${escapeHtml(reason)}</div>
</div></body></html>`;
  return { subject, html, text };
}

export function autoReplyIdempotencyKey(reference, config) {
  const route = createHash("sha256").update(`${config.from}|auto-reply`).digest("hex").slice(0, 12);
  return `oqc-auto-reply/${reference}/${route}`;
}

// Never throws and never reports failure to the caller's visitor. Returns { ok, skipped?, reason? }.
export async function sendAutoReply({ config, lead, siteUrl, fetchImpl = fetch, env = process.env }) {
  if (!config || !lead || !autoReplyEnabled(env)) return { ok: true, skipped: true };
  if (!["trial", "contact"].includes(lead.lead_type || "trial")) return { ok: true, skipped: true };
  const email = typeof lead.email === "string" ? lead.email.trim() : "";
  if (!email || email.length > 254 || !EMAIL.test(email)) return { ok: false, reason: "invalid_recipient" };
  try {
    return await sendLeadEmail({
      config, message: buildAutoReplyEmail(lead, { siteUrl }), reference: lead.reference, fetchImpl, source: "auto_reply",
      to: [email], key: autoReplyIdempotencyKey(lead.reference, config),
      extra: { reply_to: AUTO_REPLY_REPLY_TO, headers: { "Auto-Submitted": "auto-replied" } },
    });
  } catch {
    return { ok: false, reason: "auto_reply_error" };
  }
}
