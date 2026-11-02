import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("public Trustpilot references remain text links until official widget/API entitlement is verified", () => {
  const home = read("src/app/(site)/page.jsx");
  const reviews = read("src/app/(site)/reviews/page.jsx");
  const settings = read("src/app/admin/(panel)/settings/page.jsx");
  const defaults = read("src/lib/default-settings.js");

  assert.doesNotMatch(home, /TrustpilotReviews|trustpilotSection|TrustpilotSummary/);
  assert.doesNotMatch(reviews, /TrustpilotReviews|trustpilotSection|TrustpilotSummary/);
  assert.match(reviews, /read our public Trustpilot profile/);
  assert.doesNotMatch(settings, /site\.trustpilot_reviews|site\.trustpilot\"/);
  assert.doesNotMatch(defaults, /TRUSTPILOT_DEFAULT_REVIEWS|site\.trustpilot_reviews/);
  assert.match(settings, /does not automatically publish to Trustpilot/);
});

test("Trustpilot invitations remain optional and independent of private OQC feedback", () => {
  const reviewSettings = read("src/lib/reviews-button.js");
  const reviewForm = read("src/components/site/review-form.jsx");
  assert.match(reviewSettings, /https:\/\/www\.trustpilot\.com\/evaluate\/onlinequrancollege\.com/);
  assert.match(reviewForm, /Every reviewer, whatever their rating/);
  assert.match(reviewForm, /review gating/);
});
