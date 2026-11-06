import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migrationPath = "../supabase/migrations/20261106035103_progress_11_area_assessment_enforcement.sql";
const migration = readFileSync(new URL(migrationPath, import.meta.url), "utf8");

test("the production migration requires all 11 areas, accepts Not applicable, and preserves unchanged historical snapshots", () => {
  assert.match(migrationPath, /20261106035103/);
  assert.match(migration, /create or replace function private\.progress_require_assessment_on_submit/i);
  for (const area of [
    "qaida_reading", "tajweed", "makharij", "fluency", "hifz_revision",
    "duas", "daily_sunnah", "surahs", "hadith", "namaz", "islamic_knowledge",
  ]) assert.ok(migration.includes(area), `missing required learning area: ${area}`);
  assert.match(migration, /not_applicable/);
  assert.match(migration, /before insert or update of status, details on public\.monthly_reports/i);
  assert.match(migration, /new\.details is not distinct from old\.details/i);
  assert.match(migration, /new\.status = 'changes_requested'/i);
  assert.match(migration, /new\.published is null/i);
  assert.match(migration, /Complete effort and course-standard selectors for all 11 learning areas/i);
  assert.match(migration, /Invalid effort rating/);
  assert.match(migration, /Invalid course standard/);
});
