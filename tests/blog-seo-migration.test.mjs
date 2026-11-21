import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { stripHtml } from "../src/lib/format.js";

const file = "supabase/migrations/20261112130000_blog_seo_trial_links_and_depth.sql";
const migration = readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
const old = "2026-11-01 00:00:00+00";
const CTA_SLUGS = ["family-quran-learning-multiple-children", "importance-of-reciting-quran-with-tajweed", "adult-quran-beginner-first-month", "tajweed-practice-with-feedback", "parent-teacher-quran-progress-review", "quran-lessons-australia-time-zones", "memorization-techniques-for-beginners", "hifz-revision-with-school", "help-your-kids-learn-quran-online"];
const DEPTH = { "online-tafseer-classes-what-you-learn": "Questions to ask before enrolling", "how-long-does-hifz-take-online": "Questions to ask before starting", "arabic-for-quran-readers": "Plan for steady practice", "quran-translation-tafseer-beginners": "Ask questions in the right place", "how-long-to-learn-noorani-qaida": "Questions to ask the teacher" };

async function setup() {
  const db = new PGlite();
  await db.exec("create table public.blog_posts (slug text, locale text, status text, deleted_at timestamptz, body_html text, updated_at timestamptz)".replace("public.", "") .replace("create table ", "create schema if not exists public; create table public."));
  const add = (slug, body, extra = {}) => db.query("insert into public.blog_posts values ($1,$2,$3,$4,$5,$6)", [slug, extra.locale || "en", extra.status || "published", extra.deleted_at || null, body, old]);
  for (const slug of CTA_SLUGS) await add(slug, "<h2>Plan</h2><p>Body text.</p>");
  for (const [slug, anchor] of Object.entries(DEPTH)) await add(slug, `<h2>Intro</h2><p>Short.</p><h2>${anchor}</h2><ul><li>Q</li></ul><p>End.</p>`);
  await add("already-linked", '<p>Has <a href="/free-trial">trial</a>.</p>');
  await add("unrelated-post", "<p>Nothing to change.</p>");
  return { db, add };
}
const body = async (db, slug) => (await db.query("select body_html, updated_at from public.blog_posts where slug=$1", [slug])).rows[0];

test("adds exactly one trial link to articles that lacked one and leaves others untouched", async () => {
  const { db } = await setup();
  await db.exec(migration);
  for (const slug of CTA_SLUGS) {
    const row = await body(db, slug);
    assert.equal((row.body_html.match(/href="\/free-trial"/g) || []).length, 1, slug);
    assert.ok(/eligible plan/.test(row.body_html), `${slug} keeps the eligible-plan trial wording`);
    assert.ok(new Date(row.updated_at) > new Date(old), `${slug} updated_at moves`);
  }
  for (const slug of ["already-linked", "unrelated-post"]) {
    const row = await body(db, slug);
    assert.equal(new Date(row.updated_at).toISOString(), new Date(old).toISOString(), `${slug} untouched`);
  }
  assert.equal((await body(db, "already-linked")).body_html.match(/free-trial/g).length, 1);
});

test("inserts depth sections before the closing questions heading, once", async () => {
  const { db } = await setup();
  await db.exec(migration);
  for (const [slug, anchor] of Object.entries(DEPTH)) {
    const html = (await body(db, slug)).body_html;
    assert.equal(html.split(`<h2>${anchor}</h2>`).length - 1, 1, `${slug} keeps one anchor`);
    assert.ok(html.indexOf("<h2>Intro</h2>") < html.indexOf(`<h2>${anchor}</h2>`));
    assert.ok(html.length > 400, `${slug} gained content`);
  }
});

test("is idempotent: a second run changes nothing", async () => {
  const { db } = await setup();
  await db.exec(migration);
  const first = (await db.query("select slug, body_html, updated_at from public.blog_posts order by slug")).rows;
  await new Promise((r) => setTimeout(r, 20));
  await db.exec(migration);
  const second = (await db.query("select slug, body_html, updated_at from public.blog_posts order by slug")).rows;
  assert.deepEqual(second, first);
});

test("ignores drafts, deleted rows and other locales", async () => {
  const { db, add } = await setup();
  await db.exec("delete from public.blog_posts where slug = 'tajweed-practice-with-feedback'");
  await add("tajweed-practice-with-feedback", "<p>Draft.</p>", { status: "draft" });
  await add("hifz-revision-with-school", "<p>Deleted.</p>", { deleted_at: old });
  await add("memorization-techniques-for-beginners", "<p>Urdu.</p>", { locale: "ur" });
  await db.exec(migration);
  const rows = (await db.query("select slug, body_html from public.blog_posts where body_html in ('<p>Draft.</p>','<p>Deleted.</p>','<p>Urdu.</p>')")).rows;
  assert.equal(rows.length, 3);
});

test("added copy stays inside the 1,000-word cap, uses known routes and adds no hidden markers or claims", () => {
  const added = [...migration.matchAll(/\$h\$([\s\S]*?)\$h\$/g)].map((m) => m[1]).filter((html) => !html.startsWith("%"));
  assert.equal(added.length, CTA_SLUGS.length + Object.keys(DEPTH).length);
  for (const html of added) {
    assert.ok(stripHtml(html).split(/\s+/).length < 250);
    assert.ok(!/<!--|<script|<img|style=/i.test(html), "no comments, scripts, images or inline styles");
    for (const [, href] of html.matchAll(/href="([^"]+)"/g)) assert.equal(href, "/free-trial");
    assert.ok(!/\b(guarantee|guaranteed|100%|best in|certified|ijazah|fatwa|[£$€]\s?\d)/i.test(html), "no outcome, price or credential claims");
  }
});
