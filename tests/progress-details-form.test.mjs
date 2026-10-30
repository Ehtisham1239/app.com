// Form-side checks for monthly report details; they mirror private.progress_details.
import { test } from "node:test";
import assert from "node:assert/strict";
import { detailsForm, detailsProblem, formToDetails, marksSummary, attendancePercent } from "../src/lib/progress/constants.js";

const form = (patch = {}) => {
  const d = detailsForm();
  for (const [group, values] of Object.entries(patch)) Object.assign(d[group], values);
  return d;
};

test("detailsProblem accepts valid input and rejects what the database rejects", () => {
  assert.equal(detailsProblem(form()), "");
  assert.equal(detailsProblem(form({ scores: { adab: "10", dua: "8.5", qaida: "7.0" }, attendance: { held: "12", attended: "12" } })), "");
  assert.match(detailsProblem(form({ scores: { adab: "11" } })), /Adab must be 0–10/);
  assert.match(detailsProblem(form({ scores: { dua: "8.3" } })), /Dua must be 0–10/);
  assert.match(detailsProblem(form({ scores: { qaida: "abc" } })), /Qaida/);
  assert.match(detailsProblem(form({ attendance: { held: "63" } })), /0 to 62/);
  assert.match(detailsProblem(form({ attendance: { held: "10", attended: "11" } })), /no more than classes held/);
  assert.match(detailsProblem(form({ attendance: { attended: "3" } })), /no more than classes held/);
});

test("formToDetails feeds the e-DMC totals and attendance used in previews", () => {
  const d = formToDetails(form({ scores: { adab: "10", qaida: "8", dua: "8.5", tajweed: "6", engagement: "9", outcome: "7" }, attendance: { held: "12", attended: "11" }, syllabus: { level: "  Lesson 12 ", covered: "" } }));
  assert.deepEqual(d.syllabus, { level: "Lesson 12" });
  assert.deepEqual(marksSummary(d), { given: 6, obtained: 48.5, total: 60, complete: true, percent: 80.8 });
  assert.equal(attendancePercent(d), 92);
  assert.equal(attendancePercent(formToDetails(form({ attendance: { held: "12" } }))), null);
  assert.equal(marksSummary(formToDetails(form({ scores: { adab: "9" } }))).complete, false);
});
