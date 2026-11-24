import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { stripHtml } from "../src/lib/format.js";

const file = "supabase/migrations/20261123120000_new_search_gap_articles.sql";
const sql = readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
const SLUGS = ["online-quran-classes-for-women-and-girls", "can-i-learn-quran-by-myself", "quranic-arabic-roadmap-first-year", "noorani-qaida-for-adults-online", "quran-study-for-new-muslims"];
const EXISTING = ["returning-to-quran-study-adults", "online-quran-lesson-setup-accessibility", "printable-weekly-quran-practice-planner", "noorani-qaida-or-quran-reading", "adult-quran-beginner-first-month", "quran-translation-and-arabic-difference", "arabic-for-quran-readers", "quran-translation-tafseer-beginners", "questions-before-quran-course-enrolment", "how-long-to-learn-noorani-qaida"];

async function run() {
  const db = new PGlite();
  await db.exec(`create schema if not exists public; create table public.blog_posts (id uuid default gen_random_uuid(), slug text not null, locale text not null default 'en', title text not null, excerpt text not null default '', body_html text not null default '', cover_url text, cover_alt text not null default '', category text not null default 'Learning', tags text[] not null default '{}', author_name text not null default 'OQC Editorial Team', reading_minutes int, status text not null default 'draft', seo_title text, seo_description text, seo_focus_keyword text not null default '', published_at timestamptz)`);
  await db.exec(sql);
  return db;
}
const rows = async (db) => (await db.query("select * from public.blog_posts order by slug")).rows;

test("inserts the five articles once, published, English, under the organisation name", async () => {
  const db = await run();
  const r = await rows(db);
  assert.deepEqual(r.map((x) => x.slug).sort(), [...SLUGS].sort());
  for (const x of r) {
    assert.equal(x.status, "published");
    assert.equal(x.locale, "en");
    assert.equal(x.author_name, "Online Quran College");
    assert.ok(x.seo_title.length <= 65 && x.seo_description.length >= 100 && x.seo_description.length <= 160, x.slug);
    assert.ok(x.body_html.startsWith("<p><strong>Short answer:</strong>"), `${x.slug} answers first`);
  }
});

test("is idempotent", async () => {
  const db = await run();
  const first = await rows(db);
  await db.exec(sql);
  assert.deepEqual((await rows(db)).map((x) => x.id), first.map((x) => x.id));
});

test("only links to real routes, one trial link, no claims", async () => {
  const db = await run();
  const courses = new Set(["noorani-qaida", "quran-nazara", "quran-translation", "arabic-language", "tajweed"]);
  for (const x of await rows(db)) {
    const words = stripHtml(x.body_html).split(/\s+/).length;
    assert.ok(words > 250 && words < 1000, `${x.slug} ${words} words`);
    assert.equal((x.body_html.match(/href="\/free-trial"/g) || []).length, 1, x.slug);
    for (const [, href] of x.body_html.matchAll(/href="([^"]+)"/g)) {
      if (href === "/free-trial") continue;
      if (href.startsWith("/courses/")) assert.ok(courses.has(href.slice(9)), href);
      else if (href.startsWith("/blog/")) assert.ok(EXISTING.includes(href.slice(6)), `${x.slug} -> ${href}`);
      else assert.fail(`unexpected link ${href}`);
    }
    assert.ok(!/<!--|<script|<img|style=/i.test(x.body_html));
    assert.ok(!/\b(guarantee|guaranteed|100%|best in|certified|ijazah|fatwa|[£$€]\s?\d)/i.test(x.body_html), x.slug);
  }
});
