// Floating "Review us on Trustpilot" button (owner request, 2 Nov 2026).
// Edited in CMS → Settings → "Trustpilot button". The link may be left empty to reuse
// the Trustpilot reviews page saved under Social links.

export const REVIEWS_BUTTON_DEFAULTS = {
  enabled: true,
  label: "Review us on Trustpilot",
  sublabel: "Parents & students",
  url: "",
  every_page: false,
};

const MAX_LABEL = 40;
const MAX_SUBLABEL = 40;

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

export function reviewsButtonError(value = {}) {
  if (value.url && !trustpilotUrl(value.url)) return "Trustpilot link must start with https:// and be a trustpilot.com address.";
  if (value.enabled && !String(value.label ?? "").trim()) return "Add the button text, or switch the button off.";
  if (String(value.label ?? "").length > MAX_LABEL) return `Button text must be ${MAX_LABEL} characters or fewer.`;
  if (String(value.sublabel ?? "").length > MAX_SUBLABEL) return `Small text must be ${MAX_SUBLABEL} characters or fewer.`;
  return null;
}

// Resolved, render-ready config; null means "do not show the button".
export function reviewsButtonConfig(setting, social) {
  const value = { ...REVIEWS_BUTTON_DEFAULTS, ...(setting && typeof setting === "object" ? setting : {}) };
  if (!value.enabled) return null;
  const href = trustpilotUrl(value.url) || trustpilotUrl(social?.trustpilot);
  const label = String(value.label ?? "").trim().slice(0, MAX_LABEL);
  if (!href || !label) return null;
  return {
    href,
    label,
    sublabel: String(value.sublabel ?? "").trim().slice(0, MAX_SUBLABEL),
    everyPage: Boolean(value.every_page),
  };
}
