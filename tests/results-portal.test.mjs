// Database tests for the results portal migration, run in PGlite with synthetic data only.
import { before, after, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";

const db = new PGlite({ extensions: { pgcrypto } });
const root = new URL("../", import.meta.url);
const sql = (file) => readFileSync(new URL(file, root), "utf8");
const ids = {
  academic: "a1111111-1111-4111-8111-111111111111",
  admin: "a2222222-2222-4222-8222-222222222222",
  admin2: "a3333333-3333-4333-8333-333333333333",
  editor: "a4444444-4444-4444-8444-444444444444",
};
const sha = (text) => createHash("sha256").update(text).digest("hex");

async function as(name, id = "") {
  await db.exec(`reset role; set role ${name};`);
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [id]);
}
const one = async (text, params = []) => (await db.query(text, params)).rows[0];

let assessmentId, studentA, studentB, studentC, guardianA, guardianB;

before(async () => {
  await db.exec(sql("supabase/tests/local_shim.sql"));
  // Imitate Supabase's default grants so the migration's revokes are actually exercised.
  await db.exec(`alter default privileges in schema public grant all on tables to anon, authenticated, service_role;`);
  for (const file of readdirSync(new URL("supabase/migrations", root)).sort()) {
    if (/20261013000800|20261013001400/.test(file)) continue;
    await db.exec(sql(`supabase/migrations/${file}`));
  }
  for (const [key, role] of [["academic", "academic"], ["admin", "admin"], ["admin2", "admin"], ["editor", "content_editor"]]) {
    await db.query("insert into auth.users (id,email,raw_app_meta_data) values ($1,$2,$3)", [ids[key], `${key}@example.test`, { role }]);
  }
  // Synthetic students and guardians.
  studentA = (await one("insert into public.students (full_name) values ('Test Learner A') returning id, student_code"));
  studentB = (await one("insert into public.students (full_name) values ('Test Learner B') returning id, student_code"));
  studentC = (await one("insert into public.students (full_name) values ('Test Learner C') returning id, student_code"));
  guardianA = (await one("insert into public.guardians (full_name, client_id) values ('Guardian A', 'CLIENT-A1') returning id")).id;
  guardianB = (await one("insert into public.guardians (full_name, client_id) values ('Guardian B', 'CLIENT-B2') returning id")).id;
  await db.query("insert into public.student_guardians (student_id, guardian_id) values ($1,$2),($3,$2),($4,$5)",
    [studentA.id, guardianA, studentB.id, studentC.id, guardianB]);
});
after(async () => { await db.close(); });

test("anonymous visitors cannot read or write any results table", async () => {
  await as("anon");
  for (const table of ["assessments", "result_import_batches", "result_import_rows", "student_results", "student_result_history"]) {
    await assert.rejects(db.query(`select * from public.${table}`), /permission denied/, table);
  }
  await assert.rejects(db.query("insert into public.assessments (code,title,assessment_date,total_marks) values ('X1','x',current_date,10)"), /permission denied/);
  await assert.rejects(db.query("select public.results_publish_batch(gen_random_uuid())"), /permission denied/);
  await assert.rejects(db.query("select public.guardian_issue_code(gen_random_uuid())"), /permission denied/);
  await assert.rejects(db.query("select * from private.parent_sessions"), /permission denied/);
});

test("staff without results permission cannot see or create assessments", async () => {
  await as("authenticated", ids.editor);
  assert.equal((await db.query("select * from public.assessments")).rows.length, 0);
  await assert.rejects(db.query("insert into public.assessments (code,title,assessment_date,total_marks) values ('X2','x',current_date,10)"), /row-level security/);
});

