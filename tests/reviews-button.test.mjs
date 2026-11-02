import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DEFAULT_INVITE_MESSAGE, REVIEW_LIMITS, REVIEW_MEDIA_TYPES, REVIEWS_BUTTON_DEFAULTS, reviewInviteError, reviewInviteMessage, reviewShortPath, googleReviewUrl, reviewFileError, reviewFormErrors, reviewMediaPath, reviewsButtonConfig, reviewsButtonError, trustpilotUrl } from "../src/lib/reviews-button.js";
import { DEFAULT_SETTINGS } from "../src/lib/default-settings.js";

const SOCIAL = { trustpilot: "https://www.trustpilot.com/review/onlinequrancollege.com" };
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const VALID = { name: "Amina", email: "amina@example.test", rating: 5, comment: "My daughter loves her Tajweed teacher.", consent: true };

test("only https Trustpilot addresses are accepted as the button link", () => {
  for (const ok of ["https://www.trustpilot.com/review/onlinequrancollege.com", "https://uk.trustpilot.com/review/onlinequrancollege.com", "https://trustpilot.com/evaluate/onlinequrancollege.com"]) assert.ok(trustpilotUrl(ok), ok);
  for (const bad of ["javascript:alert(1)", "http://www.trustpilot.com/review/x", "https://trustpilot.com.evil.example/review/x", "https://eviltrustpilot.com/x", "https://user:pw@www.trustpilot.com/x", "/review", "", null, 42]) assert.equal(trustpilotUrl(bad), "", String(bad));
});

test("by default the button opens OQC’s direct Trustpilot review invitation on every page", () => {
  assert.deepEqual(DEFAULT_SETTINGS["site.reviews_button"], REVIEWS_BUTTON_DEFAULTS);
  assert.deepEqual(reviewsButtonConfig(undefined, SOCIAL), { href: "https://www.trustpilot.com/evaluate/onlinequrancollege.com", googleHref: "", label: "Review us on Trustpilot", sublabel: "Parents & students", everyPage: true, openForm: false, pageUrl: "/reviews" });
  assert.equal(reviewsButtonConfig(undefined, { trustpilot: "" }).href, "https://www.trustpilot.com/evaluate/onlinequrancollege.com", "the verified direct invitation URL is the safe fallback");
});

test("CMS values control text, link, pages and form/Trustpilot mode", () => {
  const custom = reviewsButtonConfig({ label: " Rate us ", sublabel: "", url: "https://uk.trustpilot.com/review/onlinequrancollege.com", every_page: false, open_form: false }, SOCIAL);
  assert.deepEqual(custom, { href: "https://uk.trustpilot.com/review/onlinequrancollege.com", googleHref: "", label: "Rate us", sublabel: "", everyPage: false, openForm: false, pageUrl: "/reviews" });
  assert.equal(reviewsButtonConfig({ enabled: false }, SOCIAL), null, "switched off in CMS");
  assert.equal(reviewsButtonConfig({ open_form: false }, { trustpilot: "" }).href, "https://www.trustpilot.com/evaluate/onlinequrancollege.com", "direct mode falls back to the verified invitation URL");
  assert.equal(reviewsButtonConfig({ open_form: false, url: "https://example.com/fake" }, { trustpilot: "" }).href, "https://www.trustpilot.com/evaluate/onlinequrancollege.com", "unsafe CMS links fall back to the verified Trustpilot destination");
  assert.equal(reviewsButtonConfig({ url: "https://example.com/x" }, SOCIAL).href, SOCIAL.trustpilot, "invalid custom link falls back to the saved Trustpilot page");
  // A row saved before direct-link mode (no open_form key) inherits the safe direct-link default.
  assert.equal(reviewsButtonConfig({ enabled: true, label: "Review us", every_page: false }, SOCIAL).openForm, false);
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
  const policy = read("supabase/migrations/20261102051558_review_submissions.sql").match(/name ~ '([^']+)'/)[1];
  const token = "3f2b8c1e-9a4d-4e6f-8b2a-1c3d5e7f9a0b";
  for (const type of Object.keys(REVIEW_MEDIA_TYPES)) {
    const path = reviewMediaPath(token, 2, { type });
    assert.match(path, new RegExp(policy), path);
    assert.ok(path.startsWith(`pending/${token}/3-`), path);
  }
  const bucket = read("supabase/migrations/20261102051558_review_submissions.sql").match(/array\[([^\]]+)\]\)\non conflict/)[1];
  assert.deepEqual(bucket.match(/'([^']+)'/g).map((s) => s.slice(1, -1)).sort(), Object.keys(REVIEW_MEDIA_TYPES).sort(), "client and bucket allow the same types");
});

