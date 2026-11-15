import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const layout = readFileSync(new URL("../src/app/layout.jsx", import.meta.url), "utf8");

test("Microsoft Clarity Consent API v2 keeps analytics and advertising storage denied with documented key casing", () => {
  const call = layout.match(/consentv2",\\{([^}]+)\\}/);
  assert.ok(call, "Clarity Consent API v2 call must exist");
  assert.match(call[1], /analytics_Storage\\s*:\\s*"denied"/);
  assert.match(call[1], /ad_Storage\\s*:\\s*"denied"/);
  assert.doesNotMatch(call[1], /\\banalytics_storage\\b|\\bad_storage\\b/);
});

test("Clarity remains excluded from private application routes", () => {
  assert.match(layout, /\\/\\^\\\\\\/\\(\\?:admin\\|parents\\|api\\|auth\\)/);
});
