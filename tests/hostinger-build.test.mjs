import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const { scripts } = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));

// Hostinger's shared Node.js hosting cannot start Turbopack's PostCSS worker
// process ("node process exited before we could connect"), so the Hostinger
// mirror builds with webpack. Its thread limit also rejects one page-data worker
// per host CPU (63) and default Rust thread pools ("os error 11"), so the build
// caps them. Vercel keeps the default Turbopack `build`.
test("Hostinger build uses webpack and keeps the release preparation and asset checks", () => {
  const steps = scripts["build:hostinger"].split("&&").map((s) => s.trim());
  assert.deepEqual(steps, [
    scripts.prebuild,
    "node scripts/prepare-responsive-learning.mjs",
    "OQC_BUILD_CPUS=2 TOKIO_WORKER_THREADS=2 RAYON_NUM_THREADS=2 next build --webpack",
    scripts.postbuild,
  ]);
});

test("the Vercel build script is unchanged", () => {
  assert.equal(scripts.build, "node scripts/prepare-responsive-learning.mjs && next build");
  assert.equal(scripts.prebuild, "node scripts/prepare-production-build.mjs");
  assert.equal(scripts.postbuild, "node scripts/verify-build-assets.mjs");
});

test("the worker cap applies only when OQC_BUILD_CPUS is set", async () => {
  const load = async (value) => {
    if (value === undefined) delete process.env.OQC_BUILD_CPUS; else process.env.OQC_BUILD_CPUS = value;
    return (await import(`../next.config.mjs?cpus=${value}`)).default;
  };
  try {
    assert.equal((await load(undefined)).experimental, undefined);
    assert.equal((await load("0")).experimental, undefined);
    assert.deepEqual((await load("2")).experimental, { cpus: 2 });
  } finally {
    delete process.env.OQC_BUILD_CPUS;
  }
});
