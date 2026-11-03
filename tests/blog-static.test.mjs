import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

test("/blog is served from the static cache; filtered lists keep their address", async () => {
  const page = read("src/app/(site)/blog/page.jsx");
  assert.doesNotMatch(page, /searchParams/, "the first page must not read the query string");
  assert.match(page, /export const revalidate = 300/);
  const browse = read("src/app/(site)/blog/browse/page.jsx");
  assert.match(browse, /blogParams\(await searchParams\)/, "invalid filters still 404 via blogParams");
  const config = (await import("../next.config.mjs")).default;
  const { beforeFiles } = await config.rewrites();
  for (const key of ["page", "category"]) {
    const rule = beforeFiles.find((r) => r.has?.[0]?.key === key);
    assert.ok(rule && rule.source === "/blog" && rule.destination === "/blog/browse", key);
  }
  const shared = read("src/components/site/blog-index.jsx");
  assert.doesNotMatch(shared, /searchParams/);
  assert.match(shared, /alternates|contentMetadata\(/, "metadata (canonical) still comes from contentMetadata");
});
