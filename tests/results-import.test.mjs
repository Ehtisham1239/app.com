import test from "node:test";
import assert from "node:assert/strict";
import { deflateRawSync, crc32 } from "node:zlib";
import { gradeFor, mapResultRows, normalizeGradeBands, parseCsv, parseXlsx, previewIssues, readResultsFile, toImportRows } from "../src/lib/results/import.js";

// Synthetic data only.
const assessment = { code: "TERM1-2026", total_marks: 100, grade_bands: [{ grade: "A", min_percent: 85 }, { grade: "B", min_percent: 70 }] };

test("CSV: BOM, quotes, embedded commas/newlines, CRLF and blank lines", () => {
  const rows = parseCsv('﻿student_code,marks_obtained,teacher_remarks\r\nOQC-00001,91,"Good, steady ""tajweed""\nkeep going"\r\n\r\nOQC-00002,70,\r\n');
  assert.deepEqual(rows, [["student_code", "marks_obtained", "teacher_remarks"], ["OQC-00001", "91", 'Good, steady "tajweed"\nkeep going'], ["OQC-00002", "70", ""]]);
});

test("CSV: semicolon-separated files from some Excel locales", () => {
  assert.deepEqual(parseCsv("student_code;marks\nOQC-1;5"), [["student_code", "marks"], ["OQC-1", "5"]]);
});

test("CSV: an unclosed quote is reported, not silently accepted", () => {
  assert.throws(() => parseCsv('a,b\n"x,1'), /unclosed quotation/);
});

test("mapping: header aliases, upper-cased codes, required columns", () => {
  const { rows } = mapResultRows([["Student Code", "Name", "Marks", "Remarks"], [" oqc-00007 ", "Test  Learner", "88.5", "  Fine  "]]);
  assert.deepEqual(rows[0], { row_number: 1, assessment_code: "", student_code: "OQC-00007", student_name: "Test Learner", marks_obtained: "88.5", total_marks: "", grade: "", teacher_remarks: "Fine" });
  assert.throws(() => mapResultRows([["name", "marks"], ["x", "1"]]), /student_code/);
  assert.throws(() => mapResultRows([["student_code", "marks"]]), /no results/);
});

test("mapping: a column holding parent access codes is refused", () => {
  assert.throws(() => mapResultRows([["student_code", "marks", "Client Code"], ["OQC-1", "1", "ABCD"]]), /access codes must never/);
});

test("ambiguous columns and oversized remarks are refused without dropping data", () => {
  assert.throws(() => mapResultRows([["student_code", "marks", "score"], ["OQC-1", "60", "90"]]), /more than one marks_obtained column/);
  assert.throws(() => mapResultRows([["student_code", "marks", "remarks"], ["OQC-1", "60", "x".repeat(1001)]]), /no text has been removed/);
});

test("upload refuses a mismatched assessment or total before dropping preview-only columns", () => {
  const row = { row_number: 1, student_code: "OQC-1", grade: "", marks_obtained: "60", assessment_code: "OTHER" };
  assert.throws(() => toImportRows([row], "batch", assessment), /assessment code does not match/);
  assert.throws(() => toImportRows([{ ...row, assessment_code: "TERM1-2026", total_marks: "200" }], "batch", assessment), /total marks do not match/);
  assert.throws(() => normalizeGradeBands([{grade:"A",min_percent:80},{grade:"B",min_percent:80}]), /different minimum/);
});

test("preview checks match the database rules", () => {
  const base = { student_code: "OQC-1", marks_obtained: "90", assessment_code: "", total_marks: "", grade: "" };
  assert.deepEqual(previewIssues(base, assessment), []);
  assert.deepEqual(previewIssues({ ...base, marks_obtained: "abc" }, assessment), ["Marks must be a number"]);
  assert.deepEqual(previewIssues({ ...base, marks_obtained: "101" }, assessment), ["Marks exceed the maximum for this assessment"]);
  assert.deepEqual(previewIssues({ ...base, marks_obtained: "=1+1" }, assessment), ["Marks must be a number"]);
  assert.deepEqual(previewIssues({ ...base, grade: "Z" }, assessment), ["Grade is not in the approved scheme"]);
  assert.deepEqual(previewIssues({ ...base, assessment_code: "OTHER" }, assessment), ["Assessment code is not TERM1-2026"]);
  assert.deepEqual(previewIssues({ ...base, student_code: "" }, assessment), ["Student code is missing"]);
});

