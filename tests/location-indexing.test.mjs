import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  LOCATIONS,
  INDEXED_MARKETS,
  RESTORED_LOCATION_PATHS,
  isLiveLocation,
  locationIndexRecord,
  locationPath,
} from "../src/lib/locations.js";
import { shouldIncludeInSitemap } from "../src/lib/seo.js";

const EXPECTED_LIVE = LOCATIONS.reduce(
  (n, country) =>
    n +
    (INDEXED_MARKETS.includes(country.slug) ? 0 : 1) +
    country.cities.length,
  0,
);
const SITE_URL = "https://www.onlinequrancollege.com";

test("every configured country and city route is live, including the three city-state URLs (owner, 20 Nov 2026)", () => {
  assert.equal(RESTORED_LOCATION_PATHS.length, EXPECTED_LIVE);
  assert.equal(new Set(RESTORED_LOCATION_PATHS).size, EXPECTED_LIVE);

  for (const key of ["monaco/monaco", "san-marino/san-marino", "vatican-city/vatican-city"]) {
    assert.equal(RESTORED_LOCATION_PATHS.includes(key), true, key);
  }

  for (const country of LOCATIONS) {
    assert.equal(
      isLiveLocation(country, null),
      INDEXED_MARKETS.includes(country.slug) || RESTORED_LOCATION_PATHS.includes(country.slug),
      country.slug,
    );
    for (const city of country.cities) {
      assert.equal(isLiveLocation(country, city), true, `${country.slug}/${city.slug}`);
    }
  }
});

test("only the five target-market hubs are indexable by default", () => {
  for (const country of LOCATIONS) {
    assert.equal(
      locationIndexRecord(undefined, country, null).seo_noindex,
      !INDEXED_MARKETS.includes(country.slug),
      country.slug,
    );

    for (const city of country.cities) {
      assert.equal(
        locationIndexRecord(undefined, country, city).seo_noindex,
        true,
        `${country.slug}/${city.slug}`,
      );
    }
  }
});

test("explicit CMS indexability is respected for a city page", () => {
  const country = LOCATIONS.find((item) => item.slug === "australia");
  const city = country.cities.find((item) => item.slug === "melbourne");

  assert.equal(locationIndexRecord({ seo_noindex: true }, country, city).seo_noindex, true);
  assert.equal(locationIndexRecord({ seo_noindex: false }, country, city).seo_noindex, false);
  assert.equal(locationIndexRecord({ title: "No explicit decision" }, country, city).seo_noindex, true);
});

test("explicit CMS indexability is respected for a non-hub country page", () => {
  const country = LOCATIONS.find((item) => item.slug === "france");

  assert.equal(locationIndexRecord({ seo_noindex: true }, country, null).seo_noindex, true);
  assert.equal(locationIndexRecord({ seo_noindex: false }, country, null).seo_noindex, false);
  assert.equal(locationIndexRecord(undefined, country, null).seo_noindex, true);
});

test("noindex location pages are excluded from the sitemap while approved pages remain eligible", () => {
  const country = LOCATIONS.find((item) => item.slug === "australia");
  const city = country.cities.find((item) => item.slug === "melbourne");
  const path = locationPath(country, city);

  assert.equal(
    shouldIncludeInSitemap(locationIndexRecord({ seo_noindex: true }, country, city), path, SITE_URL),
    false,
  );
  assert.equal(
    shouldIncludeInSitemap(locationIndexRecord({ seo_noindex: false }, country, city), path, SITE_URL),
    true,
  );

  const sitemapSource = readFileSync(new URL("../src/app/sitemap.js", import.meta.url), "utf8");
  assert.match(sitemapSource, /shouldIncludeInSitemap\(locationIndexRecord\(page, country, city\)/);
});

test("approved country hubs remain indexable unless CMS explicitly sets noindex", () => {
  for (const slug of INDEXED_MARKETS) {
    const country = LOCATIONS.find((item) => item.slug === slug);
    assert.equal(locationIndexRecord(undefined, country, null).seo_noindex, false, slug);
    assert.equal(locationIndexRecord({ seo_noindex: false }, country, null).seo_noindex, false, slug);
    assert.equal(locationIndexRecord({ seo_noindex: true }, country, null).seo_noindex, true, slug);
  }
});

test("a city page shows its own CMS guidance open when substantive local content is published", () => {
  const src = readFileSync(new URL("../src/components/site/location-page.jsx", import.meta.url), "utf8");
  assert.match(src, /<details className="surface p-6" open=\{Boolean\(city\)\}>/);
});

test("city-state headings do not repeat the place name", async () => {
  const { locationHeading, getLocation } = await import("../src/lib/locations.js");
  for (const slug of ["monaco", "san-marino", "vatican-city"]) {
    const country = getLocation(slug);
    const city = country.cities[0];
    const expected = `Online Quran classes in ${country.name}`;
    assert.equal(locationHeading(country, city), expected, slug);
    assert.equal(locationHeading(country, city, `${expected}, ${country.name}`), expected, slug);
  }
  const uk = getLocation("united-kingdom");
  assert.equal(locationHeading(uk, uk.cities[0]), `Online Quran classes in ${uk.cities[0].name}, ${uk.name}`);
});
