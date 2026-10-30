// Database tests for monthly progress reports, run in PGlite with synthetic data only.
import { before, after, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";

const db = new PGlite({ extensions: { pgcrypto } });
const root = new URL("../", import.meta.url);
const sql = (file) => readFileSync(new URL(file, root), "utf8");
const ids = {
  teacher: "b1111111-1111-4111-8111-111111111111",
  teacher2: "b2222222-2222-4222-8222-222222222222",
  admin: "b3333333-3333-4333-8333-333333333333",
  editor: "b4444444-4444-4444-8444-444444444444",
};
async function as(name, id = "") {
  await db.exec(`reset role; set role ${name};`);
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [id]);
}
const one = async (text, params = []) => (await db.query(text, params)).rows[0];
const full = { adab: "excellent", qaida: "good", dua: "good", tajweed: "satisfactory", engagement: "excellent", outcome: "good" };
const period = "2026-10-01";
let studentA, studentB, guardian, reportId, token;

before(async () => {
  await db.exec(sql("supabase/tests/local_shim.sql"));
  await db.exec(`alter default privileges in schema public grant all on tables to anon, authenticated, service_role;`);
  for (const file of readdirSync(new URL("supabase/migrations", root)).sort()) {
    if (/20261013000800|20261013001400/.test(file)) continue;
    await db.exec(sql(`supabase/migrations/${file}`));
  }
  for (const [key, role] of [["teacher", "teacher"], ["teacher2", "teacher"], ["admin", "admin"], ["editor", "content_editor"]]) {
    await db.query("insert into auth.users (id,email,raw_app_meta_data) values ($1,$2,$3)", [ids[key], `${key}@example.test`, { role }]);
  }
  await db.query("update public.profiles set is_active = true");
  studentA = await one("insert into public.students (full_name) values ('Test Pupil A') returning id, student_code");
  studentB = await one("insert into public.students (full_name) values ('Test Pupil B') returning id, student_code");
  await db.query("insert into public.progress_assignments (teacher_profile_id, student_id, group_label) values ($1,$2,'Group 1'),($3,$4,'Group 1')",
    [ids.teacher, studentA.id, ids.teacher2, studentB.id]);
  guardian = (await one("insert into public.guardians (full_name, client_id) values ('Test Parent', 'PROG-1') returning id")).id;
  await db.query("insert into public.student_guardians (student_id, guardian_id) values ($1,$2)", [studentA.id, guardian]);
});
after(async () => { await db.close(); });

test("anonymous users and unrelated staff cannot read or write progress data", async () => {
  await as("anon");
  for (const t of ["progress_assignments", "monthly_reports", "monthly_report_history", "student_of_month"]) {
    await assert.rejects(db.query(`select * from public.${t}`), /permission denied/, t);
  }
  await assert.rejects(db.query("select public.progress_save($1,$2,$3,'x',false)", [studentA.id, period, full]), /permission denied/);
  await as("authenticated", ids.editor);
  await assert.rejects(db.query("select * from public.progress_my_students($1)", [period]), /progress:submit/);
  await assert.equal((await db.query("select * from public.monthly_reports")).rows.length, 0);
});

test("a teacher sees and reports on only their assigned students", async () => {
  await as("authenticated", ids.teacher);
  const mine = (await db.query("select * from public.progress_my_students($1)", [period])).rows;
  assert.deepEqual(mine.map((r) => r.full_name), ["Test Pupil A"]);
  await assert.rejects(db.query("select public.progress_save($1,$2,$3,'x',false)", [studentB.id, period, full]), /not assigned/);
  await assert.rejects(db.query("insert into public.monthly_reports (student_id, period) values ($1,$2)", [studentA.id, period]), /permission denied/);
});

test("drafts allow gaps, submit needs all six ratings and remarks, repeats never duplicate", async () => {
  await as("authenticated", ids.teacher);
  reportId = (await one("select public.progress_save($1,$2,$3,'',false) id", [studentA.id, period, { adab: "good" }])).id;
  assert.equal((await one("select status from public.monthly_reports where id=$1", [reportId])).status, "draft");
  await assert.rejects(db.query("select public.progress_save($1,$2,$3,'Fine',true)", [studentA.id, period, { ...full, dua: "" }]), /all six ratings/);
  await assert.rejects(db.query("select public.progress_save($1,$2,$3,'',true)", [studentA.id, period, full]), /all six ratings/);
  await assert.rejects(db.query("select public.progress_save($1,$2,$3,'Fine',false)", [studentA.id, period, { ...full, adab: "perfect" }]), /rating from the list/);
  await assert.rejects(db.query("select public.progress_save($1,$2,$3,'Fine',false)", [studentA.id, "2099-01-01", full]), /current or a past month/);
  const again = (await one("select public.progress_save($1,$2,$3,'Steady progress in recitation.',true) id", [studentA.id, "2026-10-17", full])).id;
  assert.equal(again, reportId, "same student and month is the same report");
  assert.equal((await one("select count(*)::int n from public.monthly_reports")).n, 1);
  await assert.rejects(db.query("select public.progress_save($1,$2,$3,'Changed',false)", [studentA.id, period, full]), /waiting for review/);
  await as("authenticated", ids.teacher2);
  assert.equal((await db.query("select * from public.monthly_reports")).rows.length, 0, "another teacher cannot read it");
});

