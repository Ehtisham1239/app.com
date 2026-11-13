// Durable lead delivery: database contract (PGlite, synthetic data) and worker retry rules.
import { before, after, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";
import { processLeadSyncBatch } from "../src/lib/server/lead-outbox.js";

const db = new PGlite({ extensions: { pgcrypto } });
const root = new URL("../", import.meta.url);
const sql = (file) => readFileSync(new URL(file, root), "utf8");
const as = async (name) => db.exec(`reset role; set role ${name};`);
const one = async (text, params = []) => (await db.query(text, params)).rows[0];

const insertTrial = async (name, extra = "") => {
  await as("postgres");
  return one(
    `insert into public.trial_applications (learner_name, email, phone, country, age_band, consent_given, consent_text_version, utm ${extra ? "," + extra.split("=")[0] : ""})
     values ($1, $2, '+15552345678', 'United States', 'adult', true, 'test', '{}'::jsonb ${extra ? ", " + extra.split("=")[1] : ""}) returning reference`,
    [name, `${name.toLowerCase().replace(/\W+/g, ".")}@example.test`],
  );
};

before(async () => {
  await db.exec(sql("supabase/tests/local_shim.sql"));
  await db.exec("alter default privileges in schema public grant all on tables to anon, authenticated, service_role;");
  for (const file of readdirSync(new URL("supabase/migrations", root)).sort()) {
    if (/20261013000800|20261013001400/.test(file)) continue;
    await db.exec(sql(`supabase/migrations/${file}`));
  }
});
after(async () => { await db.close(); });

test("saving a trial request queues a delivery job in the same transaction", async () => {
  const { reference } = await insertTrial("Queue Check");
  const job = await one("select status, attempts, crm_done, email_done, lead_type from public.lead_sync_jobs where reference = $1", [reference]);
  assert.deepEqual(job, { status: "pending", attempts: 0, crm_done: false, email_done: false, lead_type: "trial" });
});

test("claiming applies backoff, skips jobs that are not due, and gives up after 8 attempts", async () => {
  const { reference } = await insertTrial("Backoff Check");
  await as("postgres");
  await db.exec(`update public.lead_sync_jobs set next_attempt_at = now() - interval '1 minute' where reference = '${reference}'`);
  await as("service_role");
  const first = (await db.query("select * from public.claim_lead_sync_jobs(25)")).rows.filter((r) => r.reference === reference);
  assert.equal(first.length, 1);
  const again = (await db.query("select * from public.claim_lead_sync_jobs(25)")).rows.filter((r) => r.reference === reference);
  assert.equal(again.length, 0, "not claimable again until the backoff passes");
  await as("postgres");
  const row = await one("select attempts, next_attempt_at > now() as later from public.lead_sync_jobs where reference = $1", [reference]);
  assert.equal(row.attempts, 1);
  assert.equal(row.later, true);
  await db.exec(`update public.lead_sync_jobs set attempts = 8, next_attempt_at = now() - interval '1 minute' where reference = '${reference}'`);
  await as("service_role");
  assert.equal((await db.query("select * from public.claim_lead_sync_jobs(25)")).rows.filter((r) => r.reference === reference).length, 0);
});

test("completing records done, retry and dead states and mirrors CRM status for admin", async () => {
  const { reference } = await insertTrial("Complete Check");
  await as("service_role");
  assert.equal((await one("select public.complete_lead_sync_job($1, true, false, 'Resend_403_validation_error') as s", [reference])).s, "pending");
  await as("postgres");
  let job = await one("select crm_done, email_done, last_error from public.lead_sync_jobs where reference = $1", [reference]);
  assert.deepEqual(job, { crm_done: true, email_done: false, last_error: "resend_403_validation_error" });
  assert.equal((await one("select status from public.lead_crm_sync where reference = $1", [reference])).status, "synced");
  await as("service_role");
  assert.equal((await one("select public.complete_lead_sync_job($1, null, true, null) as s", [reference])).s, "done");
  await as("postgres");
  job = await one("select last_error from public.lead_sync_jobs where reference = $1", [reference]);
  assert.equal(job.last_error, null);

  const second = await insertTrial("Dead Check");
  await db.exec(`update public.lead_sync_jobs set attempts = 8 where reference = '${second.reference}'`);
  await as("service_role");
  assert.equal((await one("select public.complete_lead_sync_job($1, false, false, 'highlevel_provider_rejected_401') as s", [second.reference])).s, "dead");
  await as("postgres");
  const failed = await one("select status, detail from public.lead_crm_sync where reference = $1", [second.reference]);
  assert.deepEqual(failed, { status: "failed", detail: "highlevel_provider_rejected_" });
});

test("anonymous and signed-in visitors cannot use or read the queue", async () => {
  for (const role of ["anon", "authenticated"]) {
    await as(role);
    await assert.rejects(() => db.query("select * from public.claim_lead_sync_jobs(5)"), /permission denied/);
    await assert.rejects(() => db.query("select public.lead_for_outbox('TR-2026-00001')"), /permission denied/);
    await assert.rejects(() => db.query("select public.complete_lead_sync_job('TR-2026-00001', true, true, null)"), /permission denied/);
  }
  await as("anon");
  await assert.rejects(() => db.query("select * from public.lead_sync_jobs"), /permission denied/);
});

const fakeDb = (jobs, lead) => {
  const completed = [];
  return {
    completed,
    rpc: async (name, args) => {
      if (name === "claim_lead_sync_jobs") return { data: jobs, error: null };
      if (name === "lead_for_outbox") return { data: lead, error: null };
      if (name === "complete_lead_sync_job") { completed.push(args); return { data: args.p_crm_ok !== false && args.p_email_ok ? "done" : "pending", error: null }; }
      throw new Error("unexpected rpc");
    },
  };
};
const trialLead = { lead_type: "trial", id: "1", reference: "TR-2026-00001", created_at: "2026-11-12T10:00:00Z", learner_name: "Test Learner", email: "test.learner@example.test", phone: "+15552345678", country: "United States", age_band: "adult", utm: {} };
const emailConfig = { apiKey: "re_test_key_123456", from: "OQC <leads@example.test>", to: ["admissions@example.test"] };
const highLevel = { token: "t", locationId: "loc" };

test("worker delivers CRM and email, and records success", async () => {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push(String(url));
    if (String(url).includes("resend")) return new Response(JSON.stringify({ id: "em_1" }), { status: 200 });
    if (String(url).endsWith("/contacts/upsert")) return new Response(JSON.stringify({ contact: { id: "c1" } }), { status: 200 });
    return new Response("{}", { status: 200 });
  };
  const fake = fakeDb([{ reference: "TR-2026-00001", lead_type: "trial", crm_done: false, email_done: false }], trialLead);
  const summary = await processLeadSyncBatch({ db: fake, highLevel, emailConfig, siteUrl: "https://example.test", fetchImpl });
  assert.equal(summary.done, 1);
  assert.deepEqual(fake.completed[0], { p_reference: "TR-2026-00001", p_crm_ok: true, p_email_ok: true, p_error: null });
  assert.ok(calls.some((u) => u.includes("api.resend.com")));
});

