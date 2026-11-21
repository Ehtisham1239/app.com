// Meta (Facebook/Instagram) Pixel, consent-gated (owner decision, 19 Nov 2026, chat: "Consent banner ke saath").
// Separate from the cookieless GA4/GTM loader in analytics.js, which is unchanged: Google ad consent stays denied.
// The Pixel script is never requested until the visitor presses Accept, nothing is written to the device before
// that choice, and only allowlisted lead fields (form type, market) are sent - never form values.
export const META_PIXEL_CONSENT_KEY = "oqc-meta-pixel-consent-v1";
const MARKETS = ["UK", "USA", "Canada", "Australia", "UAE", "Other"];

// Pixel IDs are 15-16 digit numbers. Anything else (empty, script code, a URL) switches the Pixel off.
export function metaPixelId(value) {
  const id = String(value ?? "").trim();
  return /^[0-9]{10,20}$/.test(id) ? id : "";
}

export function readMetaPixelConsent(win) {
  try {
    const value = win.localStorage.getItem(META_PIXEL_CONSENT_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch { return null; } // storage blocked: ask again, track nothing
}

export function saveMetaPixelConsent(win, value) {
  if (value !== "granted" && value !== "denied") return false;
  try { win.localStorage.setItem(META_PIXEL_CONSENT_KEY, value); return true; } catch { return false; }
}

// Standard Meta stub: queues calls until fbevents.js loads.
function ensureFbq(win) {
  if (win.fbq) return win.fbq;
  const fbq = function () { fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments); };
  win.fbq = fbq;
  if (!win._fbq) win._fbq = fbq;
  fbq.push = fbq; fbq.loaded = true; fbq.version = "2.0"; fbq.queue = [];
  return fbq;
}

export function createMetaPixelController(win, pixelId) {
  const id = metaPixelId(pixelId);
  const doc = win.document;
  let active = false;
  const onLead = (event) => {
    const { form_type, market } = event.detail || {};
    if (!active || event.detail?.event !== "generate_lead" || !["trial", "contact"].includes(form_type) || !MARKETS.includes(market)) return;
    // eventID lets a later server-side Conversions API call deduplicate the same lead.
    const eventID = `lead_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    win.fbq("track", "Lead", { content_category: form_type, content_name: market }, { eventID });
  };
  function grant() {
    if (!id || active) return false;
    const fbq = ensureFbq(win);
    if (!doc.getElementById("oqc-meta-pixel")) {
      const script = doc.createElement("script");
      script.id = "oqc-meta-pixel"; script.async = true; script.src = "https://connect.facebook.net/en_US/fbevents.js";
      doc.head.appendChild(script);
    }
    fbq("init", id);
    fbq("track", "PageView"); // later route changes are picked up by the Pixel's own history tracking
    win.addEventListener("oqc:lead-saved", onLead);
    active = true;
    return true;
  }
  function revoke() {
    // Stops our Lead events; a Pixel already loaded this page view stops completely after the next page load.
    win.removeEventListener("oqc:lead-saved", onLead);
    if (win.fbq) win.fbq("consent", "revoke");
    active = false;
  }
  return { grant, revoke, isActive: () => active };
}
