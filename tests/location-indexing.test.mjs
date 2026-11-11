import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { LOCATIONS, INDEXED_MARKETS, locationIndexRecord } from "../src/lib/locations.js";

// Pathway decision 26–28 Oct 2026: only the five approved country hubs are indexed by default.
test("without a CMS row only the five approved country hubs are indexable", () => {
  const indexable = LOCATIONS.flatMap((country) => [null, ...country.cities].filter((city) => !locationIndexRecord(undefined, country, city).seo_noindex).map((city) => city ? `${country.slug}/${city.slug}` : country.slug));
  assert.deepEqual(indexable.sort(), [...INDEXED_MARKETS].sort());
});

test("legacy CMS index opt-in cannot bypass the local-proof gate for city pages", () => {
  for (const country of LOCATIONS) {
    for (const city of country.cities) {
      assert.equal(locationIndexRecord({ seo_noindex: false }, country, city).seo_noindex, true, `${country.slug}/${city.slug} stays noindex until local proof is approved`);
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

test("a city page shows its own CMS guidance open, so re-indexed city pages lead with local content", () => {
  const src = readFileSync(new URL("../src/components/site/location-page.jsx", import.meta.url), "utf8");
  assert.match(src, /<details className="surface p-6" open=\{Boolean\(city\)\}>/);
});
