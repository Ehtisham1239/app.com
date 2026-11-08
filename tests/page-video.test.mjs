import { test } from "node:test";
import assert from "node:assert/strict";
import { pageVideo, videoSchema, videoSitemapEntry, youtubeVideoId, isVideoPageSlug } from "../src/lib/page-video.js";
import { TRIAL_GUIDE_VIDEO } from "../src/lib/trial-guide-video.js";

const site = "https://www.onlinequrancollege.com";
const id = "a1B2c3D4e5F";
const watch = `https://www.youtube.com/watch?v=${id}`;

test("accepts real YouTube URL forms and normalizes to the privacy-enhanced embed host", () => {
  for (const url of [watch, `https://youtu.be/${id}`, `https://www.youtube.com/shorts/${id}`, `https://www.youtube-nocookie.com/embed/${id}`]) {
    assert.equal(youtubeVideoId(url), id);
    assert.equal(pageVideo({ ...TRIAL_GUIDE_VIDEO, url, thumbnail: "" }, site).embedUrl, `https://www.youtube-nocookie.com/embed/${id}`);
  }
});

test("rejects untrusted embed origins, malformed dates and missing uploaded-video thumbnails", () => {
  for (const url of [`https://youtube.com.example.test/watch?v=${id}`, `https://youtube.com@evil.test/watch?v=${id}`, `http://youtu.be/${id}`, "//example.test/video.mp4", "javascript:alert(1)", "https://example.test/video.mp4"]) {
    assert.equal(pageVideo({ ...TRIAL_GUIDE_VIDEO, url }, site), null);
  }
  assert.equal(pageVideo({ ...TRIAL_GUIDE_VIDEO, uploadDate: "2026-02-30" }, site), null);
  assert.equal(pageVideo({ ...TRIAL_GUIDE_VIDEO, thumbnail: "" }, site), null);
  assert.equal(pageVideo({ ...TRIAL_GUIDE_VIDEO, thumbnail: "https://example.test/x.png" }, site), null);
});

test("watch-page schema and sitemap describe the actual player and escape XML", () => {
  const video = pageVideo({ ...TRIAL_GUIDE_VIDEO, title: "Parents & learners", description: "<Trial guide>" }, site);
  assert.equal(videoSchema(video).contentUrl, site + TRIAL_GUIDE_VIDEO.url);
  assert.equal(videoSitemapEntry(video).title, "Parents &amp; learners");
  assert.equal(videoSitemapEntry(video).description, "&lt;Trial guide&gt;");
  assert.equal(videoSitemapEntry(video).content_loc, site + TRIAL_GUIDE_VIDEO.url);
  assert.equal(isVideoPageSlug("trial-video"), false);
  assert.equal(isVideoPageSlug("locations-united-states"), false);
  assert.equal(isVideoPageSlug("quran-lesson-overview"), true);
});
