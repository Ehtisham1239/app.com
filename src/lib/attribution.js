export const ATTRIBUTION_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid"];
const STORAGE_KEY = "oqc-campaign";
const MAX_AGE = 86400000;
// Session-only attribution: no visitor IDs, cookies, or ad-platform requests.
export function captureAttribution() {
  if (typeof window === "undefined") return {};
  let previous = {};
  let at = Date.now();
  try {
    const saved = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) || "null");
    if (saved?.at && Date.now() - saved.at < MAX_AGE) { previous = saved.data || {}; at = saved.at; }
  } catch { /* Forms still work if storage is unavailable. */ }
  const params = new URLSearchParams(window.location.search);
  const current = Object.fromEntries(ATTRIBUTION_KEYS.filter((key) => params.get(key)).map((key) => [key, params.get(key).slice(0, 120)]));
  if (Object.keys(current).length) at = Date.now();
  const data = Object.keys(current).length ? { ...current, landing_page: window.location.pathname.slice(0, 200) } : previous;
  if (Object.keys(data).length) {
    try { window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ at, data })); } catch { /* Optional storage. */ }
  }
  return data;
}
