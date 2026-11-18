import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { LOCATIONS, RESTORED_LOCATION_PATHS, INDEXED_MARKETS, relatedLocationLinks, isLiveLocation } from "../src/lib/locations.js";

test("every restored page gets at least three related links, all to live pages, never to itself", () => {
  const live = new Set([...INDEXED_MARKETS, ...RESTORED_LOCATION_PATHS].map((p) => `/locations/${p}`));
  for (const path of RESTORED_LOCATION_PATHS) {
    const [cs, ci] = path.split("/"); const country = LOCATIONS.find((c) => c.slug === cs); const city = ci ? country.cities.find((c) => c.slug === ci) : null;
    const links = relatedLocationLinks(country, city);
    assert.ok(links.length >= 3, `${path} has ${links.length} links`);
    for (const l of links) { assert.ok(live.has(l.path), `${path} -> ${l.path} is not live`); assert.notEqual(l.path, `/locations/${path}`); }
  }
});
test("hubs link to their live cities and every inbound link is counted at least once per restored page", () => {
  const inbound = new Map();
  for (const country of LOCATIONS) for (const city of [null, ...country.cities]) {
    if (!isLiveLocation(country, city)) continue;
    for (const l of relatedLocationLinks(country, city)) inbound.set(l.path, (inbound.get(l.path) || 0) + 1);
  }
  for (const p of RESTORED_LOCATION_PATHS) assert.ok((inbound.get(`/locations/${p}`) || 0) >= 3, p);
  const canada = LOCATIONS.find((c) => c.slug === "canada");
  assert.deepEqual(relatedLocationLinks(canada, null).map((l) => l.path).sort(), ["/locations/canada/montreal", "/locations/canada/ottawa", "/locations/canada/vancouver"]);
});
test("/favicon.ico is rewritten to the generated icon, teacher pages emit BreadcrumbList", () => {
  assert.match(readFileSync(new URL("../next.config.mjs", import.meta.url), "utf8"), /source: "\/favicon\.ico", destination: "\/icon"/);
  assert.match(readFileSync(new URL("../src/app/(site)/teachers/[slug]/page.jsx", import.meta.url), "utf8"), /breadcrumbSchema\(\[\{ name: "Home"/);
});