test("admin can request changes with a reason the teacher sees", async () => {
  await as("authenticated", ids.teacher);
  await assert.rejects(db.query("select public.progress_request_changes($1,'Fix it')", [reportId]), /progress:review/);
  await as("authenticated", ids.admin);
  await assert.rejects(db.query("select public.progress_request_changes($1,'')", [reportId]), /what to change/);
  await db.query("select public.progress_request_changes($1,'Please add a note on dua practice.')", [reportId]);
  await as("authenticated", ids.teacher);
  const r = await one("select status, change_note from public.monthly_reports where id=$1", [reportId]);
  assert.deepEqual(r, { status: "changes_requested", change_note: "Please add a note on dua practice." });
  await db.query("select public.progress_save($1,$2,$3,'Steady progress. Practise duas daily at home.',true)", [studentA.id, period, full]);
  assert.equal((await one("select status from public.monthly_reports where id=$1", [reportId])).status, "submitted");
});

test("drafts and submitted reports never reach parents; publishing does", async () => {
  await as("anon");
  token = (await one("select public.parent_sign_in('PROG-1', $1) r", ["X"])).r.token;
  assert.equal(token, undefined);
  await as("authenticated", ids.admin);
  const code = (await one("select public.guardian_issue_code($1) c", [guardian])).c;
  await as("anon");
  token = (await one("select public.parent_sign_in('prog-1', $1) r", [code])).r.token;
  const before = (await one("select public.parent_progress($1) d", [token])).d;
  assert.deepEqual(before[0].reports, [], "submitted report is not visible");
  await assert.rejects(db.query("select public.progress_publish($1)", [reportId]), /permission denied/);

  await as("authenticated", ids.admin);
  await db.query("select public.progress_admin_update($1,$2,$3,'Corrected tajweed rating')", [reportId, { ...full, tajweed: "good" }, "Steady progress. Practise duas daily at home."]);
  await db.query("select public.progress_publish($1)", [reportId]);
  await db.query("select public.progress_set_award($1,'Group 1',$2)", [period, studentA.id]);
  await as("anon");
  const after = (await one("select public.parent_progress($1) d", [token])).d;
  const rep = after[0].reports[0];
  assert.deepEqual([rep.tajweed, rep.version, rep.student_of_month, rep.period], ["good", 1, true, period]);
  assert.equal(after[0].code, studentA.student_code);
  assert.ok(!("status" in rep));
});

test("a correction keeps the published version visible until republished, with history", async () => {
  await as("authenticated", ids.admin);
  await db.query("select public.progress_admin_update($1,$2,'Revised remark','Teacher asked for a clearer remark')", [reportId, full]);
  await as("anon");
  assert.equal((await one("select public.parent_progress($1) d", [token])).d[0].reports[0].remarks, "Steady progress. Practise duas daily at home.");
  await as("authenticated", ids.admin);
  await db.query("select public.progress_publish($1)", [reportId]);
  await as("anon");
  const rep = (await one("select public.parent_progress($1) d", [token])).d[0].reports[0];
  assert.deepEqual([rep.remarks, rep.version], ["Revised remark", 2]);
  await as("authenticated", ids.admin);
  const actions = (await db.query("select action from public.monthly_report_history where report_id=$1 order by id", [reportId])).rows.map((r) => r.action);
  assert.deepEqual(actions, ["submitted", "changes_requested", "submitted", "edited_before", "published", "edited_before", "published"]);
  await db.query("select public.progress_unpublish($1,'Withdrawn for review')", [reportId]);
  await as("anon");
  assert.deepEqual((await one("select public.parent_progress($1) d", [token])).d[0].reports, []);
  assert.equal((await one("select public.parent_progress($1) d", ["0".repeat(64)])).d, null);
});