test("rows sent to the database contain only stored columns", () => {
  const out = toImportRows([{ row_number: 3, assessment_code: "X", student_code: "OQC-1", student_name: "N", marks_obtained: "5", total_marks: "10", grade: "a", teacher_remarks: "r" }], "batch");
  assert.deepEqual(out, [{ batch_id: "batch", row_number: 3, student_code: "OQC-1", student_name: "N", marks_text: "5", grade: "A", teacher_remarks: "r" }]);
});

test("grade bands are validated and sorted", () => {
  assert.deepEqual(normalizeGradeBands([{ grade: "b", min_percent: "70" }, { grade: "A", min_percent: 85, label: "Excellent" }, { grade: "", min_percent: "", label: "" }]),
    [{ grade: "A", min_percent: 85, label: "Excellent" }, { grade: "B", min_percent: 70 }]);
  assert.throws(() => normalizeGradeBands([{ grade: "A", min_percent: 120 }]), /between 0 and 100/);
  assert.throws(() => normalizeGradeBands([{ grade: "A", min_percent: 90 }, { grade: "a", min_percent: 80 }]), /only once/);
  assert.equal(gradeFor(assessment.grade_bands, 86), "A");
  assert.equal(gradeFor(assessment.grade_bands, 50), "");
});

// Minimal .xlsx builder: a zip of the XML parts Excel writes.
function zip(files) {
  const locals = [], centrals = [];
  let offset = 0;
  for (const [name, text] of Object.entries(files)) {
    const data = Buffer.from(text), packed = deflateRawSync(data), nameBuf = Buffer.from(name), crc = crc32(data);
    const local = Buffer.alloc(30); local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4); local.writeUInt16LE(8, 8);
    local.writeUInt32LE(crc, 14); local.writeUInt32LE(packed.length, 18); local.writeUInt32LE(data.length, 22); local.writeUInt16LE(nameBuf.length, 26);
    const central = Buffer.alloc(46); central.writeUInt32LE(0x02014b50, 0); central.writeUInt16LE(20, 6); central.writeUInt16LE(8, 10);
    central.writeUInt32LE(crc, 16); central.writeUInt32LE(packed.length, 20); central.writeUInt32LE(data.length, 24); central.writeUInt16LE(nameBuf.length, 28); central.writeUInt32LE(offset, 42);
    locals.push(local, nameBuf, packed); centrals.push(central, nameBuf);
    offset += 30 + nameBuf.length + packed.length;
  }
  const dir = Buffer.concat(centrals), end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(Object.keys(files).length, 8); end.writeUInt16LE(Object.keys(files).length, 10); end.writeUInt32LE(dir.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, dir, end]);
}

const workbook = (sheet) => zip({
  "xl/workbook.xml": '<workbook xmlns:r="r"><sheets><sheet name="Results" sheetId="1" r:id="rId1"/></sheets></workbook>',
  "xl/_rels/workbook.xml.rels": '<Relationships><Relationship Id="rId1" Type="worksheet" Target="worksheets/sheet1.xml"/></Relationships>',
  "xl/sharedStrings.xml": '<sst><si><t>student_code</t></si><si><t>marks_obtained</t></si><si><t>teacher_remarks</t></si><si><t>OQC-00003</t></si><si><r><t>Very </t></r><r><t>good &amp; clear</t></r></si></sst>',
  "xl/worksheets/sheet1.xml": sheet,
});

