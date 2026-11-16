import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const layout = readFileSync(new URL("../src/app/layout.jsx", import.meta.url), "utf8");

test("Microsoft Clarity Consent API v2 keeps analytics and advertising storage denied with documented key casing", () => {
  assert.ok(
    layout.includes('consentv2",{analytics_Storage:"denied",ad_Storage:"denied"}'),
    "Clarity must pass both denied states using Microsoft's documented case-sensitive keys",
  );
  assert.ok(!layout.includes('analytics_storage:"denied"'));
  assert.ok(!layout.includes('ad_storage:"denied"'));
});

test("Clarity remains excluded from private application routes", () => {
  const guardStart = layout.indexOf("if (/^");
  assert.notEqual(guardStart, -1);
  const guard = layout.slice(guardStart, guardStart + 140);
  assert.match(guard, /admin\|parents\|api\|auth/);
  assert.match(guard, /location\.pathname/);
});

test("the privacy policy discloses Microsoft Clarity and its cookieless denied-consent mode", () => {
  const page = readFileSync(new URL("../src/components/site/cms-page.jsx", import.meta.url), "utf8");
  const section = page.slice(page.indexOf('id="optional-analytics"'));
  assert.match(section, /<h3>Microsoft Clarity<\/h3>/);
  assert.match(section, /consent signals set to denied/);
  assert.match(section, /does not set Clarity cookies/);
  assert.match(section, /not loaded on staff, parent-portal, sign-in or API pages/);
});
