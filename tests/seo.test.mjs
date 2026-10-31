import { test } from "node:test";
import assert from "node:assert/strict";
import { analyzeSeo, validCanonical, canonicalUrl, duplicateMetadata, shouldIncludeInSitemap, safeJsonLd } from "../src/lib/seo.js";
import { locationFromCmsSlug, locationPath } from "../src/lib/locations.js";
test("canonical validation rejects unsafe schemes, fragments and credentials", () => {
  for (const value of ["javascript:alert(1)", "//outside.test/x", "https://user:pass@example.com/", "/page#section", "/two words", "<script>"]) assert.equal(validCanonical(value), false, value);
  for (const value of ["", "/courses/quran", "https://example.com/course"]) assert.equal(validCanonical(value), true, value);
  assert.equal(canonicalUrl("javascript:alert(1)", "/safe", "https://example.com"), "https://example.com/safe");
});
test("checklist diagnoses content and accepts decorative alt and section links", () => {
  const r = { title: "Quran lessons in London", seo_description: "Learn Quran online with a dedicated teacher and a flexible class schedule. Find a course for your family and arrange a free trial today.", body_html: `<h2>Learning at home</h2><p>${"Useful learning guidance. ".repeat(55)}</p><img src='/a.png' alt=''><a href='#lessons'>Lessons</a>`, seo_focus_keyword: "Quran lessons" };
  const good = analyzeSeo(r); assert.equal(good.recommendations.length, 0);
  const bad = analyzeSeo({ ...r, body_html: '<h1>Second title</h1><img src="/a.png"><a href="#">Empty</a>' });
  for (const id of ["h1", "alt", "links", "content", "headings"]) assert.ok(bad.recommendations.some((c) => c.id === id), id);
});
test("duplicate metadata is normalised and tied to audit records", () => {
  const groups = duplicateMetadata([{ auditId: "pages:1", title: "Same Title", seo_description: "Same description" }, { auditId: "pages:2", title: "same title", seo_description: "Same  description" }]);
  assert.equal(groups.length, 2); assert.deepEqual(groups[0].ids, ["pages:1", "pages:2"]);
});
test("sitemap excludes noindex and alternative canonicals but includes valid self canonicals", () => {
  const site = "https://college.test";
  assert.equal(shouldIncludeInSitemap({ seo_noindex: true }, "/london", site), false);
  assert.equal(shouldIncludeInSitemap({ canonical_url: "/other" }, "/london", site), false);
  assert.equal(shouldIncludeInSitemap({ canonical_url: "/london" }, "/london", site), true);
  assert.equal(shouldIncludeInSitemap(undefined, "/london", site), true);
});
test("JSON-LD escapes script-closing text without corrupting data", () => {
  const data = { name: '</script><script>alert("x")</script>' }; const json = safeJsonLd(data);
  assert.equal(json.includes("</script>"), false); assert.deepEqual(JSON.parse(json), data);
});
test("legacy location content slugs resolve to their single public route", () => {
  const r = locationFromCmsSlug("locations-united-kingdom-london");
  assert.equal(locationPath(r.country, r.city), "/locations/united-kingdom/london");
  assert.equal(locationFromCmsSlug("about"), null);
});
test("location breadcrumbs match the visible hierarchy and use absolute URLs", async () => {
  const { getLocation, locationBreadcrumbs, locationSearchTitle, LOCATIONS } = await import("../src/lib/locations.js");
  const { breadcrumbSchema, searchTitle } = await import("../src/lib/seo.js");
  const country = getLocation("united-kingdom"), city = country.cities.find((c) => c.slug === "london");
  const items = locationBreadcrumbs(country, city), schema = breadcrumbSchema(items, "https://college.test");
  assert.deepEqual(schema.itemListElement.map((i) => [i.position, i.name, new URL(i.item).pathname]), [[1,"Countries & cities","/locations"],[2,"United Kingdom","/locations/united-kingdom"],[3,"London","/locations/united-kingdom/london"]]);
  const titles = LOCATIONS.flatMap((c) => [locationSearchTitle(c), ...c.cities.map((x) => locationSearchTitle(c, x))]);
  assert.equal(new Set(titles).size, titles.length);
  assert.equal(searchTitle({ slug: "locations-united-kingdom-london" }), locationSearchTitle(country,city));
  assert.equal(searchTitle({ slug: "locations-united-kingdom-london", seo_title: "Owner's approved title" }), "Owner's approved title");
});
test("seeded location headings gain the article; staff-edited headings are kept", async () => {
  const { getLocation, locationHeading } = await import("../src/lib/locations.js");
  const uk = getLocation("united-kingdom"), canada = getLocation("canada"), london = uk.cities.find((c) => c.slug === "london");
  assert.equal(locationHeading(uk, null, "Online Quran classes in United Kingdom"), "Online Quran classes in the United Kingdom");
  assert.equal(locationHeading(getLocation("netherlands"), null, undefined), "Online Quran classes in the Netherlands");
  assert.equal(locationHeading(canada, null, "Online Quran classes in Canada"), "Online Quran classes in Canada");
  assert.equal(locationHeading(uk, london, "Online Quran classes in London, United Kingdom"), "Online Quran classes in London, United Kingdom");
  assert.equal(locationHeading(uk, null, "Quran lessons for UK families"), "Quran lessons for UK families");
});
test("404 pages override the layout's index robots with noindex", async () => {
  const { readFile } = await import("node:fs/promises");
  const source = await readFile(new URL("../src/app/not-found.jsx", import.meta.url), "utf8");
  assert.match(source, /robots:\s*\{\s*index:\s*false,\s*follow:\s*true,\s*googleBot:\s*\{\s*index:\s*false/);
});
test("location pages describe online tuition for the place without claiming a local branch", async () => {
  const { getLocation, countryInName } = await import("../src/lib/locations.js");
  const { locationServiceSchema } = await import("../src/lib/seo.js");
  const { MARKET_GUIDES } = await import("../src/lib/market-guides.js");
  const au = getLocation("australia"), perth = au.cities.find((c) => c.slug === "perth");
  const hub = locationServiceSchema({ country: au, city: null, placeName: countryInName(au), url: "https://college.test/locations/australia", siteUrl: "https://college.test" });
  assert.equal(hub["@type"], "Service");
  assert.equal(hub.name, "Online Quran classes in Australia");
  assert.deepEqual(hub.areaServed, { "@type": "Country", name: "Australia" });
  assert.equal(hub.provider["@id"], "https://college.test/#organization");
  assert.equal("address" in hub, false);
  const city = locationServiceSchema({ country: au, city: perth, placeName: "Perth, Australia", url: "https://college.test/locations/australia/perth", siteUrl: "https://college.test" });
  assert.deepEqual(city.areaServed, { "@type": "City", name: "Perth", containedInPlace: { "@type": "Country", name: "Australia" } });
  const guide = MARKET_GUIDES.australia;
  assert.ok(guide.sections.length >= 2);
  assert.ok(guide.sources.every((s) => new URL(s.url).hostname.endsWith(".gov.au")));
  const us = MARKET_GUIDES["united-states"];
  assert.ok(us.sections.length >= 2 && us.sections.every((s) => s.path.startsWith("/")));
  assert.ok(us.sources.every((s) => new URL(s.url).hostname.endsWith(".gov")));
  assert.notEqual(us.title, guide.title);
});
test("location sitemap dates include the latest shared template change", async () => {
  const { locationLastModified, LOCATION_TEMPLATE_UPDATED } = await import("../src/lib/locations.js");
  assert.equal(locationLastModified({ updated_at: "2026-10-29T09:49:43Z" }), new Date(LOCATION_TEMPLATE_UPDATED).toISOString());
  assert.equal(locationLastModified({ updated_at: "2099-01-02T03:04:05Z" }), "2099-01-02T03:04:05.000Z");
  assert.equal(locationLastModified(null), new Date(LOCATION_TEMPLATE_UPDATED).toISOString());
});
