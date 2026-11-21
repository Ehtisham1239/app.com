import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

// A missing named export from the icon module fails `next build` (Turbopack) but not
// `node --test`, so check every import statically. Caught after ddc19a0 broke production.
const root = new URL("../src/", import.meta.url).pathname;
const exported = new Set([...readFileSync(join(root, "components/site/icons.jsx"), "utf8").matchAll(/^export (?:const|function) ([A-Za-z0-9_]+)/gm)].map((m) => m[1]));
const files = (dir) => readdirSync(dir).flatMap((name) => { const path = join(dir, name); return statSync(path).isDirectory() ? files(path) : /\.(jsx?|mjs)$/.test(name) ? [path] : []; });

test("every icon imported from @/components/site/icons is exported by that module", () => {
  assert.ok(exported.size > 10, "icon exports were found");
  const missing = [];
  for (const file of files(root)) {
    for (const [, names] of readFileSync(file, "utf8").matchAll(/import\s*\{([^}]*)\}\s*from\s*["'](?:@\/components\/site\/icons|\.\/icons|\.\.\/site\/icons)["']/g)) {
      for (const name of names.split(",").map((n) => n.trim().split(/\s+as\s+/)[0]).filter(Boolean)) if (!exported.has(name)) missing.push(`${file.replace(root, "src/")}: ${name}`);
    }
  }
  assert.deepEqual(missing, []);
});
