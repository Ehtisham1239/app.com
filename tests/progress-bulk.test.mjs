import test from "node:test";
import assert from "node:assert/strict";
import {
  ASSESSMENT_AREAS, CATEGORIES, detailsForm, formToDetails, missingForSubmit,
} from "../src/lib/progress/constants.js";
import {
  PROGRESS_BULK_COLUMNS, normalizeProgressBulkHeader, progressBulkPayload,
  progressBulkTemplateRows, validateProgressBulkRows,
} from "../src/lib/progress/bulk.js";

const ratings = Object.fromEntries(CATEGORIES.map((category) => [category.key, "good"]));
const assigned = [{ student_id: "student-1", student_code: "OQC-0001", status: "draft" }];
function validRow() {
  const row = Object.fromEntries(PROGRESS_BULK_COLUMNS.map(({ key }) => [key, ""]));
  row.student_code = "OQC-0001";
  row.remarks = "Learner practised the assigned reading and revision.";
  for (const area of ASSESSMENT_AREAS) {
    row[area.key + "_effort"] = "not_applicable";
    row[area.key + "_standard"] = "not_applicable";
  }
  return row;
}

test("the monthly rubric has exactly 11 required learning areas", () => {
  assert.equal(ASSESSMENT_AREAS.length, 11);
  assert.equal(new Set(ASSESSMENT_AREAS.map((area) => area.key)).size, 11);
});

test("all 11 areas require both selectors, and Not applicable satisfies each selector", () => {
  const blank = detailsForm(null);
  assert.equal(blank.assessment_version, 1);
  assert.equal(missingForSubmit(ratings, "Teacher remark", blank, true).length, 22);
  const areas = Object.fromEntries(ASSESSMENT_AREAS.map((area) => [area.key, {
    effort: "not_applicable", standard: "not_applicable",
  }]));
  const details = { ...blank, assessment_version: 1, assessment_areas: areas };
  assert.deepEqual(missingForSubmit(ratings, "Teacher remark", details, true), []);
  const saved = formToDetails(details);
  assert.equal(saved.assessment_areas.qaida_reading.effort, "not_applicable");
  assert.equal(saved.assessment_areas.islamic_knowledge.standard, "not_applicable");
});

test("legacy reports stay distinguishable from new assessment-version reports", () => {
  const legacy = detailsForm({ scores: { adab: 8 } });
  assert.equal(legacy.assessment_version, null);
  assert.deepEqual(missingForSubmit(ratings, "Teacher remark", legacy, false), []);
  assert.equal(missingForSubmit(ratings, "Teacher remark", legacy, true).length, 22);
});

test("Excel CSV UTF-8 BOM is stripped from the first heading", () => {
  assert.equal(normalizeProgressBulkHeader("\uFEFFstudent_code"), "student_code");
  assert.equal(normalizeProgressBulkHeader("Qaida Reading-Effort"), "qaida_reading_effort");
});

test("bulk template includes all 11 areas and the current required selectors", () => {
  const template = progressBulkTemplateRows();
  assert.equal(template.length, 1);
  for (const area of ASSESSMENT_AREAS) {
    assert.ok(Object.hasOwn(template[0], area.key + "_effort"));
    assert.ok(Object.hasOwn(template[0], area.key + "_standard"));
  }
});

test("bulk validation accepts Not applicable but rejects missing selectors and unassigned students", () => {
  const row = validRow();
  assert.deepEqual(validateProgressBulkRows([row], assigned)[0].issues, []);
  const missing = validRow();
  missing.tajweed_effort = "";
  assert.ok(validateProgressBulkRows([missing], assigned)[0].issues.some((issue) => issue.includes("Tajweed: effort")));
  const unknown = validRow();
  unknown.student_code = "OQC-9999";
  assert.ok(validateProgressBulkRows([unknown], assigned)[0].issues.some((issue) => issue.includes("not in your assigned roster")));
});

test("bulk validation blocks duplicate and already-submitted student rows", () => {
  const row = validRow();
  assert.ok(validateProgressBulkRows([row, row], assigned)[1].issues.some((issue) => issue.includes("Duplicate student code")));
  assert.ok(validateProgressBulkRows([row], [{ ...assigned[0], status: "submitted" }])[0].issues.some((issue) => issue.includes("already submitted")));
});

test("bulk payload preserves the 11-area version and Not applicable values", () => {
  const payload = progressBulkPayload(validRow());
  assert.equal(payload.details.assessment_version, 1);
  assert.equal(Object.keys(payload.details.assessment_areas).length, 11);
  assert.equal(payload.details.assessment_areas.qaida_reading.effort, "not_applicable");
  assert.equal(payload.details.assessment_areas.namaz.standard, "not_applicable");
});
