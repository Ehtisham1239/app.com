import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateHifzPlan } from "../src/lib/hifz-planner.js";

test("Hifz planner estimates weeks from remaining pages and teacher-agreed daily pace", () => {
  assert.deepEqual(calculateHifzPlan({ remainingPages: 604, studyDaysPerWeek: 5, newPagesPerStudyDay: 2, revisionPages: 30, revisionDaysPerWeek: 6 }), { newPagesPerStudyDay: 2, estimatedStudyDays: 302, estimatedWeeks: 61, revisionPagesPerDay: 5 });
});

test("Hifz planner rejects invalid or unrealistic inputs", () => {
  const base = { remainingPages: 100, studyDaysPerWeek: 5, newPagesPerStudyDay: 1, revisionPages: 0, revisionDaysPerWeek: 5 };
  assert.match(calculateHifzPlan({ ...base, newPagesPerStudyDay: 0 }).error, /1–100/);
  assert.match(calculateHifzPlan({ ...base, studyDaysPerWeek: 8 }).error, /1–7/);
  assert.match(calculateHifzPlan({ ...base, remainingPages: 1.5 }).error, /whole numbers/);
});