test("worker keeps a job pending with a machine reason when email fails, without redoing finished CRM work", async () => {
  const urls = [];
  const fetchImpl = async (url) => {
    urls.push(String(url));
    return new Response(JSON.stringify({ name: "validation_error", message: "The example.test domain is not verified. " }), { status: 403 });
  };
  const fake = fakeDb([{ reference: "TR-2026-00001", lead_type: "trial", crm_done: true, email_done: false }], trialLead);
  const logs = [];
  const summary = await processLeadSyncBatch({ db: fake, highLevel, emailConfig, siteUrl: "https://example.test", fetchImpl, log: (l, e) => logs.push(e) });
  assert.equal(summary.retry, 1);
  assert.equal(fake.completed[0].p_crm_ok, true);
  assert.equal(fake.completed[0].p_email_ok, false);
  assert.equal(fake.completed[0].p_error, "resend_403_validation_error");
  assert.ok(urls.every((u) => u.includes("resend")), "no HighLevel call when CRM was already done");
  assert.equal(logs[0].error, "resend_403_validation_error");
  assert.equal(JSON.stringify(logs[0]).includes("not verified"), false, "provider text is never logged");
});

test("worker records a failed lookup and a missing email configuration instead of dropping the job", async () => {
  const none = fakeDb([{ reference: "TR-2026-00001", lead_type: "trial", crm_done: false, email_done: false }], null);
  const a = await processLeadSyncBatch({ db: none, highLevel, emailConfig, siteUrl: "https://example.test" });
  assert.equal(a.failed_lookup, 1);
  assert.equal(none.completed[0].p_error, "lead_lookup_failed");

  const fetchImpl = async () => new Response(JSON.stringify({ contact: { id: "c1" } }), { status: 200 });
  const noEmail = fakeDb([{ reference: "TR-2026-00001", lead_type: "trial", crm_done: true, email_done: false }], trialLead);
  await processLeadSyncBatch({ db: noEmail, highLevel, emailConfig: null, siteUrl: "https://example.test", fetchImpl });
  assert.equal(noEmail.completed[0].p_error, "email_not_configured");
});
