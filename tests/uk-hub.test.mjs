import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { UK_HUB, ukHubFaqs } from "../src/lib/uk-hub.js";
import { SEARCH_INTENTS } from "../src/lib/search-intent.js";

// E-11 (3 Nov 2026): UK hub answers the UK queries Search Console shows, without unverified claims.
test("UK hub uses the searched phrasing in its intro, section headings and FAQ", () => {
  assert.match(SEARCH_INTENTS["/locations/united-kingdom"].intro, /^Learn Quran online in the UK/);
  assert.match(UK_HUB.pathsHeading, /Learn Quran online in the UK/);
  assert.match(UK_HUB.adultHeading, /Online Quran classes for adults in the UK/);
  assert.equal(UK_HUB.feeQuestion, "How much do online Quran classes cost in the UK?");
  const faqs = ukHubFaqs();
  assert.ok(faqs.length >= 1 && faqs.every((f) => f.question.endsWith("?") && f.answer.length > 80));
});

test("UK hub copy makes no price, office, credential or response-time claims", () => {
  const text = [...Object.values(UK_HUB), ...ukHubFaqs().flatMap((f) => [f.question, f.answer])].join(" ");
  assert.doesNotMatch(text, /£|\d+\s*(?:GBP|pounds)|office|branch|centre in|certified|qualified|ijazah|within \d+ (?:hours?|minutes?)|guarantee/i);
});

test("location page wires the UK copy into the visible page and the FAQPage data", () => {
  const page = readFileSync(new URL("../src/components/site/location-page.jsx", import.meta.url), "utf8");
  assert.match(page, /import \{ UK_HUB, ukHubFaqs \} from "@\/lib\/uk-hub";/);
  assert.match(page, /!city && country\.slug === "united-kingdom" \? UK_HUB\.feeQuestion : hub\?\.feeQuestion \|\| `What are the fees in \$\{country\.currency\}\?`/);
  assert.match(page, /\.\.\.\(!city && country\.slug === "united-kingdom" \? ukHubFaqs\(\) : \[\]\)/);
  // One faqs array feeds both the visible list and the FAQPage JSON-LD.
  assert.match(page, /safeJsonLd\(faqSchema\(faqs\)\)/);
  assert.match(page, /<FaqList faqs=\{faqs\}/);
  assert.match(page, /\{UK_HUB\.pathsHeading\}/);
  assert.match(page, /\{UK_HUB\.adultHeading\}/);
});
