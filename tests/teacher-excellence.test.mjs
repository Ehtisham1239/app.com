import { before, after, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";

const db = new PGlite({ extensions: { pgcrypto } });
const root = new URL("../", import.meta.url);
const trainerId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const teacherUserId = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const sql = (file) => readFileSync(new URL(file, root), "utf8");
async function role(name = "postgres", id = "") {
  await db.exec(`reset role; set role ${name};`);
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [id]);
}

before(async () => {
  await db.exec(sql("supabase/tests/local_shim.sql"));
  for (const file of readdirSync(new URL("supabase/migrations", root)).sort()) {
    if (/20261013000800|20261013001400/.test(file)) continue;
    await db.exec(sql(`supabase/migrations/${file}`));
  }
  await db.query("insert into auth.users (id,email,raw_app_meta_data) values ($1,$2,$3),($4,$5,$6)", [
    trainerId, "trainer@example.test", { role: "master_trainer" },
    teacherUserId, "teacher@example.test", { role: "teacher" },
  ]);
  await db.query("update public.profiles set role='master_trainer',is_active=true where id=$1", [trainerId]);
  await db.query("update public.profiles set role='teacher',is_active=true where id=$1", [teacherUserId]);
  const a = (await db.query("insert into public.teachers(slug,display_name) values ('trainer-test','Trainer Test') returning id")).rows[0].id;
  const b = (await db.query("insert into public.teachers(slug,display_name) values ('teacher-test','Teacher Test') returning id")).rows[0].id;
  await db.query("update public.profiles set teacher_id=$1 where id=$2", [b, teacherUserId]);
  globalThis.__teacherIds = { a, b };
});
after(async () => { await db.close(); });

test("Master Trainer can assign actual roles and multiple subjects", async () => {
  await role("authenticated", trainerId);
  const { a } = globalThis.__teacherIds;
  await db.query("insert into public.teacher_role_assignments(teacher_id,role_title,responsibilities) values ($1,'Senior Hifz Mentor','Mentors Hifz teachers')", [a]);
  await db.query("insert into public.teacher_subject_assignments(teacher_id,subject_name,rubric) values ($1,'Tajweed',$2),($1,'Hifz',$3)", [
    a,
    { quran_accuracy: { weight: 50, label: "Quran accuracy" }, tajweed_rules: { weight: 50, label: "Tajweed rules" } },
    { memorisation_accuracy: { weight: 60, label: "Memorisation accuracy" }, revision_retention: { weight: 40, label: "Revision retention" } },
  ]);
  assert.equal((await db.query("select count(*)::int as n from public.teacher_subject_assignments where teacher_id=$1", [a])).rows[0].n, 2);
});

test("subject assessment preserves its own rubric and critical Quran accuracy flag", async () => {
  await role("authenticated", trainerId);
  const { a } = globalThis.__teacherIds;
  const subject = (await db.query("select id,rubric from public.teacher_subject_assignments where teacher_id=$1 and subject_name='Tajweed'", [a])).rows[0];
  await db.query("insert into public.teacher_assessments(teacher_id,subject_assignment_id,dimension_scores,rubric_snapshot,overall_score,critical_quran_accuracy_issue,status) values ($1,$2,$3,$4,72,true,'action_required')", [
    a, subject.id, { quran_accuracy: 3, tajweed_rules: 4 }, subject.rubric,
  ]);
  const row = (await db.query("select rubric_snapshot,critical_quran_accuracy_issue,status from public.teacher_assessments where subject_assignment_id=$1", [subject.id])).rows[0];
  assert.equal(row.rubric_snapshot.quran_accuracy.weight, 50);
  assert.equal(row.critical_quran_accuracy_issue, true);
  assert.equal(row.status, "action_required");
  const escalated = (await db.query("select priority,status,assessment_id from public.teacher_issues where assessment_id=(select id from public.teacher_assessments where subject_assignment_id=$1)", [subject.id])).rows[0];
  assert.equal(escalated.priority, "P1");
  assert.equal(escalated.status, "escalated");
});

test("teacher self-service can read only their own subject assignments and assessments", async () => {
  await role("authenticated", trainerId);
  const { a, b } = globalThis.__teacherIds;
  await db.query("insert into public.teacher_subject_assignments(teacher_id,subject_name) values ($1,'Qaida')", [b]);
  const ownSubject = (await db.query("select id from public.teacher_subject_assignments where teacher_id=$1", [b])).rows[0];
  await db.query("insert into public.teacher_assessments(teacher_id,subject_assignment_id,overall_score) values ($1,$2,80)", [b, ownSubject.id]);
  await role("authenticated", teacherUserId);
  assert.equal((await db.query("select count(*)::int as n from public.teacher_subject_assignments")).rows[0].n, 1);
  assert.equal((await db.query("select count(*)::int as n from public.teacher_assessments")).rows[0].n, 1);
  assert.equal((await db.query("select count(*)::int as n from public.teacher_issues")).rows[0].n, 0);
});
