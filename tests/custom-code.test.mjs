import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import {
  parseHeadCode, parseSchemaJson, validateSiteSchema, validatePageSchema, mergeSiteGraph, normalizePagePath, pathMatches,
  pageSchemaNodes, customCodeErrors, customCodeFromSettings, normalizeCustomCode, SCHEMA_KEY, HEAD_CODE_KEY,
} from "../src/lib/custom-code.js";

const SITE = "https://www.onlinequrancollege.com";
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const builtIn = () => [
  { "@type": "WebSite", "@id": `${SITE}/#website`, name: "Online Quran College", url: SITE, publisher: { "@id": `${SITE}/#organization` } },
  { "@type": ["EducationalOrganization", "Organization"], "@id": `${SITE}/#organization`, name: "Online Quran College", telephone: "+44 7864 710821", sameAs: ["https://x.com/OnlineQuranClg"] },
];

test("head code accepts verification meta, link hints and safe scripts", () => {
  const { elements, errors } = parseHeadCode(`
    <!-- Pinterest -->
    <meta name="p:domain_verify" content="abc123"/>
    <meta property="fb:app_id" content="42">
    <link rel="preconnect" href="https://fonts.example.com" crossorigin>
    <script async src="https://cdn.example.com/widget.js" data-site="oqc"></script>
    <script>window.oqcFlag = 1;</script>`);
  assert.deepEqual(errors, []);
  assert.deepEqual(elements.map((e) => e.tag), ["meta", "meta", "link", "script", "script"]);
  assert.equal(elements[3].attrs.async, true);
  assert.equal(elements[4].content.trim(), "window.oqcFlag = 1;");
});

test("head code rejects anything that could break the page or duplicate installed tags", () => {
  const cases = {
    "<div>hello</div>": /Only <meta>, <link> and <script>/,
    "<iframe src=\"https://x.test\"></iframe>": /Only <meta>, <link> and <script>/,
    "<meta name=\"x\" content=\"y\" onload=\"alert(1)\">": /event-handler/,
    "<script src=\"http://x.test/a.js\" async></script>": /https/,
    "<script src=\"https://x.test/a.js\"></script>": /async or defer/,
    "<script src=\"javascript:alert(1)\" async></script>": /https/,
    "<script type=\"application/ld+json\">{}</script>": /schema fields/i,
    "<script>alert(1)": /not closed/,
    "<script>var a='<!--';</script>": /cannot contain/,
    "<meta name=\"description\" content=\"x\">": /already set/,
    "<meta name=\"robots\" content=\"noindex\">": /already set/,
    "<link rel=\"stylesheet\" href=\"https://x.test/a.css\">": /not allowed/,
    "<link rel=\"canonical\" href=\"https://x.test/\">": /not allowed/,
    "<script async src=\"https://www.googletagmanager.com/gtm.js?id=GTM-AAAA\"></script>": /Tag Manager/,
    "<script async src=\"https://www.googletagmanager.com/gtag/js?id=G-57TGPTDNT4\"></script>": /GA4/,
    "<script async src=\"https://www.googletagmanager.com/gtm.js?id=GTM-52PTXDRF\"></script>": /Tag Manager/,
    "<script>gtag('config','AW-16564445897')</script>": /Google Ads/,
    "<script>(function(c,l,a,r,i){})(window,document,'clarity','script','zdo7gxbgkn')</script>": /Clarity/,
    "<meta http-equiv=\"refresh\" content=\"0;url=https://x.test\">": /not allowed/,
  };
  for (const [code, pattern] of Object.entries(cases)) {
    const { elements, errors } = parseHeadCode(code);
    assert.ok(errors.some((e) => pattern.test(e)), `${code} → ${errors.join(" | ")}`);
    assert.ok(!elements.some((e) => e.tag === "script" && /alert|clarity|googletagmanager/.test(e.content + (e.attrs.src || ""))), code);
  }
});

test("head code removes exact duplicates and the Search engines verification code", () => {
  const meta = '<meta name="google-site-verification" content="AbC_123">';
  assert.match(parseHeadCode(meta, { google_verification: "AbC_123" }).errors[0], /already saved in Search engines/);
  assert.deepEqual(parseHeadCode(meta, { google_verification: "Different" }).errors, []);
  const twice = parseHeadCode(`${meta}\n${meta}`);
  assert.equal(twice.elements.length, 1);
  assert.match(twice.errors[0], /Duplicate/);
  assert.match(parseHeadCode("<meta name=\"a\" content=\"b\">".repeat(2000)).errors[0], /too long/);
});

