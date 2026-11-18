// Lead conversion events (owner decision, 18 Nov 2026).
//
// A conversion is counted only on the thank-you page that follows a submission the
// database confirmed, and only once per lead reference:
//   1. The form saves the lead. On a confirmed save it calls rememberConfirmedLead(),
//      which keeps a short-lived "pending" record in sessionStorage (this tab only).
//   2. The form moves to its thank-you page with ?ref=<reference>.
//   3. The analytics controller calls consumeConfirmedLead() on that thank-you page. It
//      returns the event once when the pending record matches the page and the
//      reference, then removes it and remembers the reference as counted.
// A refresh, a later revisit, a direct visit, a failed or spam submission, or a
// careers/support message therefore never produces a conversion.
//
// Events carry no personal data: never names, emails, phone numbers or form text.
// The lead reference (TR-… / MSG-…) is an opaque database ID and is used as the
// transaction ID so Google Ads can de-duplicate.

export const PENDING_LEAD_KEY = "oqc-pending-lead";
export const COUNTED_LEADS_KEY = "oqc-counted-leads";
export const PENDING_LEAD_MAX_AGE = 30 * 60 * 1000;
const COUNTED_LIMIT = 50;

// Contact-form subjects from prospective families. "Existing student support",
// "Partnership", "Other" and careers enquiries are not leads.
export const PROSPECT_CONTACT_SUBJECTS = ["Course enquiry", "Fees and payment", "Class timings", "Teacher request"];

const MARKET_BY_COUNTRY = {
  "United Kingdom": "UK",
  "United States": "USA",
  Canada: "Canada",
  Australia: "Australia",
  "United Arab Emirates": "UAE",
};

export const LEAD_FORMS = {
  trial: { prefix: "TR-", event: "free_trial_submission", formId: "free_trial", thankYouPath: "/free-trial/thank-you" },
  contact: { prefix: "MSG-", event: "contact_form_submission", formId: "contact", thankYouPath: "/contact/thank-you" },
};

export function isLeadReference(formType, reference) {
  const form = LEAD_FORMS[formType];
  if (!form || typeof reference !== "string") return false;
  return new RegExp(`^${form.prefix}[A-Z0-9-]{4,32}$`).test(reference) && reference !== `${form.prefix}RECEIVED`;
}

/** Which lead type a confirmed submission is, or null when it must not count as a lead. */
export function leadTypeFor({ formType, packageEnquiry = false, subject = "", careers = false } = {}) {
  if (formType === "trial") return packageEnquiry ? "package_enquiry" : "free_trial";
  if (formType === "contact") return !careers && PROSPECT_CONTACT_SUBJECTS.includes(subject) ? "course_enquiry" : null;
  return null;
}

function storage(win, name) {
  try { return win?.[name] || null; } catch { return null; } // Access itself can throw when storage is blocked.
}
function readJson(store, key) {
  try { return JSON.parse(store?.getItem(key) || "null"); } catch { return null; }
}
function writeJson(store, key, value) {
  if (!store) return false;
  try { store.setItem(key, JSON.stringify(value)); return true; } catch { return false; }
}
function remove(store, key) {
  try { store?.removeItem(key); } catch { /* Optional storage. */ }
}

/**
 * Call after the database confirmed the save, before moving to the thank-you page.
 * Returns true when a conversion is pending for the thank-you page.
 * Instrumentation must never interrupt a saved enquiry, so this never throws.
 */
export function rememberConfirmedLead({ formType, country, reference, honeypot = "", packageEnquiry = false, subject = "", careers = false } = {}, win = typeof window === "undefined" ? undefined : window) {
  try {
    if (!win || honeypot || !isLeadReference(formType, reference)) return false;
    const leadType = leadTypeFor({ formType, packageEnquiry, subject, careers });
    if (!leadType) return false;
    return writeJson(storage(win, "sessionStorage"), PENDING_LEAD_KEY, {
      form_type: formType,
      lead_type: leadType,
      market: MARKET_BY_COUNTRY[country] || "Other",
      reference,
      at: Date.now(),
    });
  } catch { return false; }
}

/**
 * Called on page views. Returns the dataLayer event for a confirmed lead exactly once,
 * on the matching thank-you page; otherwise null. `markCounted` lets the caller record the
 * reference only after the event was actually sent.
 */
export function consumeConfirmedLead(win, now = Date.now()) {
  try {
    const session = storage(win, "sessionStorage");
    const pending = readJson(session, PENDING_LEAD_KEY);
    if (!pending) return null;
    const form = LEAD_FORMS[pending.form_type];
    const path = String(win.location?.pathname || "").replace(/\/+$/, "");
    if (!form || path !== form.thankYouPath) return null; // Not on its thank-you page (yet).
    const urlRef = new URLSearchParams(win.location?.search || "").get("ref") || "";
    const fresh = Number.isFinite(pending.at) && now - pending.at >= 0 && now - pending.at <= PENDING_LEAD_MAX_AGE;
    const local = storage(win, "localStorage");
    const counted = readJson(local, COUNTED_LEADS_KEY);
    const countedList = Array.isArray(counted) ? counted.filter((ref) => typeof ref === "string") : [];
    if (!fresh || urlRef !== pending.reference || !isLeadReference(pending.form_type, pending.reference) || countedList.includes(pending.reference)) {
      remove(session, PENDING_LEAD_KEY);
      return null;
    }
    const event = {
      event: form.event,
      form_id: form.formId,
      form_type: pending.form_type,
      lead_type: pending.lead_type,
      market: pending.market,
      lead_id: pending.reference,
      transaction_id: pending.reference,
    };
    return {
      event,
      markCounted() {
        remove(session, PENDING_LEAD_KEY);
        writeJson(local, COUNTED_LEADS_KEY, [...countedList, pending.reference].slice(-COUNTED_LIMIT));
      },
    };
  } catch { return null; }
}
