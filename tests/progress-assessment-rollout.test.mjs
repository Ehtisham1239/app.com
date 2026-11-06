import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migrationPath = "../supabase/migrations/20261107120000_enforce_all_11_progress_assessment_areas.sql";
const migration = readFileSync(new URL(migrationPath, import.meta.url), "utf8");

test("the owner-directed final assessment migration requires all 11 selectors and accepts Not applicable", () => {
  assert.match(migrationPath, /20261107120000/);
  assert.match(migration, /create or replace function private\\.progress_require_assessment_on_submit/i);
  assert.match(migration, /assessment_areas/);
  for (const area of [
    "qaida_reading", "tajweed", "makharij", "fluency", "hifz_revision",
    "duas", "daily_sunnah", "surahs", "hadith", "namaz", "islamic_knowledge",
  ]) assert.ok(migration.includes(area), `missing required learning area: ${area}`);
  assert.match(migration, /not_applicable/);
  assert.match(migration, /before insert or update of status, details on public\\.monthly_reports/i);
  assert.match(migration, /new\\.details is not distinct from old\\.details/i);
  assert.match(migration, /Complete effort and course-standard selectors for all 11 learning areas/i);
});ort assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migrationPath = "../supabase/migrations/20261107120000_enforce_all_11_progress_assessment_areas.sql";
const migration = readFileSync(new URL(migrationPath, import.meta.url), "utf8");

test("the owner-approved final assessment migration enforces all 11 areas and preserves legacy published reports", () => {
  assert.match(migrationPath, /20261106035103/);
  assert.match(migration, /create or replace function private\.progress_details\(p jsonb\)/i);
  assert.match(migration, /assessment_version/);
  assert.match(migration, /assessment_areas/);
  for (const area of [
    "qaida_reading", "tajweed", "makharij", "fluency", "hifz_revision",
    "duas", "daily_sunnah", "surahs", "hadith", "namaz", "islamic_knowledge",
  ]) assert.ok(migration.includes(area), `missing required learning area: ${area}`);
  assert.match(migration, /not_applicable/);
  assert.match(migration, /before insert or update of status, details on public\.monthly_reports/i);
  assert.match(migration, /old\.status in \('submitted', 'published'\)/i);
  assert.match(migration, /Complete effort and course-standard selectors for all 11 learning areas/i);
});
