import { test } from "node:test";
import assert from "node:assert/strict";
import { analyzeSeo, validCanonical, canonicalUrl, duplicateMetadata, shouldIncludeInSitemap, safeJsonLd, organizationPostalAddress } from "../src/lib/seo.js";
import { locationFromCmsSlug, locationPath, getLocation, defaultLocationNoindex, locationIndexRecord } from "../src/lib/locations.js";
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

test("organization schema never turns a country-only setting into a postal address", () => {
  assert.equal(organizationPostalAddress({ location: "United Kingdom" }), null);
  assert.equal(organizationPostalAddress({ address: { addressCountry: "GB" } }), null);
  assert.deepEqual(organizationPostalAddress({ address: { streetAddress: "10 Example Street", addressLocality: "London", postalCode: "SW1A 1AA", addressCountry: "GB" } }), {
    "@type": "PostalAddress", streetAddress: "10 Example Street", addressLocality: "London", postalCode: "SW1A 1AA", addressCountry: "GB"
  });
});

test("priority country hubs remain indexable while city pages stay noindex by default", () => {
  for (const slug of ["united-kingdom", "united-states", "australia", "united-arab-emirates"]) {
    const country = getLocation(slug);
    assert.ok(country, slug);
    assert.equal(defaultLocationNoindex(country, null), false, slug);
    assert.equal(locationIndexRecord(null, country, null).seo_noindex, false, slug);
    assert.equal(defaultLocationNoindex(country, country.cities[0]), true, `${slug} city`);
  }
});

test("robots explicitly permits Perplexity search crawling on public pages and blocks private routes", async () => {
  const { default: robots } = await import("../src/app/robots.js");
  const config = robots();
  const perplexity = config.rules.find((rule) => rule.userAgent === "PerplexityBot");
  const wildcard = config.rules.find((rule) => rule.userAgent === "*");
  assert.ok(perplexity);
  assert.ok(perplexity.allow.includes("/"));
  for (const path of ["/admin", "/auth", "/api/", "/parents"]) assert.ok(perplexity.disallow.includes(path), path);
  assert.ok(wildcard.allow.includes("/"));
  for (const path of ["/admin", "/auth", "/api/", "/parents"]) assert.ok(wildcard.disallow.includes(path), path);
});

