import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { US_HUB, usHubFaqs } from "../src/lib/us-hub.js";
import { SEARCH_INTENTS } from "../src/lib/search-intent.js";
import { LEARNING_GUIDES } from "../src/lib/learning-guides.js";

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

test("USA country hub answers US searches: kids, adults, new Muslims, English, Tafseer, cost", () => {
  const intent = SEARCH_INTENTS["/locations/united-states"];
  assert.match(intent.intro, /^Find online Quran classes in the USA/);
  assert.match(intent.intro, /Eastern, Central, Mountain or Pacific/);
  assert.match(intent.intro, /no US office or local branch/);
  assert.equal(US_HUB.feeQuestion, "How much do online Quran classes cost in the USA?");
  assert.equal(US_HUB.steps.length, 3);
  assert.match(US_HUB.steps[2].text, /Weekend plan is excluded/);
  const q = usHubFaqs().map((f) => f.question).join(" ");
  for (const topic of [/adults/, /English/, /new Muslims/, /Tafseer/]) assert.match(q, topic);
  assert.ok(usHubFaqs().every((f) => f.answer.length > 80));
});

test("USA country hub copy makes no price, office, credential, guarantee or response-time claims", () => {
  const text = JSON.stringify(US_HUB) + JSON.stringify(usHubFaqs());
  assert.doesNotMatch(text, /\$\d|\d+\s*USD|US\$|office|branch|licen[cs]e|certified|guarantee|within \d+ (?:hours?|minutes?|days?)/i);
});

test("every USA country hub link leads to a published guide or article", () => {
  const migrations = readdirSync(new URL("../supabase/migrations/", import.meta.url)).map((f) => read(`supabase/migrations/${f}`)).join("\n");
  const guides = new Set(LEARNING_GUIDES.map((g) => g.path));
  for (const href of [...US_HUB.paths.map((p) => p.href), ...US_HUB.reading.map((r) => r.href)]) {
    const blog = href.match(/^\/blog\/([a-z0-9-]+)$/);
    assert.ok(guides.has(href) || (blog && migrations.includes(`'${blog[1]}'`)), href);
  }
});

test("the US hub renders the landing block, one fee answer and the US FAQs in the FAQPage data", () => {
  const page = read("src/components/site/location-page.jsx");
  assert.match(page, /COUNTRY_HUBS\[country\.slug\]/);
  assert.match(page, /<CountryLanding hub=\{hub\} fee=\{hubFee\}/);
  assert.match(page, /answer: hubFee \? hubFee\.answer :/, "the FAQ and the fee box give the same live answer");
  assert.match(page, /\.\.\.\(hub\?\.faqs \? hub\.faqs\(\) : \[\]\)/);
  const landing = read("src/components/site/country-landing.jsx");
  assert.match(landing, /teachers\.slice\(0, 3\)/);
  assert.doesNotMatch(landing, /TrustScore|aggregateRating|★/i, "reviews are a text link, not a copied rating");
  for (const link of landing.match(/<a [^>]*target="_blank"[^>]*>/g) || []) assert.match(link, /rel="noopener noreferrer"/);
});
