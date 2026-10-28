import test from "node:test";
import assert from "node:assert/strict";
import { LOCATIONS, INDEXED_MARKETS, locationIndexRecord } from "../src/lib/locations.js";

// Pathway decision 26–28 Oct 2026: only approved country hubs are indexed by default.
test("without a CMS row only the four approved country hubs are indexable", () => {
  const indexable = LOCATIONS.flatMap((country) => [null, ...country.cities].filter((city) => !locationIndexRecord(undefined, country, city).seo_noindex).map((city) => city ? `${country.slug}/${city.slug}` : country.slug));
  assert.deepEqual(indexable.sort(), [...INDEXED_MARKETS].sort());
});

test("an explicit CMS choice always wins over the default", () => {
  const uk = LOCATIONS.find((c) => c.slug === "united-kingdom");
  const london = uk.cities.find((c) => c.slug === "london");
  assert.equal(locationIndexRecord({ seo_noindex: false }, uk, london).seo_noindex, false, "city page re-indexed after local proof");
  assert.equal(locationIndexRecord({ seo_noindex: true }, uk, null).seo_noindex, true);
});
