// Floating reviews button (owner request, 2 Nov 2026): direct Trustpilot review invitation by default.
// The optional on-site review form remains available as a CMS-controlled alternative; the
// shareable review page is /reviews (short link /review).
// Edited in CMS → Settings → "Reviews button".

export const REVIEWS_BUTTON_DEFAULTS = {
  enabled: true,
  label: "Review us on Trustpilot",
  sublabel: "Parents & students",
  url: "https://www.trustpilot.com/evaluate/onlinequrancollege.com",
  page_url: "/reviews",
  every_page: true,
  open_form: false,
  google_url: "",
};

const MAX_LABEL = 40;
const MAX_SUBLABEL = 40;

// Review form limits — keep in step with public.submit_review and the review-media bucket.
export const REVIEW_LIMITS = { minComment: 10, maxComment: 2000, maxFiles: 3, maxFileBytes: 20 * 1024 * 1024 };
export const REVIEW_MEDIA_TYPES = {
  "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/heic": "heic", "image/heif": "heif",
  "video/mp4": "mp4", "video/quicktime": "mov", "video/webm": "webm",
};

// Only an https Trustpilot address is accepted, so a CMS typo or a pasted script
// can never turn the button into a link to somewhere else.
export function trustpilotUrl(value) {
  if (typeof value !== "string" || !value.trim()) return "";
  try {
    const url = new URL(value.trim());
    const host = url.hostname.toLowerCase();
    if (url.protocol !== "https:" || url.username || url.password) return "";
    if (host !== "trustpilot.com" && !host.endsWith(".trustpilot.com")) return "";
    return url.toString();
  } catch {
    return "";
  }
}

// Google review links come from Google Business Profile ("Ask for reviews"): g.page/r/…,
// search.google.com/local/writereview?placeid=… or a maps.app.goo.gl short link.
export function googleReviewUrl(value) {
  if (typeof value !== "string" || !value.trim()) return "";
  try {
    const url = new URL(value.trim());
    const host = url.hostname.toLowerCase();
    if (url.protocol !== "https:" || url.username || url.password) return "";
    const ok = host === "g.page" || host === "maps.app.goo.gl"
      || (host === "search.google.com" && url.pathname.startsWith("/local/writereview"))
      || ((host === "www.google.com" || host === "google.com") && url.pathname.startsWith("/maps"));
    return ok ? url.toString() : "";
  } catch {
    return "";
  }
}

export function reviewsButtonError(value = {}) {
  if (value.url && !trustpilotUrl(value.url)) return "Trustpilot link must start with https:// and be a trustpilot.com address.";
  if (value.page_url && (typeof value.page_url !== "string" || !/^\/(?!\/)[A-Za-z0-9/_-]*$/.test(value.page_url))) return "Customer review page must be a same-site path such as /reviews.";
  if (value.google_url && !googleReviewUrl(value.google_url)) return "Google review link must be the https:// link from Google Business Profile → Ask for reviews (g.page/r/… or search.google.com/local/writereview…).";
  if (value.enabled && !String(value.label ?? "").trim()) return "Add the button text, or switch the button off.";
  if (String(value.label ?? "").length > MAX_LABEL) return `Button text must be ${MAX_LABEL} characters or fewer.`;
  if (String(value.sublabel ?? "").length > MAX_SUBLABEL) return `Small text must be ${MAX_SUBLABEL} characters or fewer.`;
  return null;
}

// Resolved, render-ready config; null means "do not show the button".
export function reviewsButtonConfig(setting, social) {
  const value = { ...REVIEWS_BUTTON_DEFAULTS, ...(setting && typeof setting === "object" ? setting : {}) };
  if (!value.enabled) return null;
  const href = trustpilotUrl(value.url) || trustpilotUrl(social?.trustpilot) || trustpilotUrl(REVIEWS_BUTTON_DEFAULTS.url);
  const label = String(value.label ?? "").trim().slice(0, MAX_LABEL);
  const openForm = value.open_form !== false;
  if (!label || (!openForm && !href)) return null;
  return {
    href,
    pageUrl: value.page_url || "/reviews",
    googleHref: googleReviewUrl(value.google_url),
    label,
    sublabel: String(value.sublabel ?? "").trim().slice(0, MAX_SUBLABEL),
    everyPage: Boolean(value.every_page),
    openForm,
  };
}

// Client-side checks mirror the database rules so visitors see errors before upload.
export function reviewFormErrors(form) {
  // Keys follow the on-screen order so focus moves to the first problem the visitor sees.
  const errors = {};
  if (!(Number(form.rating) >= 1 && Number(form.rating) <= 5)) errors.rating = "Please choose a star rating.";
  const comment = String(form.comment ?? "").trim();
  if (comment.length < REVIEW_LIMITS.minComment) errors.comment = `Please write your comment (at least ${REVIEW_LIMITS.minComment} characters).`;
  else if (comment.length > REVIEW_LIMITS.maxComment) errors.comment = `Please keep your comment under ${REVIEW_LIMITS.maxComment} characters.`;
  if (String(form.name ?? "").trim().length < 2) errors.name = "Please enter your name.";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(form.email ?? "").trim())) errors.email = "Please enter a valid email address.";
  if (!form.consent) errors.consent = "Please agree to the privacy notice before sending.";
  return errors;
}

// Returns an error message for a file the bucket would refuse, or null.
export function reviewFileError(file) {
  if (!file || !REVIEW_MEDIA_TYPES[file.type]) return "Only photos (JPG, PNG, WebP, HEIC) and videos (MP4, MOV, WebM) can be attached.";
  if (file.size > REVIEW_LIMITS.maxFileBytes) return "Each file must be 20 MB or smaller.";
  return null;
}

// Storage path accepted by the "review media public upload" policy.
export function reviewMediaPath(token, index, file) {
  return `pending/${token}/${index + 1}-${Date.now().toString(36)}.${REVIEW_MEDIA_TYPES[file.type]}`;
}
