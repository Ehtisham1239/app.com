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
    [JSON.stringify([{ grade: "A", min_percent: 85, label: "Excellent" }, { grade: "B", min_percent: 70 }, { grade: "C", min_percent: 0 }])])).id;
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
  await assert.rejects(db.query("select public.results_correct($1, 101, 'A', 'x', 'Mistyped marks')", [result.id]), /between 0 and/);
  await assert.rejects(db.query("select public.results_correct($1, 75, 'Z', 'x', 'Mistyped marks')", [result.id]), /approved scheme/);
  await db.query("select public.results_correct($1, 75, '', 'Reviewed again', 'Mistyped marks')", [result.id]);
  assert.equal((await one("select grade from public.student_results where id=$1", [result.id])).grade, "B", "blank grade uses the bands");
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
  assert.deepEqual(keys, ["assessment", "certificate_id", "course", "date", "grade", "grade_label", "id", "marks", "percentage", "period", "published_at", "remarks", "total"]);
  assert.equal(data[0].results[0].grade_label, "Excellent");
  assert.equal(data[0].code, studentA.student_code, "the parent sees their own child's student code");
  assert.ok(!JSON.stringify(data).includes("CLIENT-") && !JSON.stringify(data).includes(studentC.student_code));

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

test("staff see code status without the hash, and can remove access", async () => {
  await as("authenticated", ids.editor);
  await assert.rejects(db.query("select * from public.guardian_access_status($1)", [[guardianA]]), /guardians:read/);
  await as("authenticated", ids.admin);
  const status = await one("select * from public.guardian_access_status($1)", [[guardianA]]);
  assert.deepEqual(Object.keys(status).sort(), ["guardian_id", "issued_at", "last_sign_in", "locked"]);
  await as("authenticated", ids.editor);
  await assert.rejects(db.query("select public.guardian_revoke_code($1)", [guardianA]), /guardians:update/);
  await as("authenticated", ids.admin);
  await db.query("select public.guardian_revoke_code($1)", [guardianA]);
  assert.equal((await db.query("select * from public.guardian_access_status($1)", [[guardianA]])).rows.length, 0);
  await as("anon");
  await assert.rejects(db.query("select * from public.guardian_access_status($1)", [[guardianA]]), /permission denied/);
});

test("Client IDs remain unique regardless of letter case", async () => {
  await as("authenticated", ids.admin);
  await assert.rejects(db.query("insert into public.guardians (full_name, client_id) values ('Duplicate family', 'client-a1')"), /duplicate key/);
});

test("approved results cannot change when an assessment is edited later", async () => {
  await as("authenticated", ids.admin);
  for (const change of ["total_marks=200", "grade_bands='[]'::jsonb", "period_label='Another term'", "title='Another assessment'"]) {
    await assert.rejects(db.query(`update public.assessments set ${change} where id=$1`, [assessmentId]), /already submitted/);
  }
  // Closing the assessment is still a normal supported operation.
  await db.query("update public.assessments set status='closed' where id=$1", [assessmentId]);
});

test("database rejects invalid or ambiguous grade schemes", async () => {
  await as("authenticated", ids.admin);
  for (const bands of [[{grade:"A",min_percent:101}], [{grade:"A",min_percent:80},{grade:"a",min_percent:60}], [{grade:"A",min_percent:"oops"}], [{grade:"A",min_percent:80},{grade:"B",min_percent:80}]]) {
    await assert.rejects(db.query("insert into public.assessments (code,title,assessment_date,total_marks,grade_bands) values ('BAD-GRADE','Test grading',current_date,100,$1)", [JSON.stringify(bands)]), /grade/i);
  }
});