test("submissions stay private: staff-only table, private bucket, no public read of files", () => {
  const sql = read("supabase/migrations/20261102051558_review_submissions.sql");
  assert.match(sql, /alter table public\.review_submissions enable row level security/);
  assert.match(sql, /revoke all on public\.review_submissions from anon/);
  assert.match(sql, /values \('review-media', 'review-media', false, 20971520/);
  assert.doesNotMatch(sql, /for select to anon/, "visitors cannot list or read uploaded files");
  assert.match(sql, /for insert to anon, authenticated\s+with check \(bucket_id = 'review-media'/);
  assert.match(sql, /grant execute on function public\.submit_review\(jsonb\) to anon/);
  assert.match(sql, /'Please write your comment \(at least 10 characters\)\.'/);
});

test("the button sits bottom-left above the mobile bar, opens an accessible dialog and links out safely", () => {
  const trigger = read("src/components/site/reviews-button.jsx");
  const form = read("src/components/site/review-form.jsx");
  assert.match(trigger, /fixed bottom-\[calc\(5\.25rem\+env\(safe-area-inset-bottom\)\)\] left-3/);
  assert.match(trigger, /lg:bottom-5 lg:left-5/);
  assert.match(trigger, /<dialog/);
  assert.match(trigger, /aria-labelledby="review-dialog-title"/);
  assert.match(trigger, /aria-haspopup="dialog"/);
  assert.match(trigger, /sm:inset-0 sm:m-auto sm:h-fit/, "centred on larger screens; bottom sheet on phones");
  assert.match(trigger, /max-h-\[94dvh\]/, "the phone sheet always fits on screen");
  assert.match(read("src/app/globals.css"), /\.review-dialog::backdrop \{ background: rgb\(14 31 18/, "the page behind is dimmed");
  assert.match(form, /src="\/brand\/mark-v2-64\.png"/, "the pop-up carries the OQC mark");
  assert.match(form, /aria-label="Close review form"/);
  assert.match(form, /id="review-dialog-title"/);
  for (const source of [trigger, form]) {
    assert.doesNotMatch(source, /from "lucide-react"/, "public pages use the shared icon sprite");
    for (const link of source.match(/<a [^>]*target="_blank"[^>]*>/g) || []) assert.match(link, /rel="noopener noreferrer"/, link);
  }
  const layout = read("src/app/(site)/layout.jsx");
  assert.match(layout, /<ReviewsButton config=\{reviewsButtonConfig\(settings\["site\.reviews_button"\], settings\["site\.social"\]\)\} consentText=\{settings\["site\.forms"\]\?\.consent_text\} \/>/);
});

test("speed: only the small trigger ships with each page; the form chunk loads on intent and is not in the page HTML", () => {
  const trigger = read("src/components/site/reviews-button.jsx");
  assert.doesNotMatch(trigger, /^import .*review-form/m, "no static import of the form");
  assert.match(trigger, /import\("@\/components\/site\/review-form"\)/);
  assert.match(trigger, /onPointerEnter=\{prefetch\} onFocus=\{prefetch\} onTouchStart=\{prefetch\}/);
  assert.match(trigger, /\{Form \? \(\s*<Form open=\{open\}/, "form mounts only after the first opening");
  assert.doesNotMatch(trigger, /How are the classes going|consentText \|\|/, "form copy is not rendered into every page");
  assert.match(trigger, /The review form did not load/, "a failed chunk load explains what to do");
  assert.match(trigger, /\) : open \? \(/, "even the loading message is rendered only while opening");
});

test("the form is one short screen that keeps a draft, guides the reviewer and supports keyboard rating", () => {
  const source = read("src/components/site/review-form.jsx");
  assert.doesNotMatch(source, /STEP_FIELDS|Step 1 of 2/, "no multi-step flow");
  assert.match(source, /const errs = reviewFormErrors\(form\);/, "one submit validates every field");
  assert.match(source, /export function ReviewForm\(\{ open, config, consentText, onClose, inline = false \}\)/);
  assert.match(source, /const STARTERS = \[/, "one-tap topic chips");
  assert.match(source, /COMMENT_PROMPTS\[form\.rating\]/);
  assert.match(read("src/components/site/reviews-button.jsx"), /document\.documentElement\.style\.overflow = open \? "hidden" : ""/);
  assert.match(source, /e\.key === "ArrowRight"/);
  assert.match(source, /URL\.revokeObjectURL/);
  assert.match(source, /first name, rating and comment only/);
  assert.match(read("src/app/admin/(panel)/reviews/[id]/page.jsx"), /name: r\.name\.trim\(\)\.split\(\/\\s\+\/\)\[0\]/, "testimonial drafts keep that first-name promise");
  assert.match(read("src/app/admin/(panel)/reviews/page.jsx"), /How to handle reviews/);
  const page = read("src/app/(site)/reviews/page.jsx");
  assert.match(page, /<ReviewForm open inline /, "the /reviews page shows the form inline");
  assert.match(page, /robots: \{ index: false, follow: true \}/);
  const css = read("src/app/globals.css");
  assert.match(css, /\.review-star\[data-filled="true"\] \{ color: var\(--color-gold-500\); \}/);
  assert.match(css, /@keyframes review-sheet-in/);
});

test("Google and Trustpilot invitations go to every reviewer, never only to high ratings", () => {
  const source = read("src/components/site/review-form.jsx");
  const block = source.slice(source.indexOf("Help other families find us") - 200, source.indexOf("Help other families find us") + 1200);
  assert.match(block, /config\.googleHref/);
  assert.match(block, /config\.href/);
  assert.doesNotMatch(block, /rating\s*(>=|>|===|==)\s*\d/, "no review gating by star rating");
  assert.doesNotMatch(source, /form\.rating\s*(>=|>)\s*[34]/);
});

test("only genuine Google review links are accepted", () => {
  for (const ok of ["https://g.page/r/CTestAbc123/review", "https://search.google.com/local/writereview?placeid=ChIJ123", "https://maps.app.goo.gl/AbCdEf", "https://www.google.com/maps/place/x"]) assert.ok(googleReviewUrl(ok), ok);
  for (const bad of ["http://g.page/r/x", "https://g.page.evil.example/r/x", "https://search.google.com/search?q=x", "javascript:alert(1)", "https://example.com/review", ""]) assert.equal(googleReviewUrl(bad), "", bad);
  assert.equal(reviewsButtonConfig({ google_url: "https://g.page/r/CTestAbc123/review" }, SOCIAL).googleHref, "https://g.page/r/CTestAbc123/review");
  assert.equal(reviewsButtonConfig({ google_url: "https://evil.example/r" }, SOCIAL).googleHref, "");
  assert.match(reviewsButtonError({ ...REVIEWS_BUTTON_DEFAULTS, google_url: "https://evil.example/r" }), /Google review link/);
});

test("the CMS short review link is one safe word and never shadows a real page", () => {
  for (const [input, out] of [["/copoloit", "/copoloit"], ["/Feedback", "/feedback"], ["/reviews", "/reviews"], [" /review-us ", "/review-us"]]) assert.equal(reviewShortPath(input), out, input);
  for (const bad of ["/courses", "/admin", "/api", "/pricing", "/a", "//evil.example", "/x/y", "https://evil.example/x", "/x?y=1", "javascript:alert(1)", "", null]) assert.equal(reviewShortPath(bad), "", String(bad));
  assert.equal(reviewsButtonConfig({ page_url: "/courses" }, SOCIAL).pageUrl, "/reviews", "a reserved path falls back to the canonical page");
  assert.match(reviewsButtonError({ ...REVIEWS_BUTTON_DEFAULTS, page_url: "/courses" }), /short review link/i);
  assert.ok(!reviewsButtonError({ ...REVIEWS_BUTTON_DEFAULTS, page_url: "/copoloit" }));
});

test("/copoloit, /review and any CMS short link reach /reviews; the site links to /reviews directly", () => {
  const config = read("next.config.mjs");
  assert.match(config, /source: "\/copoloit", destination: "\/reviews", permanent: true/);
  assert.match(config, /source: "\/review", destination: "\/reviews", permanent: true/);
  const slug = read("src/app/(site)/[slug]/page.jsx");
  assert.match(slug, /reviewShortPath\(/);
  assert.match(slug, /permanentRedirect\("\/reviews"\)/);
  assert.ok(slug.indexOf("permanentRedirect(\"/reviews\")") < slug.lastIndexOf("notFound()"), "short-link redirect runs before the 404");
  const footer = read("src/components/site/footer.jsx");
  assert.match(footer, /const reviewPage = "\/reviews";/, "internal links skip the redirect hop");
  const page = read("src/app/(site)/reviews/page.jsx");
  assert.match(page, /canonical: "\/reviews"/);
});

test("staff review invitations are neutral, carry the link and are offered for every family", () => {
  const link = "https://www.onlinequrancollege.com/copoloit";
  const msg = reviewInviteMessage(DEFAULT_INVITE_MESSAGE, link);
  assert.ok(msg.includes(link) && !msg.includes("{link}"));
  assert.match(msg, /honest experience/);
  assert.ok(!reviewInviteError(DEFAULT_INVITE_MESSAGE));
  assert.ok(reviewInviteMessage("Please share your feedback.", link).endsWith(link), "a template without {link} still gets the link");
  for (const gated of ["Please leave us a 5-star review {link}", "Give us five stars", "Leave a positive review", "Review us and get a free class", "Review for a discount"]) assert.ok(reviewInviteError(gated), gated);
  assert.ok(reviewInviteError("x".repeat(601)));
  assert.match(reviewsButtonError({ ...REVIEWS_BUTTON_DEFAULTS, invite_message: "Leave a 5 star review" }), /./);
  const invite = read("src/components/admin/review-invite.jsx");
  assert.doesNotMatch(invite, /rating\s*[<>=]/, "the invitation is never filtered by rating");
  assert.match(invite, /wa\.me\/\?text=/);
  assert.match(invite, /mailto:\?subject=/);
  assert.match(read("src/app/admin/(panel)/reviews/page.jsx"), /<ReviewInvite \/>/);
  assert.match(read("src/app/admin/(panel)/settings/page.jsx"), /invite_message/);
});
