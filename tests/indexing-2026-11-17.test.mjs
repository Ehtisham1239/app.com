import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

// Owner decision 17 Nov 2026: every public page is indexable and a plain-text
// sitemap is offered to crawlers alongside sitemap.xml.
test("/reviews and /verify-certificate are indexable and listed in the sitemap", () => {
  assert.doesNotMatch(read("src/app/(site)/reviews/page.jsx"), /index: false/);
  assert.match(read("src/app/(site)/verify-certificate/page.jsx"), /seo_noindex: false/);
  const sitemap = read("src/app/sitemap.js");
  // The academic hub is appended after /at-a-glance only when subjects are published (tests/academic-subjects.test.mjs).
  assert.match(sitemap, /"\/reviews", "\/verify-certificate", "\/usa-quran-classes", "\/at-a-glance"(, \.\.\.\(courses\.some[^\]]*\] : \[\]\))?\]/);
});

test("/sitemap.txt lists the same URLs as sitemap.xml as plain text", () => {
  const route = read("src/app/sitemap.txt/route.js");
  assert.match(route, /import sitemap from "\.\.\/sitemap\.js"/);
  assert.match(route, /text\/plain; charset=utf-8/);
  assert.match(route, /entry\.url/);
});

test("CMS landing pages declare a WebPage identity and open with a hero visual", () => {
  const page = read("src/components/site/cms-page.jsx");
  assert.match(page, /function landingWebPage\(page\)/);
  assert.match(page, /"@type": "WebPage", "@id": `\$\{url\}#webpage`, url/);
  assert.match(page, /heroImage: page\.cover_url \?/);
  const sections = read("src/components/site/page-sections.jsx");
  assert.match(sections, /<div data-hero-visual><ContentImage src=\{heroImage\.src\}/);
});

test("/reviews declares its WebPage identity and marks its hero visual", () => {
  const page = read("src/app/(site)/reviews/page.jsx");
  assert.match(page, /"@type": "WebPage", "@id": `\$\{SITE_URL\}\/reviews#webpage`, url: `\$\{SITE_URL\}\/reviews`/);
  assert.match(page, /<div data-hero-visual className="shrink-0"><img src="\/brand\/mark-v2-128\.png"/);
});