test("bulk parent upload checks every row and saves all or nothing", async () => {
  const rows = [
    { row_number: 1, client_id: "BULK-100", parent_name: "Bulk Parent One", email: "ONE@example.test", student_code: studentA.student_code, student_name: "" },
    { row_number: 2, client_id: "bulk-100", parent_name: "Bulk Parent One", student_code: "", student_name: "New Bulk Child" },
    { row_number: 3, client_id: "BULK-200", parent_name: "Bulk Parent Two", student_code: "OQC-99999", student_name: "" },
    { row_number: 4, client_id: "x", parent_name: "", student_code: "", student_name: "" },
  ];
  await as("authenticated", ids.editor);
  await assert.rejects(db.query("select public.guardians_bulk_import($1, false)", [JSON.stringify(rows)]), /guardians:create/);

  await as("authenticated", ids.admin);
  const before = (await one("select count(*)::int n from public.guardians")).n;
  const check = (await one("select public.guardians_bulk_import($1, true) r", [JSON.stringify(rows)])).r;
  assert.equal(check.ok, false);
  assert.equal(check.committed, false);
  assert.deepEqual(check.rows.map((r) => r.ok), [true, true, false, false]);
  assert.match(check.rows[2].errors.join(), /Unknown student code/);
  assert.match(check.rows[3].errors.join(), /Client ID/);
  assert.equal((await one("select count(*)::int n from public.guardians")).n, before, "nothing saved when any row fails");

  const good = rows.slice(0, 2);
  const dry = (await one("select public.guardians_bulk_import($1, false) r", [JSON.stringify(good)])).r;
  assert.deepEqual([dry.ok, dry.committed, dry.summary.parents_new, dry.summary.students_new], [true, false, 1, 1]);
  assert.equal((await one("select count(*)::int n from public.guardians")).n, before, "a check saves nothing");

  const saved = (await one("select public.guardians_bulk_import($1, true) r", [JSON.stringify(good)])).r;
  assert.deepEqual([saved.ok, saved.committed, saved.summary.parents_new, saved.summary.students_new, saved.summary.links_new], [true, true, 1, 1, 2]);
  assert.equal(saved.guardian_ids.length, 1);
  const parent = await one("select g.full_name, g.email, (select count(*)::int from public.student_guardians sg where sg.guardian_id=g.id) kids from public.guardians g where g.client_id='BULK-100'");
  assert.deepEqual(parent, { full_name: "Bulk Parent One", email: "one@example.test", kids: 2 });

  const again = (await one("select public.guardians_bulk_import($1, true) r", [JSON.stringify(good)])).r;
  assert.deepEqual([again.summary.parents_new, again.summary.parents_updated, again.summary.students_new, again.summary.links_new], [0, 1, 0, 0], "re-upload does not duplicate");
});

test("bulk code issue covers parents without a code and returns each code once", async () => {
  await as("authenticated", ids.editor);
  await assert.rejects(db.query("select * from public.guardian_issue_codes_bulk(null)"), /guardians:update/);
  await as("authenticated", ids.admin);
  const issued = (await db.query("select * from public.guardian_issue_codes_bulk(null)")).rows;
  assert.ok(issued.some((r) => r.client_id === "BULK-100"));
  for (const r of issued) assert.match(r.code, /^[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
  assert.equal((await db.query("select * from public.guardian_issue_codes_bulk(null)")).rows.length, 0, "second run finds nobody without a code");
  await as("anon");
  const bulk = issued.find((r) => r.client_id === "BULK-100");
  assert.equal((await one("select public.parent_sign_in('bulk-100', $1) r", [bulk.code])).r.ok, true);
  await assert.rejects(db.query("select public.guardians_bulk_import('[]'::jsonb, false)"), /permission denied/);
});

test("bounded code chunks return every credential without a table response cap", async () => {
  await as("authenticated", ids.editor);
  await assert.rejects(db.query("select public.guardian_issue_codes_chunk(null)"), /guardians:update/);
  await as("authenticated", ids.admin);
  await assert.rejects(db.query("select public.guardian_issue_codes_chunk($1)", [Array(21).fill(guardianA)]), /at most 20/);
  for (let i=0;i<21;i++) await db.query("insert into public.guardians(full_name,client_id) values($1,$2)", [`Chunk Parent ${i}`,`CHUNK-${i}`]);
  const first=(await one("select public.guardian_issue_codes_chunk(null) r")).r;
  const second=(await one("select public.guardian_issue_codes_chunk(null) r")).r;
  assert.equal(first.length,20); assert.equal(second.length,1);
  assert.equal(new Set([...first,...second].map(r=>r.guardian_id)).size,21);
  assert.deepEqual((await one("select public.guardian_issue_codes_chunk(null) r")).r,[]);
});
