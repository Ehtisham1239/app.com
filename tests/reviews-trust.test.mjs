import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

// Reviews on the website (owner request, 3 Nov 2026): real reviews only, shown with permission.
test("review form asks for website permission separately and optionally", () => {
  const form = read("src/components/site/review-form.jsx");
  assert.match(form, /publish_consent: false/, "unticked by default");
  const start = form.indexOf('<input id="rv-publish"');
  const box = start >= 0 ? form.slice(start, form.indexOf("/>", start)) : "";
  assert.ok(box, "publish checkbox exists");
  assert.doesNotMatch(box, /required/, "publishing permission is optional");
  assert.match(form, /Photos and videos are never published/);
});

test("migration stores publish permission additively and defaults to no", () => {
  const sql = read("supabase/migrations/20261103080000_review_publish_consent.sql");
  assert.match(sql, /add column if not exists publish_consent boolean not null default false/);
  assert.match(sql, /coalesce\(\(payload ->> 'publish_consent'\)::boolean, false\)/);
  assert.match(sql, /case when v_publish then now\(\) end/);
  assert.match(sql, /raise exception 'Please agree to the privacy notice before sending\.'/, "privacy consent still required");
  assert.match(sql, /grant execute on function public\.submit_review\(jsonb\) to anon, authenticated, service_role;/);
});

test("public pages show only published testimonials and add no self-serving rating schema", () => {
  const data = read("src/lib/site-data.js");
  assert.match(data, /from\("testimonials"\)\.select\("id, name, relation, country, quote, rating, avatar_url, sort_order"\)\.eq\("status", "published"\)\.not\("consent_recorded_at", "is", null\)/);
  const landing = read("src/components/site/country-landing.jsx");
  assert.match(landing, /testimonials\.length > 0 && <>/);
  assert.match(landing, /shown with the reviewer’s permission \(first name only\)/);
  for (const file of ["src/components/site/country-landing.jsx", "src/components/site/sections.jsx", "src/app/(site)/page.jsx", "src/components/site/location-page.jsx"]) {
    assert.doesNotMatch(read(file), /AggregateRating|"@type": "Review"|ratingValue/, `${file}: no review/rating structured data`);
  }
});

test("llms.txt points assistants to independent reviews and states the permission rule", () => {
  const route = read("src/app/llms.txt/route.js");
  assert.match(route, /## Reviews/);
  assert.match(route, /https:\/\/www\.trustpilot\.com\/review\/onlinequrancollege\.com/);
  assert.match(route, /only when the reviewer gives permission/);
});


test("database RLS prevents public reads of testimonials without publication consent", () => {
  const migration = read("supabase/migrations/20261103181459_require_testimonial_publication_consent.sql");
  assert.match(migration, /drop policy if exists "public read" on public\.testimonials/i);
  assert.match(migration, /for select to anon, authenticated/i);
  assert.match(migration, /status = 'published' and consent_recorded_at is not null/i);
});
