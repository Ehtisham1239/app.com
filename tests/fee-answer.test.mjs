import { test } from "node:test";
import assert from "node:assert/strict";
import { feeAnswer, FEE_QUESTION } from "../src/lib/fee-answer.js";

const fx = { base: "USD", rates: { USD: 1, GBP: 0.75 } };
const plans = [
  { name: "Package 1", classes_per_week: 2, duration_min: 30, prices: [{ currency: "USD", amount_minor: 3000 }] },
  { name: "Package 4", classes_per_week: 4, duration_min: 30, prices: [{ currency: "USD", amount_minor: 5000 }] },
  { name: "Weekend", classes_per_week: 2, duration_min: 30, prices: [{ currency: "USD", amount_minor: 4000 }] },
];

test("answer gives the published USD range and an approximate pounds range", () => {
  const result = feeAnswer(plans, fx, "GBP");
  assert.equal(result.question, FEE_QUESTION);
  assert.deepEqual(result.usd, [3000, 5000]);
  assert.deepEqual(result.local, [2300, 3800]);
  assert.equal(result.approximate, true);
  assert.match(result.answer, /US\$30 to US\$50 for 2 to 4 live one-to-one 30-minute classes a week/);
  assert.match(result.answer, /about £23 to £38 a month at the latest available exchange rate/);
  assert.match(result.answer, /Weekend plan is excluded/);
  assert.doesNotMatch(result.answer, /sibling discount|family discount|15% off/i);
});

test("approved pounds prices win and are not called approximate", () => {
  const approved = plans.map((p) => ({ ...p, prices: [...p.prices, { currency: "GBP", amount_minor: p.prices[0].amount_minor - 500 }] }));
  const result = feeAnswer(approved, fx, "GBP");
  assert.equal(result.approximate, false);
  assert.match(result.answer, /In the UK that is £25 to £45 a month\./);
});

test("without exchange rates the pounds sentence is left out, not guessed", () => {
  const result = feeAnswer(plans, null, "GBP");
  assert.equal(result.local, null);
  assert.doesNotMatch(result.answer, /£/);
  assert.match(result.answer, /US\$30 to US\$50/);
});

test("no published prices means no answer block", () => {
  assert.equal(feeAnswer([], fx), null);
  assert.equal(feeAnswer([{ name: "Package 1", prices: [] }], fx), null);
});

test("fee answer uses the configured sibling discount from backend settings", () => {
  const result = feeAnswer(plans, fx, "GBP", "the UK", { enabled: true, percent: 15 });
  assert.match(result.answer, /15% off each additional child/);
  const disabled = feeAnswer(plans, fx, "GBP", "the UK", { enabled: false, percent: 15 });
  assert.doesNotMatch(disabled.answer, /sibling discount/i);
});
