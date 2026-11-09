import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const pricingCards = readFileSync(new URL("../src/components/site/pricing-cards.jsx", import.meta.url), "utf8");
const feeCompare = readFileSync(new URL("../src/components/site/fee-compare.jsx", import.meta.url), "utf8");

test("approximate pricing cards never imply a guaranteed same-day exchange rate", () => {
  assert.match(pricingCards, /latest available exchange rate/i);
  assert.doesNotMatch(pricingCards, /today[’']s rate/i);
});

test("fee comparison labels converted amounts with the latest available exchange rate", () => {
  assert.match(feeCompare, /latest available exchange rate/i);
  assert.doesNotMatch(feeCompare, /today[’']s rate/i);
});
