// Lead forwarding outbox (migration 20261031000100). PGlite with stand-ins for pg_net and
// Vault; synthetic leads only. Real delivery to Hatchium/Make is not exercised here.
import { before, after, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";

const db = new PGlite({ extensions: { pgcrypto } });
const root = new URL("../", import.meta.url);
const sql = (file) => readFileSync(new URL(file, root), "utf8");
const adminId = "e1111111-1111-4111-8111-111111111111";
const one = async (text, params = []) => (await db.query(text, params)).rows[0];
async function as(name, id = "") {
  await db.exec(`reset role; set role ${name};`);
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [id]);
}
const dispatch = () => db.query("select private.lead_outbox_dispatch()");
const contact = { name: "Synthetic Parent", email: "synthetic.parent@example.test", subject: "Lessons", message: "Please explain online lessons", consent: true };
const trial = { learner_name: "Synthetic Learner", age_band: "adult", email: "synthetic.learner@example.test", phone: "+447700900123", country: "Australia", city: "Perth", timezone: "Australia/Perth", consent: true };

before(async () => {
  await db.exec(sql("supabase/tests/local_shim.sql"));
  for (const file of readdirSync(new URL("supabase/migrations", root)).sort()) {
    if (/20261013000800|20261013001400/.test(file)) continue;
    await db.exec(sql(`supabase/migrations/${file}`));
  }
  await db.exec(`
    create schema net;
    create table net.calls (id bigserial primary key, url text, body jsonb, headers jsonb);
    create table net._http_response (id bigint, status_code int, error_msg text, timed_out boolean);
    create function net.http_post(url text, body jsonb, params jsonb default '{}', headers jsonb default '{}', timeout_milliseconds int default 5000)
      returns bigint language sql as $$ insert into net.calls (url, body, headers) values (url, body, headers) returning id $$;
    create schema vault;
    create table vault.decrypted_secrets (name text, decrypted_secret text, created_at timestamptz default now());`);
  await db.query("insert into auth.users (id,email,raw_app_meta_data) values ($1,'admin@example.test',$2)", [adminId, { role: "admin" }]);
  await db.query("update public.profiles set is_active = true");
});
after(async () => { await db.close(); });

test("new website leads are queued with coordinator fields only; spam is not queued", async () => {
  await as("anon");
  await db.query("select public.submit_contact_message($1::jsonb)", [contact]);
  await db.query("select public.submit_trial_application($1::jsonb)", [trial]);
  await as("postgres");
  await db.query("insert into public.contact_messages (reference,name,email,subject,message,consent_text_version,status) values ('MSG-SPAM','Spam Bot','spam@example.test','Spam','Buy things now','v1','spam')");
  const rows = (await db.query("select kind, status, payload from private.lead_outbox order by kind")).rows;
  assert.deepEqual(rows.map((r) => [r.kind, r.status]), [["contact", "pending"], ["trial", "pending"]]);
  const [c, t] = rows.map((r) => r.payload);
  assert.equal(c.email, contact.email); assert.equal(c.message, contact.message); assert.match(c.reference, /^MSG-/);
  assert.equal(t.learner_name, trial.learner_name); assert.equal(t.city, "Perth"); assert.equal(t.timezone, "Australia/Perth");
  for (const p of [c, t]) for (const hidden of ["ip_hash", "user_agent", "spam_score", "internal_note", "utm"]) assert.equal(hidden in p, false, hidden);
});

test("nothing is sent until a https webhook URL is stored in Vault", async () => {
  await dispatch();
  assert.equal((await one("select count(*)::int n from net.calls")).n, 0);
  await db.query("insert into vault.decrypted_secrets (name, decrypted_secret) values ('lead_webhook_url', 'http://insecure.example.test/hook')");
  await dispatch();
  assert.equal((await one("select count(*)::int n from net.calls")).n, 0);
  assert.equal((await one("select count(*)::int n from private.lead_outbox where status='pending'")).n, 2);
});

test("configured forwarding posts each lead once with an event id, bearer token and idempotency key", async () => {
  await db.query("insert into vault.decrypted_secrets (name, decrypted_secret) values ('lead_webhook_url', 'https://hooks.example.test/oqc'), ('lead_webhook_token', 'synthetic-token')");
  await dispatch();
  const calls = (await db.query("select url, body, headers from net.calls order by id")).rows;
  assert.equal(calls.length, 2);
  for (const c of calls) {
    assert.equal(c.url, "https://hooks.example.test/oqc");
    assert.equal(c.headers.Authorization, "Bearer synthetic-token");
    assert.equal(c.headers["Idempotency-Key"], c.body.event_id);
    assert.equal(c.body.site, "onlinequrancollege.com");
  }
  assert.equal((await one("select count(*)::int n from private.lead_outbox where status='sending'")).n, 2);
  await dispatch(); // no answer yet: nothing is sent twice
  assert.equal((await one("select count(*)::int n from net.calls")).n, 2);
});

test("2xx marks sent; errors retry with backoff and give up after six attempts", async () => {
  const [ok, bad] = (await db.query("select id, request_id from private.lead_outbox order by kind")).rows;
  await db.query("insert into net._http_response (id, status_code) values ($1, 202), ($2, 500)", [ok.request_id, bad.request_id]);
  await dispatch();
  const sent = await one("select status, sent_at, last_status_code from private.lead_outbox where id=$1", [ok.id]);
  assert.equal(sent.status, "sent"); assert.ok(sent.sent_at); assert.equal(sent.last_status_code, 202);
  const retry = await one("select status, attempts, last_error, next_attempt_at > now() as later from private.lead_outbox where id=$1", [bad.id]);
  assert.deepEqual([retry.status, retry.attempts, retry.last_error, retry.later], ["pending", 1, "HTTP 500", true]);
  for (let i = 0; i < 5; i++) {
    await db.query("update private.lead_outbox set next_attempt_at = now() - interval '1 second' where id=$1", [bad.id]);
    await dispatch();
    const r = await one("select request_id from private.lead_outbox where id=$1", [bad.id]);
    await db.query("insert into net._http_response (id, status_code) values ($1, 503)", [r.request_id]);
    await dispatch();
  }
  const failed = await one("select status, attempts from private.lead_outbox where id=$1", [bad.id]);
  assert.deepEqual([failed.status, failed.attempts], ["failed", 6]);
  assert.equal((await one("select count(*)::int n from public.contact_messages where email=$1", [contact.email])).n, 1);
});

test("only staff with settings permission see the status and can retry failed deliveries", async () => {
  await as("anon");
  await assert.rejects(db.query("select public.lead_forwarding_status()"), /permission denied/);
  await as("authenticated", adminId);
  const s = (await one("select public.lead_forwarding_status() s")).s;
  assert.equal(s.configured, true); assert.equal(s.sent, 1); assert.equal(s.failed, 1); assert.equal(s.last_error, "HTTP 503");
  assert.equal(JSON.stringify(s).includes("synthetic-token"), false);
  assert.equal((await one("select public.lead_forwarding_retry_failed() n")).n, 1);
  await as("postgres");
  assert.equal((await one("select status from private.lead_outbox where status <> 'sent'")).status, "pending");
});
