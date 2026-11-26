import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PAGES, STATE_LANDING_PAGES } from "../scripts/responsive-audit.mjs";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const states = [
  ["maryland", "Maryland", ["Baltimore", "Silver Spring", "Rockville"]],
  ["massachusetts", "Massachusetts", ["Boston", "Worcester", "Springfield"]],
  ["north-carolina", "North Carolina", ["Charlotte", "Raleigh", "Durham"]],
  ["minnesota", "Minnesota", ["Minneapolis", "Saint Paul", "Rochester"]],
  ["arizona", "Arizona", ["Phoenix", "Tucson", "Mesa"]],
  ["wisconsin", "Wisconsin", ["Milwaukee", "Madison", "Green Bay"]],
  ["missouri", "Missouri", ["Kansas City", "St. Louis", "Springfield"]],
  ["connecticut", "Connecticut", ["Hartford", "New Haven", "Stamford"]],
  ["indiana", "Indiana", ["Indianapolis", "Fort Wayne", "South Bend"]],
  ["tennessee", "Tennessee", ["Nashville", "Memphis", "Knoxville"]],
];

const read = (path) => readFileSync(resolve(root, path), "utf8");

test("all ten US state pages and the state directory are included in live responsive audits", () => {
  assert.deepEqual(STATE_LANDING_PAGES, [
    "/usa-quran-classes/states",
    ...states.map(([slug]) => `/${slug}-quran-classes`),
  ]);
  for (const path of STATE_LANDING_PAGES) {
    assert.ok(PAGES.includes(path), `${path} is included in the viewport audit`);
  }
});

test("US state landing pages have unique indexable SEO foundations and working trial paths", () => {
  const sitemap = read("src/app/sitemap.js");
  const config = read("next.config.mjs");
  const allContent = [];

  for (const [slug, state, cities] of states) {
    const path = `public/${slug}-quran-classes/index.html`;
    assert.ok(existsSync(resolve(root, path)), `${state} page exists`);
    const html = read(path);
    assert.match(html, new RegExp(`<title>Online Quran Classes in ${state.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} \\| OQC</title>`));
    const description = html.match(/<meta name="description" content="([^"]+)">/)?.[1] || "";
    assert.ok(description.length >= 80 && description.length <= 160, `${state} description is between 80 and 160 characters`);
    assert.match(html, /<meta name="robots" content="index,follow,max-image-preview:large">/);
    assert.match(html, new RegExp(`<link rel="canonical" href="https://www\\.onlinequrancollege\\.com/${slug}-quran-classes">`));
    assert.match(html, new RegExp(`<h1>Online Quran Classes in ${state} for Kids & Adults</h1>`));
    assert.match(html, /"@type":"Service"/);
    assert.match(html, /"@type":"FAQPage"/);
    assert.equal((html.match(/<details>/g) || []).length, 5, `${state} has five visible FAQ entries`);
    assert.ok(html.includes('"EducationalOrganization"'), `${state} includes the shared organization node`);
    assert.ok(html.includes('data-hero-visual'), `${state} has a detectable hero visual`);
    assert.ok(html.includes('width="1200" height="800"'), `${state} hero image reserves its actual dimensions`);
    assert.match(html, /href="\/free-trial"/);
    assert.match(html, /\/usa-state-pages\/state-pages\.css/);
    assert.match(config, new RegExp(`source: "/${slug}-quran-classes"`));
    assert.ok(sitemap.includes(`"/${slug}-quran-classes"`), `${state} included in sitemap`);
    for (const city of cities) assert.ok(html.includes(city), `${state} includes ${city}`);
    allContent.push(html);
  }

  assert.equal(new Set(allContent).size, 10, "state page HTML is not identical");
});

