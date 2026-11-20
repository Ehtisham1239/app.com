import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// 20 Nov 2026: production is on Hostinger, so the Vercel cron never ran and every lead stayed
// "pending" in public.lead_sync_jobs with 0 attempts. A GitHub schedule now calls the worker.
const wf = readFileSync(new URL("../.github/workflows/oqc-lead-sync.yml", import.meta.url), "utf8");

test("lead sync worker runs on a schedule against production with the CRON_SECRET bearer", () => {
  assert.match(wf, /schedule:\s*\n\s*- cron: "\*\/10 \* \* \* \*"/);
  assert.match(wf, /workflow_dispatch:/);
  assert.match(wf, /CRON_SECRET: \$\{\{ secrets\.CRON_SECRET \}\}/);
  assert.match(wf, /-H "Authorization: Bearer \$\{CRON_SECRET\}"/);
  assert.match(wf, /https:\/\/www\.onlinequrancollege\.com\/api\/cron\/lead-sync/);
  assert.match(wf, /permissions:\s*\n\s*contents: read/);
});

test("without the secret the job is a no-op, and a non-200 answer fails loudly", () => {
  assert.match(wf, /if \[ "\$\{#CRON_SECRET\}" -lt 24 \]; then[\s\S]*?exit 0/);
  assert.match(wf, /if \[ "\$\{code\}" != "200" \]; then[\s\S]*?exit 1/);
  assert.doesNotMatch(wf, /echo "\$CRON_SECRET"|echo "\$\{CRON_SECRET\}"/, "the secret is never printed");
});
