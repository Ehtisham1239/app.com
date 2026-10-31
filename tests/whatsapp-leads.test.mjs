import { before, after, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";

// WhatsApp lead messages (migration 20261031000100). pg_net and Vault are
// Supabase-only, so these tests cover the message building and prove a
// submission never fails because of the integration.
const db = new PGlite({ extensions: { pgcrypto } });
const root = new URL("../", import.meta.url);
const sql = (file) => readFileSync(new URL(file, root), "utf8");

before(async () => {
  await db.exec(sql("supabase/tests/local_shim.sql"));
  for (const file of readdirSync(new URL("supabase/migrations", root)).sort()) {
    if (/20261013000800|20261013001400/.test(file)) continue;
    await db.exec(sql(`supabase/migrations/${file}`));
  }
});
after(async () => { await db.close(); });

const config = (over = {}) => ({
  enabled: true,
  api_url: "https://ai-platform.example/v1/messages",
  owner_phone: "+923001112222",
  student_template: { name: "trial_request_received", language: "en", variables: ["learner_name", "reference"] },
  owner_template: { name: "new_lead_alert", language: "en", variables: ["kind", "name", "phone", "reference"] },
  ...over,
});
const lead = { id: "11111111-aaaa-4aaa-8aaa-111111111111", reference: "TR-1001", learner_name: "Ayesha  Khan", name: "Ayesha  Khan", phone: "+447700900123", phone_is_whatsapp: true, consent_given: true, kind: "Free trial" };
const build = async (kind, l, c) => (await db.query("select private.whatsapp_lead_messages($1, $2::jsonb, $3::jsonb) as m", [kind, l, c])).rows[0].m;

test("seeds a private, disabled configuration row", async () => {
  const row = (await db.query("select value, is_public from public.settings where key = 'integrations.whatsapp'")).rows[0];
  assert.equal(row.is_public, false, "owner phone and API URL are not public");
  assert.equal(row.value.enabled, false);
  assert.deepEqual(row.value.student_template.variables, ["learner_name", "reference"]);
});

test("a trial lead produces a learner confirmation and an owner alert", async () => {
  const m = await build("trial", lead, config());
  assert.deepEqual(m, [
    {
      idempotency_key: `lead-trial-${lead.id}-learner`,
      body: { to: "+447700900123", type: "template", client_reference: "TR-1001", template: { name: "trial_request_received", language: "en", variables: { 1: "Ayesha Khan", 2: "TR-1001" } } },
    },
    {
      idempotency_key: `lead-trial-${lead.id}-owner`,
      body: { to: "+923001112222", type: "template", client_reference: "TR-1001", template: { name: "new_lead_alert", language: "en", variables: { 1: "Free trial", 2: "Ayesha Khan", 3: "+447700900123", 4: "TR-1001" } } },
    },
  ]);
});

test("no learner message without a WhatsApp number, consent or template", async () => {
  for (const l of [{ ...lead, phone_is_whatsapp: false }, { ...lead, consent_given: false }, { ...lead, phone: "" }]) {
    const m = await build("trial", l, config());
    assert.deepEqual(m.map((x) => x.idempotency_key), [`lead-trial-${lead.id}-owner`]);
  }
  const noStudentTemplate = await build("trial", lead, config({ student_template: { name: "" } }));
  assert.equal(noStudentTemplate.length, 1);
});

test("contact messages alert the owner only; disabled or incomplete config sends nothing", async () => {
  const m = await build("contact", { ...lead, kind: "Contact message" }, config());
  assert.deepEqual(m.map((x) => x.idempotency_key), [`lead-contact-${lead.id}-owner`]);
  assert.deepEqual(await build("trial", lead, config({ enabled: false })), []);
  assert.deepEqual(await build("trial", lead, config({ owner_phone: "", student_template: { name: "" } })), []);
});

test("template variables are cleaned, capped and never empty", async () => {
  const v = (fields, l) => db.query("select private.whatsapp_template_variables($1::jsonb, $2::jsonb) as v", [fields, l]).then((r) => r.rows[0].v);
  assert.deepEqual(await v(["a", "b", "c"], { a: "line1\n\n\nline2\t x", b: "", c: "x".repeat(300) }), { 1: "line1 line2 x", 2: "-", 3: "x".repeat(200) });
  assert.deepEqual(await v(null, {}), {});
});

test("website submissions still succeed when the integration is enabled but pg_net is unavailable", async () => {
  await db.query("update public.settings set value = $1::jsonb where key = 'integrations.whatsapp'", [config()]);
  await db.exec("set role anon");
  const payload = { learner_name: "Hook Test", age_band: "adult", email: "hook@example.test", phone: "+447700900124", phone_is_whatsapp: true, country: "United Kingdom", timezone: "Europe/London", consent: true };
  const r = await db.query("select public.submit_trial_application($1::jsonb) as result", [payload]);
  assert.ok(r.rows[0].result.reference.startsWith("TR-"));
  const c = await db.query("select public.submit_contact_message($1::jsonb) as result", [{ name: "Hook Parent", email: "hp@example.test", message: "Please tell me about classes", consent: true }]);
  assert.ok(c.rows[0].result.reference.startsWith("MSG-"));
  await db.exec("reset role");
});

test("the anon role cannot call the integration functions", async () => {
  await db.exec("set role anon");
  await assert.rejects(db.query("select private.whatsapp_lead_messages('trial', '{}'::jsonb, '{}'::jsonb)"), /permission denied/);
  await db.exec("reset role");
});
