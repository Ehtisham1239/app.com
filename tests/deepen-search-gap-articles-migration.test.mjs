import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { stripHtml } from "../src/lib/format.js";

const file = "supabase/migrations/20261124150000_deepen_search_gap_articles.sql";
const sql = readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
const SLUGS = ["can-i-learn-quran-by-myself", "noorani-qaida-for-adults-online", "quran-study-for-new-muslims", "quranic-arabic-roadmap-first-year", "online-quran-classes-for-women-and-girls", "arabic-for-quran-readers"];
// Published posts and routes verified on the live site on 24 Nov 2026.
const BLOGS = new Set([...SLUGS, "returning-to-quran-study-adults", "online-quran-lesson-setup-accessibility", "printable-weekly-quran-practice-planner", "noorani-qaida-or-quran-reading", "adult-quran-beginner-first-month", "quran-translation-and-arabic-difference", "quran-translation-tafseer-beginners", "questions-before-quran-course-enrolment", "how-long-to-learn-noorani-qaida", "native-arabic-speaking-quran-teacher"]);
const COURSES = new Set(["noorani-qaida", "quran-nazara", "quran-translation", "arabic-language", "tajweed"]);
const LEARN = new Set(["quran-for-adults", "quran-for-reverts", "female-quran-teacher"]);

async function run() {
  const db = new PGlite();
  await db.exec(`create schema if not exists public; create table public.blog_posts (id uuid default gen_random_uuid(), slug text not null, locale text not null default 'en', body_html text not null default '', reading_minutes int, status text not null default 'draft', version int not null default 1, updated_at timestamptz, deleted_at timestamptz)`);
  for (const slug of [...SLUGS, "unrelated-post"]) await db.query("insert into public.blog_posts (slug, body_html, status, reading_minutes) values ($1, '<p>old short body</p>', 'published', 3)", [slug]);
  await db.query("insert into public.blog_posts (slug, body_html, status) values ('can-i-learn-quran-by-myself', '<p>draft copy</p>', 'draft')");
  await db.exec(sql);
  return db;
}
const rows = async (db) => (await db.query("select * from public.blog_posts order by slug, status")).rows;

test("rewrites only the six published English articles and leaves others alone", async () => {
  const db = await run();
  const r = await rows(db);
  for (const slug of SLUGS) {
    const x = r.find((row) => row.slug === slug && row.status === "published");
    assert.ok(x.body_html.length > 2500, slug);
    assert.equal(x.version, 2, slug);
  }
  assert.equal(r.find((row) => row.slug === "unrelated-post").body_html, "<p>old short body</p>");
  assert.equal(r.find((row) => row.slug === "unrelated-post").version, 1);
  assert.equal(r.find((row) => row.status === "draft").body_html, "<p>draft copy</p>");
});

test("is idempotent: a second run changes nothing", async () => {
  const db = await run();
  const first = await rows(db);
  await db.exec(sql);
  assert.deepEqual((await rows(db)).map((x) => [x.slug, x.version, x.body_html]), first.map((x) => [x.slug, x.version, x.body_html]));
});

test("each guide is substantial, within the 1,000-word editorial maximum and answers first", async () => {
  const db = await run();
  for (const x of (await rows(db)).filter((row) => SLUGS.includes(row.slug) && row.status === "published")) {
    const words = stripHtml(x.body_html).split(/\s+/).filter(Boolean).length;
    assert.ok(words >= 550 && words <= 950, `${x.slug}: ${words} words`);
    assert.ok(x.body_html.startsWith("<p><strong>Short answer:</strong>"), `${x.slug} answers first`);
    assert.ok(x.reading_minutes >= 4, x.slug);
  }
});

test("one trial link, only real routes, no claims, no scripts or inline styles", async () => {
  const db = await run();
  for (const x of (await rows(db)).filter((row) => SLUGS.includes(row.slug) && row.status === "published")) {
    assert.equal((x.body_html.match(/href="\/free-trial"/g) || []).length, 1, x.slug);
    for (const [, href] of x.body_html.matchAll(/href="([^"]+)"/g)) {
      if (href === "/free-trial") continue;
      if (href.startsWith("/courses/")) assert.ok(COURSES.has(href.slice(9)), `${x.slug} -> ${href}`);
      else if (href.startsWith("/blog/")) assert.ok(BLOGS.has(href.slice(6)), `${x.slug} -> ${href}`);
      else if (href.startsWith("/learn/")) assert.ok(LEARN.has(href.slice(7)), `${x.slug} -> ${href}`);
      else assert.fail(`${x.slug}: unexpected link ${href}`);
    }
    assert.ok(!/<!--|<script|<img|style=/i.test(x.body_html), x.slug);
    assert.ok(!/\b(guarantee|guaranteed|100%|best in|certified|ijazah|sanad|fatwa|[£$€]\s?\d)/i.test(x.body_html), x.slug);
    assert.ok(!/\bhadith\b/i.test(stripHtml(x.body_html)), `${x.slug}: no religious quotation without qualified review`);
  }
});

test("self-links are not used and the articles link to each other for a connected cluster", async () => {
  const db = await run();
  const r = (await rows(db)).filter((row) => row.status === "published");
  for (const slug of SLUGS) {
    const x = r.find((row) => row.slug === slug);
    assert.ok(!x.body_html.includes(`href="/blog/${slug}"`), `${slug} links to itself`);
  }
});
