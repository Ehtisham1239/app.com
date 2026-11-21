import test from "node:test";
import assert from "node:assert/strict";
import { isWebPageIdentity } from "../scripts/lib/page-schema.mjs";

const canonical = "https://www.onlinequrancollege.com/contact";

test("a ContactPage is accepted as a WebPage identity", () => {
  assert.equal(isWebPageIdentity({ "@type": "ContactPage", url: canonical }, canonical), true);
});

test("a WebPage subtype array is accepted when its canonical URL matches", () => {
  assert.equal(isWebPageIdentity({ "@type": ["ContactPage", "WebPage"], url: canonical }, canonical), true);
});

test("non-page schema types and mismatched or invalid URLs are rejected", () => {
  assert.equal(isWebPageIdentity({ "@type": "EducationalOrganization", url: canonical }, canonical), false);
  assert.equal(isWebPageIdentity({ "@type": "ContactPage", url: "https://example.com/contact" }, canonical), false);
  assert.equal(isWebPageIdentity({ "@type": "ContactPage", url: "not a URL" }, canonical), false);
});
