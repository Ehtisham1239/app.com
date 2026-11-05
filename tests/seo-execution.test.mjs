import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { courseHeading } from "../src/lib/course-heading.js";
import { GUIDE_FAQS, guideFaqs } from "../src/lib/guide-faqs.js";
import { SEARCH_INTENTS } from "../src/lib/search-intent.js";
import { LEARNING_GUIDES } from "../src/lib/learning-guides.js";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("course pages use a searchable H1 while cards keep the short CMS title", () => {
  assert.equal(courseHeading({ slug: "noorani-qaida", title: "Noorani Qaida" }), "Noorani Qaida online classes for kids and adults");
  assert.equal(courseHeading({ slug: "hifz-quran", title: "Hifz ul Quran" }), "Online Hifz ul Quran classes");
  assert.equal(courseHeading({ slug: "new-course", title: "Seerah" }), "Seerah online classes");
  assert.equal(courseHeading({ slug: "x", title: "Online Fiqh" }), "Online Fiqh");
  assert.equal(courseHeading({ slug: "x", title: "" }), "");
  assert.match(read("src/app/(site)/courses/[slug]/page.jsx"), /title=\{courseHeading\(course\)\}/);
});

test("every learning guide has direct, cautious FAQ answers rendered with FAQPage data", () => {
  for (const guide of LEARNING_GUIDES) assert.ok(guideFaqs(guide.topic).length >= 2, guide.topic);
  for (const [topic, rows] of Object.entries(GUIDE_FAQS)) for (const [q, a] of rows) {
    const words = a.split(/\s+/).length;
    assert.ok(words >= 20 && words <= 70, `${topic}: "${q}" is ${words} words`);
    assert.doesNotMatch(a, /guarantee|in just \d|within \d+ (weeks|months)|best in|#1|£|\$/i, `${topic}: "${q}" makes a claim the site cannot back`);
  }
  const page = read("src/components/site/learning-guide-page.jsx");
  assert.match(page, /faqSchema\(faqs\)/);
  assert.match(page, /<FaqList faqs=\{faqs\}/);
});

test("the UAE snippet fits in search results", () => {
  const uae = SEARCH_INTENTS["/locations/united-arab-emirates"];
  assert.ok(uae.description.length <= 160, `${uae.description.length} characters`);
  assert.match(read("src/app/(site)/locations/[country]/page.jsx"), /\?\.description \|\| SEARCH_INTENTS/);
});

test("pricing and free-trial pages stay cacheable: no server-side searchParams", () => {
  for (const path of ["src/app/(site)/pricing/page.jsx", "src/app/(site)/free-trial/page.jsx"]) {
    const source = read(path);
    assert.doesNotMatch(source, /\{\s*searchParams\s*\}|await searchParams/, path);
    assert.match(source, /export const revalidate = 300/, path);
  }
  assert.match(read("src/lib/use-visitor-currency.js"), /URLSearchParams\(window\.location\.search\)\.get\("currency"\)/);
  const trial = read("src/components/site/trial-intro.jsx");
  assert.match(trial, /^"use client";/);
  assert.match(trial, /useSearchParams/);
  assert.match(trial, /The Weekend plan is excluded/);
  assert.match(read("src/components/site/quick-trial-form.jsx"), /bookingPreferenceNotes\(params, currencies\)/);
});

test("the free-trial FAQ repeats only what the page already promises", () => {
  const source = read("src/app/(site)/free-trial/page.jsx");
  assert.match(source, /faqSchema\(TRIAL_FAQS\)/);
  assert.match(source, /Weekend plan is excluded from the free trial/);
  assert.doesNotMatch(source, /24 hours/, "no unverified response-time promise (owner decision 2 Nov 2026)");
  assert.doesNotMatch(source, /sm:hidden/, "one promise list, not a duplicate for phones");
  assert.doesNotMatch(source, /no obligation/i);
});

test("course pages link to all five indexed country hubs", () => {
  const source = read("src/app/(site)/courses/[slug]/page.jsx");
  for (const [path, label] of [
    ["/locations/united-kingdom", "UK families"],
    ["/locations/united-states", "USA families"],
    ["/locations/canada", "Canadian families"],
    ["/locations/australia", "Australian families"],
    ["/locations/united-arab-emirates", "UAE families"],
  ]) {
    assert.ok(source.includes(`href="${path}"`), path);
    assert.ok(source.includes(`>${label}</Link>`), label);
  }
});

test("Hifz planner calculates only user-entered page targets and validates inputs", () => {
  assert.deepEqual(calculateHifzPlan({ remainingPages: 50, studyDaysPerWeek: 5, revisionPages: 30, revisionDaysPerWeek: 6 }), {
    newPagesPerStudyDay: 10, estimatedStudyDays: 5, estimatedWeeks: 1, revisionPagesPerDay: 5,
  });
  assert.deepEqual(calculateHifzPlan({ remainingPages: 30, studyDaysPerWeek: 5, revisionPages: 0, revisionDaysPerWeek: 6 }), {
    newPagesPerStudyDay: 6, estimatedStudyDays: 5, estimatedWeeks: 1, revisionPagesPerDay: 0,
  });
  assert.ok(calculateHifzPlan({ remainingPages: 0, studyDaysPerWeek: 5, revisionPages: 0, revisionDaysPerWeek: 6 }).error);
  assert.ok(calculateHifzPlan({ remainingPages: 10, studyDaysPerWeek: 8, revisionPages: 0, revisionDaysPerWeek: 6 }).error);
});

test("Hifz planner is linked, indexable and included in sitemap", () => {
  const hub = read("src/app/(site)/quran-study/page.jsx");
  const page = read("src/app/(site)/quran-study/hifz-planner/page.jsx");
  const sitemap = read("src/app/sitemap.js");
  assert.match(hub, /href="\/quran-study\/hifz-planner"/);
  assert.match(page, /seo_noindex: false/);
  assert.match(page, /calculate a simple weekly target/i);
  assert.match(sitemap, /"\/quran-study\/hifz-planner"/);
});

test("teacher credentials are not represented as verified structured credentials without evidence", () => {
  const person = teacherPerson({ slug: "teacher", display_name: "Teacher", qualifications: "Qualification claim" }, "https://example.com");
  assert.equal(person.hasCredential, undefined);
  assert.equal(person.name, "Teacher");
});

test("trial request fallback does not promise an unverified response time", () => {
  assert.doesNotMatch(read("src/components/site/quick-trial-form.jsx"), /within 24 hours/i);
});
