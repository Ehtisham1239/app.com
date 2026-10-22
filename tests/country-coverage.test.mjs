import { test } from "node:test";
import assert from "node:assert/strict";
import { COUNTRIES } from "../src/lib/constants.js";
import { LOCATIONS } from "../src/lib/locations.js";
test("all supported location countries are available once in forms", () => {
  const names = COUNTRIES.map(([name]) => name);
  assert.equal(new Set(names).size, names.length);
  for (const country of LOCATIONS) assert.ok(names.includes(country.name), country.name);
  assert.equal(names.at(-1), "Other");
  const zones = new Map(COUNTRIES);
  assert.equal(zones.get("Portugal"), "Europe/Lisbon");
  assert.equal(zones.get("United Kingdom"), "Europe/London");
  assert.equal(zones.get("United States"), "America/New_York");
});
