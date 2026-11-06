import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const deferredMigration = readFileSync(
  new URL("../supabase/migrations/20261106040000_defer_unapproved_progress_assessment.sql", import.meta.url),
  "utf8",
);
const enforcementMigration = readFileSync(
  new URL("../supabase/migrations/20261107120000_enforce_all_11_progress_assessment_areas.sql", import.meta.url),
  "utf8",
);

test("11-area assessment is explicitly enforced after the temporary rollout deferral", () => {
  assert.match(deferredMigration, /drop trigger if exists monthly_reports_require_assessment_on_submit/i);
  assert.match(deferredMigration, /drop function if exists private\\.progress_require_assessment_on_submit/i);
  assert.match(enforcementMigration, /create trigger monthly_reports_require_assessment_on_submit/i);
  assert.match(enforcementMigration, /before insert or update of status, details on public\\.monthly_reports/i);
  assert.match(enforcementMigration, /'not_applicable'/i);
  assert.match(enforcementMigration, /all 11 learning areas/i);
});
