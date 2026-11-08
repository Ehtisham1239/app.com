import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const { scripts } = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));

// Hostinger's shared Node.js hosting cannot start Turbopack's PostCSS worker
// process ("node process exited before we could connect"), so the Hostinger
// mirror builds with webpack. Vercel keeps the default Turbopack `build`.
test("Hostinger build uses webpack and keeps the release preparation and asset checks", () => {
  const steps = scripts["build:hostinger"].split("&&").map((s) => s.trim());
  assert.deepEqual(steps, [
    scripts.prebuild,
    "node scripts/prepare-responsive-learning.mjs",
    "next build --webpack",
    scripts.postbuild,
  ]);
});

test("the Vercel build script is unchanged", () => {
  assert.equal(scripts.build, "node scripts/prepare-responsive-learning.mjs && next build");
  assert.equal(scripts.prebuild, "node scripts/prepare-production-build.mjs");
  assert.equal(scripts.postbuild, "node scripts/verify-build-assets.mjs");
});
