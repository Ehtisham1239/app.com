import test from "node:test";
import assert from "node:assert/strict";
import { recentSitemapUrls } from "../scripts/indexnow-select.mjs";

const xml = `<?xml version="1.0"?><urlset>
<url><loc>https://www.onlinequrancollege.com/blog/new</loc><lastmod>2026-11-10T04:00:00Z</lastmod></url>
<url><loc>https://www.onlinequrancollege.com/blog/old</loc><lastmod>2026-10-01T00:00:00Z</lastmod></url>
<url><loc>https://www.onlinequrancollege.com/courses</loc></url>
<url><loc>https://www.onlinequrancollege.com/locations/australia/sydney</loc><lastmod>2026-11-08T00:00:00Z</lastmod></url>
<url><loc>https://www.onlinequrancollege.com/future</loc><lastmod>2027-06-01T00:00:00Z</lastmod></url>
</urlset>`;
const now = new Date("2026-11-11T05:00:00Z");

test("weekly IndexNow picks only URLs changed in the window, newest first", () => {
  assert.deepEqual(recentSitemapUrls(xml, { now, days: 7 }), [
    "https://www.onlinequrancollege.com/blog/new",
    "https://www.onlinequrancollege.com/locations/australia/sydney",
  ]);
});

test("URLs without lastmod, older ones and far-future dates are never sent", () => {
  const picked = recentSitemapUrls(xml, { now, days: 7 });
  for (const path of ["/blog/old", "/courses", "/future"]) assert.ok(!picked.includes(`https://www.onlinequrancollege.com${path}`));
});

test("the batch is capped", () => {
  assert.equal(recentSitemapUrls(xml, { now, days: 60, limit: 1 }).length, 1);
});
