import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { TRUSTPILOT_DEFAULTS, TRUSTPILOT_DEFAULT_REVIEWS, TRUSTPILOT_PROFILE_URL, trustpilotReviewsError, trustpilotSection, trustpilotSummaryError } from "../src/lib/trustpilot.js";
import { DEFAULT_SETTINGS } from "../src/lib/default-settings.js";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const review = (over = {}) => ({ name: "Amina", country: "UK", rating: "5", date: "2024-06-06", title: "Great", text: "Lovely teacher and clear lessons.", excerpt: false, url: "https://www.trustpilot.com/reviews/abc123", ...over });

test("defaults feature genuine linked Trustpilot reviews with the profile's score and count", () => {
  assert.deepEqual(DEFAULT_SETTINGS["site.trustpilot"], TRUSTPILOT_DEFAULTS);
  assert.equal(DEFAULT_SETTINGS["site.trustpilot_reviews"].length, TRUSTPILOT_DEFAULT_REVIEWS.length);
  assert.equal(trustpilotReviewsError(TRUSTPILOT_DEFAULT_REVIEWS), null, "every default review is valid and linked");
  assert.equal(trustpilotSummaryError(TRUSTPILOT_DEFAULTS), null);
  const data = trustpilotSection(undefined, undefined, {});
  assert.equal(data.profileUrl, TRUSTPILOT_PROFILE_URL);
  assert.equal(data.trustScore, 4.3);
  assert.equal(data.reviewCount, 8);
  assert.equal(data.reviews.length, 6, "home page shows six");
  for (const r of data.reviews) {
    assert.ok(r.rating >= 4);
    assert.match(r.url, /^https:\/\/www\.trustpilot\.com\/reviews\/[0-9a-f]+$/);
  }
});

test("only reviews at or above the minimum rating are featured, in CMS order", () => {
  const list = [review({ name: "A", rating: "2", url: "https://www.trustpilot.com/reviews/a1" }), review({ name: "B", rating: "4", url: "https://www.trustpilot.com/reviews/b1" }), review({ name: "C", rating: "5", url: "https://www.trustpilot.com/reviews/c1" })];
  assert.deepEqual(trustpilotSection({}, list).reviews.map((r) => r.name), ["B", "C"]);
  assert.deepEqual(trustpilotSection({ min_rating: "5" }, list).reviews.map((r) => r.name), ["C"]);
  assert.deepEqual(trustpilotSection({ min_rating: "1" }, list).reviews.map((r) => r.name), ["B", "C"], "minimum cannot be lowered below 4 on the site");
  assert.equal(trustpilotSection({}, [review({ rating: "3" })]), null, "nothing to feature hides the section");
  assert.equal(trustpilotSection({ enabled: false }, list), null, "switched off in CMS");
});

test("reviews without a genuine Trustpilot link are never shown and cannot be saved", () => {
  for (const url of ["https://example.com/reviews/x", "javascript:alert(1)", "http://www.trustpilot.com/reviews/x", ""]) {
    assert.equal(trustpilotSection({}, [review({ url })]), null, url);
    assert.match(trustpilotReviewsError([review({ url })]), /Trustpilot link/, url);
  }
  assert.match(trustpilotReviewsError([review({ url: TRUSTPILOT_PROFILE_URL })]), /review's own/, "profile link is not a review link");
  assert.match(trustpilotReviewsError([review({ rating: "6" })]), /rating/);
  assert.match(trustpilotReviewsError([review({ name: " " })]), /reviewer name/);
  assert.match(trustpilotReviewsError([review({ date: "06/06/2024" })]), /date/);
});

test("summary values must match a real profile format", () => {
  assert.match(trustpilotSummaryError({ trust_score: "9" }), /TrustScore/);
  assert.match(trustpilotSummaryError({ review_count: "lots" }), /whole number/);
  assert.match(trustpilotSummaryError({ profile_url: "https://evil.example" }), /trustpilot\.com/);
  assert.match(trustpilotSummaryError({ min_rating: "3" }), /4 or 5/);
  const data = trustpilotSection({ trust_score: "", review_count: "" }, [review()]);
  assert.equal(data.trustScore, null, "a blank score is not invented");
  assert.equal(data.reviewCount, null);
});

test("the page always links to every review and never emits self-serving review schema", () => {
  const component = read("src/components/site/trustpilot-reviews.jsx");
  assert.match(component, /See all\{data\.reviewCount/);
  assert.match(component, /Every review, whatever its rating, is visible on Trustpilot/);
  for (const link of component.match(/<a [^>]*target="_blank"[^>]*>/g) || []) assert.match(link, /rel="noopener noreferrer"/, link);
  for (const file of ["src/components/site/trustpilot-reviews.jsx", "src/app/(site)/page.jsx", "src/app/(site)/reviews/page.jsx"]) {
    assert.doesNotMatch(read(file), /AggregateRating|"@type": "Review"/, file);
  }
  assert.doesNotMatch(component, /^"use client"/, "server-rendered: no client JavaScript");
});
