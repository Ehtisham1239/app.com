import { DEFAULT_SETTINGS } from "./default-settings.js";

// Verification tokens must come from the owner's search-engine account.
// File/DNS verification is independent of these optional meta-tag fields.
export function verificationCode(value) {
  return typeof value === "string" && /^[A-Za-z0-9_-]{1,250}$/.test(value.trim()) ? value.trim() : undefined;
}

export function normalizeSeoSettings(value = {}) {
  const stored = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const text = key => typeof stored[key] === "string" ? stored[key].trim() : "";
  return {
    ...stored,
    title: text("title") || DEFAULT_SETTINGS["site.seo"].title,
    description: text("description") || DEFAULT_SETTINGS["site.seo"].description,
    google_verification: text("google_verification"),
    bing_verification: text("bing_verification"),
  };
}

export function seoSettingsError(value = {}) {
  for (const field of ["google_verification", "bing_verification"]) {
    if (value[field] && !verificationCode(value[field])) return "Paste only the verification code from your account, not an HTML tag or a file name.";
  }
  return "";
}
