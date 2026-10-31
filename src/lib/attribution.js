export const ATTRIBUTION_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid"];
const STORAGE_KEY = "oqc-campaign";
const MAX_AGE = 86400000;
const SEARCH_SOURCES = [
  ["google", /^(?:www\.)?google\.(?:com|co\.uk|com\.au|ca|co\.nz|co\.in|com\.pk|de|fr|ae|com\.sa)$/],
  ["bing", /^(?:www\.)?bing\.com$/],
  ["duckduckgo", /^(?:www\.)?duckduckgo\.com$/],
  ["yahoo", /^(?:[a-z]+\.)?search\.yahoo\.com$/],
];
// Only an allowlisted engine label is retained, never the referrer URL/query.
// This is an inferred enquiry source, not proof of a genuine lead or admission.
function organicReferrer() {
  if (typeof document === "undefined" || !document.referrer) return null;
  try {
    const referrer = new URL(document.referrer);
    if (!["http:", "https:"].includes(referrer.protocol) || referrer.hostname === window.location.hostname) return null;
    return SEARCH_SOURCES.find(([, pattern]) => pattern.test(referrer.hostname))?.[0] || null;
  } catch { return null; }
}
// Session-only attribution: no visitor IDs, cookies, or ad-platform requests.
export function captureAttribution() {
  if (typeof window === "undefined") return {};
  let previous = {};
  let at = Date.now();
  try {
    const saved = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) || "null");
    if (saved?.at && Date.now() - saved.at < MAX_AGE) { previous = saved.data || {}; at = saved.at; }
    else if (saved) window.sessionStorage.removeItem?.(STORAGE_KEY);
  } catch { /* Forms still work if storage is unavailable. */ }
  const params = new URLSearchParams(window.location.search);
  const current = Object.fromEntries(ATTRIBUTION_KEYS.filter((key) => params.get(key)).map((key) => [key, params.get(key).slice(0, 120)]));
  if (Object.keys(current).length) at = Date.now();
  const engine = !Object.keys(current).length && !Object.keys(previous).length ? organicReferrer() : null;
  const data = Object.keys(current).length ? { ...current, landing_page: window.location.pathname.slice(0, 200) }
    : engine ? { utm_source: engine, utm_medium: "organic", attribution_method: "search_referrer", landing_page: window.location.pathname.slice(0, 200) }
    : previous;
  if (Object.keys(data).length) {
    try { window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ at, data })); } catch { /* Optional storage. */ }
  }
  return data;
}
