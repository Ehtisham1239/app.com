import test from "node:test";
import { contentVisual } from "../src/lib/content-visual.js";
import assert from "node:assert/strict";
import { blogParams, blogUrl, articleDates, blogPosting, articleFeed } from "../src/lib/blog-seo.js";

test("blog filters reject duplicate, impossible and unbounded page values", () => {
  for (const page of ["0", "-1", "2.5", "1e2", "", "01", "10000", ["1", "2"]]) assert.equal(blogParams({ page }), null);
  assert.equal(blogParams({ category: ["Parents", "Tajweed"] }), null);
  assert.equal(blogParams({ category: "x".repeat(101) }), null);
  assert.deepEqual(blogParams({ page: "2", category: "Parents & children" }), { page: 2, category: "Parents & children" });
  assert.equal(blogUrl(2, "Parents & children"), "/blog?category=Parents+%26+children&page=2");
  assert.equal(blogUrl(1), "/blog");
});

test("article dates preserve publication history and reject invalid/backwards modification values", () => {
  const published_at = "2026-06-15T09:00:00Z";
  assert.equal(articleDates({ published_at, updated_at: "2026-10-22T09:00:00Z" }).showModified, true);
  assert.equal(articleDates({ published_at, updated_at: "2026-06-15T10:00:00Z" }).showModified, false);
  assert.equal(articleDates({ published_at, updated_at: "2025-01-01" }).modified, undefined);
  assert.equal(articleDates({ published_at: "not-a-date", updated_at: null }).published, undefined);
});

test("article fallback image and truthful author identity survive missing CMS cover/date values", () => {
  const data = blogPosting({ slug: "test", title: "A useful guide", author_name: "OQC Editorial Team" }, { siteUrl: "https://college.test", visual: { src: "/fallback.webp" }, html: "<p>Two words</p>", description: "A guide" });
  assert.equal(data.image, "https://college.test/fallback.webp");
  assert.equal(data.author["@type"], "Organization");
  assert.equal(data.wordCount, 2);
  assert.equal("datePublished" in data, false);
  const person = blogPosting({ slug: "test", title: "A useful guide", author_name: "Fatima Ahmed" }, { siteUrl: "https://college.test", visual: { src: "/fallback.webp" }, html: "", description: "A guide" });
  assert.equal(person.author["@type"], "Person");
  assert.equal("url" in person.author, false);
});

test("RSS safely escapes editorial text and does not fabricate publication dates", () => {
  const feed = articleFeed([{ slug: "guide", title: 'Parents & children <guide>', excerpt: 'A "quoted" tip\u0001.', category: "Parents & children", published_at: "2026-06-15T09:00:00Z" }, { slug: "other", title: "No date" }], "https://college.test");
  assert.ok(feed.includes("Parents &amp; children &lt;guide&gt;"));
  assert.ok(feed.includes("A &quot;quoted&quot; tip."));
  assert.equal((feed.match(/<pubDate>/g) || []).length, 1);
  assert.equal((feed.match(/<item>/g) || []).length, 2);
});

test("blog covers replace only the identified legacy files and preserve newer editor uploads", () => {
  const slug = "tajweed-rules-for-beginners";
  const oldCover = "https://assets.example.org/oqc-learning-australia-melbourne-v3-1200.webp?v=2";
  const corrected = contentVisual({ slug, cover_url: oldCover, cover_alt: "Legacy alt" });
  assert.match(corrected.src, /blog-tajweed-recitation-r2-1200\.webp$/);
  assert.match(corrected.alt, /recitation/);
  assert.deepEqual(contentVisual({ slug, cover_url: "/new-cover.webp", cover_alt: "New image description" }), {
    src: "/new-cover.webp",
    alt: "New image description",
  });
  assert.deepEqual(contentVisual({ slug }), corrected);
});
