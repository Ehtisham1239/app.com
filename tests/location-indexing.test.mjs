import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { LOCATIONS, INDEXED_MARKETS, APPROVED_CITY_PAGES, locationIndexRecord } from "../src/lib/locations.js";

// Pathway decision 26–28 Oct 2026: only the five approved country hubs are indexed by default.
test("without a CMS row only the five approved country hubs are indexable", () => {
  const indexable = LOCATIONS.flatMap((country) => [null, ...country.cities].filter((city) => !locationIndexRecord(undefined, country, city).seo_noindex).map((city) => city ? `${country.slug}/${city.slug}` : country.slug));
  assert.deepEqual(indexable.sort(), [...INDEXED_MARKETS].sort());
});

test("only owner-approved city pages can be indexed, and only with an explicit CMS opt-in", () => {
  for (const country of LOCATIONS) {
    for (const city of country.cities) {
      const key = `${country.slug}/${city.slug}`;
      const approved = APPROVED_CITY_PAGES.includes(key);
      assert.equal(locationIndexRecord({ seo_noindex: false }, country, city).seo_noindex, !approved, `${key} with CMS opt-in`);
      assert.equal(locationIndexRecord({ seo_noindex: true }, country, city).seo_noindex, true, `${key} with CMS noindex`);
      assert.equal(locationIndexRecord(undefined, country, city).seo_noindex, true, `${key} without a CMS row`);
    }
  }
});

test("the approved city list is the ten US and Australian cities the owner approved on 11 Nov 2026", () => {
  assert.deepEqual([...APPROVED_CITY_PAGES].sort(), [
    "australia/adelaide", "australia/brisbane", "australia/melbourne", "australia/perth", "australia/sydney",
    "united-states/chicago", "united-states/dallas", "united-states/houston", "united-states/los-angeles", "united-states/new-york",
  ]);
  for (const key of APPROVED_CITY_PAGES) {
    const [c, slug] = key.split("/");
    assert.ok(LOCATIONS.find((x) => x.slug === c)?.cities.some((x) => x.slug === slug), `${key} exists`);
  }
});

test("approved country hubs remain indexable unless CMS explicitly sets noindex", () => {
  for (const slug of INDEXED_MARKETS) {
    const country = LOCATIONS.find((c) => c.slug === slug);
    assert.equal(locationIndexRecord({ seo_noindex: false }, country, null).seo_noindex, false, slug);
    assert.equal(locationIndexRecord({ seo_noindex: true }, country, null).seo_noindex, true);
  }
});

test("a city page shows its own CMS guidance open, so re-indexed city pages lead with local content", () => {
  const src = readFileSync(new URL("../src/components/site/location-page.jsx", import.meta.url), "utf8");
  assert.match(src, /<details className="surface p-6" open=\{Boolean\(city\)\}>/);
});
