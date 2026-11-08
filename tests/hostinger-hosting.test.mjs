import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import config from "../next.config.mjs";
import { currencyForTimeZone } from "../src/lib/fx.js";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("the bare domain redirects permanently to www, keeping the path", async () => {
  const rules = await config.redirects();
  const apex = rules.filter((rule) => rule.has?.some((h) => h.type === "host" && h.value === "onlinequrancollege.com"));
  assert.equal(apex.length, 1);
  assert.equal(apex[0].source, "/:path*");
  assert.equal(apex[0].destination, "https://www.onlinequrancollege.com/:path*");
  assert.equal(apex[0].permanent, true);
  // www itself must never match, or every page would loop.
  assert.equal(rules.some((rule) => rule.has?.some((h) => h.type === "host" && /www\.onlinequrancollege\.com/.test(h.value))), false);
});

test("browser time zone picks one of the four display currencies, else USD stays", () => {
  assert.equal(currencyForTimeZone("Europe/London"), "GBP");
  assert.equal(currencyForTimeZone("Europe/Jersey"), "GBP");
  assert.equal(currencyForTimeZone("Australia/Sydney"), "AUD");
  assert.equal(currencyForTimeZone("Australia/Perth"), "AUD");
  assert.equal(currencyForTimeZone("Asia/Dubai"), "AED");
  assert.equal(currencyForTimeZone("America/New_York"), "USD");
  assert.equal(currencyForTimeZone("Asia/Karachi"), null);
  assert.equal(currencyForTimeZone("Europe/Paris"), null);
  assert.equal(currencyForTimeZone(""), null);
  assert.equal(currencyForTimeZone(undefined), null);
});

test("currency hook falls back to the time zone only when the host gives no country", () => {
  const hook = read("src/lib/use-visitor-currency.js");
  assert.match(hook, /geo\?\.country \? geo\.currency : fromTimeZone\(\)/);
  assert.match(hook, /\.catch\(\(\) => apply\(fromTimeZone\(\)\)\)/);
});

test("Supabase works without env vars, using only the public publishable key", () => {
  const config = read("src/lib/config.js");
  assert.match(config, /\|\| "sb_publishable_[A-Za-z0-9_-]+";/);
  // Never a secret/service key as a default.
  assert.doesNotMatch(config, /sb_secret_|service_role/);
});

test("Vercel Speed Insights loads only on Vercel builds", () => {
  const layout = read("src/app/(site)/layout.jsx");
  assert.match(layout, /process\.env\.VERCEL === "1" && <SpeedInsights \/>/);
  assert.doesNotMatch(layout, /^\s*<SpeedInsights \/>/m);
});