test("XLSX: shared and rich strings, numbers, sparse cells", async () => {
  const sheet = '<worksheet><sheetData><row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c><c r="C1" t="s"><v>2</v></c></row>'
    + '<row r="2"><c r="A2" t="s"><v>3</v></c><c r="B2"><v>85.299999999999997</v></c><c r="C2" t="s"><v>4</v></c></row>'
    + '<row r="3"><c r="A3" t="inlineStr"><is><t>OQC-00004</t></is></c><c r="C3" t="str"><v>=SUM(1)</v></c></row></sheetData></worksheet>';
  const rows = await parseXlsx(workbook(sheet));
  assert.deepEqual(rows, [["student_code", "marks_obtained", "teacher_remarks"], ["OQC-00003", "85.3", "Very good & clear"], ["OQC-00004", "", "=SUM(1)"]]);
});

test("XLSX: a non-workbook and an oversized part are refused", async () => {
  await assert.rejects(parseXlsx(Buffer.from("not a zip")), /not a valid .xlsx/);
  await assert.rejects(parseXlsx(zip({ "a.txt": "x" })), /not an Excel workbook/);
  const bomb = zip({ "xl/workbook.xml": "<workbook><sheets><sheet r:id=\"rId1\"/></sheets></workbook>", "xl/worksheets/sheet1.xml": "<worksheet>" + " ".repeat(30 * 1024 * 1024) + "</worksheet>" });
  await assert.rejects(parseXlsx(bomb), /too large/);
});

test("readResultsFile: type, size and hash", async () => {
  const file = new File(["student_code,marks_obtained\nOQC-00001,77\n"], "term1.csv", { type: "text/csv" });
  const out = await readResultsFile(file);
  assert.equal(out.rows.length, 1);
  assert.match(out.sha256, /^[0-9a-f]{64}$/);
  await assert.rejects(readResultsFile(new File(["x"], "old.xls")), /Save the sheet as .xlsx or CSV/);
  await assert.rejects(readResultsFile(new File(["x"], "notes.pdf")), /Upload a .csv or .xlsx/);
  await assert.rejects(readResultsFile(new File([new Uint8Array(2 * 1024 * 1024 + 1)], "big.csv")), /larger than 2 MB/);
});

test("parents sheet: aliases, one row per child, refuses an access code column", async () => {
  const { mapClientRows, clientRowIssues, toClientPayload } = await import("../src/lib/results/clients-import.js");
  const rows = mapClientRows([["Client ID", "Parent Name", "E-mail", "Student Code", "Child Name"], [" c-1 ", "Test  Parent", "A@Example.TEST", "oqc-00001", ""], ["c-1", "Test Parent", "", "", "New Child"]]);
  assert.deepEqual(rows[0], { row_number: 1, client_id: "c-1", parent_name: "Test Parent", relationship: "", email: "a@example.test", phone: "", student_code: "OQC-00001", student_name: "" });
  assert.equal(rows[1].student_name, "New Child");
  assert.deepEqual(clientRowIssues(rows[0]), []);
  assert.deepEqual(clientRowIssues({ ...rows[0], client_id: "x", parent_name: "", email: "bad" }), ["Client ID: 3–64 letters, numbers, dots, dashes or underscores", "Parent name is missing", "Email is not valid"]);
  assert.deepEqual(Object.keys(toClientPayload(rows)[0]).sort(), ["client_id", "email", "parent_name", "phone", "relationship", "row_number", "student_code", "student_name"]);
  assert.throws(() => mapClientRows([["client_id", "parent_name", "Access Code"], ["c-1", "P", "X"]]), /never uploaded/);
  assert.throws(() => mapClientRows([["parent_name"], ["P"]]), /client_id/);
  assert.throws(() => mapClientRows([["client_id", "parent_name"], ["x".repeat(65), "Example Parent"]]), /no text has been removed/);
  assert.throws(() => mapClientRows([["client_id", "parent_name", "name"], ["C-1", "First", "Second"]]), /more than one parent_name/);
});
