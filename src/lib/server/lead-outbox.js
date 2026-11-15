// Worker for the durable lead delivery queue (public.lead_sync_jobs).
// Server-only. The database and providers are injected so the retry rules can
// be tested without network access. Every step is idempotent: HighLevel
// upserts by email and the admissions email carries an Idempotency-Key tied to
// the lead reference, so a retry or an overlapping browser call cannot create a
// duplicate contact or a second email.
import { syncHighLevelAdmission } from "./highlevel.js";
import { buildContactEmail, buildLeadEmail, sendLeadEmail } from "../usa-lead-notification.js";

const USA_LANDING = "/usa-quran-classes";
const code = (value) => String(value || "").toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 80) || "unknown";

async function deliver(job, lead, { highLevel, emailConfig, siteUrl, fetchImpl }) {
  const usa = lead.utm?.landing_page === USA_LANDING;
  const result = { crmOk: null, emailOk: job.email_done, error: null };

  if (!highLevel) {
    result.crmOk = null;
  } else if (!job.crm_done) {
    const options = lead.lead_type === "contact" ? { form: "contact" } : usa ? { form: "usa" } : { trialSiteUrl: siteUrl };
    const crm = await syncHighLevelAdmission(lead, lead.lead_type === "contact" ? "contact" : "trial", { config: highLevel, fetchImpl, ...options });
    result.crmOk = crm.ok === true;
    if (!crm.ok) result.error = `highlevel_${crm.reason}${crm.status ? `_${crm.status}` : ""}`;
  } else {
    result.crmOk = true;
  }

  if (!job.email_done) {
    if (!emailConfig) {
      result.emailOk = false;
      result.error ||= "email_not_configured";
    } else {
      const message = lead.lead_type === "contact"
        ? buildContactEmail(lead, { siteUrl })
        : buildLeadEmail(lead, { siteUrl, sourceLabel: usa ? "USA landing page" : "website form" });
      const sent = await sendLeadEmail({
        config: emailConfig, message, reference: lead.reference, fetchImpl,
        source: lead.lead_type === "contact" ? "website_contact" : usa ? "usa_landing_page" : "website_trial",
      });
      result.emailOk = sent.ok === true;
      if (!sent.ok) {
        result.error ||= sent.reason;
      }
    }
  }
  return result;
}

export async function processLeadSyncBatch({ db, highLevel, emailConfig, siteUrl, limit = 10, fetchImpl = fetch, log = () => {} }) {
  const summary = { claimed: 0, done: 0, retry: 0, dead: 0, failed_lookup: 0 };
  const { data: jobs, error, status: rpcStatus } = await db.rpc("claim_lead_sync_jobs", { p_limit: limit });
  if (error) {
    log("error", { event: "lead_sync", outcome: "claim_failed", rpc_error_code: code(error.code), rpc_http_status: rpcStatus });
    throw new Error("claim_failed");
  }
  for (const job of jobs || []) {
    summary.claimed += 1;
    let outcome;
    try {
      const { data: lead, error: leadError } = await db.rpc("lead_for_outbox", { p_reference: job.reference });
      if (leadError || !lead || lead.reference !== job.reference) {
        summary.failed_lookup += 1;
        outcome = { crmOk: null, emailOk: false, error: "lead_lookup_failed" };
      } else {
        outcome = await deliver(job, lead, { highLevel, emailConfig, siteUrl, fetchImpl });
      }
    } catch (caught) {
      outcome = { crmOk: null, emailOk: false, error: code(caught?.name || "worker_error") };
    }
    const { data: status } = await db.rpc("complete_lead_sync_job", {
      p_reference: job.reference, p_crm_ok: outcome.crmOk, p_email_ok: outcome.emailOk, p_error: outcome.error ? code(outcome.error) : null,
    });
    if (status === "done") summary.done += 1;
    else if (status === "dead") summary.dead += 1;
    else summary.retry += 1;
    log(status === "done" ? "info" : "error", { event: "lead_sync", reference: job.reference, status, error: outcome.error || null });
  }
  return summary;
}
