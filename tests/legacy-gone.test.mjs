import test from "node:test";
import assert from "node:assert/strict";
import nextConfig from "../next.config.mjs";
import { GET, HEAD } from "../src/app/gone/route.js";

const { beforeFiles } = await nextConfig.rewrites();
const toGone = beforeFiles.filter((r) => r.destination === "/gone");
// Build the same matcher Next uses for these simple patterns.
const matches = (path) => toGone.some((r) => new RegExp("^" + r.source
  .replace(/:(\w+)\(([^)]*)\)\*?/g, (_, __, re) => `(?:${re})`)
  .replace(/:path\*|:slug\*/g, ".*") + "$").test(path));

test("old WordPress URLs without an equivalent answer 410", async () => {
  for (const path of ["/noorani-qaida-quiz", "/tajweed-quiz", "/islamic-quiz", "/quran-quiz", "/quiz-2", "/lp-profile", "/api-test", "/sign-in",
    "/importance-of-hajj-and-the-steps-of-hajj-2024", "/the-quran-a-guide-for-humanity", "/wp-json/elementskit/v1", "/wp-content/uploads/x.png",
    "/wp-login.php", "/2012/10/17/kod-pocztowy", "/2013/01/23/komplety-erotyczne"]) assert.ok(matches(path), path);
  for (const res of [GET(), HEAD()]) { assert.equal(res.status, 410); assert.match(res.headers.get("x-robots-tag"), /noindex/); }
});

test("real pages are never rewritten to 410", () => {
  for (const path of ["/", "/courses", "/pricing", "/blog", "/blog/tajweed-rules-for-beginners", "/teachers/aisha", "/locations/canada", "/login", "/free-trial", "/learn/quran-for-reverts", "/editorial-standards"]) assert.equal(matches(path), false, path);
});

test("the duplicate parenting article maps to the same blog guide as its sibling", async () => {
  const rules = await nextConfig.redirects();
  const dest = (s) => rules.find((r) => r.source === s)?.destination;
  assert.equal(dest("/teaching-the-quran-to-your-children-2"), "/blog/help-your-kids-learn-quran-online");
  assert.equal(dest("/teaching-the-quran-to-your-children-2"), dest("/start-teaching-the-quran-to-your-children"));
});
