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

test("organic engine attribution survives navigation without keeping search terms or a referrer URL", () => {
  const data = new Map();
  global.window = { location: { hostname: "www.onlinequrancollege.com", pathname: "/blog/example", search: "" }, sessionStorage: { getItem: k => data.get(k), setItem: (k,v) => data.set(k,v) } };
  global.document = { referrer: "https://www.google.com/search?q=private+search+terms" };
  try {
    assert.deepEqual(captureAttribution(), { utm_source: "google", utm_medium: "organic", attribution_method: "search_referrer", landing_page: "/blog/example" });
    window.location.pathname = "/free-trial";
    document.referrer = "https://www.onlinequrancollege.com/blog/example";
    assert.equal(captureAttribution().landing_page, "/blog/example");
    assert.equal(captureAttribution().utm_medium, "organic");
    assert.equal(JSON.stringify([...data.values()]).includes("private"), false);
    assert.equal(JSON.stringify([...data.values()]).includes("https://"), false);
  } finally { delete global.window; delete global.document; }
});

test("an explicit or retained campaign takes priority over inferred organic source", () => {
  const data = new Map();
  global.window = { location: { hostname: "www.onlinequrancollege.com", pathname: "/", search: "?utm_source=google&utm_medium=cpc&utm_campaign=approved" }, sessionStorage: { getItem: k => data.get(k), setItem: (k,v) => data.set(k,v) } };
  global.document = { referrer: "https://www.google.co.uk/search?q=example" };
  try {
    assert.equal(captureAttribution().utm_medium, "cpc");
    window.location.search = "";
    assert.equal(captureAttribution().utm_medium, "cpc");
    window.location.search = "?utm_source=facebook&utm_medium=paid_social";
    assert.equal(captureAttribution().utm_source, "facebook");
  } finally { delete global.window; delete global.document; }
});

test("unknown, internal, spoofed, malformed and absent referrers do not fabricate organic traffic", () => {
  global.window = { location: { hostname: "www.onlinequrancollege.com", pathname: "/free-trial", search: "" }, sessionStorage: { getItem: () => null, setItem() {} } };
  try {
    for (const referrer of ["", "not a URL", "https://www.onlinequrancollege.com/blog/example", "https://google.com.attacker.test/search", "https://notgoogle.com/search", "https://example.test/", "javascript:alert(1)"]) {
      global.document = { referrer };
      assert.deepEqual(captureAttribution(), {}, referrer);
    }
    for (const [referrer, source] of [["https://www.google.co.uk/", "google"], ["https://www.bing.com/search?q=example", "bing"], ["https://duckduckgo.com/?q=example", "duckduckgo"], ["https://search.yahoo.com/search?p=example", "yahoo"]]) {
      document.referrer = referrer;
      assert.equal(captureAttribution().utm_source, source);
    }
    window.sessionStorage = { getItem() { throw Error("blocked"); }, setItem() { throw Error("blocked"); } };
    document.referrer = "https://www.google.com/search?q=example";
    assert.equal(captureAttribution().utm_medium, "organic");
  } finally { delete global.window; delete global.document; }
});
