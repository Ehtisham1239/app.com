import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { LEARNING_GUIDES } from "../src/lib/learning-guides.js";
import { INDEXED_MARKETS, getLocation, locationPath } from "../src/lib/locations.js";

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const route = read("src/app/llms.txt/route.js");

test("llms.txt lists every learning guide and indexed country page", () => {
  assert.match(route, /LEARNING_GUIDES\.map\(g => `- \[\$\{label\(g\.title\)\}\]\(\$\{g\.path\}\)/);
  assert.match(route, /INDEXED_MARKETS\.map\(getLocation\)/);
  assert.ok(LEARNING_GUIDES.length >= 6);
  for (const slug of INDEXED_MARKETS) assert.ok(getLocation(slug) && locationPath(getLocation(slug)).startsWith("/locations/"), slug);
});

test("llms.txt key facts repeat what public pages already state", () => {
  const pricing = read("src/app/(site)/pricing/page.jsx");
  assert.match(route, /Each additional child from the same family receives 15% off their monthly fee\./);
  assert.match(pricing, /Each additional child from the same family receives 15% off their monthly fee\./);
  assert.match(route, /the Weekend plan is excluded/);
  assert.doesNotMatch(route, /24 hours|guarantee|best |#1|founded|since 20/i, "no unverified claims");
});

test("Organization data names the five online markets and the subjects taught", () => {
  const layout = read("src/app/(site)/layout.jsx");
  assert.match(layout, /areaServed: AREA_SERVED, knowsAbout: KNOWS_ABOUT/);
  assert.match(layout, /INDEXED_MARKETS\.map\(getLocation\)/);
  assert.equal(INDEXED_MARKETS.length, 5);
});

test("llms.txt distinguishes configured profile links from Organization identity references", () => {
  assert.match(route, /getSettings\(\)/);
  assert.match(route, /settings\?\.\["site\.social"\]/);
  assert.match(route, /## Profile links configured on this website/);
  assert.match(route, /does not independently verify account ownership/);
  assert.match(route, /organizationIdentityProfiles\(settings\?\.\["site\.social"\]\)/);
  assert.match(route, /exact OQC Trustpilot profile URL linked by this website/);
  assert.match(route, /\^https:\\\/\\\/\[\^\\s\]\+\$/, "only https profile URLs are listed");
});

test("editorial standards are linked from articles, Organization data and llms.txt", () => {
  assert.match(route, /\[Editorial standards\]\(\/editorial-standards\)/);
  assert.match(read("src/app/(site)/layout.jsx"), /publishingPrinciples: `\$\{SITE_URL\}\/editorial-standards`/);
  assert.match(read("src/app/(site)/blog/[slug]/page.jsx"), /<Link href="\/editorial-standards"[^>]*>How we write<\/Link>/);
});

test("llms.txt points to the free printable trackers", () => {
  assert.match(route, /\[Free printable Quran trackers\]\(\/free-quran-learning-resources\)/);
});

test("llms.txt turns its site links into absolute URLs before serving", () => {
  assert.match(route, /lines\.join\("\\n"\)\.replaceAll\("\]\(\/", `\]\(\$\{SITE_URL\}\/`\)/);
  const sample = "- [Fees](/pricing)\n- [Trustpilot](https://www.trustpilot.com/review/x)".replaceAll("](/", "](https://www.onlinequrancollege.com/");
  assert.equal(sample, "- [Fees](https://www.onlinequrancollege.com/pricing)\n- [Trustpilot](https://www.trustpilot.com/review/x)");
});

test("llms.txt exposes country-specific official references without calling them endorsements", () => {
  assert.match(route, /MARKET_GUIDES/);
  assert.match(route, /## Market guidance and primary references/);
  assert.match(route, /independent public guidance, not endorsements of OQC/);
  assert.match(route, /guide\.sources\.map\(source =>/);
});
