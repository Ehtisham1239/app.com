import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

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

test("US state landing pages have unique indexable SEO foundations and working trial paths", () => {
  const sitemap = read("src/app/sitemap.js");
  const config = read("next.config.mjs");
  const allContent = [];

  for (const [slug, state, cities] of states) {
    const path = `public/${slug}-quran-classes/index.html`;
    assert.ok(existsSync(resolve(root, path)), `${state} page exists`);
    const html = read(path);
    assert.match(html, new RegExp(`<title>Online Quran Classes in ${state.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} \\| OQC</title>`));
    assert.match(html, /<meta name="description" content="[^"]{80,180}">/);
    assert.match(html, /<meta name="robots" content="index,follow,max-image-preview:large">/);
    assert.match(html, new RegExp(`<link rel="canonical" href="https://www\\.onlinequrancollege\\.com/${slug}-quran-classes">`));
    assert.match(html, new RegExp(`<h1>Online Quran Classes in ${state} for Kids & Adults</h1>`));
    assert.match(html, /"@type":"Service"/);
    assert.match(html, /"@type":"FAQPage"/);
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
  assert.match(hub, /<meta name="robots" content="index,follow">/);
  assert.ok(hub.includes('"@type":"CollectionPage"'));
  assert.ok(hub.includes('"EducationalOrganization"'));
  assert.ok(hub.includes('data-hero-visual'));
  assert.ok(hub.includes('width="1200" height="800"'));
  assert.match(hub, /<link rel="canonical" href="https:\/\/www\.onlinequrancollege\.com\/usa-quran-classes\/states">/);
  for (const [slug] of states) assert.ok(hub.includes(`href="/${slug}-quran-classes"`));
  assert.ok(read("public/usa-quran-classes/index.html").includes('href="/usa-quran-classes/states"'));
  assert.ok(read("src/app/sitemap.js").includes('"/usa-quran-classes/states"'));
  assert.ok(read("next.config.mjs").includes('source: "/usa-quran-classes/states"'));
});
