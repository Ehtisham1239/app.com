// Trustpilot reviews shown on the website (owner request, 2 Nov 2026).
// Edited in CMS → Settings → "Trustpilot summary" and "Trustpilot reviews".
//
// Honest presentation rules (UK DMCC Act 2024 / CMA guidance, Trustpilot guidelines):
// - The website features only genuine Trustpilot reviews rated at or above `min_rating`
//   (4★ by default), each linked to the original review on Trustpilot.
// - The overall TrustScore and the total review count shown next to them are copied
//   from the live Trustpilot profile, and a "See all reviews" link is always shown,
//   so visitors are never given the impression that the featured cards are all reviews.
// - No review schema / AggregateRating is emitted: Google treats reviews a business
//   publishes about itself as self-serving and ineligible for review stars.
import { trustpilotUrl } from "./reviews-button.js";

export const TRUSTPILOT_PROFILE_URL = "https://www.trustpilot.com/review/onlinequrancollege.com";

export const TRUSTPILOT_DEFAULTS = {
  enabled: true,
  profile_url: TRUSTPILOT_PROFILE_URL,
  // Copied from the public profile on 2 Nov 2026. Update both when Trustpilot changes.
  trust_score: "4.3",
  review_count: "8",
  min_rating: "4",
  heading: "What families say on Trustpilot",
};

// Genuine reviews from the public profile (checked 2 Nov 2026). Names are shortened to
// first name + initial. Where Trustpilot shows a longer review, `text` holds its opening
// words and `excerpt` marks it, so the card ends with "…" and links to the full review.
export const TRUSTPILOT_DEFAULT_REVIEWS = [
  { name: "Nadia", country: "Australia", rating: "5", date: "2024-06-06", title: "Good teacher and system", text: "Good teacher and system, my son is comfortable and easily understands what he learns.", excerpt: false, url: "https://www.trustpilot.com/reviews/66614f4d99c0c4b3e36541f1" },
  { name: "Shabina S.", country: "Australia", rating: "5", date: "2024-06-04", title: "Alhumdolillah I am very happy with…", text: "Alhumdolillah found a good Academy and a good teachers.", excerpt: true, url: "https://www.trustpilot.com/reviews/665eacb1a22ff3a99a78f999" },
  { name: "Yasmeen", country: "New Zealand", rating: "5", date: "2024-06-06", title: "Alhumdullillha we found a good Academy…", text: "Alhumdullillha we found a good Academy and a good teachers.", excerpt: true, url: "https://www.trustpilot.com/reviews/66614d50f32517e90aab2cfa" },
  { name: "Saira", country: "Australia", rating: "5", date: "2024-06-04", title: "Excellent services", text: "The Online Quran college services are exceptional, offering a seamless and effective learning platform.", excerpt: true, url: "https://www.trustpilot.com/reviews/665eaf1ac18fb1edb2fcc527" },
  { name: "Faeza K.", country: "Australia", rating: "5", date: "2024-06-03", title: "Alhamdulliah we are happy with the…", text: "Alhamdulliah we are happy with the online Quaran tutorial.", excerpt: true, url: "https://www.trustpilot.com/reviews/665d8a20ece0f40be52dc9be" },
  { name: "Nouman A.", country: "Pakistan", rating: "5", date: "2024-05-29", title: "Very good experience", text: "Very good experience", excerpt: false, url: "https://www.trustpilot.com/reviews/6656c18d32a0610bd54ef4f7" },
  { name: "Syed Z.", country: "Pakistan", rating: "5", date: "2025-01-17", title: "Excellent 👌 Mashallah sir", text: "", excerpt: false, url: "https://www.trustpilot.com/reviews/6789e619be6bf99372cd6f0e" },
  { name: "Khan", country: "United States", rating: "5", date: "2024-10-16", title: "Alhamdulillah", text: "Alhamdulillah", excerpt: false, url: "https://www.trustpilot.com/reviews/670fc1098031d135b40cbbba" },
];

const LIMITS = { name: 60, country: 40, title: 120, text: 400, heading: 80 };
const clean = (value, max) => String(value ?? "").replace(/\s+/g, " ").trim().slice(0, max);
const toRating = (value) => { const n = Math.round(Number(value)); return n >= 1 && n <= 5 ? n : 0; };
const toDate = (value) => (/^\d{4}-\d{2}-\d{2}$/.test(String(value ?? "")) && !Number.isNaN(Date.parse(value)) ? String(value) : "");
const truthy = (value) => value === true || value === "true" || value === "yes";