test("US state hub is indexable and links to all ten pages", () => {
  const hub = read("public/usa-quran-classes/states/index.html");
  const hubDescription = hub.match(/<meta name="description" content="([^"]+)">/)?.[1] || "";
  assert.ok(hubDescription.length >= 80 && hubDescription.length <= 160, "state directory description is between 80 and 160 characters");
  assert.match(hub, /<meta name="robots" content="index,follow">/);
  assert.ok(hub.includes('"@type":"CollectionPage"'));
  assert.ok(hub.includes('"EducationalOrganization"'));
  assert.ok(hub.includes('data-hero-visual'));
  assert.match(hub, /class="hero directory-hero"/);
  assert.match(hub, /class="hero-photo directory-photo"/);
  assert.doesNotMatch(hub, /Online classes, not local branches/);
  assert.ok(hub.includes('width="1200" height="800"'));
  assert.match(hub, /<link rel="canonical" href="https:\/\/www\.onlinequrancollege\.com\/usa-quran-classes\/states">/);
  for (const [slug] of states) assert.ok(hub.includes(`href="/${slug}-quran-classes"`));
  assert.ok(read("public/usa-quran-classes/index.html").includes('href="/usa-quran-classes/states"'));
  assert.ok(read("src/app/sitemap.js").includes('"/usa-quran-classes/states"'));
  assert.ok(read("next.config.mjs").includes('source: "/usa-quran-classes/states"'));
});

test("priority commercial metadata descriptions stay within the snippet guardrail", () => {
  const pricing = read("src/app/(site)/pricing/page.jsx");
  const description = pricing.match(/description: "([^"]+)"/)?.[1] || "";
  assert.ok(description.length >= 100 && description.length <= 160, "pricing description is concise and complete");
});

test("US state pages offer answer-first scheduling and direct course and fee links", () => {
  for (const [slug, state] of states) {
    const html = read(`public/${slug}-quran-classes/index.html`);
    const graph = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1])["@graph"];
    const page = graph.find((node) => node["@type"] === "WebPage");
    const service = graph.find((node) => node["@type"] === "Service");
    assert.equal(page.mainEntity["@id"], service["@id"], state);
    assert.match(html, /href="#main-content"/);
    assert.match(html, /id="main-content"/);
    assert.match(html, /id="local-schedule"/);
    assert.match(html, /href="\/locations\/united-states"/);
    assert.match(html, /href="\/pricing\?currency=USD"/);
    assert.match(html, /href="\/courses\/noorani-qaida"/);
    assert.match(html, /href="\/courses\/quran-nazara"/);
    assert.match(html, /href="\/courses\/hifz-quran"/);
    assert.doesNotMatch(html, /<link rel="preload" as="image"/);
  }
});

test("US state pages use the light hero, framed photo and colour hover styles", () => {
  const css = read("public/usa-state-pages/state-pages.css");
  const script = read("public/usa-state-pages/state-pages.js");
  for (const [slug, state] of states) {
    const html = read(`public/${slug}-quran-classes/index.html`);
    assert.match(html, /<section class="hero state-hero" data-hero-visual>/, `${state} has the light hero`);
    assert.match(html, /<picture class="hero-photo state-photo">/, `${state} frames the hero photo`);
    assert.doesNotMatch(html, /class="quick"|Quran classes from home in/, `${state} has no dark side panel`);
    assert.doesNotMatch(html, /class="btn light" href="\/free-trial">Request your/, `${state} hero uses the green primary button`);
    assert.match(html, /<script src="\/usa-state-pages\/state-pages\.js\?v=\w+" defer><\/script>/, `${state} loads the pointer glow without blocking`);
    assert.doesNotMatch(html, /style="color:#/, `${state} has no dark-theme inline colours`);
  }
  assert.match(css, /\.hero:is\(\.directory-hero, \.state-hero\)/);
  assert.match(css, /\.state-table tbody tr:hover > \*/);
  assert.match(css, /\.faq details\[open\] summary::after/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(script, /prefers-reduced-motion: reduce/);
  assert.match(script, /pointer: fine/);
});
