import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../src/components/site/location-page.jsx", import.meta.url), "utf8");

test("market fee guidance describes approximate conversions using the latest available rate", () => {
  assert.match(source, /at the latest available exchange rate/g);
  assert.doesNotMatch(source, /at today’s (?:exchange )?rate|at today's (?:exchange )?rate/);
});
