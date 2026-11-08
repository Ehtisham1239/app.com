// Database checks for public.usa_lead_for_notification (supabase/migrations/20261105104232_usa_lead_notification.sql),
// run in PGlite with synthetic data only.
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

const submit = async (extra = {}) => {
  await as("anon");
  const payload = {
    learner_name: "Child of Test Parent", guardian_name: "Test Parent", email: "Parent@Example.test", phone: "+15552345678", phone_is_whatsapp: false,
    country: "United States", timezone: "America/Chicago", age_band: "child_8_12", course_id: course.id, teacher_gender_pref: "female",
    notes: "Source: USA landing page (/usa-quran-classes).", consent: true, source: "google", utm: { landing_page: "/usa-quran-classes", gclid: "test-gclid" }, ...extra,
  };
  return (await one("select public.submit_trial_application($1::jsonb) as r", [payload])).r;
};
const lookup = async (submission, email = "parent@example.test") => {
  await as("anon");
  return (await one("select public.usa_lead_for_notification($1, $2, $3) as r", [
    submission.reference, email, submission.notification_token,
  ])).r;
};

before(async () => {
  await db.exec(sql("supabase/tests/local_shim.sql"));
  await db.exec("alter default privileges in schema public grant all on tables to anon, authenticated, service_role;");
  for (const file of readdirSync(new URL("supabase/migrations", root)).sort()) {
    if (/20261013000800|20261013001400/.test(file)) continue;
    await db.exec(sql(`supabase/migrations/${file}`));
  }
  course = await one("select id, title from public.courses where status = 'published' and deleted_at is null order by title limit 1");
  assert.ok(course, "a published course is seeded");
});
after(async () => { await db.close(); });

test("only the submitting visitor with the 256-bit token can retrieve their own lead for email", async () => {
  const submission = await submit();
  assert.match(submission.notification_token, /^[0-9a-f]{64}$/);
  const row = await lookup(submission, "  PARENT@example.TEST ");
  assert.equal(row.reference, submission.reference);
  assert.equal(row.email, "parent@example.test");
  assert.equal(row.course, course.title);
  assert.equal(row.guardian_name, "Test Parent");
  assert.equal(row.utm.gclid, "test-gclid");
  assert.equal(row.repeat_of, null);
  for (const key of ["id", "created_at", "learner_name", "phone", "timezone", "age_band", "teacher_gender_pref", "notes", "source"]) assert.ok(key in row, key);

  await as("postgres");
  const leadId = (await one("select id from public.trial_applications where reference=$1", [submission.reference])).id;
  const stored = await one("select token_hash from private.usa_lead_notification_tokens where lead_id=$1", [leadId]);
  const digest = await one("select encode(extensions.digest($1,'sha256'),'hex') as hash", [submission.notification_token]);
  assert.equal(stored.token_hash, digest.hash);
  assert.notEqual(stored.token_hash, submission.notification_token, "raw token is never stored");

  await as("anon");
  await assert.rejects(db.query("select * from private.usa_lead_notification_tokens"), /permission denied/, "anon cannot read the private token table");
  await assert.rejects(db.query("select * from public.trial_applications"), /permission denied/, "anon still cannot read the leads table");
});

test("wrong token, email, source page, expiry, deletion or guessed reference returns nothing", async () => {
  const submission = await submit({ email: "second@example.test", phone: "+15552340002" });
  assert.equal(await lookup(submission, "someone-else@example.test"), null);
  assert.equal(await lookup({ ...submission, notification_token: "0".repeat(64) }, "second@example.test"), null);
  assert.equal(await lookup({ ...submission, reference: "TR-RECEIVED" }, "second@example.test"), null);
  assert.equal(await lookup({ ...submission, notification_token: "short" }, "second@example.test"), null);
  const sitewide = await submit({ email: "site@example.test", phone: "+15552340003", phone_is_whatsapp: true, learner_name: "Test Student", utm: { landing_page: "/free-trial", gclid: "x" } });
  assert.equal(await lookup(sitewide, "site@example.test"), null, "main-site leads are not exposed");

  await as("postgres");
  const saved = await one("select learner_name, guardian_name, email, phone, phone_is_whatsapp, country from public.trial_applications where reference = $1", [sitewide.reference]);
  assert.deepEqual(saved, {
    learner_name: "Test Student", guardian_name: "Test Parent", email: "site@example.test",
    phone: "+15552340003", phone_is_whatsapp: true, country: "United States",
  });
  await db.query("update public.trial_applications set created_at = now() - interval '31 minutes' where reference = $1", [submission.reference]);
  assert.equal(await lookup(submission, "second@example.test"), null, "older than 30 minutes");
  const deleted = await submit({ email: "third@example.test", phone: "+15552340004" });
  await as("postgres");
  await db.query("update public.trial_applications set deleted_at = now() where reference = $1", [deleted.reference]);
  assert.equal(await lookup(deleted, "third@example.test"), null);
  const bot = await submit({ website: "bot" });
  assert.equal(bot.reference, "TR-RECEIVED");
  assert.equal(bot.notification_token, undefined);
});

test("a repeat request names the earlier reference so staff do not handle it twice", async () => {
  const first = await submit({ email: "repeat@example.test", phone: "+15552340005" });
  const second = await submit({ email: "repeat@example.test", phone: "+15552340005" });
  const row = await lookup(second, "repeat@example.test");
  assert.equal(row.repeat_of, first.reference);
  assert.ok(row.repeat_of_created_at);
});

test("lookup is read-only and the legacy two-argument RPC cannot expose lead details", async () => {
  await as("anon");
  assert.equal((await one("select public.usa_lead_for_notification($1,$2) as r", ["TR-2026-00001", "parent@example.test"])).r, null);
  await as("postgres");
  const fns = await one(`select
    (select p.prosecdef from pg_proc p where p.oid='public.usa_lead_for_notification(text,text)'::regprocedure) as legacy_definer,
    (select p.prosecdef from pg_proc p where p.oid='public.usa_lead_for_notification(text,text,text)'::regprocedure) as token_definer,
    (select p.provolatile from pg_proc p where p.oid='public.usa_lead_for_notification(text,text,text)'::regprocedure) as token_volatility,
    has_function_privilege('anon','public.usa_lead_for_notification(text,text,text)'::regprocedure,'execute') as anon_exec`);
  assert.equal(fns.legacy_definer, false);
  assert.equal(fns.token_definer, true);
  assert.equal(fns.token_volatility, "s");
  assert.equal(fns.anon_exec, true);
  assert.equal((await one("select count(*)::int as n from public.trial_applications")).n > 0, true);
});
