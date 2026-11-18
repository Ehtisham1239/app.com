import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { LOCATIONS, INDEXED_MARKETS, RESTORED_LOCATION_PATHS, APPROVED_CITY_PAGES, locationIndexRecord } from "../src/lib/locations.js";

// Owner decisions: 16 Nov 2026 kept only the five hubs; 18 Nov 2026 restored the 52 URLs Search Console listed as "Excluded by noindex".
test("without a CMS row only the five hubs and the 52 restored pages are indexable", () => {
  const indexable = LOCATIONS.flatMap((country) => [null, ...country.cities].filter((city) => !locationIndexRecord(undefined, country, city).seo_noindex).map((city) => city ? `${country.slug}/${city.slug}` : country.slug));
  assert.equal(RESTORED_LOCATION_PATHS.length, 52);
  assert.equal(new Set(RESTORED_LOCATION_PATHS).size, 52);
  assert.deepEqual(indexable.sort(), [...new Set([...INDEXED_MARKETS, ...RESTORED_LOCATION_PATHS])].sort());
});

test("restored pages are indexable even if the old CMS row says noindex; every other city stays noindex", () => {
  assert.deepEqual(APPROVED_CITY_PAGES, []);
  for (const country of LOCATIONS) {
    for (const city of [null, ...country.cities]) {
      const key = city ? `${country.slug}/${city.slug}` : country.slug;
      if (RESTORED_LOCATION_PATHS.includes(key)) {
        assert.equal(locationIndexRecord({ seo_noindex: true }, country, city).seo_noindex, false, `${key} restored`);
      } else if (city) {
        assert.equal(locationIndexRecord({ seo_noindex: false }, country, city).seo_noindex, true, `${key} with stale CMS opt-in`);
        assert.equal(locationIndexRecord(undefined, country, city).seo_noindex, true, `${key} without a CMS row`);
      }
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