test("import, validation, review, approval and publication follow the permission model", async () => {
  await as("authenticated", ids.academic);
  assessmentId = (await one(
    "insert into public.assessments (code,title,assessment_date,total_marks,status,grade_bands) values ('TERM1-2026','Term 1 Quran reading','2026-11-01',100,'active',$1) returning id",
    [JSON.stringify([{ grade: "A", min_percent: 85 }, { grade: "B", min_percent: 70 }, { grade: "C", min_percent: 0 }])])).id;
  const batch = (await one("insert into public.result_import_batches (assessment_id, original_filename, file_sha256) values ($1,'term1.csv',$2) returning id",
    [assessmentId, sha("file-1")])).id;
  const rows = [
    [1, studentA.student_code, "Test Learner A", "91", "", "Clear and steady reading"],
    [2, studentB.student_code, "Test Learner B", "72.5", "", "=HYPERLINK(\"x\")"],
    [3, "OQC-99999", "Nobody", "50", "", ""],
    [4, studentC.student_code, "Wrong Name", "40", "", ""],
    [5, studentA.student_code, "Test Learner A", "120", "", ""],
    [6, studentC.student_code, "Test Learner C", "abc", "Z", ""],
  ];
  for (const r of rows) {
    await db.query("insert into public.result_import_rows (batch_id,row_number,student_code,student_name,marks_text,grade,teacher_remarks) values ($1,$2,$3,$4,$5,$6,$7)", [batch, ...r]);
  }
  // Staff cannot mark rows valid or change batch status directly.
  await assert.rejects(db.query("update public.result_import_rows set status='valid' where batch_id=$1", [batch]), /permission denied/);
  await assert.rejects(db.query("update public.result_import_batches set status='approved' where id=$1", [batch]), /permission denied/);

  const counts = (await one("select public.results_validate_batch($1) as c", [batch])).c;
  assert.deepEqual(counts, { total: 6, valid: 1, invalid: 4, duplicate: 1, excluded: 0 });
  const byRow = Object.fromEntries((await db.query("select row_number, status, errors from public.result_import_rows where batch_id=$1", [batch])).rows.map((r) => [r.row_number, r]));
  assert.ok(byRow[3].errors.includes("Unknown student code"));
  assert.ok(byRow[4].errors.includes("Student name does not match the student code"));
  assert.ok(byRow[5].errors.includes("Marks exceed the maximum for this assessment"));
  assert.ok(byRow[6].errors.includes("Marks must be a number") && byRow[6].errors.includes("Grade is not in the approved scheme"));
  assert.equal(byRow[1].status, "duplicate");

  await assert.rejects(db.query("select public.results_submit_batch($1)", [batch]), /Fix or exclude/);
  for (const n of [3, 4, 5, 6]) {
    const rowId = (await one("select id from public.result_import_rows where batch_id=$1 and row_number=$2", [batch, n])).id;
    await db.query("select public.results_set_row_excluded($1, true)", [rowId]);
  }
  await db.query("select public.results_submit_batch($1)", [batch]);
  assert.equal((await one("select status from public.result_import_batches where id=$1", [batch])).status, "ready_for_approval");

  // Academic staff cannot approve or publish; the uploader cannot approve their own batch.
  await assert.rejects(db.query("select public.results_decide_batch($1, true)", [batch]), /results:approve/);
  await assert.rejects(db.query("select public.results_publish_batch($1)", [batch]), /results:publish/);

  await as("authenticated", ids.admin);
  await assert.rejects(db.query("select public.results_publish_batch($1)", [batch]), /Only approved batches/);
  await db.query("select public.results_decide_batch($1, true, 'Checked against the class register')", [batch]);
  assert.equal((await one("select public.results_publish_batch($1) as n", [batch])).n, 2);
  const published = (await db.query("select student_id, marks_obtained::text m, percentage::text p, grade, teacher_remarks from public.student_results where assessment_id=$1 order by marks_obtained desc", [assessmentId])).rows;
  assert.deepEqual(published.map((r) => [r.student_id, r.m, r.p, r.grade]), [[studentA.id, "91.00", "91.00", "A"], [studentB.id, "72.50", "72.50", "B"]]);
  assert.equal(published[1].teacher_remarks, "=HYPERLINK(\"x\")", "remarks are stored as plain text");
  await assert.rejects(db.query("select public.results_publish_batch($1)", [batch]), /Only approved batches/, "publishing is not repeatable");

  // Published results are read-only except through the audited correction function.
  await assert.rejects(db.query("update public.student_results set marks_obtained=100"), /permission denied/);
  const audit = await one("select count(*)::int n from public.audit_logs where entity_type='student_results'");
  assert.ok(audit.n >= 2);
});

