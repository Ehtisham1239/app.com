import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("public pricing integrates the approved sibling discount from backend settings", () => {
  const pricing = read("src/app/(site)/pricing/page.jsx");
  const compare = read("src/components/site/fee-compare.jsx");
  const answer = read("src/lib/fee-answer.js");
  const siteData = read("src/lib/site-data.js");

  assert.ok(pricing.includes("familyDiscount={settings[\"site.family_discount\"]}"));
  assert.ok(compare.includes("familyDiscount?.eligible_plan_ids"));
  assert.ok(compare.includes("Apply sibling discount"));
  assert.ok(compare.includes("familyMonthlyEstimate(selectedRow.price.amount_minor, learners, appliedPercent"));
  assert.ok(answer.includes("familyDiscount.percent") && answer.includes("each additional child"));
  assert.ok(siteData.includes("return rows;"));
});
