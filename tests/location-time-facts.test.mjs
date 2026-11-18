import test from "node:test";
import assert from "node:assert/strict";
import { timeFacts, formatOffset } from "../src/lib/location-time-facts.js";
import { LOCATIONS, RESTORED_LOCATION_PATHS, locationTimeZone } from "../src/lib/locations.js";

test("Oslo: CET/CEST offsets and 2027 DST dates", () => {
  const f = timeFacts("Europe/Oslo");
  assert.equal(f.jan, "UTC+01:00"); assert.equal(f.jul, "UTC+02:00");
  assert.deepEqual(f.changes.map((c) => c.date), ["28 March", "31 October"]);
});
test("Dubai has no DST and converts 4 pm to London 12 pm in January, 1 pm in July", () => {
  const f = timeFacts("Asia/Dubai");
  assert.equal(f.observesDst, false);
  const row = f.conversions.find((r) => r.local === "4 pm").zones.find((z) => z.name === "London");
  assert.equal(row.jan, "12 pm"); assert.equal(row.jul, "1 pm");
});
test("southern hemisphere: Sydney is UTC+11 in January and a 7 am lesson is the previous day in New York", () => {
  const f = timeFacts("Australia/Sydney");
  assert.equal(f.jan, "UTC+11:00");
  assert.match(f.conversions[0].zones[1].jan, /previous day/);
});
test("half-hour offsets format correctly", () => assert.equal(formatOffset(330), "UTC+05:30"));
test("every restored page has a valid time zone", () => {
  for (const path of RESTORED_LOCATION_PATHS) {
    const [c, ci] = path.split("/"); const country = LOCATIONS.find((x) => x.slug === c); const city = ci ? country.cities.find((x) => x.slug === ci) : null;
    const tz = locationTimeZone(country, city);
    assert.ok(tz, path); assert.doesNotThrow(() => timeFacts(tz), path);
  }
});
