import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

// Responsive audit, 3 Nov 2026: at 768px the /learn trial button was 4px wider
// than its three-column cell and made the page scroll sideways.
test("the /learn trial button wraps inside its column", () => {
  assert.match(read("src/app/(site)/learn/page.jsx"), /className="btn btn-primary mt-5 max-w-full whitespace-normal text-center" href="\/free-trial">Request a three-day trial/);
});

test("the responsive audit covers phone to desktop widths and the market pages", () => {
  const src = read("scripts/responsive-audit.mjs");
  assert.match(src, /const WIDTHS = \[320, 360, 390, 768, 1024, 1440\];/);
  for (const path of ["/locations/united-kingdom", "/locations/united-states", "/locations/canada", "/locations/australia", "/locations/united-arab-emirates", "/learn", "/pricing", "/free-trial"]) {
    assert.ok(src.includes(`"${path}"`), path);
  }
});
