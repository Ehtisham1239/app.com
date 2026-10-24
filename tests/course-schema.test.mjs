import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { courseSchema, courseListSchema } from "../src/lib/course-schema.js";

const courses = JSON.parse(readFileSync(new URL("../src/lib/seed-content.json", import.meta.url))).courses;
const site = "https://college.test";

test("published course markup describes real courses without incomplete event or invented commercial data", () => {
  assert.ok(courses.length >= 3);
  for (const course of courses) {
    const schema = courseSchema(course, site, "Owner's College");
    assert.equal(schema.name, course.title);
    assert.ok(schema.description.trim());
    assert.equal(schema.provider.name, "Owner's College");
    assert.equal(new URL(schema.url).pathname, `/courses/${course.slug}`);
    for (const key of ["hasCourseInstance", "offers", "aggregateRating", "startDate"]) assert.equal(key in schema, false);
  }
});

test("course listing supplies unique canonical detail URLs in visible course order", () => {
  const list = courseListSchema(courses, site).itemListElement;
  assert.deepEqual(list.map((item) => item.position), courses.map((_, index) => index + 1));
  assert.deepEqual(list.map((item) => item.url), courses.map((course) => courseSchema(course, site).url));
  assert.equal(new Set(list.map((item) => item.url)).size, courses.length);
});

test("incomplete CMS course records are not emitted as invalid Course items", () => {
  assert.equal(courseSchema({ slug: "empty", title: "Empty" }, site), null);
  assert.equal(courseSchema({ slug: "empty", summary: "Description" }, site), null);
  assert.equal(courseSchema({ slug: "reading", title: "Reading", description_html: "<p>Read with a teacher.</p>" }, site).description, "Read with a teacher.");
});
