import { test } from "node:test";
import assert from "node:assert/strict";
import { familyMonthlyEstimate, perClassEstimate, planPrice } from "../src/lib/fee-estimate.js";

const plan = { billing_period: "monthly", classes_per_week: 3, prices: [{ currency: "USD", amount_minor: 4000 }] };

test("per-class estimate divides the monthly fee across a 4-week month", () => {
  assert.equal(planPrice(plan, "USD"), 4000);
  assert.equal(planPrice(plan, "GBP"), null);
  assert.equal(perClassEstimate(plan, "USD"), 333);
  assert.equal(perClassEstimate({ ...plan, billing_period: "one_time" }), null);
  assert.equal(perClassEstimate({ ...plan, classes_per_week: 0 }), null);
});

test("family estimate charges the first learner in full and discounts each sibling by 15%", () => {
  assert.deepEqual(familyMonthlyEstimate(4000, 1), { learners: 1, total: 4000, saving: 0 });
  assert.deepEqual(familyMonthlyEstimate(4000, 3), { learners: 3, total: 4000 + 3400 * 2, saving: 1200 });
  assert.equal(familyMonthlyEstimate(4000, 99).learners, 10);
  assert.equal(familyMonthlyEstimate(null, 2), null);
});
