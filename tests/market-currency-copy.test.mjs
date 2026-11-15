import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../src/components/site/location-page.jsx", import.meta.url), "utf8");

test("both market fee messages use the latest available rate and avoid same-day promises", () => {
  assert.equal([...source.matchAll(/at the latest available exchange rate/g)].length, 2);
  assert.doesNotMatch(source, /at today’s (?:exchange )?rate|at today's (?:exchange )?rate/);
});
