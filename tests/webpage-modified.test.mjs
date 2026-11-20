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
});
