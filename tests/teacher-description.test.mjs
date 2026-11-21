import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { teacherDescription } from "../src/lib/teacher-description.js";

test("a short bio is replaced by a factual 120–159 character description", () => {
  const d = teacherDescription({ display_name: "Saba Urooj", headline: "English specialist", bio: "She is best communicator in the institute." });
  assert.equal(d, "Live one-to-one online Quran lessons with Saba Urooj (English specialist) at Online Quran College. Request a 3-day free trial, no card needed.");
  assert.ok(d.length >= 120 && d.length <= 159, `length ${d.length}`);
  assert.doesNotMatch(d, /best communicator/);
});

test("an empty profile still reaches 120 characters", () => {
  const d = teacherDescription({ display_name: "Ali", headline: "", bio: "" });
  assert.ok(d.length >= 120, `length ${d.length}`);
  assert.match(d, /3-day free trial/);
});

test("a bio of 120+ characters is used as written", () => {
  const bio = "Teaches Noorani Qaida and Quran reading to children and adult beginners, with patient correction of every letter and simple weekly revision plans.";
  assert.equal(teacherDescription({ display_name: "X", headline: "Y", bio }), bio);
});

test("static meta descriptions flagged by the 21 Nov Bing audit are 120–159 characters", () => {
  for (const [file, re] of [
    ["src/app/(site)/reviews/page.jsx", /description: "([^"]+)"/],
    ["src/app/(site)/verify-certificate/page.jsx", /description: "([^"]+)"/],
  ]) {
    const text = readFileSync(new URL(`../${file}`, import.meta.url), "utf8").match(re)[1];
    assert.ok(text.length >= 120 && text.length <= 159, `${file}: ${text.length}`);
  }
});
