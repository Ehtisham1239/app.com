import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const migration = readFileSync(
  new URL("../supabase/migrations/20261110060000_correct_canada_australia_market_fee_copy.sql", import.meta.url),
  "utf8",
);

test("Canada market copy reflects the currently approved USD quote currency", () => {
  assert.match(migration, /slug = 'locations-canada'/);
  assert.match(migration, /Request approved fees in CAD before enrolling/);
  assert.match(migration, /Canadian fees: USD quotes and currency guidance/);
  assert.match(migration, /OQC currently quotes Canadian learners in USD/);
  assert.match(migration, /country=Canada&amp;currency=USD/);
  assert.match(migration, /CAD conversion to plan your budget, treat it as an estimate only/);
});

test("Australia market copy avoids promising a same-day exchange rate", () => {
  assert.match(migration, /slug = 'locations-australia'/);
  assert.match(migration, /at today’s exchange rate/);
  assert.match(migration, /at the latest available exchange rate/);
});

test("Sydney's example converts AEDT and AEST to Pakistan correctly", () => {
  assert.match(migration, /slug = 'locations-australia-sydney'/);
  assert.match(migration, /5:00 pm Sydney lesson corresponds to 12:00 pm in Pakistan during AEDT/);
  assert.match(migration, /11:00 am in Pakistan during AEDT and 12:00 pm during AEST/);
  assert.match(migration, /nsw\.gov\.au\/about-nsw\/daylight-saving/);
});

test("market copy migration does not change indexation, prices, discounts or trial eligibility", () => {
  assert.doesNotMatch(migration, /seo_noindex\s*=|pricing_plan_prices|sibling discount|free trial/i);
});
