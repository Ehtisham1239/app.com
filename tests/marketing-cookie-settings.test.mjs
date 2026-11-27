import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

test("cookie settings link reopens only the existing marketing consent choice", () => {
  const component = read("../src/components/site/marketing-cookie-settings-link.jsx");
  assert.match(component, /oqc:open-marketing-preferences/);
  assert.match(component, /Cookie settings/);
  assert.doesNotMatch(component, /analytics_storage|Analytics preferences/);
});

test("cookie settings link is shown only when the Meta Pixel is configured", () => {
  const footer = read("../src/components/site/footer.jsx");
  const layout = read("../src/app/(site)/layout.jsx");
  assert.match(footer, /marketingCookiesEnabled &&/);
  assert.match(layout, /marketingCookiesEnabled=\{Boolean\(marketingPixelId\)\}/);
  assert.match(layout, /const marketingPixelId = metaPixelId\(process\.env\.META_PIXEL_ID\)/);
});
