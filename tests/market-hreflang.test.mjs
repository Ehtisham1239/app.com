import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { INDEXED_MARKETS, MARKET_HREFLANG, marketHreflang } from "../src/lib/locations.js";

const site = "https://www.onlinequrancollege.com";

test("every indexed country hub has one English region code", () => {
  assert.deepEqual(INDEXED_MARKETS.map((slug) => MARKET_HREFLANG[slug]).sort(), ["en-AE", "en-AU", "en-CA", "en-GB", "en-US"]);
});

test("hreflang lists all five hubs plus x-default, as absolute URLs", () => {
  const tags = marketHreflang(site);
  assert.deepEqual(tags, {
    "en-GB": `${site}/locations/united-kingdom`,
    "en-US": `${site}/locations/united-states`,
    "en-AU": `${site}/locations/australia`,
    "en-CA": `${site}/locations/canada`,
    "en-AE": `${site}/locations/united-arab-emirates`,
    "x-default": `${site}/locations`,
  });
});

test("country hubs include only sitemap-eligible country alternates; noindex pages never emit hreflang", () => {
  const hub = readFileSync(new URL("../src/app/(site)/locations/[country]/page.jsx", import.meta.url), "utf8");

  // The page now evaluates each country hub's current CMS/indexability record before
  // emitting the alternate. This intentionally replaces the old static all-markets
  // mapping, which could advertise noindex pages as hreflang alternates.
  assert.match(hub, /async function indexableMarketLanguages\(currentSlug, currentPage\)/);
  assert.match(hub, /Object\.entries\(marketHreflang\(SITE_URL\)\)/);
  assert.match(hub, /const page = country\.slug === currentSlug \? currentPage : await getPage\(locationCmsSlug\(country\)\)/);
  assert.match(hub, /shouldIncludeInSitemap\(locationIndexRecord\(page, country, null\), path, SITE_URL\)/);
  assert.match(hub, /entries\.some\(\(\[, url\]\) => url === `\$\{SITE_URL\}\/locations\/\$\{currentSlug\}`\)/);
  assert.match(hub, /const languages = INDEXED_MARKETS\.includes\(country\.slug\)\s*\?\s*await indexableMarketLanguages\(country\.slug, page\)\s*:\s*undefined/);

  const city = readFileSync(new URL("../src/app/(site)/locations/[country]/[city]/page.jsx", import.meta.url), "utf8");
  assert.doesNotMatch(city, /marketHreflang|languages:/);

  const meta = readFileSync(new URL("../src/lib/seo-metadata.js", import.meta.url), "utf8");
  assert.match(meta, /\.\.\.\(languages && !record\.seo_noindex \? \{ languages \} : \{\}\)/);
});
