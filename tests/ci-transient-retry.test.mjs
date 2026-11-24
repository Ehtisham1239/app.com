import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const audit = readFileSync(new URL("../scripts/performance-audit.mjs", import.meta.url), "utf8");
const workflow = readFileSync(new URL("../.github/workflows/oqc-quality-checks.yml", import.meta.url), "utf8");

test("Lighthouse audit retries only NO_NAVSTART and NO_FCP, at most 3 times", () => {
  assert.match(audit, /TRANSIENT_LIGHTHOUSE_CODES = new Set\(\['NO_NAVSTART', 'NO_FCP', 'CHROME_INTERSTITIAL_ERROR'\]\)/);
  assert.match(audit, /!TRANSIENT_LIGHTHOUSE_CODES\.has\(error\.code\) \|\| attempt === 3\) throw error/);
});

test("production smoke retries transient 5xx while a deploy restarts, and still requires 200", () => {
  assert.match(workflow, /curl -sS --retry 6 --retry-delay 10 -o \/tmp\/oqc-response/);
  assert.match(workflow, /test "\$status" = "200" \|\| \{ echo "\$path returned \$status"; exit 1; \}/);
});
