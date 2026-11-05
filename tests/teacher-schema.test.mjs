import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { teacherListSchema, teacherPerson } from "../src/lib/teacher-schema.js";

const T = { slug: "amina", display_name: "Ustadha Amina", headline: "Tajweed teacher", qualifications: "Ijazah in Hafs, BA Islamic Studies", languages: ["English", "Urdu"], specialties: ["Tajweed"], email: "x@example.test", phone: "+440000", employee_code: "E1" };

test("public teacher profiles are described as Person data without private fields", () => {
  const p = teacherPerson(T, "https://www.onlinequrancollege.com");
  assert.equal(p["@type"], "Person");
  assert.equal(p.url, "https://www.onlinequrancollege.com/teachers/amina");
  assert.deepEqual(p.knowsLanguage, ["English", "Urdu"]);
  assert.equal(p.hasCredential, undefined, "unverified qualification text is not emitted as formal credential markup");
  assert.deepEqual(p.worksFor, { "@id": "https://www.onlinequrancollege.com/#organization" });
  const text = JSON.stringify(p);
  for (const secret of ["x@example.test", "+440000", "E1"]) assert.ok(!text.includes(secret), secret);
  assert.equal(teacherListSchema([], "https://x"), null, "no schema until a teacher is made public");
  assert.equal(teacherListSchema([T], "https://x").itemListElement.length, 1);
});

test("teacher pages render the Person data and the loader only reads public profiles", () => {
  assert.match(read("src/app/(site)/teachers/page.jsx"), /teacherListSchema\(teachers, SITE_URL\)/);
  assert.match(read("src/app/(site)/teachers/[slug]/page.jsx"), /teacherPerson\(t, SITE_URL\)/);
  const data = read("src/lib/site-data.js");
  assert.match(data, /\.eq\("is_public", true\)\.eq\("is_active", true\)/);
  assert.doesNotMatch(data.match(/const TEACHER_FIELDS = "([^"]+)"/)[1], /email|phone|employee_code|verification_note/);
});
function read(p) { return readFileSync(new URL(`../${p}`, import.meta.url), "utf8"); }
