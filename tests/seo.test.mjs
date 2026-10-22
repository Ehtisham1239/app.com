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
