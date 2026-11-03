import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { LEARNING_GUIDES } from "../src/lib/learning-guides.js";
import { SEARCH_INTENTS } from "../src/lib/search-intent.js";
import { guideFaqs } from "../src/lib/guide-faqs.js";

const dir = new URL("../supabase/migrations/", import.meta.url);
const NEW = ["20261103000100_audience_learning_guides.sql", "20261103000200_month_articles.sql"];
const read = (f) => readFileSync(new URL(f, dir), "utf8");
const older = readdirSync(dir).filter((f) => !NEW.includes(f)).map(read).join("\n");
const FIXED = new Set(["/free-trial", "/pricing", "/courses/tajweed", ...LEARNING_GUIDES.map((g) => g.path)]);
// Published articles created in the CMS rather than by a migration (checked in production on 3 Nov 2026).
const CMS_POSTS = ["noorani-qaida-home-practice-checklist"];
const COURSES = ["noorani-qaida", "quran-nazara", "hifz-quran", "arabic-language", "quran-translation", "hadith-translation"];

test("new guides are wired: path, search intent, FAQs and a published page row", () => {
  for (const topic of ["female-quran-teacher", "quran-for-reverts"]) {
    const g = LEARNING_GUIDES.find((x) => x.topic === topic);
    assert.ok(g && g.path === `/learn/${topic}`, topic);
    assert.ok(SEARCH_INTENTS[g.path]?.heading, `${topic} intent`);
    assert.ok(guideFaqs(topic).length >= 3, `${topic} FAQs`);
    assert.match(read(NEW[0]), new RegExp(`'${g.slug}'`));
  }
});

test("every link in the new content points to a page that exists", () => {
  for (const f of NEW) for (const [, href] of read(f).matchAll(/href="([^"]+)"/g)) {
    const blog = href.match(/^\/blog\/([a-z0-9-]+)$/);
    const course = href.match(/^\/courses\/([a-z0-9-]+)$/);
    const ok = FIXED.has(href) || (course && COURSES.includes(course[1])) || (blog && (older.includes(`'${blog[1]}'`) || CMS_POSTS.includes(blog[1])));
    assert.ok(ok, `${f}: ${href}`);
  }
});

test("new content answers first and promises no timeline, price or result", () => {
  for (const f of NEW) {
    const sql = read(f);
    assert.doesNotMatch(sql, /guarantee|in just \d|within \d+ (days|weeks|months|years)|\d+ (months|years) to (finish|complete)|best in|#1|£\d|\$\d/i, f);
    for (const [, d] of sql.matchAll(/,\s*'((?:[^']|'')+)',\s*(?:'https|now\(\))/g)) assert.ok(d.length <= 160, `${f}: description ${d.length}`);
  }
  assert.match(read(NEW[1]), /<p>There is no fixed time to finish Noorani Qaida\./);
  assert.match(read(NEW[1]), /<p>There is no single timeline for completing Hifz/);
  assert.match(read(NEW[0]), /The Weekend plan is excluded from the free trial\./);
});
