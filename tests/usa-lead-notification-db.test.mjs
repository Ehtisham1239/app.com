// Database checks for public.lead_for_notification (server-only; legacy USA lookup revoked),
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
  return (await one("select public.submit_trial_application($1::jsonb) as r", [payload])).r.reference;
};
const lookup = async (reference, email = "parent@example.test") => {
  await as("service_role");
  return (await one("select public.lead_for_notification($1, $2) as r", [reference, email])).r;
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

test("the person who just submitted gets the lead details back for the admissions email", async () => {
  const reference = await submit();
  const row = await lookup(reference, "  PARENT@example.TEST ");
  assert.equal(row.reference, reference);
  assert.equal(row.email, "parent@example.test");
  assert.equal(row.course, course.title);
  assert.equal(row.guardian_name, "Test Parent");
  assert.equal(row.utm.gclid, "test-gclid");
  assert.equal(row.repeat_of, null);
  for (const key of ["id", "created_at", "learner_name", "phone", "timezone", "age_band", "teacher_gender_pref", "notes", "source"]) assert.ok(key in row, key);
  await as("anon");
  const visible = await db.query("select id from public.trial_applications");
  assert.equal(visible.rows.length, 0, "RLS must prevent anon from seeing saved lead rows");
});

test("nothing is returned for another email, another page, an old or deleted lead, or a made-up reference", async () => {
  const reference = await submit({ email: "second@example.test", phone: "+15552340002" });
  assert.equal(await lookup(reference, "someone-else@example.test"), null);
  assert.equal(await lookup("TR-RECEIVED", "second@example.test"), null);
  assert.equal(await lookup("TR-2026-99999", "second@example.test"), null);
  assert.equal(await lookup(`${reference}' or '1'='1`, "second@example.test"), null);
  const sitewide = await submit({ email: "site@example.test", phone: "+15552340003", utm: { landing_page: "/free-trial", gclid: "x" } });
  const sitewideRow = await lookup(sitewide, "site@example.test");
  assert.equal(sitewideRow.utm.landing_page, "/free-trial", "the server lookup is global; the USA route applies its own landing-page restriction");
  await as("postgres");
  await db.query("update public.trial_applications set created_at = now() - interval '31 minutes' where reference = $1", [reference]);
  assert.equal(await lookup(reference, "second@example.test"), null, "older than 30 minutes");
  const deleted = await submit({ email: "third@example.test", phone: "+15552340004" });
  await as("postgres");
  await db.query("update public.trial_applications set deleted_at = now() where reference = $1", [deleted]);
  assert.equal(await lookup(deleted, "third@example.test"), null);
});

test("a repeat request names the earlier reference so staff do not handle it twice", async () => {
  const first = await submit({ email: "repeat@example.test", phone: "+15552340005" });
  const second = await submit({ email: "repeat@example.test", phone: "+15552340005" });
  const row = await lookup(second, "repeat@example.test");
  assert.equal(row.repeat_of, first);
  assert.ok(row.repeat_of_created_at);
});

test("the function is read-only and callable only through its declared grants", async () => {
  await as("postgres");
  const fn = await one(`select p.provolatile, p.prosecdef, array_to_string(p.proconfig, ',') as config,
    has_function_privilege('anon', p.oid, 'execute') as anon_exec,
    has_function_privilege('authenticated', p.oid, 'execute') as auth_exec,
    has_function_privilege('service_role', p.oid, 'execute') as service_exec
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.proname = 'lead_for_notification'`);
  assert.equal(fn.provolatile, "s"); assert.equal(fn.prosecdef, true); assert.equal(fn.config, "search_path=\"\"");
  assert.equal(fn.anon_exec, false); assert.equal(fn.auth_exec, false); assert.equal(fn.service_exec, true);

  const legacy = await one(`select
    has_function_privilege('anon', p.oid, 'execute') as anon_exec,
    has_function_privilege('authenticated', p.oid, 'execute') as auth_exec,
    has_function_privilege('service_role', p.oid, 'execute') as service_exec
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'usa_lead_for_notification'`);
  assert.ok(legacy);
  assert.equal(legacy.anon_exec, false);
  assert.equal(legacy.auth_exec, false);
  assert.equal(legacy.service_exec, false);
  const before = await one("select count(*)::int as n from public.trial_applications");
  await lookup("TR-2026-00001");
  await as("postgres");
  assert.equal((await one("select count(*)::int as n from public.trial_applications")).n, before.n);
});
