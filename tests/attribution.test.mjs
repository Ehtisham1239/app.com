import { test } from "node:test";
import assert from "node:assert/strict";
import { captureAttribution } from "../src/lib/attribution.js";
import { LOCATIONS, locationPath } from "../src/lib/locations.js";
test("campaign attribution survives navigation and is replaced by a new campaign", () => {
  const data = new Map();
  global.window = { location: { pathname: "/locations/united-kingdom/london", search: "?utm_source=google&utm_medium=cpc&utm_campaign=london" }, sessionStorage: { getItem: (k) => data.get(k), setItem: (k,v) => data.set(k,v) } };
  assert.equal(captureAttribution().utm_campaign, "london");
  window.location = { pathname: "/free-trial", search: "" };
  assert.equal(captureAttribution().utm_campaign, "london");
  assert.equal(captureAttribution().landing_page, "/locations/united-kingdom/london");
  window.location.search = "?utm_source=facebook&utm_campaign=canada";
  assert.equal(captureAttribution().utm_campaign, "canada");
  assert.equal(captureAttribution().utm_medium, undefined);
  for(const [key,value] of data) data.set(key, JSON.stringify({ ...JSON.parse(value), at: Date.now()-86400001 }));
  window.location.search = "";
  assert.deepEqual(captureAttribution(), {});
  delete global.window;
});
test("blocked browser storage does not stop form attribution", () => {
  global.window = { location: { pathname: "/contact", search: "?utm_source=google" }, sessionStorage: { getItem() { throw Error("blocked"); }, setItem() { throw Error("blocked"); } } };
  assert.equal(captureAttribution().utm_source, "google");
  delete global.window;
  assert.deepEqual(captureAttribution(), {});
});
test("all country and city routes are unique with valid currencies and time zones", () => {
  const paths = LOCATIONS.flatMap((c) => [locationPath(c), ...c.cities.map((city) => locationPath(c,city))]);
  assert.equal(paths.length, 165); assert.equal(new Set(paths).size, paths.length);
  for(const c of LOCATIONS) { assert.match(c.currency, /^[A-Z]{3}$/); assert.doesNotThrow(() => new Intl.DateTimeFormat("en", { timeZone: c.timezone })); }
});
