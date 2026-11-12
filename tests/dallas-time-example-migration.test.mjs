import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const migration = readFileSync(
  new URL("../supabase/migrations/20261112150000_correct_dallas_pakistan_time_example.sql", import.meta.url),
  "utf8",
);

// Authoritative rule: Dallas is UTC-5 (CDT) / UTC-6 (CST); Pakistan is UTC+5 all year.
const pakistanHour = (dallasHour, dallasOffset) => (dallasHour - dallasOffset + 5 + 24) % 24;

test("the corrected example matches the UTC offsets", () => {
  assert.equal(pakistanHour(17, -5), 3);
  assert.equal(pakistanHour(17, -6), 4);
  assert.match(migration, /corresponds to 3:00 am in Pakistan during CDT or 4:00 am during CST, on the following day/);
});

test("the migration targets only the Dallas page's reversed sentence", () => {
  assert.match(migration, /slug = 'locations-united-states-dallas'/);
  assert.match(migration, /4:00 am in Pakistan during CDT or 3:00 am during CST on the relevant date/);
  assert.doesNotMatch(migration, /seo_noindex\s*=|pricing_plan_prices|sibling discount/i);
});
