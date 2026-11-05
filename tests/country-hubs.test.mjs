import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { COUNTRY_HUBS } from "../src/lib/country-hubs.js";
import { US_HUB } from "../src/lib/us-hub.js";
import { UK_HUB } from "../src/lib/uk-hub.js";
import { feeAnswer } from "../src/lib/fee-answer.js";
import { LEARNING_GUIDES } from "../src/lib/learning-guides.js";
import { teacherInitial } from "../src/components/site/teacher-initial.js";

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const migrations = readdirSync(new URL("../supabase/migrations/", import.meta.url)).map((f) => read(`supabase/migrations/${f}`)).join("\n");
const CMS_POSTS = ["noorani-qaida-home-practice-checklist", "online-quran-lessons-canada-time-zones", "online-quran-lessons-uae-families", "online-quran-class-fees-uk-comparison"]; // published in the CMS (checked 3 Nov 2026)
const guides = new Set(LEARNING_GUIDES.map((g) => g.path));

test("all five indexed hubs get a landing block in their own currency", () => {
  assert.deepEqual(Object.keys(COUNTRY_HUBS).sort(), ["australia", "canada", "united-arab-emirates", "united-kingdom", "united-states"]);
  assert.deepEqual(Object.fromEntries(Object.entries(COUNTRY_HUBS).map(([k, h]) => [k, h.currency])), { "united-states": "USD", "united-kingdom": "GBP", canada: "CAD", australia: "AUD", "united-arab-emirates": "AED" });
  assert.equal(COUNTRY_HUBS["united-states"].stepsHeading, US_HUB.stepsHeading);
  assert.equal(COUNTRY_HUBS["united-kingdom"].feeQuestion, UK_HUB.feeQuestion);
  assert.equal(COUNTRY_HUBS["united-kingdom"].paths, null, "the UK keeps its own learning-paths section");
  for (const [slug, hub] of Object.entries(COUNTRY_HUBS)) {
    assert.equal(hub.steps.length, 3, slug);
    assert.match(hub.steps[2].text, /Weekend plan is excluded/, slug);
    assert.match(hub.feeQuestion, new RegExp(`cost in ${hub.place.replace(/[.]/g, "\\.")}\\?$`), slug);
  }
  assert.match(COUNTRY_HUBS.canada.steps[0].text, /Canadian time zone/);
  assert.match(COUNTRY_HUBS["united-arab-emirates"].steps[0].text, /Gulf Standard Time/);
});

test("all market and city landing pages disclose the exact free-trial conditions", () => {
  const page = read("src/components/site/location-page.jsx");
  assert.match(page, /3-day free trial on eligible plans/);
  assert.match(page, /No card is needed; the Weekend plan is excluded/);
  assert.match(page, /Is the 3-day free trial available on every plan/);
  assert.match(page, /No card is needed for an eligible trial/);
});

test("hub copy makes no price, office, credential, guarantee or response-time claims", () => {
  const text = JSON.stringify(Object.values(COUNTRY_HUBS).map((h) => ({ ...h, faqs: h.faqs ? h.faqs() : [] })));
  assert.doesNotMatch(text, /[£$€]\d|\d+\s*(?:USD|GBP|CAD|AUD|AED)|office|branch|licen[cs]e|certified|guarantee|within \d+ (?:hours?|minutes?|days?)/i);
});

test("every hub link leads to a guide or a published article", () => {
  for (const [slug, hub] of Object.entries(COUNTRY_HUBS)) for (const href of [...(hub.paths || []).map((p) => p.href), ...hub.reading.map((r) => r.href)]) {
    const blog = href.match(/^\/blog\/([a-z0-9-]+)$/);
    assert.ok(guides.has(href) || (blog && (migrations.includes(`'${blog[1]}'`) || CMS_POSTS.includes(blog[1]))), `${slug}: ${href}`);
  }
});

test("the fee answer names the right country", () => {
  const fx = { base: "USD", rates: { USD: 1, CAD: 1.4 } };
  const plans = [{ classes_per_week: 2, duration_min: 30, prices: [{ currency: "USD", amount_minor: 3000 }] }];
  assert.match(feeAnswer(plans, fx, "CAD", "Canada").answer, /In Canada that is about/);
  assert.doesNotMatch(feeAnswer(plans, fx, "CAD", "Canada").answer, /In the UK/);
  assert.doesNotMatch(feeAnswer(plans, fx, "USD", "the USA").answer, /In the USA that is/, "no conversion sentence for USD");
});

test("teacher cards without a photo use a compact initial, skipping honorifics", () => {
  assert.equal(teacherInitial("Ustadha Maryam"), "M");
  assert.equal(teacherInitial("Ustadh Bilal"), "B");
  assert.equal(teacherInitial("Qari Ahmed"), "A");
  assert.equal(teacherInitial("Zainab"), "Z");
  assert.equal(teacherInitial(""), "O");
  const card = read("src/components/site/sections.jsx");
  assert.match(card, /teacherInitial\(t\.display_name\)/);
  assert.doesNotMatch(card.slice(card.indexOf("export function TeacherCard")), /brand-mark block size-20/, "no tall empty image block");
});

test("the reviews button is icon-only on phones and keeps its accessible text", () => {
  const btn = read("src/components/site/reviews-button.jsx");
  assert.match(btn, /flex min-w-0 flex-col leading-tight max-lg:sr-only/);
  assert.match(btn, /pr-1\.5 text-left lg:pr-4/);
});