function score(value) {
  const n = Number(String(value ?? "").replace(",", "."));
  return Number.isFinite(n) && n >= 1 && n <= 5 ? Math.round(n * 10) / 10 : null;
}
function count(value) {
  const n = Number(String(value ?? "").replace(/[^\d]/g, ""));
  return Number.isInteger(n) && n > 0 ? n : null;
}

// Error message for CMS → Settings → "Trustpilot summary", or null when valid.
export function trustpilotSummaryError(value = {}) {
  if (value.profile_url && !trustpilotUrl(value.profile_url)) return "Trustpilot profile link must be an https://…trustpilot.com address.";
  if (String(value.trust_score ?? "").trim() && score(value.trust_score) === null) return "TrustScore must be a number between 1 and 5, e.g. 4.3 — copy it from your Trustpilot profile.";
  if (String(value.review_count ?? "").trim() && count(value.review_count) === null) return "Total reviews must be a whole number — copy it from your Trustpilot profile.";
  if (![4, 5].includes(toRating(value.min_rating || 4))) return "Show reviews rated at least 4 or 5 stars.";
  if (String(value.heading ?? "").length > LIMITS.heading) return `Heading must be ${LIMITS.heading} characters or fewer.`;
  return null;
}

// Error message for CMS → Settings → "Trustpilot reviews", or null when valid.
export function trustpilotReviewsError(list = []) {
  if (!Array.isArray(list)) return "Reviews must be a list.";
  for (const [i, item] of list.entries()) {
    const n = i + 1;
    if (!clean(item?.name, LIMITS.name)) return `Review ${n}: add the reviewer name shown on Trustpilot.`;
    if (!toRating(item?.rating)) return `Review ${n}: rating must be 1 to 5 — use the stars shown on Trustpilot.`;
    if (!clean(item?.title, LIMITS.title) && !clean(item?.text, LIMITS.text)) return `Review ${n}: add the review title or text exactly as on Trustpilot.`;
    if (!trustpilotUrl(item?.url) || !/\/reviews\/[A-Za-z0-9]+\/?$/.test(new URL(trustpilotUrl(item.url)).pathname)) return `Review ${n}: paste the review's own Trustpilot link (https://www.trustpilot.com/reviews/…).`;
    if (item?.date && !toDate(item.date)) return `Review ${n}: date must look like 2024-06-06.`;
  }
  return null;
}

// Render-ready data; null hides the section. Only genuine, linked reviews at or above the
// minimum rating are featured, in CMS order, up to `limit`.
export function trustpilotSection(summarySetting, reviewsSetting, social, { limit = 6 } = {}) {
  const summary = { ...TRUSTPILOT_DEFAULTS, ...(summarySetting && typeof summarySetting === "object" ? summarySetting : {}) };
  if (summary.enabled === false || summary.enabled === "false") return null;
  const profileUrl = trustpilotUrl(summary.profile_url) || trustpilotUrl(social?.trustpilot) || TRUSTPILOT_PROFILE_URL;
  const minRating = [4, 5].includes(toRating(summary.min_rating)) ? toRating(summary.min_rating) : 4;
  const source = Array.isArray(reviewsSetting) ? reviewsSetting : TRUSTPILOT_DEFAULT_REVIEWS;
  const reviews = source
    .map((item) => ({
      name: clean(item?.name, LIMITS.name),
      country: clean(item?.country, LIMITS.country),
      rating: toRating(item?.rating),
      date: toDate(item?.date),
      title: clean(item?.title, LIMITS.title),
      text: clean(item?.text, LIMITS.text),
      excerpt: truthy(item?.excerpt),
      url: trustpilotUrl(item?.url),
    }))
    .filter((r) => r.name && r.url && r.rating >= minRating && (r.title || r.text))
    // CMS order is the display order, so staff choose which reviews lead.
    .slice(0, Math.max(0, limit));
  if (!reviews.length) return null;
  return {
    heading: clean(summary.heading, LIMITS.heading) || TRUSTPILOT_DEFAULTS.heading,
    profileUrl,
    reviewUrl: trustpilotUrl(summary.review_url) || "https://www.trustpilot.com/evaluate/onlinequrancollege.com",
    trustScore: score(summary.trust_score),
    reviewCount: count(summary.review_count),
    minRating,
    reviews,
  };
}
