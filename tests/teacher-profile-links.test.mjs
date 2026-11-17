import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { teacherCourses } from "../src/lib/teacher-courses.js";
import { courseReading } from "../src/lib/course-reading.js";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("teacher specialties map to the matching course pages", () => {
  assert.deepEqual(teacherCourses({ headline: "Tajweed Expert", specialties: ["Tajweed", "Quran Nazara"] }).map((c) => c.href), ["/courses/quran-nazara", "/courses/tajweed"]);
  assert.deepEqual(teacherCourses({ headline: "Hifz Specialist", specialties: ["Hifz ul Quran"] }).map((c) => c.href), ["/courses/hifz-quran"]);
  assert.deepEqual(teacherCourses({ headline: "Tafseer Scholar", specialties: ["Quran Translation & Tafseer"] }).map((c) => c.href), ["/courses/quran-translation"]);
  assert.deepEqual(teacherCourses({ headline: "English specialist", specialties: ["English grammar and literature"] }), []);
});

test("teacher profiles explain lessons and link to courses, the trial guide and other teachers", () => {
  const page = read("src/app/(site)/teachers/[slug]/page.jsx");
  assert.match(page, /How lessons with \{first\} work/);
  assert.match(page, /The trial lasts 3 days and the Weekend plan is excluded/);
  assert.match(page, /href="\/trial-video"/);
  assert.match(page, /aria-labelledby="other-teachers"/);
});

test("the Hifz course links to the readiness article", () => {
  assert.ok(courseReading("hifz-quran").some((l) => l.href === "/blog/is-my-child-ready-for-hifz"));
});
