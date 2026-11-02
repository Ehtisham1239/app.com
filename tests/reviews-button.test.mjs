import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { REVIEW_LIMITS, REVIEW_MEDIA_TYPES, REVIEWS_BUTTON_DEFAULTS, reviewFileError, reviewFormErrors, reviewMediaPath, reviewsButtonConfig, reviewsButtonError, trustpilotUrl } from "../src/lib/reviews-button.js";
import { DEFAULT_SETTINGS } from "../src/lib/default-settings.js";

const SOCIAL = { trustpilot: "https://www.trustpilot.com/review/onlinequrancollege.com" };
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const VALID = { name: "Amina", email: "amina@example.test", rating: 5, comment: "My daughter loves her Tajweed teacher.", consent: true };

test("only https Trustpilot addresses are accepted as the button link", () => {
  for (const ok of ["https://www.trustpilot.com/review/onlinequrancollege.com", "https://uk.trustpilot.com/review/onlinequrancollege.com", "https://trustpilot.com/evaluate/onlinequrancollege.com"]) assert.ok(trustpilotUrl(ok), ok);
  for (const bad of ["javascript:alert(1)", "http://www.trustpilot.com/review/x", "https://trustpilot.com.evil.example/review/x", "https://eviltrustpilot.com/x", "https://user:pw@www.trustpilot.com/x", "/review", "", null, 42]) assert.equal(trustpilotUrl(bad), "", String(bad));
});

test("by default the button shows on every page and opens the review form, with the saved Trustpilot page linked", () => {
  assert.deepEqual(DEFAULT_SETTINGS["site.reviews_button"], REVIEWS_BUTTON_DEFAULTS);
  assert.deepEqual(reviewsButtonConfig(undefined, SOCIAL), { href: SOCIAL.trustpilot, label: "Share your review", sublabel: "Parents & students", everyPage: true, openForm: true });
  assert.equal(reviewsButtonConfig(undefined, { trustpilot: "" }).href, "", "the form still works without a Trustpilot page");
});

test("CMS values control text, link, pages and form/Trustpilot mode", () => {
  const custom = reviewsButtonConfig({ label: " Rate us ", sublabel: "", url: "https://uk.trustpilot.com/review/onlinequrancollege.com", every_page: false, open_form: false }, SOCIAL);
  assert.deepEqual(custom, { href: "https://uk.trustpilot.com/review/onlinequrancollege.com", label: "Rate us", sublabel: "", everyPage: false, openForm: false });
  assert.equal(reviewsButtonConfig({ enabled: false }, SOCIAL), null, "switched off in CMS");
  assert.equal(reviewsButtonConfig({ open_form: false }, { trustpilot: "" }), null, "Trustpilot-only mode needs a Trustpilot link");
  assert.equal(reviewsButtonConfig({ open_form: false, url: "https://example.com/fake" }, { trustpilot: "" }), null, "a non-Trustpilot link never renders");
  assert.equal(reviewsButtonConfig({ url: "https://example.com/x" }, SOCIAL).href, SOCIAL.trustpilot, "invalid custom link falls back to the saved Trustpilot page");
  // A row saved before 2 Nov (no open_form key) keeps working and now opens the form.
  assert.equal(reviewsButtonConfig({ enabled: true, label: "Review us", every_page: false }, SOCIAL).openForm, true);
});

test("the settings editor rejects unsafe links and unusable text before saving", () => {
  assert.equal(reviewsButtonError(REVIEWS_BUTTON_DEFAULTS), null);
  assert.match(reviewsButtonError({ ...REVIEWS_BUTTON_DEFAULTS, url: "javascript:alert(1)" }), /trustpilot\.com/);
  assert.match(reviewsButtonError({ ...REVIEWS_BUTTON_DEFAULTS, label: "  " }), /button text/i);
  assert.equal(reviewsButtonError({ ...REVIEWS_BUTTON_DEFAULTS, enabled: false, label: "" }), null);
  assert.match(reviewsButtonError({ ...REVIEWS_BUTTON_DEFAULTS, label: "x".repeat(41) }), /40 characters/);
});

test("the review form requires a comment, rating, name, email and consent; media is optional", () => {
  assert.deepEqual(reviewFormErrors(VALID), {});
  assert.deepEqual(Object.keys(reviewFormErrors({ ...VALID, comment: "   " })), ["comment"], "comment is mandatory");
  assert.deepEqual(Object.keys(reviewFormErrors({ ...VALID, comment: "Too short" })), ["comment"]);
  assert.deepEqual(Object.keys(reviewFormErrors({ ...VALID, comment: "x".repeat(REVIEW_LIMITS.maxComment + 1) })), ["comment"]);
  assert.deepEqual(Object.keys(reviewFormErrors({ ...VALID, rating: 0 })), ["rating"]);
  assert.deepEqual(Object.keys(reviewFormErrors({ ...VALID, consent: false })), ["consent"]);
  assert.deepEqual(Object.keys(reviewFormErrors({})), ["rating", "comment", "name", "email", "consent"], "same order as the form, so focus lands on the first visible error");
});

