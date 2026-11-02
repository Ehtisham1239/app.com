import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { REVIEWS_BUTTON_DEFAULTS, reviewsButtonConfig, reviewsButtonError, trustpilotUrl } from "../src/lib/reviews-button.js";
import { DEFAULT_SETTINGS } from "../src/lib/default-settings.js";

const SOCIAL = { trustpilot: "https://www.trustpilot.com/review/onlinequrancollege.com" };

test("only https Trustpilot addresses are accepted as the button link", () => {
  for (const ok of ["https://www.trustpilot.com/review/onlinequrancollege.com", "https://uk.trustpilot.com/review/onlinequrancollege.com", "https://trustpilot.com/evaluate/onlinequrancollege.com"]) assert.ok(trustpilotUrl(ok), ok);
  for (const bad of ["javascript:alert(1)", "http://www.trustpilot.com/review/x", "https://trustpilot.com.evil.example/review/x", "https://eviltrustpilot.com/x", "https://user:pw@www.trustpilot.com/x", "/review", "", null, 42]) assert.equal(trustpilotUrl(bad), "", String(bad));
});

test("the button is on by default and reuses the Social links Trustpilot page", () => {
  assert.deepEqual(DEFAULT_SETTINGS["site.reviews_button"], REVIEWS_BUTTON_DEFAULTS);
  const config = reviewsButtonConfig(undefined, SOCIAL);
  assert.equal(config.href, SOCIAL.trustpilot);
  assert.equal(config.label, "Review us on Trustpilot");
  assert.equal(config.sublabel, "Parents & students");
  assert.equal(config.everyPage, false, "home page only unless staff choose every page");
});

test("CMS values control text, link and visibility", () => {
  const custom = reviewsButtonConfig({ enabled: true, label: " Rate us ", sublabel: "", url: "https://uk.trustpilot.com/review/onlinequrancollege.com", every_page: true }, SOCIAL);
  assert.deepEqual(custom, { href: "https://uk.trustpilot.com/review/onlinequrancollege.com", label: "Rate us", sublabel: "", everyPage: true });
  assert.equal(reviewsButtonConfig({ enabled: false }, SOCIAL), null, "switched off in CMS");
  assert.equal(reviewsButtonConfig(undefined, { trustpilot: "" }), null, "no Trustpilot link anywhere: nothing to show");
  assert.equal(reviewsButtonConfig({ url: "https://example.com/fake-reviews" }, { trustpilot: "" }), null, "a non-Trustpilot link never renders");
  assert.equal(reviewsButtonConfig({ url: "https://example.com/x" }, SOCIAL).href, SOCIAL.trustpilot, "invalid custom link falls back to the saved Trustpilot page");
});

test("the settings editor rejects unsafe links and unusable text before saving", () => {
  assert.equal(reviewsButtonError(REVIEWS_BUTTON_DEFAULTS), null);
  assert.match(reviewsButtonError({ ...REVIEWS_BUTTON_DEFAULTS, url: "javascript:alert(1)" }), /trustpilot\.com/);
  assert.match(reviewsButtonError({ ...REVIEWS_BUTTON_DEFAULTS, label: "  " }), /button text/i);
  assert.equal(reviewsButtonError({ ...REVIEWS_BUTTON_DEFAULTS, enabled: false, label: "" }), null, "an empty label is fine when the button is off");
  assert.match(reviewsButtonError({ ...REVIEWS_BUTTON_DEFAULTS, label: "x".repeat(41) }), /40 characters/);
});

test("the button opens Trustpilot safely, stays bottom-left and clears the mobile action bar", () => {
  const source = readFileSync(new URL("../src/components/site/reviews-button.jsx", import.meta.url), "utf8");
  assert.match(source, /rel="noopener noreferrer"/);
  assert.match(source, /target="_blank"/);
  assert.match(source, /aria-label=/);
  assert.match(source, /fixed bottom-\[calc\(5\.25rem\+env\(safe-area-inset-bottom\)\)\] left-3/);
  assert.match(source, /lg:bottom-5 lg:left-5/);
  assert.match(source, /pathname === "\/"/);
  const layout = readFileSync(new URL("../src/app/(site)/layout.jsx", import.meta.url), "utf8");
  assert.match(layout, /<ReviewsButton config=\{reviewsButtonConfig\(settings\["site\.reviews_button"\], settings\["site\.social"\]\)\} \/>/);
});
