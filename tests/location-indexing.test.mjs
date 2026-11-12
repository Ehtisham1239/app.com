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

test("no city page is approved for indexing without unique local value and documented owner approval", () => {
  assert.deepEqual([...APPROVED_CITY_PAGES], []);
  for (const country of LOCATIONS) {
    for (const city of country.cities) {
      assert.equal(
        locationIndexRecord({ seo_noindex: false }, country, city).seo_noindex,
        true,
        `${country.slug}/${city.slug} remains noindex until both requirements are documented`,
      );
    }
  }
});

test("approved country hubs remain indexable unless CMS explicitly sets noindex", () => {
  for (const slug of INDEXED_MARKETS) {
    const country = LOCATIONS.find((c) => c.slug === slug);
    assert.equal(locationIndexRecord({ seo_noindex: false }, country, null).seo_noindex, false, slug);
    assert.equal(locationIndexRecord({ seo_noindex: true }, country, null).seo_noindex, true);
  }
});

test("city-specific CMS guidance remains visible to visitors even while the page is noindex", () => {
  const src = readFileSync(new URL("../src/components/site/location-page.jsx", import.meta.url), "utf8");
  assert.match(src, /<details className="surface p-6" open=\{Boolean\(city\)\}>/);
});
