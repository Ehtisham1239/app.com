import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const config = readFileSync(new URL("../next.config.mjs", import.meta.url), "utf8");

test("site-wide headers disable unused powerful browser features and legacy cross-domain policy files", () => {
  for (const feature of ["camera=()", "microphone=()", "geolocation=()", "payment=()", "usb=()", "serial=()", "bluetooth=()", "browsing-topics=()"]) assert.ok(config.includes(feature), feature);
  assert.match(config, /X-Permitted-Cross-Domain-Policies", value: "none"/);
});
