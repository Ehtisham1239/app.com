import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { CONTENT_ICON_SYMBOLS } from "../src/lib/site-icon-names.js";

test("every public and CMS-selected icon resolves to a same-origin licensed SVG symbol", () => {
  const component = readFileSync(new URL("../src/components/site/icons.jsx", import.meta.url), "utf8");
  const asset = component.match(/\/icons\/(site-icons-[a-f0-9]+\.svg)/)?.[1];
  assert.ok(asset);
  const svg = readFileSync(new URL(`../public/icons/${asset}`, import.meta.url), "utf8");
  const symbols = [...svg.matchAll(/<symbol id="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(symbols).size, symbols.length);
  for (const match of component.matchAll(/name="([^"]+)"/g)) assert.ok(symbols.includes(match[1]), match[1]);
  for (const symbol of Object.values(CONTENT_ICON_SYMBOLS)) assert.ok(symbols.includes(symbol), symbol);
  assert.ok(svg.includes("Permission to use, copy, modify"));
  assert.ok(component.includes('aria-hidden="true"'));
  assert.equal(/<script|<foreignObject|\son\w+=/.test(svg), false);
});
