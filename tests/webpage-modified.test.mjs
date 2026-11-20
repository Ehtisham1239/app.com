import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { modifiedIso } from "../src/lib/seo.js";

test("modifiedIso returns an ISO timestamp for a stored date", () => {
  assert.equal(modifiedIso("2026-11-20T10:00:00+00:00"), "2026-11-20T10:00:00.000Z");
  assert.equal(modifiedIso(new Date("2026-11-01T00:00:00Z")), "2026-11-01T00:00:00.000Z");
});

test("modifiedIso never invents a date for missing or invalid input", () => {
  for (const bad of [undefined, null, "", "not a date", "0000-99-99"]) assert.equal(modifiedIso(bad), undefined);
});

test("CMS pages pass their stored updated_at to the WebPage schema; nothing else is dated", () => {
  const cms = readFileSync(new URL("../src/components/site/cms-page.jsx", import.meta.url), "utf8");
  const chrome = readFileSync(new URL("../src/components/site/chrome.jsx", import.meta.url), "utf8");
  assert.match(cms, /modified=\{page\.updated_at\}/);
  assert.match(cms, /dateModified: modifiedIso\(page\.updated_at\)/);
  assert.equal((chrome.match(/\.\.\.\(dateModified \? \{ dateModified \} : \{\}\)/g) || []).length, 2);
  assert.equal((chrome.match(/\.\.\.\(datePublished \? \{ datePublished \} : \{\}\)/g) || []).length, 2);
  assert.match(cms, /published=\{page\.published_at\}/);
  assert.match(cms, /datePublished: modifiedIso\(page\.published_at\)/);
});

test("static pages carry the reviewed date as dateModified", async () => {
  const { STATIC_PAGES_REVIEWED, modifiedIso } = await import("../src/lib/seo.js");
  assert.equal(modifiedIso(STATIC_PAGES_REVIEWED), STATIC_PAGES_REVIEWED);
  for (const f of ["learn", "locations", "pricing", "faq", "courses"]) {
    const src = readFileSync(`src/app/(site)/${f}/page.jsx`, "utf8");
    assert.match(src, /modified=\{STATIC_PAGES_REVIEWED\}/, f);
  }
});

test("teacher profile shows an initial avatar (not a photo) when no photo is stored", () => {
  const src = readFileSync("src/app/(site)/teachers/[slug]/page.jsx", "utf8");
  assert.match(src, /teacherInitial\(t\.display_name\)/);
  assert.match(src, /t\.photo_url \?/);
});