test("schema JSON must be schema.org objects without a script wrapper", () => {
  assert.match(parseSchemaJson("{oops").errors[0], /not valid JSON/);
  assert.match(parseSchemaJson("<script type=\"application/ld+json\">{}</script>").errors[0], /without the <script>/);
  assert.match(parseSchemaJson('{"name":"x"}').errors[0], /@type/);
  assert.match(parseSchemaJson('{"@context":"https://evil.test","@type":"Thing"}').errors[0], /@context/);
  const graph = parseSchemaJson('{"@context":"https://schema.org","@graph":[{"@type":"Service","name":"a"},{"@type":"OfferCatalog","name":"b"}]}');
  assert.deepEqual(graph.errors, []);
  assert.deepEqual(graph.nodes.map((n) => n["@type"]), ["Service", "OfferCatalog"]);
  assert.ok(graph.nodes.every((n) => !("@context" in n)));
});

test("site-wide Organization/WebSite schema merges into the built-in graph instead of duplicating", () => {
  const { nodes, errors } = validateSiteSchema(JSON.stringify([
    { "@context": "https://schema.org", "@type": "EducationalOrganization", foundingDate: "2019", telephone: "+44 0000", sameAs: ["https://x.com/OnlineQuranClg", "https://www.youtube.com/@oqc"] },
    { "@type": "WebSite", alternateName: "Online Quran College UK" },
    { "@type": "Service", "@id": `${SITE}/#tajweed-service`, name: "Online Tajweed classes" },
  ]), SITE);
  assert.deepEqual(errors, []);
  const graph = mergeSiteGraph(builtIn(), nodes, SITE);
  assert.equal(graph.length, 3, "one website, one organization, one new service");
  assert.equal(graph.filter((n) => [].concat(n["@type"]).includes("Organization")).length, 1);
  const org = graph.find((n) => n["@id"] === `${SITE}/#organization`);
  assert.equal(org.foundingDate, "2019");
  assert.equal(org.telephone, "+44 0000", "CMS value wins");
  assert.deepEqual(org["@type"], ["EducationalOrganization", "Organization"]);
  assert.deepEqual(org.sameAs, ["https://x.com/OnlineQuranClg", "https://www.youtube.com/@oqc"], "lists combined without repeats");
  assert.deepEqual(graph.find((n) => n["@id"] === `${SITE}/#website`).alternateName, "Online Quran College UK");
  assert.equal(mergeSiteGraph(builtIn(), [...nodes, ...nodes], SITE).length, 3, "same @id is never appended twice");
});

test("site-wide schema refuses page-only types and a second identity", () => {
  assert.match(validateSiteSchema('{"@type":"FAQPage","mainEntity":[]}', SITE).errors[0], /Page schema/);
  assert.match(validateSiteSchema(`{"@type":"Organization","@id":"https://other.test/#org"}`, SITE).errors[0], /duplicate/);
  assert.deepEqual(validateSiteSchema(`{"@type":"Organization","@id":"${SITE}/#organization","slogan":"x"}`, SITE).errors, []);
});

test("page paths normalise and match exactly or by section", () => {
  assert.equal(normalizePagePath(" /pricing/ "), "/pricing");
  assert.equal(normalizePagePath(`${SITE}/pricing?x=1#top`), "/pricing");
  assert.equal(normalizePagePath("/"), "/");
  assert.equal(normalizePagePath("/blog/*"), "/blog/*");
  for (const bad of ["pricing", "//evil.test/x", "/two words", "/*", "javascript:alert(1)", "/a<b"]) assert.equal(normalizePagePath(bad), "", bad);
  assert.equal(pathMatches("/pricing", "/pricing/"), true);
  assert.equal(pathMatches("/pricing", "/pricing-guide"), false);
  assert.equal(pathMatches("/blog/*", "/blog/how-to-read"), true);
  assert.equal(pathMatches("/blog/*", "/blog"), false);
  assert.equal(pathMatches("/blog/*", "/blogger"), false);
});

test("page schema stays page-specific and skips invalid or disabled entries", () => {
  assert.match(validatePageSchema('{"@type":"Organization","name":"x"}', SITE, "/pricing").errors[0], /Site-wide/);
  assert.match(validatePageSchema(`{"@type":"WebPage","@id":"${SITE}/pricing#webpage"}`, SITE, "/pricing").errors[0], /built-in WebPage/);
  assert.match(validatePageSchema('[{"@type":"FAQPage"},{"@type":"FAQPage"}]', SITE, "/x").errors[0], /only one FAQPage/);
  const value = { page_schemas: [
    { path: "/pricing", schema: '{"@type":"Service","name":"Fees"}' },
    { path: "/pricing", schema: "{bad json", enabled: true },
    { path: "/blog/*", schema: '{"@type":"Thing","name":"Section"}' },
    { path: "/faq", schema: '{"@type":"Thing","name":"Off"}', enabled: false },
  ] };
  assert.deepEqual(pageSchemaNodes(value, "/pricing", SITE).map((n) => n.name), ["Fees"]);
  assert.deepEqual(pageSchemaNodes(value, "/blog/a-post", SITE).map((n) => n.name), ["Section"]);
  assert.deepEqual(pageSchemaNodes(value, "/faq", SITE), []);
  assert.deepEqual(pageSchemaNodes(undefined, "/", SITE), []);
});

