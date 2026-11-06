import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync(
  new URL("../supabase/migrations/20261106040000_defer_unapproved_progress_assessment.sql", import.meta.url),
  "utf8",
);

test("provisional 11-area assessment does not block the established report workflow", () => {
  assert.match(migration, /drop trigger if exists monthly_reports_require_assessment_on_submit/i);
  assert.match(migration, /drop function if exists private\.progress_require_assessment_on_submit/i);
  assert.match(migration, /pending Academic approval/i);
});