test("the same file and a second result for the same student are refused", async () => {
  await as("authenticated", ids.academic);
  await assert.rejects(db.query("insert into public.result_import_batches (assessment_id, original_filename, file_sha256) values ($1,'again.csv',$2)", [assessmentId, sha("file-1")]), /duplicate key/);
  const batch = (await one("insert into public.result_import_batches (assessment_id, original_filename, file_sha256) values ($1,'term1-late.csv',$2) returning id", [assessmentId, sha("file-2")])).id;
  await db.query("insert into public.result_import_rows (batch_id,row_number,student_code,marks_text) values ($1,1,$2,'60')", [batch, studentA.student_code]);
  const counts = (await one("select public.results_validate_batch($1) as c", [batch])).c;
  assert.equal(counts.invalid, 1);
  assert.ok((await one("select errors from public.result_import_rows where batch_id=$1", [batch])).errors.includes("A result already exists for this student; use a correction"));
});

test("corrections keep the previous version and require a reason", async () => {
  await as("authenticated", ids.academic);
  const result = await one("select id, version from public.student_results where student_id=$1", [studentB.id]);
  await assert.rejects(db.query("select public.results_correct($1, 75, 'B', 'Updated', '')", [result.id]), /reason/);
  await assert.rejects(db.query("select public.results_correct($1, 101, 'A', 'x', 'Mistyped marks')", [result.id]), /check constraint/);
  await db.query("select public.results_correct($1, 75, 'B', 'Reviewed again', 'Mistyped marks')", [result.id]);
  const after = await one("select marks_obtained::text m, version from public.student_results where id=$1", [result.id]);
  assert.deepEqual([after.m, after.version], ["75.00", result.version + 1]);
  const history = await one("select version, snapshot->>'marks_obtained' m, reason from public.student_result_history where result_id=$1", [result.id]);
  assert.deepEqual([history.version, history.m, history.reason], [result.version, "72.50", "Mistyped marks"]);
});

