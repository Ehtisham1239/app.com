import test from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_SETTINGS } from "../src/lib/default-settings.js";
import { normalizeSeoSettings, seoSettingsError, verificationCode } from "../src/lib/search-settings.js";
import { analyticsConfig } from "../src/lib/analytics.js";

test("verification-only or empty SEO settings retain usable search defaults", () => {
  for (const value of [undefined, null, [], { title: " ", description: "" }, { google_verification: " owner_token " }]) {
    const settings = normalizeSeoSettings(value);
    assert.equal(settings.title, DEFAULT_SETTINGS["site.seo"].title);
    assert.equal(settings.description, DEFAULT_SETTINGS["site.seo"].description);
  }
  const custom = normalizeSeoSettings({ title: " My approved title ", description: " My approved description ", google_verification: " owner_token ", custom: "preserve" });
  assert.equal(custom.title, "My approved title");
  assert.equal(custom.description, "My approved description");
  assert.equal(custom.google_verification, "owner_token");
  assert.equal(custom.custom, "preserve");
});

test("optional verification tokens are never fabricated and reject snippets or file names", () => {
  assert.equal(normalizeSeoSettings({}).google_verification, "");
  assert.equal(normalizeSeoSettings({}).bing_verification, "");
  assert.equal(verificationCode(" real-TOKEN_123 "), "real-TOKEN_123");
  for (const value of ["<meta name='x' content='token'>", "google123.html", "token with spaces", "x".repeat(251), 42]) {
    assert.equal(verificationCode(value), undefined);
    assert.ok(seoSettingsError({ google_verification: value }));
  }
  assert.equal(seoSettingsError({ google_verification: "", bing_verification: "BING_123" }), "");
});

test("fallback analytics uses the owner-approved GTM destination without duplicate GA4 loading", () => {
  const config = analyticsConfig(DEFAULT_SETTINGS["site.analytics"]);
  assert.equal(config.enabled, true);
  assert.equal(config.mode, "gtm");
  assert.equal(config.gtmId, "GTM-W7CMZS53");
  assert.equal(config.ga4Id, "G-57TGPTDNT4");
});
