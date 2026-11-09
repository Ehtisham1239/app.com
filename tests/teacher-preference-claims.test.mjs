import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const homePage = read("../src/app/(site)/page.jsx");
const teacherPage = read("../src/app/(site)/teachers/page.jsx");
const trialPage = read("../src/app/(site)/free-trial/page.jsx");
const trialIntro = read("../src/components/site/trial-intro.jsx");
const searchIntent = read("../src/lib/search-intent.js");
const llms = read("../src/app/llms.txt/route.js");
const learningGuide = read("../src/app/(site)/learn/page.jsx");
const usaLanding = read("../public/usa-quran-classes/index.html");

test("public teacher copy does not imply both teacher genders are currently available", () => {
  for (const [name, source] of [
    ["teacher page", teacherPage],
    ["free-trial page", trialPage],
    ["free-trial promises", trialIntro],
    ["search intent", searchIntent],
    ["LLM summary", llms],
    ["learning guide", learningGuide],
    ["USA campaign landing page", usaLanding],
  ]) {
    assert.doesNotMatch(source, /female and male teachers|male and female teachers|female or male teacher|male teachers for brothers/i, name);
  }
});

test("teacher preference is presented as a request with availability confirmation", () => {
  assert.match(teacherPage, /Share any teacher preference[\s\S]*Admissions confirms whether a suitable teacher is available/);
  assert.match(trialPage, /request a female teacher[\s\S]*Admissions confirms whether a suitable female teacher is available/i);
  assert.match(trialIntro, /Share any teacher preference[\s\S]*Admissions confirms teacher availability and the teaching language/i);
  assert.match(llms, /share a teacher preference when booking[\s\S]*Admissions confirms availability/i);
  assert.match(learningGuide, /share a teacher preference[\s\S]*Admissions confirms whether a suitable teacher is available/i);
  assert.match(usaLanding, /Teacher preference[\s\S]*Admissions confirms whether a suitable teacher is available/i);
  assert.doesNotMatch(usaLanding, /Morning, afternoon and evening slots are available across US time zones/i);
});


test("homepage trial CTA confirms availability instead of promising a teacher or start date", () => {
  assert.match(homePage, /Request a 3-day free trial\. Admissions will discuss your course and teacher preferences, confirm availability and agree a suitable time/i);
  assert.doesNotMatch(homePage, /journey this week|We will match you with a teacher/i);
});