test("attachments are limited to photos/videos up to 20 MB and use paths the storage policy accepts", () => {
  assert.equal(reviewFileError({ type: "image/jpeg", size: 2_000_000 }), null);
  assert.equal(reviewFileError({ type: "video/mp4", size: REVIEW_LIMITS.maxFileBytes }), null);
  assert.match(reviewFileError({ type: "video/mp4", size: REVIEW_LIMITS.maxFileBytes + 1 }), /20 MB/);
  for (const type of ["application/pdf", "image/svg+xml", "text/html", "application/x-msdownload", ""]) assert.match(reviewFileError({ type, size: 10 }), /Only photos/, type);
  const policy = read("supabase/migrations/20261102000200_review_submissions.sql").match(/name ~ '([^']+)'/)[1];
  const token = "3f2b8c1e-9a4d-4e6f-8b2a-1c3d5e7f9a0b";
  for (const type of Object.keys(REVIEW_MEDIA_TYPES)) {
    const path = reviewMediaPath(token, 2, { type });
    assert.match(path, new RegExp(policy), path);
    assert.ok(path.startsWith(`pending/${token}/3-`), path);
  }
  const bucket = read("supabase/migrations/20261102000200_review_submissions.sql").match(/array\[([^\]]+)\]\)\non conflict/)[1];
  assert.deepEqual(bucket.match(/'([^']+)'/g).map((s) => s.slice(1, -1)).sort(), Object.keys(REVIEW_MEDIA_TYPES).sort(), "client and bucket allow the same types");
});

test("submissions stay private: staff-only table, private bucket, no public read of files", () => {
  const sql = read("supabase/migrations/20261102000200_review_submissions.sql");
  assert.match(sql, /alter table public\.review_submissions enable row level security/);
  assert.match(sql, /revoke all on public\.review_submissions from anon/);
  assert.match(sql, /values \('review-media', 'review-media', false, 20971520/);
  assert.doesNotMatch(sql, /for select to anon/, "visitors cannot list or read uploaded files");
  assert.match(sql, /for insert to anon, authenticated\s+with check \(bucket_id = 'review-media'/);
  assert.match(sql, /grant execute on function public\.submit_review\(jsonb\) to anon/);
  assert.match(sql, /'Please write your comment \(at least 10 characters\)\.'/);
});

test("the button sits bottom-left above the mobile bar, opens an accessible dialog and links Trustpilot safely", () => {
  const source = read("src/components/site/reviews-button.jsx");
  assert.match(source, /fixed bottom-\[calc\(5\.25rem\+env\(safe-area-inset-bottom\)\)\] left-3/);
  assert.match(source, /lg:bottom-5 lg:left-5/);
  assert.match(source, /<dialog/);
  assert.match(source, /aria-labelledby="review-dialog-title"/);
  assert.match(source, /aria-haspopup="dialog"/);
  assert.match(source, /aria-label="Close review form"/);
  assert.match(source, /sm:w-\[27rem\]/, "panel on larger screens; bottom sheet on phones");
  assert.equal((source.match(/target="_blank" rel="noopener noreferrer"/g) || []).length >= 3, true);
  assert.doesNotMatch(source, /from "lucide-react"/, "public pages use the shared icon sprite");
  const layout = read("src/app/(site)/layout.jsx");
  assert.match(layout, /<ReviewsButton config=\{reviewsButtonConfig\(settings\["site\.reviews_button"\], settings\["site\.social"\]\)\} consentText=\{settings\["site\.forms"\]\?\.consent_text\} \/>/);
});

test("the form is a two-step flow that keeps a draft, locks page scroll and supports keyboard rating", () => {
  const source = read("src/components/site/reviews-button.jsx");
  assert.match(source, /const STEP_FIELDS = \[\["rating", "comment", "media"\], \["name", "email", "consent"\]\]/, "step 1 asks about the classes, step 2 about the reviewer");
  assert.match(source, /Step 1 of 2: about the classes/);
  assert.match(source, /<ReviewForm open=\{open\}/, "form stays mounted so a half-written review survives closing");
  assert.doesNotMatch(source, /\{open && <ReviewForm/);
  assert.match(source, /document\.documentElement\.style\.overflow = open \? "hidden" : ""/);
  assert.match(source, /e\.key === "ArrowRight"/);
  assert.match(source, /URL\.revokeObjectURL/, "photo previews release their memory");
  assert.match(source, /onDrop=/, "files can be dropped onto the picker");
  assert.match(source, /RATING_WORDS = \["Tap a star", "Poor", "Fair", "Good", "Very good", "Excellent"\]/);
  const css = read("src/app/globals.css");
  assert.match(css, /\.review-star\[data-filled="true"\] \{ color: var\(--color-gold-500\); \}/);
  assert.match(css, /@keyframes review-sheet-in/);
});
