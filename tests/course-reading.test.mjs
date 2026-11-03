import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { COURSE_READING, courseReading } from "../src/lib/course-reading.js";
import { LEARNING_GUIDES } from "../src/lib/learning-guides.js";

const dir = new URL("../supabase/migrations/", import.meta.url);
const migrations = readdirSync(dir).map((f) => readFileSync(new URL(f, dir), "utf8")).join("\n");
const CMS_POSTS = ["noorani-qaida-home-practice-checklist", "family-quran-learning-weekly-routine"]; // published via the CMS, checked 3 Nov 2026
const COURSES = ["noorani-qaida", "quran-nazara", "hifz-quran", "arabic-language", "quran-translation", "hadith-translation"];
const GUIDES = new Set(LEARNING_GUIDES.map((g) => g.path));

test("every course has further reading, and every link leads to a published page", () => {
  for (const slug of COURSES) {
    const links = courseReading(slug);
    assert.ok(links.length >= 3, slug);
    assert.ok(links.some((l) => l.href === "/learn/female-quran-teacher"), `${slug}: female-teacher guide`);
    for (const { href } of links) {
      const blog = href.match(/^\/blog\/([a-z0-9-]+)$/);
      assert.ok(GUIDES.has(href) || (blog && (migrations.includes(`'${blog[1]}'`) || CMS_POSTS.includes(blog[1]))), `${slug}: ${href}`);
    }
  }
  assert.deepEqual(courseReading("unknown"), []);
  assert.deepEqual(Object.keys(COURSE_READING).sort(), [...COURSES].sort());
  assert.match(readFileSync(new URL("../src/app/(site)/courses/[slug]/page.jsx", import.meta.url), "utf8"), /courseReading\(course\.slug\)/);
});
