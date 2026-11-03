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

test("only country hubs carry hreflang, and a noindex page never does", () => {
  const hub = readFileSync(new URL("../src/app/(site)/locations/[country]/page.jsx", import.meta.url), "utf8");
  assert.match(hub, /languages: INDEXED_MARKETS\.includes\(country\.slug\) \? marketHreflang\(SITE_URL\) : undefined/);
  const city = readFileSync(new URL("../src/app/(site)/locations/[country]/[city]/page.jsx", import.meta.url), "utf8");
  assert.doesNotMatch(city, /marketHreflang|languages:/);
  const meta = readFileSync(new URL("../src/lib/seo-metadata.js", import.meta.url), "utf8");
  assert.match(meta, /\.\.\.\(languages && !record\.seo_noindex \? \{ languages \} : \{\}\)/);
});
