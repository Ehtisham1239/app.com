import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("public pricing does not advertise an unverified family discount", () => {
  const pricing = read("src/app/(site)/pricing/page.jsx");
  const compare = read("src/components/site/fee-compare.jsx");
  const answer = read("src/lib/fee-answer.js");
  const siteData = read("src/lib/site-data.js");

  assert.doesNotMatch(pricing, /15% sibling discount|family discount|15% off/i);
  assert.doesNotMatch(compare, /SIBLING_DISCOUNT|sibling discount|15% off/i);
  assert.doesNotMatch(answer, /sibling discount|family discount|15% off/i);
  assert.ok(siteData.includes("return rows.filter((faq) => !/family discount|sibling discount/i.test"));
});
