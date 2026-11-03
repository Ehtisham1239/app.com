import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import nextConfig from "../next.config.mjs";

const headers = await nextConfig.headers();
const hostRule = headers.find((rule) => rule.has?.some((h) => h.type === "host"));
const hostPattern = hostRule && new RegExp(`^${hostRule.has.find((h) => h.type === "host").value}$`);

test("*.vercel.app hosts are kept out of search indexes; the canonical domain is not", () => {
  assert.ok(hostRule, "a host-scoped header rule exists");
  assert.equal(hostRule.source, "/:path*");
  assert.deepEqual(hostRule.headers, [{ key: "X-Robots-Tag", value: "noindex, follow" }]);
  for (const host of ["appcom-online-quran-college.vercel.app", "appcom-online-quran-college-6c7mgmyos-ehtisham1239s-projects.vercel.app"]) assert.match(host, hostPattern, host);
  for (const host of ["www.onlinequrancollege.com", "onlinequrancollege.com", "vercel.app.onlinequrancollege.com"]) assert.doesNotMatch(host, hostPattern, host);
});

test("the trial form shows no example phone number that could be mistaken for a real one", () => {
  const form = readFileSync(new URL("../src/components/site/quick-trial-form.jsx", import.meta.url), "utf8");
  assert.doesNotMatch(form, /7700\s?900\d{3}/, "Ofcom drama-range sample number removed");
  assert.match(form, /placeholder="Start with country code: \+1, \+44, \+61…"/);
  assert.match(form, /aria-describedby=\{errors\.phone \? "q-phone-hint q-phone-error" : "q-phone-hint"\}/);
});
