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

const trial = async (email = "parent@example.test") => {
  await as("anon");
  const payload = {
    learner_name: "Test Learner", guardian_name: "Test Parent", email,
    phone: "+15552345678", country: "United States", timezone: "America/Chicago",
    age_band: "child_8_12", course_id: course.id, teacher_gender_pref: "any",
    notes: "Synthetic database test", consent: true, source: "website",
    utm: { landing_page: "/free-trial" },
  };
  return (await one("select public.submit_trial_application($1::jsonb) as r", [payload])).r.reference;
};
const contact = async (email = "contact@example.test") => {
  await as("anon");
  const payload = {
    name: "Test Parent", email, phone: "+15552345678", country: "United States",
    city: "Denver", subject: "Course enquiry", message: "Please explain online class times.",
    consent: true, source: "website", utm: { utm_source: "google" },
  };
  return (await one("select public.submit_contact_message($1::jsonb) as r", [payload])).r.reference;
};
const lookup = async (reference, email) => {
  await as("anon");
  return (await one("select public.lead_for_notification($1, $2) as r", [reference, email])).r;
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

test("the just-submitted trial is available only to its matching email and reference", async () => {
  const reference = await trial();
  const row = await lookup(reference, "PARENT@example.test");
  assert.equal(row.lead_type, "trial");
  assert.equal(row.reference, reference);
  assert.equal(row.email, "parent@example.test");
  assert.equal(row.learner_name, "Test Learner");
  assert.equal(await lookup(reference, "other@example.test"), null);
  await assert.rejects(db.query("select * from public.trial_applications"), /permission denied/);
});

test("the just-submitted contact enquiry is available only to its matching email and reference", async () => {
  const reference = await contact();
  const row = await lookup(reference, "CONTACT@example.test");
  assert.equal(row.lead_type, "contact");
  assert.equal(row.reference, reference);
  assert.equal(row.email, "contact@example.test");
  assert.equal(row.message, "Please explain online class times.");
  assert.equal(await lookup(reference, "other@example.test"), null);
  await assert.rejects(db.query("select * from public.contact_messages"), /permission denied/);
});

test("notification lookup rejects honeypots, made-up references, spam, deleted and old records", async () => {
  assert.equal(await lookup("TR-RECEIVED", "parent@example.test"), null);
  assert.equal(await lookup("MSG-RECEIVED", "contact@example.test"), null);
  assert.equal(await lookup("MSG-2026-99999", "contact@example.test"), null);
  const spam = await contact("spam@example.test");
  await as("postgres");
  await db.query("update public.contact_messages set status='spam' where reference=$1", [spam]);
  assert.equal(await lookup(spam, "spam@example.test"), null);
  const old = await trial("old@example.test");
  await as("postgres");
  await db.query("update public.trial_applications set created_at=now()-interval '31 minutes' where reference=$1", [old]);
  assert.equal(await lookup(old, "old@example.test"), null);
  const deleted = await contact("deleted@example.test");
  await as("postgres");
  await db.query("update public.contact_messages set deleted_at=now() where reference=$1", [deleted]);
  assert.equal(await lookup(deleted, "deleted@example.test"), null);
});

test("lookup function is stable, security definer, and executable for anonymous form submitters", async () => {
  await as("postgres");
  const fn = await one(`select p.provolatile, p.prosecdef, array_to_string(p.proconfig, ',') as config,
    has_function_privilege('anon', p.oid, 'execute') as anon_exec
    from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname='lead_for_notification'`);
  assert.equal(fn.provolatile, "s");
  assert.equal(fn.prosecdef, true);
  assert.equal(fn.config, 'search_path=""');
  assert.equal(fn.anon_exec, true);
});