let codeA;
test("guardian codes are issued only by permitted staff, hashed, and never returned again", async () => {
  await as("authenticated", ids.editor);
  await assert.rejects(db.query("select public.guardian_issue_code($1)", [guardianA]), /guardians:update/);
  await as("authenticated", ids.admin);
  codeA = (await one("select public.guardian_issue_code($1) as c", [guardianA])).c;
  assert.match(codeA, /^[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
  await db.query("select public.guardian_issue_code($1)", [guardianB]);
  await as("postgres");
  const stored = await one("select code_hash from private.guardian_codes where guardian_id=$1", [guardianA]);
  assert.ok(stored.code_hash.startsWith("$2a$") && !stored.code_hash.includes(codeA.replaceAll("-", "")));
});

test("parent sign-in gives one answer for unknown IDs and wrong codes, and locks after five failures", async () => {
  await as("anon");
  const fail = async (id, code) => assert.deepEqual((await one("select public.parent_sign_in($1,$2) as r", [id, code])).r, { ok: false });
  await fail("NO-SUCH-ID", codeA);
  for (let i = 0; i < 5; i++) await fail("client-a1", "AAAA-AAAA-AAAA");
  await fail("CLIENT-A1", codeA); // locked even with the right code
  await as("postgres");
  await db.query("update private.guardian_codes set locked_until = now() - interval '1 second' where guardian_id=$1", [guardianA]);
  await db.query("delete from private.rate_limits where bucket like 'parent-%'");
  await as("anon");
  const ok = (await one("select public.parent_sign_in($1,$2) as r", ["CLIENT-A1", codeA.toLowerCase()])).r;
  assert.equal(ok.ok, true);
  assert.match(ok.token, /^[0-9a-f]{64}$/);
  globalThis.tokenA = ok.token;
});

test("parents see only their own children's published results and issued certificates", async () => {
  await as("postgres");
  const issued = (await one("insert into public.certificates (student_id,title,status,signed_by) values ($1,'Certificate of Completion','issued','Test Signer') returning id", [studentA.id])).id;
  const draft = (await one("insert into public.certificates (student_id,title,status) values ($1,'Draft certificate','draft') returning id", [studentA.id])).id;
  const revoked = (await one("insert into public.certificates (student_id,title,status) values ($1,'Revoked certificate','revoked') returning id", [studentB.id])).id;
  const otherFamily = (await one("insert into public.certificates (student_id,title,status) values ($1,'Other family','issued') returning id", [studentC.id])).id;
  await db.query("update public.student_results set status='withdrawn' where student_id=$1", [studentB.id]);

  await as("anon");
  const data = (await one("select public.parent_results($1) as d", [globalThis.tokenA])).d;
  assert.deepEqual(data.map((s) => s.name), ["Test Learner A", "Test Learner B"]);
  assert.equal(data[0].results.length, 1);
  assert.equal(data[1].results.length, 0, "withdrawn results are hidden");
  assert.deepEqual(data[0].certificates.map((c) => c.id), [issued]);
  assert.deepEqual(data[1].certificates, []);
  const keys = Object.keys(data[0].results[0]).sort();
  assert.deepEqual(keys, ["assessment", "certificate_id", "course", "date", "grade", "id", "marks", "percentage", "period", "published_at", "remarks", "total"]);
  assert.ok(!JSON.stringify(data).includes("CLIENT-") && !JSON.stringify(data).includes(studentA.student_code));

  assert.equal((await one("select public.parent_certificate($1,$2) as c", [globalThis.tokenA, issued])).c.title, "Certificate of Completion");
  for (const id of [draft, revoked, otherFamily]) {
    assert.equal((await one("select public.parent_certificate($1,$2) as c", [globalThis.tokenA, id])).c, null);
  }
  assert.equal((await one("select public.parent_results($1) as d", ["0".repeat(64)])).d, null);
  assert.equal((await one("select public.parent_results($1) as d", ["not-a-token"])).d, null);
});

test("sessions expire, can be signed out, and end when a new code is issued", async () => {
  await as("postgres");
  await db.query("update private.parent_sessions set last_seen_at = now() - interval '31 minutes'");
  await as("anon");
  assert.equal((await one("select public.parent_results($1) as d", [globalThis.tokenA])).d, null, "idle timeout");

  await as("postgres");
  await db.query("delete from private.rate_limits where bucket like 'parent-%'");
  await as("anon");
  const token = (await one("select public.parent_sign_in('CLIENT-A1',$1) as r", [codeA])).r.token;
  assert.ok((await one("select public.parent_results($1) as d", [token])).d);
  await db.query("select public.parent_sign_out($1)", [token]);
  assert.equal((await one("select public.parent_results($1) as d", [token])).d, null, "signed out");

  const token2 = (await one("select public.parent_sign_in('CLIENT-A1',$1) as r", [codeA])).r.token;
  await as("authenticated", ids.admin);
  await db.query("select public.guardian_issue_code($1)", [guardianA]);
  await as("anon");
  assert.equal((await one("select public.parent_results($1) as d", [token2])).d, null, "re-issued code ends sessions");
});

test("public certificate verification still returns only its fixed fields", async () => {
  await as("postgres");
  const cert = await one("select number from public.certificates where status='issued' and title='Certificate of Completion'");
  await as("anon");
  const result = (await one("select public.verify_certificate($1) as r", [cert.number])).r;
  assert.deepEqual(Object.keys(result).sort(), ["course", "issued_on", "number", "signed_by", "student", "title"]);
});
