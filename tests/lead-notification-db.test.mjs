// Database contract for public.lead_for_notification; PGlite fixtures only.
import { before, after, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";

const db = new PGlite({ extensions: { pgcrypto } });
const root = new URL("../", import.meta.url);
const sql = (file) => readFileSync(new URL(file, root), "utf8");
const as = async (name) => db.exec(`reset role; set role ${name};`);
const one = async (text, params = []) => (await db.query(text, params)).rows[0];
let course;

const trial = async (email = "parent@example.test", landing = "/free-trial", overrides = {}) => {
  await as("anon");
  const payload = {
    learner_name: "Test Learner", guardian_name: "Test Parent", email,
    phone: "+15552345678", country: "United States", timezone: "America/Chicago",
    age_band: "child_8_12", course_id: course.id, teacher_gender_pref: "any",
    notes: "Synthetic database test", consent: true, source: "website",
    utm: { landing_page: landing },
    ...overrides,
  };
  return (await one("select public.submit_trial_application($1::jsonb) as r", [payload])).r;
};
const contact = async (email = "contact@example.test", overrides = {}) => {
  await as("anon");
  const payload = {
    name: "Test Parent", email, phone: "+15552345678", country: "United States",
    city: "Denver", subject: "Course enquiry", message: "Please explain online class times.",
    consent: true, source: "website", utm: { utm_source: "google" },
    ...overrides,
  };
  return (await one("select public.submit_contact_message_with_notification($1::jsonb) as r", [payload])).r;
};
const review = async (email = "reviewer@example.test") => {
  await as("anon");
  const payload = {
    name: "Synthetic Reviewer", email, relation: "Parent", country: "United Kingdom",
    rating: 5, comment: "A synthetic review for database notification tests.",
    consent: true, publish_consent: true, page_path: "/reviews",
  };
  return (await one("select public.submit_review_with_notification($1::jsonb) as r", [payload])).r;
};
const lookup = async ({ reference, notification_token }, email, role = "anon") => {
  await as(role);
  return (await one("select public.lead_for_notification($1, $2, $3) as r", [reference, email, notification_token])).r;
};

before(async () => {
  await db.exec(sql("supabase/tests/local_shim.sql"));
  await db.exec("alter default privileges in schema public grant all on tables to anon, authenticated, service_role;");
  for (const file of readdirSync(new URL("supabase/migrations", root)).sort()) {
    if (/20261013000800|20261013001400/.test(file)) continue;
    await db.exec(sql(`supabase/migrations/${file}`));
  }
  course = await one("select id from public.courses where status = 'published' and deleted_at is null order by title limit 1");
  assert.ok(course);
});
after(async () => { await db.close(); });

test("the just-submitted trial is available only with its proof token and matching email/reference", async () => {
  const submission = await trial();
  const { reference, notification_token } = submission;
  assert.match(notification_token, /^[0-9a-f]{64}$/);
  assert.equal(await lookup({ reference, notification_token: "0".repeat(64) }, "parent@example.test"), null);
  assert.equal(await lookup({ reference, notification_token: null }, "parent@example.test"), null);
  assert.equal((await lookup(submission, "parent@example.test", "service_role")).reference, reference);
  await as("authenticated");
  await assert.rejects(db.query("select public.lead_for_notification($1, $2, $3)", [reference, "parent@example.test", notification_token]), /permission denied/);
  const row = await lookup(submission, "PARENT@example.test");
  assert.equal(row.lead_type, "trial");
  assert.equal(row.reference, reference);
  assert.equal(row.email, "parent@example.test");
  assert.equal(row.learner_name, "Test Learner");
  assert.equal(await lookup(submission, "other@example.test"), null);
  await as("anon");
  await assert.rejects(db.query("select * from public.trial_applications"), /permission denied/);
});

test("the just-submitted contact enquiry is available only to its matching email and reference", async () => {
  const submission = await contact();
  const { reference, notification_token } = submission;
  assert.match(notification_token, /^[0-9a-f]{64}$/);
  assert.equal(await lookup({ reference, notification_token: "f".repeat(64) }, "contact@example.test"), null);
  const row = await lookup(submission, "CONTACT@example.test");
  assert.equal(row.lead_type, "contact");
  assert.equal(row.reference, reference);
  assert.equal(row.email, "contact@example.test");
  assert.equal(row.message, "Please explain online class times.");
  assert.equal(await lookup(submission, "other@example.test"), null);
  await as("anon");
  await assert.rejects(db.query("select * from public.contact_messages"), /permission denied/);
});

test("the just-submitted review is available only to its matching email and reference", async () => {
  const submission = await review();
  const { reference, notification_token } = submission;
  assert.match(notification_token, /^[0-9a-f]{64}$/);
  assert.equal(await lookup({ reference, notification_token: "f".repeat(64) }, "reviewer@example.test"), null);
  const row = await lookup(submission, "REVIEWER@example.test");
  assert.equal(row.lead_type, "review");
  assert.equal(row.reference, reference);
  assert.equal(row.email, "reviewer@example.test");
  assert.equal(row.rating, 5);
  assert.equal(row.publish_consent, true);
  assert.equal(row.media_count, 0);
  assert.equal(await lookup(submission, "other@example.test"), null);
  await as("anon");
  await assert.rejects(db.query("select * from public.review_submissions"), /permission denied/);
});

test("proof must belong to this lead and be unexpired; honeypot never gets a token", async () => {
  const first = await contact("first@example.test");
  const second = await contact("second@example.test");
  assert.equal(await lookup({ ...first, notification_token: second.notification_token }, "first@example.test"), null);
  await as("postgres");
  await db.query("update private.website_lead_notification_tokens set expires_at=now() where reference=$1", [first.reference]);
  assert.equal(await lookup(first, "first@example.test"), null);
  await as("anon");
  const result = await one("select public.submit_contact_message_with_notification($1::jsonb) as r", [{ website: "bot" }]);
  assert.equal(result.r.reference, "MSG-RECEIVED");
  assert.equal(result.r.notification_token, undefined);
  await assert.rejects(db.query("select * from private.website_lead_notification_tokens"), /permission denied/);
});

test("USA trials are handled only by the existing USA notification route", async () => {
  const email = "usa@example.test";
  const result = await trial(email, "/usa-quran-classes");
  assert.equal(await lookup(result, email), null);
  await as("anon");
  const legacy = await one("select public.usa_lead_for_notification($1,$2,$3) as r", [result.reference, email, result.notification_token]);
  assert.equal(legacy.r.reference, result.reference);
});

test("only the just-submitted lead's proof can record its CRM status, and only staff can read it", async () => {
  const submission = await contact("crm@example.test");
  const record = async (token, ok = true) => {
    await as("anon");
    return (await one("select public.record_lead_crm_sync($1, $2, $3, $4, $5) as r", [submission.reference, "crm@example.test", token, ok, ok ? null : "Provider Rejected!"])).r;
  };
  assert.equal(await record("0".repeat(64)), false);
  assert.equal(await record(submission.notification_token, false), true);
  await as("postgres");
  let row = await one("select status, detail from public.lead_crm_sync where reference = $1", [submission.reference]);
  assert.deepEqual({ ...row }, { status: "failed", detail: "providerrejected" });
  assert.equal(await record(submission.notification_token, true), true);
  await as("postgres");
  row = await one("select status, detail from public.lead_crm_sync where reference = $1", [submission.reference]);
  assert.deepEqual({ ...row }, { status: "synced", detail: null });
  await as("anon");
  await assert.rejects(db.query("select * from public.lead_crm_sync"), /permission denied/);
  await assert.rejects(db.query("insert into public.lead_crm_sync (reference, status) values ('MSG-2026-99999', 'synced')"), /permission denied/);
});

test("repeated trial details create one lead while siblings and schedule changes still save", async () => {
  await as("postgres");
  await db.query("select set_config('request.headers', $1, false)", ['{"x-forwarded-for":"192.0.2.21"}']);
  const email = "repeat-trial@example.test";
  const original = await trial(email, "/free-trial", { preferred_times: ["evening"] });
  assert.match(original.notification_token, /^[0-9a-f]{64}$/);

  const repeated = await trial(email.toUpperCase(), "/usa-quran-classes", { preferred_times: ["evening"] });
  assert.equal(repeated.ok, true);
  assert.equal(repeated.reference, "TR-RECEIVED");
  assert.equal(repeated.notification_token, undefined);

  const sibling = await trial(email, "/free-trial", {
    learner_name: "Test Sibling", preferred_times: ["evening"],
  });
  const changed = await trial(email, "/free-trial", { preferred_times: ["morning"] });
  assert.match(sibling.notification_token, /^[0-9a-f]{64}$/);
  assert.match(changed.notification_token, /^[0-9a-f]{64}$/);
  await as("postgres");
  const siblingRow = await one("select duplicate_of_id from public.trial_applications where reference = $1", [sibling.reference]);
  assert.equal(siblingRow.duplicate_of_id, null);
  await db.query("update public.trial_applications set created_at = now() - interval '25 hours' where reference = $1", [original.reference]);
  const later = await trial(email, "/free-trial", { preferred_times: ["evening"] });
  assert.match(later.notification_token, /^[0-9a-f]{64}$/);
  await as("postgres");
  const saved = await one("select count(*)::int as count from public.trial_applications where email = $1", [email]);
  assert.equal(saved.count, 4);
});

test("contact retries create one lead and changed messages still save", async () => {
  await as("postgres");
  await db.query("select set_config('request.headers', $1, false)", ['{"x-forwarded-for":"192.0.2.22"}']);
  const email = "repeat-contact@example.test";
  const original = await contact(email);
  assert.match(original.notification_token, /^[0-9a-f]{64}$/);

  const repeated = await contact(email.toUpperCase(), { utm: { utm_source: "newsletter" } });
  assert.equal(repeated.ok, true);
  assert.equal(repeated.reference, "MSG-RECEIVED");
  assert.equal(repeated.notification_token, undefined);

  const changed = await contact(email, { message: "Can I also arrange a weekend lesson?" });
  assert.match(changed.notification_token, /^[0-9a-f]{64}$/);
  await as("postgres");
  const saved = await one("select count(*)::int as count from public.contact_messages where email = $1", [email]);
  assert.equal(saved.count, 2);
});
