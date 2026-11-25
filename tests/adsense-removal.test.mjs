import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

test("public layout does not load or verify Google AdSense", () => {
  const layout = readFileSync(new URL("../src/app/(site)/layout.jsx", import.meta.url), "utf8");
  assert.doesNotMatch(layout, /google-adsense-account|adsbygoogle\.js|ca-pub-\d+/);
  assert.equal(existsSync(new URL("../public/ads.txt", import.meta.url)), false);
});
