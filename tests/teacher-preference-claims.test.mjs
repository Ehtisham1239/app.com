import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const teacherPage = read("../src/app/(site)/teachers/page.jsx");
const trialPage = read("../src/app/(site)/free-trial/page.jsx");
const searchIntent = read("../src/lib/search-intent.js");
const llms = read("../src/app/llms.txt/route.js");
const learningGuide = read("../src/app/(site)/learn/page.jsx");

test("public teacher copy does not imply both teacher genders are currently available", () => {
  for (const [name, source] of [
    ["teacher page", teacherPage],
    ["free-trial page", trialPage],
    ["search intent", searchIntent],
    ["LLM summary", llms],
    ["learning guide", learningGuide],
  ]) {
    assert.doesNotMatch(source, /female and male teachers|female or male teacher|male teachers for brothers/i, name);
  }
});

test("teacher preference is presented as a request with availability confirmation", () => {
  assert.match(teacherPage, /Share any teacher preference[\s\S]*Admissions confirms whether a suitable teacher is available/);
  assert.match(trialPage, /request a female teacher[\s\S]*Admissions confirms whether a suitable female teacher is available/i);
  assert.match(llms, /share a teacher preference when booking[\s\S]*Admissions confirms availability/i);
  assert.match(learningGuide, /share a teacher preference[\s\S]*Admissions confirms whether a suitable teacher is available/i);
});
