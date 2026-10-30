// Database tests for monthly report details (marks, attendance, syllabus) used by the
// e-DMC and syllabus card. PGlite with synthetic data only.
import { before, after, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";

const db = new PGlite({ extensions: { pgcrypto } });
const root = new URL("../", import.meta.url);
const sql = (file) => readFileSync(new URL(file, root), "utf8");
const ids = { teacher: "d1111111-1111-4111-8111-111111111111", admin: "d3333333-3333-4333-8333-333333333333" };
async function as(name, id = "") {
  await db.exec(`reset role; set role ${name};`);
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [id]);
}
const one = async (text, params = []) => (await db.query(text, params)).rows[0];
const full = { adab: "excellent", qaida: "good", dua: "good", tajweed: "satisfactory", engagement: "excellent", outcome: "good" };
const period = "2026-10-01";
const details = {
  scores: { adab: "10", qaida: 8, dua: "8.5", tajweed: 6, engagement: 9, outcome: "" },
  attendance: { held: "12", attended: 11 },
  syllabus: { level: "  Noorani Qaida lesson 12 ", covered: "Lessons 10-12; Surah Al-Asr", memorised: "" },
};
let student, guardian, reportId;

before(async () => {
  await db.exec(sql("supabase/tests/local_shim.sql"));
  await db.exec(`alter default privileges in schema public grant all on tables to anon, authenticated, service_role;`);
  for (const file of readdirSync(new URL("supabase/migrations", root)).sort()) {
    if (/20261013000800|20261013001400/.test(file)) continue;
    await db.exec(sql(`supabase/migrations/${file}`));
  }
  for (const [key, role] of [["teacher", "teacher"], ["admin", "admin"]]) {
    await db.query("insert into auth.users (id,email,raw_app_meta_data) values ($1,$2,$3)", [ids[key], `${key}@example.test`, { role }]);
  }
  await db.query("update public.profiles set is_active = true");
  student = await one("insert into public.students (full_name) values ('Detail Pupil') returning id");
  await db.query("insert into public.progress_assignments (teacher_profile_id, student_id) values ($1,$2)", [ids.teacher, student.id]);
  guardian = (await one("insert into public.guardians (full_name, client_id) values ('Detail Parent', 'DET-1') returning id")).id;
  await db.query("insert into public.student_guardians (student_id, guardian_id) values ($1,$2)", [student.id, guardian]);
});
after(async () => { await db.close(); });

test("details are validated and normalised on save", async () => {
  await as("authenticated", ids.teacher);
  for (const [bad, msg] of [
    [{ scores: { adab: 11 } }, /0 to 10/],
    [{ scores: { dua: "abc" } }, /0 to 10/],
    [{ attendance: { held: 10, attended: 12 } }, /cannot be more/],
    [{ attendance: { attended: 3 } }, /classes held before/],
    [{ attendance: { held: "ten" } }, /whole number/],
    [{ attendance: { held: 70 } }, /0 to 62/],
    [{ syllabus: { level: "x".repeat(121) } }, /too long/],
  ]) {
    await assert.rejects(db.query("select public.progress_save($1,$2,$3,'x',false,null,$4)", [student.id, period, full, bad]), msg);
  }
  reportId = (await one("select public.progress_save($1,$2,$3,'Good month',false,'Next: Surah Al-Kawthar',$4) id", [student.id, period, full, details])).id;
  const saved = (await one("select details from public.monthly_reports where id=$1", [reportId])).details;
  assert.deepEqual(saved, {
    scores: { adab: 10, qaida: 8, dua: 8.5, tajweed: 6, engagement: 9 },
    attendance: { held: 12, attended: 11 },
    syllabus: { level: "Noorani Qaida lesson 12", covered: "Lessons 10-12; Surah Al-Asr" },
  });
});

test("omitting details keeps the saved details; the older call shape still works", async () => {
  await as("authenticated", ids.teacher);
  await db.query("select public.progress_save($1,$2,$3,'Good month',false,null)", [student.id, period, full]);
  assert.equal((await one("select details->'attendance'->>'held' h from public.monthly_reports where id=$1", [reportId])).h, "12");
});

test("parents receive details only in the published snapshot", async () => {
  await as("authenticated", ids.teacher);
  await db.query("select public.progress_save($1,$2,$3,'Good month',true,null,$4)", [student.id, period, full, details]);
  await as("authenticated", ids.admin);
  const code = (await one("select public.guardian_issue_code($1) c", [guardian])).c;
  await as("anon");
  const token = (await one("select public.parent_sign_in('det-1',$1) r", [code])).r.token;
  assert.deepEqual((await one("select public.parent_progress($1) d", [token])).d[0].reports, []);
  await as("authenticated", ids.admin);
  await db.query("select public.progress_admin_update($1,$2,'Good month','Checked attendance','Next: Surah Al-Kawthar',$3)",
    [reportId, full, { ...details, attendance: { held: 12, attended: 12 } }]);
  await db.query("select public.progress_publish($1)", [reportId]);
  await as("anon");
  const rep = (await one("select public.parent_progress($1) d", [token])).d[0].reports[0];
  assert.deepEqual(rep.details.attendance, { held: 12, attended: 12 });
  assert.equal(rep.details.scores.adab, 10);
  assert.equal(rep.details.syllabus.level, "Noorani Qaida lesson 12");
  assert.equal(rep.learning_plan, "Next: Surah Al-Kawthar");
});
