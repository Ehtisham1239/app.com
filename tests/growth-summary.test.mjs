import test from "node:test";
import assert from "node:assert/strict";
import { ctrPercent, marketProgress } from "../src/lib/admin/growth-summary.js";

test("ctrPercent computes a one-decimal percentage from real figures", () => {
  assert.equal(ctrPercent(36, 1266), 2.8);
  assert.equal(ctrPercent(0, 500), 0);
  assert.equal(ctrPercent(1, 3), 33.3);
});

test("ctrPercent stays null when clicks or impressions are unknown or unusable", () => {
  assert.equal(ctrPercent(null, 100), null);
  assert.equal(ctrPercent(10, null), null);
  assert.equal(ctrPercent(undefined, undefined), null);
  assert.equal(ctrPercent(5, 0), null);
  assert.equal(ctrPercent(-1, 10), null);
  assert.equal(ctrPercent("x", 10), null);
});

test("marketProgress counts complete and blocked per market and skips empty markets", () => {
  const rows = marketProgress([
    { market: "UK", status: "complete" },
    { market: "UK", status: "planned" },
    { market: "USA", status: "blocked" },
    { market: "Both", status: "complete" },
    { market: "Narnia", status: "planned" },
  ]);
  assert.deepEqual(rows, [
    { market: "UK", total: 2, complete: 1, blocked: 0 },
    { market: "USA", total: 1, complete: 0, blocked: 1 },
    { market: "Both", total: 1, complete: 1, blocked: 0 },
    { market: "Other", total: 1, complete: 0, blocked: 0 },
  ]);
});

test("marketProgress tolerates missing data", () => {
  assert.deepEqual(marketProgress(undefined), []);
  assert.deepEqual(marketProgress([]), []);
});
