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

const trial = async (email = "parent@example.test", landing = "/free-trial") => {
  await as("anon");
  const payload = {
    learner_name: "Test Learner", guardian_name: "Test Parent", email,
    phone: "+15552345678", country: "United States", timezone: "America/Chicago",
    age_band: "child_8_12", course_id: course.id, teacher_gender_pref: "any",
    notes: "Synthetic database test", consent: true, source: "website",
    utm: { landing_page: landing },
  };
  return (await one("select public.submit_trial_application($1::jsonb) as r", [payload])).r;
};
const contact = async (email = "contact@example.test") => {
  await as("anon");
  const payload = {
    name: "Test Parent", email, phone: "+15552345678", country: "United States",
    city: "Denver", subject: "Course enquiry", message: "Please explain online class times.",
    consent: true, source: "website", utm: { utm_source: "google" },
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
const lookup = async ({ reference, notification_token }, email) => {
  await as("service_role");
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

test("the just-submitted trial is available only to the server role and matching email/reference", async () => {
  const submission = await trial();
  const { reference, notification_token } = submission;
  assert.match(notification_token, /^[0-9a-f]{64}$/);
  await as("anon");
  await assert.rejects(db.query("select public.lead_for_notification($1, $2, $3)", [reference, "parent@example.test", notification_token]), /permission denied/);
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
  await as("anon");
  await assert.rejects(db.query("select public.lead_for_notification($1, $2, $3)", [reference, "contact@example.test", notification_token]), /permission denied/);
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
  await as("anon");
  await assert.rejects(db.query("select public.lead_for_notification($1, $2, $3)", [reference, "reviewer@example.test", notification_token]), /permission denied/);
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