test("admin validation reports every blocking problem before saving", () => {
  const errors = customCodeErrors({
    head_code: "<div></div>",
    schema: '{"@type":"BreadcrumbList"}',
    page_schemas: [{ path: "/a", schema: '{"@type":"Service"}' }, { path: "/a/", schema: '{"@type":"Thing"}' }, { path: "nope", schema: "{}" }, { path: "/b", schema: "" }],
  }, { siteUrl: SITE });
  for (const pattern of [/Only <meta>/, /BreadcrumbList describes one page/, /listed twice/, /enter a page path/, /paste the JSON-LD/]) assert.ok(errors.some((e) => pattern.test(e)), String(pattern));
  assert.deepEqual(customCodeErrors({}, { siteUrl: SITE }), []);
});

test("the two settings rows combine into one value and bad shapes are ignored", () => {
  const combined = customCodeFromSettings({ [SCHEMA_KEY]: { schema: "{}", page_schemas: [{ path: "/x", schema: "{}" }] }, [HEAD_CODE_KEY]: { head_code: "<meta name=\"a\" content=\"b\">" } });
  assert.equal(combined.schema, "{}");
  assert.equal(combined.head_code, "<meta name=\"a\" content=\"b\">");
  assert.deepEqual(normalizeCustomCode("junk"), { head_code: "", schema: "", page_schemas: [] });
  assert.equal(normalizeCustomCode({ page_schemas: Array.from({ length: 150 }, () => ({ path: "/x", schema: "" })) }).page_schemas.length, 100);
});

test("site layout publishes one merged graph and renders CMS head code on public pages only", () => {
  const layout = read("src/app/(site)/layout.jsx");
  assert.match(layout, /mergeSiteGraph\(/);
  assert.match(layout, /"@graph": siteGraph/);
  assert.equal((layout.match(/application\/ld\+json/g) || []).length, 1, "one site-wide JSON-LD block");
  assert.match(layout, /<CustomHeadCode value=\{customCode\}/);
  assert.doesNotMatch(read("src/app/layout.jsx"), /CustomHeadCode|custom-code/, "root layout (admin, parent portal) never renders CMS code");
  assert.doesNotMatch(read("src/components/site/custom-code.jsx"), /^"use client"/, "rendered on the server, in the initial HTML");
});

test("every public page can carry page-level schema", () => {
  const root = new URL("../src/app/(site)/", import.meta.url).pathname;
  const pages = [];
  const walk = (dir) => { for (const name of readdirSync(dir)) { const full = join(dir, name); if (statSync(full).isDirectory()) walk(full); else if (name === "page.jsx") pages.push(full); } };
  walk(root);
  assert.ok(pages.length >= 20);
  const sharedWithPath = { LocationPage: "location-page.jsx", LearningGuidePage: "learning-guide-page.jsx", BlogIndex: "blog-index.jsx", CmsPage: "cms-page.jsx" };
  for (const file of pages) {
    const source = readFileSync(file, "utf8");
    const covered = /<CmsPageSchema\b/.test(source) || /<PageHero\b[^>]*\bpath=/.test(source) || Object.keys(sharedWithPath).some((name) => new RegExp(`<${name}\\b`).test(source));
    assert.ok(covered, `${file.slice(root.length)} renders no CmsPageSchema or PageHero path`);
  }
  for (const file of Object.values(sharedWithPath)) assert.match(read(`src/components/site/${file}`), /<PageHero\b[^>]*\bpath=|<CmsPageSchema\b/, file);
  assert.match(read("src/components/site/chrome.jsx"), /<CmsPageSchema path=\{path\} \/>/);
});

test("database policy limits header code to seo_code:update without touching other settings", () => {
  const sql = read("supabase/migrations/20261115120000_seo_custom_code.sql");
  for (const op of ["update", "insert", "delete"]) assert.match(sql, new RegExp(`as restrictive for ${op} to authenticated`));
  assert.match(sql, /key <> 'site\.head_code' or \(select public\.has_permission\('seo_code:update'\)\)/);
  assert.match(sql, /\('admin', 'seo_code:update'\)/);
  assert.match(sql, /on conflict \(key\) do nothing/);
  assert.doesNotMatch(sql, /content_editor/);
});
