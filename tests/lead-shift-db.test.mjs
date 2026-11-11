// Database contract for the OQC lead shift schedule (20261111090000_lead_shift_schedule.sql).
// PGlite fixtures only; synthetic data. Also checks the SQL rules match src/lib/lead-shift.js.
import { before, after, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";
import { lastHandoverAt, leadShiftFor, shiftDateFor } from "../src/lib/lead-shift.js";

const db = new PGlite({ extensions: { pgcrypto } });
const root = new URL("../", import.meta.url);
const sql = (file) => readFileSync(new URL(file, root), "utf8");
const as = async (name) => db.exec(`reset role; set role ${name};`);
const one = async (text, params = []) => (await db.query(text, params)).rows[0];
const iso = (d) => (d instanceof Date ? d.toISOString().slice(0, 10) : String(d).slice(0, 10));

const insertTrial = async (name, createdAt, status = "new") => {
  await as("postgres");
  return one(
    `insert into public.trial_applications (learner_name, email, phone, country, age_band, consent_given, consent_text_version, created_at, status, lead_shift, shift_date)
     values ($1, $2, '+15552345678', 'United States', 'adult', true, 'test', $3, $4, 'day', '2000-01-01')
     returning id, lead_shift, shift_date`,
    [name, `${name.toLowerCase().replace(/\W+/g, ".")}@example.test`, createdAt, status],
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

test("SQL shift rules agree with the shared JavaScript rules for every quarter hour", async () => {
  await as("postgres");
  const start = Date.parse("2026-12-31T00:00:00+05:00");
  for (let i = 0; i < 2 * 96; i++) {
    const at = new Date(start + i * 15 * 60_000);
    const r = await one(
      "select private.oqc_lead_shift($1) s, private.oqc_lead_shift_date($1)::text d, private.oqc_last_shift_handover($1) h",
      [at.toISOString()],
    );
    assert.equal(r.s, leadShiftFor(at), at.toISOString());
    assert.equal(r.d, shiftDateFor(at), at.toISOString());
    assert.equal(new Date(r.h).toISOString(), lastHandoverAt(at).toISOString(), at.toISOString());
  }
});

test("a lead's shift comes from its submission time and cannot be supplied or edited", async () => {
  const night = await insertTrial("Night Lead", "2026-11-12T02:30:00+05:00");
  assert.equal(night.lead_shift, "night");
  assert.equal(iso(night.shift_date), "2026-11-11");
  const day = await insertTrial("Day Lead", "2026-11-12T08:00:00+05:00");
  assert.equal(day.lead_shift, "day");
  assert.equal(iso(day.shift_date), "2026-11-12");

  await db.query("update public.trial_applications set lead_shift = 'day', shift_date = '2030-01-01', status = 'reviewed' where id = $1", [night.id]);
  const after = await one("select lead_shift, shift_date, status from public.trial_applications where id = $1", [night.id]);
  assert.equal(after.lead_shift, "night");
  assert.equal(iso(after.shift_date), "2026-11-11");
  assert.equal(after.status, "reviewed");
});

test("website submissions are stamped with the current shift", async () => {
  await as("anon");
  const res = await one("select public.submit_contact_message_with_notification($1::jsonb) r", [{
    name: "Shift Parent", email: "shift.contact@example.test", phone: "+15552345678", country: "United States",
    subject: "Class times", message: "Synthetic message for the shift test.", consent: true,
  }]);
  await as("postgres");
  const row = await one("select lead_shift, shift_date, created_at from public.contact_messages where reference = $1", [res.r.reference]);
  assert.equal(row.lead_shift, leadShiftFor(row.created_at));
  assert.equal(iso(row.shift_date), shiftDateFor(row.created_at));
});

test("the 08:00 and 20:00 hand-overs carry only pending leads and are idempotent", async () => {
  await as("postgres");
  const pending = await insertTrial("Pending Night", "2026-11-13T01:00:00+05:00", "new");
  const closed = await insertTrial("Closed Night", "2026-11-13T01:10:00+05:00", "new");
  await db.query("update public.trial_applications set status = 'cancelled' where id = $1", [closed.id]);
  const later = await insertTrial("After Handover", "2026-11-13T08:05:00+05:00", "new");

  const first = await one("select private.run_lead_shift_handover('2026-11-13T09:00:00+05:00') r");
  assert.equal(first.r.to_shift, "day");
  assert.equal(new Date(first.r.handover_at).toISOString(), "2026-11-13T03:00:00.000Z");
  const log = await one("select * from public.lead_shift_handovers where handover_at = '2026-11-13T08:00:00+05:00'");
  assert.equal(log.from_shift, "night");
  assert.equal(iso(log.to_shift_date), "2026-11-13");
  assert.ok(log.trial_ids.includes(pending.id));
  assert.ok(!log.trial_ids.includes(closed.id));
  assert.ok(!log.trial_ids.includes(later.id));
  assert.equal(log.trials_count, log.trial_ids.length);

  const again = await one("select private.run_lead_shift_handover('2026-11-13T19:59:00+05:00') r");
  assert.equal(again.r.already_recorded, true);
  const evening = await one("select private.run_lead_shift_handover('2026-11-13T20:00:00+05:00') r");
  assert.equal(evening.r.to_shift, "night");
  const eveningLog = await one("select trial_ids from public.lead_shift_handovers where handover_at = '2026-11-13T20:00:00+05:00'");
  assert.ok(eveningLog.trial_ids.includes(later.id));

  const version = await one("select version from public.trial_applications where id = $1", [pending.id]);
  assert.equal(version.version, 1, "hand-over must not edit the lead row");
});

test("hand-over log and shift functions are closed to the public", async () => {
  await as("anon");
  await assert.rejects(db.query("select * from public.lead_shift_handovers"), /permission denied/);
  await assert.rejects(db.query("select private.run_lead_shift_handover()"), /permission denied/);
  await as("authenticated");
  await assert.rejects(db.query("select private.run_lead_shift_handover()"), /permission denied/);
  await assert.rejects(db.query("insert into public.lead_shift_handovers (handover_at, from_shift, to_shift, to_shift_date) values (now(), 'day', 'night', current_date)"), /permission denied/);
  const visible = await db.query("select id from public.lead_shift_handovers");
  assert.equal(visible.rows.length, 0, "a signed-in user without trials/contacts permission sees no hand-overs");
});