test("free-trial benefits render once and avoid an absolute data-sharing promise", async () => {
  const { readFile } = await import("node:fs/promises");
  const page = await readFile(new URL("../src/app/(site)/free-trial/page.jsx", import.meta.url), "utf8");
  // The list is rendered in the browser (trial-intro.jsx) so the page stays cached.
  const intro = await readFile(new URL("../src/components/site/trial-intro.jsx", import.meta.url), "utf8");
  const source = page + intro;
  assert.equal((intro.match(/promises\.map\(/g) || []).length, 1);
  assert.equal((page.match(/<TrialPromises /g) || []).length, 1, "rendered once on the page");
  assert.equal(source.includes("never sold or shared"), false);
  assert.ok(source.includes("privacy policy"));
  assert.equal(source.includes("within 24 hours"), false);
});

test("UAE market hub has a distinct online-only guide and all seven emirates", async () => {
  const { getLocation } = await import("../src/lib/locations.js");
  const { MARKET_GUIDES } = await import("../src/lib/market-guides.js");
  const uae = getLocation("united-arab-emirates");
  assert.ok(uae);
  assert.equal(uae.currency, "AED");
  assert.equal(uae.timezone, "Asia/Dubai");
  assert.equal(uae.cities.length, 7);
  assert.ok(MARKET_GUIDES["united-arab-emirates"].sections.length >= 4);
  assert.ok(MARKET_GUIDES["united-arab-emirates"].sections.some((section) => section.text.includes("does not claim a UAE office")));
});

test("each primary-market hub links visibly to its own published planning article", async () => {
  const { MARKET_ARTICLES, MARKET_GUIDES } = await import("../src/lib/market-guides.js");
  const { INDEXED_MARKETS } = await import("../src/lib/locations.js");
  assert.deepEqual(Object.keys(MARKET_ARTICLES).sort(), [...INDEXED_MARKETS].sort());
  for (const slug of INDEXED_MARKETS) {
    assert.ok(MARKET_GUIDES[slug], `${slug} has a market guide section to host the link`);
    assert.match(MARKET_ARTICLES[slug].path, /^\/blog\/[a-z0-9-]+$/, slug);
  }
  assert.equal(new Set(Object.values(MARKET_ARTICLES).map((a) => a.path)).size, INDEXED_MARKETS.length, "no two hubs share an article");
  const { readFileSync } = await import("node:fs");
  const page = readFileSync(new URL("../src/components/site/location-page.jsx", import.meta.url), "utf8");
  assert.match(page, /const article = !city \? MARKET_ARTICLES\[country\.slug\] : null;/);
  assert.match(page, /\{article && <p[^>]*>Read the full planning guide: <Link[^>]*href=\{article\.path\}>\{article\.label\}<\/Link><\/p>\}/);
});

test("teachers page answers the female-teacher question without unverified claims", async () => {
  const { readFileSync } = await import("node:fs");
  const page = readFileSync(new URL("../src/app/(site)/teachers/page.jsx", import.meta.url), "utf8");
  assert.match(page, /question: "Can I choose a female Quran teacher\?"/);
  assert.match(page, /safeJsonLd\(faqSchema\(TEACHER_FAQS\)\)/, "FAQPage data comes from the same visible list");
  assert.match(page, /<FaqList faqs=\{TEACHER_FAQS\}/);
  assert.doesNotMatch(page, /trained in Tajweed|experienced and caring|Qualified female and male/, "no credential claims while profiles are not shown");
  assert.doesNotMatch(page, /you choose your preference when booking/, "a preference is requested, not guaranteed");
  assert.match(page, /cannot be guaranteed/);
});

test("entity names and market hubs carry the 3 Nov keyword and schema updates", async () => {
  const { readFileSync } = await import("node:fs");
  const layout = readFileSync(new URL("../src/app/(site)/layout.jsx", import.meta.url), "utf8");
  assert.equal((layout.match(/alternateName: "OQC"/g) || []).length, 2, "WebSite and Organization");
  const { locationServiceSchema } = await import("../src/lib/seo.js");
  const svc = locationServiceSchema({ country: { name: "Australia" }, city: null, placeName: "Australia", url: "https://x/locations/australia", siteUrl: "https://x" });
  assert.equal(svc.audience["@type"], "PeopleAudience");
  assert.doesNotMatch(JSON.stringify(svc), /aggregateRating|PostalAddress|price/);
  const { SEARCH_INTENTS } = await import("../src/lib/search-intent.js");
  assert.equal(SEARCH_INTENTS["/locations/australia"].heading, "Online Quran classes in Australia");
  assert.match(SEARCH_INTENTS["/locations/australia"].intro, /Sydney, Melbourne, Brisbane, Adelaide or Perth/);
  const { COUNTRY_HUBS } = await import("../src/lib/country-hubs.js");
  for (const slug of ["united-states", "australia"]) {
    const qs = COUNTRY_HUBS[slug].faqs().map((f) => f.question);
    assert.ok(qs.some((q) => /suitable for kids/.test(q)) && qs.some((q) => /online Hifz classes/.test(q)), slug);
  }
});

test("teacher page includes a factual parent pre-enrolment checklist", async () => {
  const { readFile } = await import("node:fs/promises");
  const source = await readFile(new URL("../src/app/(site)/teachers/page.jsx", import.meta.url), "utf8");
  assert.match(source, /Questions parents can confirm before regular lessons/);
  assert.match(source, /These are questions to ask, not claims that every arrangement is automatically included/);
  assert.match(source, /whether sessions are recorded/);
  assert.match(source, /The Weekend plan is excluded/);
});

test("organization JSON-LD does not publish an unverified CMS founding year", async () => {
  const { readFile } = await import("node:fs/promises");
  const source = await readFile(new URL("../src/app/(site)/layout.jsx", import.meta.url), "utf8");
  assert.doesNotMatch(source, /legalName:/);
  assert.match(source, /organizationPostalAddress\(contact\)/);
  assert.doesNotMatch(source, /foundingDate/);
});


test("Organization sameAs includes only the exact OQC Trustpilot profile", async () => {
  const { organizationIdentityProfiles } = await import("../src/lib/seo.js");
  assert.deepEqual(organizationIdentityProfiles({
    trustpilot: "https://www.trustpilot.com/review/onlinequrancollege.com",
    facebook: "https://www.facebook.com/OnlineQuranCollegeLtdUK",
    instagram: "https://www.instagram.com/online_quran_college",
    x: "https://x.com/OnlineQuranClg",
  }), ["https://www.trustpilot.com/review/onlinequrancollege.com"]);
  assert.deepEqual(organizationIdentityProfiles({ trustpilot: "https://www.trustpilot.com/review/onlinequrancollege.com/" }), ["https://www.trustpilot.com/review/onlinequrancollege.com"]);
  assert.deepEqual(organizationIdentityProfiles({ trustpilot: "https://www.trustpilot.com/review/another-company.com" }), []);
  assert.deepEqual(organizationIdentityProfiles({ trustpilot: "http://www.trustpilot.com/review/onlinequrancollege.com" }), []);
});

test("UAE advertiser guidance points to the official Media Council guidelines", async () => {
  const { MARKET_GUIDES } = await import("../src/lib/market-guides.js");
  const source = MARKET_GUIDES["united-arab-emirates"].sources.find((item) => item.name.includes("Advertiser Permit"));
  assert.equal(source.url, "https://uaemc.gov.ae/en/guidelines/");
});
