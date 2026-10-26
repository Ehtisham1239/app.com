export const ANALYTICS_CONSENT_KEY = "oqc-analytics-consent-v1";
export const ANALYTICS_CONSENT_EVENT = "oqc:analytics-consent";
export const CONSENT_DENIED = { analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" };

export function analyticsConfig(value = {}) {
  value = value && typeof value === "object" ? value : {};
  const ga4 = typeof value.ga4_measurement_id === "string" ? value.ga4_measurement_id.trim() : "";
  const gtm = typeof value.gtm_container_id === "string" ? value.gtm_container_id.trim() : "";
  const ga4Id = /^G-[A-Z0-9]{6,20}$/.test(ga4) ? ga4 : "";
  const gtmId = /^GTM-[A-Z0-9]{5,12}$/.test(gtm) ? gtm : "";
  return { enabled: value.enabled === true && Boolean(gtmId || ga4Id), mode: gtmId ? "gtm" : ga4Id ? "ga4" : "off", ga4Id, gtmId };
}

// Site-wide mode since 26 Oct 2026: no consent banner, analytics granted, all ad
// signals denied. When a GTM container is set it owns GA4 (the live container
// already holds the G- tag), so the direct gtag script is not loaded: loading
// both double-counts, and the standalone G- tag currently answers 404.
// The container's Google tag must set client_storage "none" to stay cookieless.
export function cookielessAnalyticsConfig(config) {
  const ga4Id = config?.ga4Id || "", gtmId = config?.gtmId || "";
  const mode = gtmId ? "gtm" : ga4Id ? "ga4" : "off";
  return { ...config, enabled: Boolean(config?.enabled && mode !== "off"), mode, ga4Id, gtmId, cookieless: true };
}

export function analyticsSettingsError(value = {}) {
  const config = analyticsConfig(value);
  if (value.ga4_measurement_id && !config.ga4Id) return "Enter only a valid GA4 Measurement ID beginning G-, without script code.";
  if (value.gtm_container_id && !config.gtmId) return "Enter only a valid Google Tag Manager Container ID beginning GTM-, without script code.";
  if (value.enabled && !config.enabled) return "Add your actual GA4 or GTM ID before enabling analytics.";
  return "";
}

export function publicAnalyticsUrl(input, origin) {
  try {
    const url = new URL(input, origin);
    if (url.origin !== origin || !/^\/(?:[a-z0-9]+(?:-[a-z0-9]+)*\/?)*$/.test(url.pathname) || /^\/(admin|auth|api|verify-certificate)(\/|$)/.test(url.pathname)) return null;
    return url.origin + url.pathname; // Never include query strings, form values or certificate numbers.
  } catch { return null; }
}

export function readAnalyticsConsent(win) {
  try {
    if (win.__oqcAnalyticsConsent) return win.__oqcAnalyticsConsent;
    const saved = JSON.parse(win.localStorage.getItem(ANALYTICS_CONSENT_KEY) || "null");
    return saved?.expires > Date.now() && ["granted", "denied"].includes(saved?.value) ? saved.value : null;
  } catch { return null; }
}

export function saveAnalyticsConsent(win, value) {
  if (!["granted", "denied"].includes(value)) return;
  win.__oqcAnalyticsConsent = value;
  try { win.localStorage.setItem(ANALYTICS_CONSENT_KEY, JSON.stringify({ value, expires: Date.now() + 180 * 86400000 })); } catch { /* Choice still works for this page when storage is blocked. */ }
  win.dispatchEvent(new win.Event(ANALYTICS_CONSENT_EVENT));
}

export function clearAnalyticsCookies(win) {
  try {
  const names = win.document.cookie.split(";").map(cookie => cookie.split("=")[0].trim()).filter(name => /^_ga(?:_|$)/.test(name));
  const domains = win.location.hostname.split(".").map((_, i, parts) => parts.slice(i).join(".")).filter(domain => domain.includes("."));
  for (const name of names) {
    win.document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
    for (const domain of domains) win.document.cookie = `${name}=; Max-Age=0; Path=/; Domain=${domain}; SameSite=Lax`;
  }
  } catch { /* Analytics remains denied even when the browser blocks cookie access. */ }
}

// One transport per page. Banner mode: do not load Google before opt-in.
// Cookieless mode (owner decision, 26 Oct 2026 — keep): GA4 loads straight away
// with client_storage "none", so no cookie or identifier is written, and
// analytics_storage is granted so page views and leads appear in GA4 reports.
// With analytics_storage "denied" Google keeps hits only for modelling and the
// reports stay almost empty. Ad storage, ad data and personalisation stay denied.
export function createAnalyticsController(win, config) {
  let consent = false, initialized = false, lastPage = "", previousPage = "";
  const doc = win.document, origin = win.location.origin;
  try { const referrer = new URL(doc.referrer); previousPage = referrer.origin === origin ? publicAnalyticsUrl(referrer.href, origin) || "" : referrer.origin + "/"; } catch { /* Direct visit or unavailable referrer. */ }
  win.dataLayer = win.dataLayer || [];
  function command() { win.dataLayer.push(arguments); }
  const allowed = () => config.enabled && consent && Boolean(publicAnalyticsUrl(win.location.href, origin));
  const emit = (name, params) => {
    if (!allowed()) return false;
    if (config.mode === "gtm") win.dataLayer.push({ event: `oqc_${name}`, ...params });
    else command("event", name, { ...params, send_to: config.ga4Id });
    return true;
  };
  command("consent", "default", { ...CONSENT_DENIED });
  function setConsent(granted) {
    consent = granted === true;
    if (config.ga4Id) win[`ga-disable-${config.ga4Id}`] = !consent;
    command("consent", "update", { ...CONSENT_DENIED, analytics_storage: consent ? "granted" : "denied" });
    if (!allowed() || initialized) return;
    initialized = true;
    const location = publicAnalyticsUrl(win.location.href, origin);
    if (config.mode === "gtm") {
      // The container's Google tag reads these before its config: keep it
      // cookieless with Google signals and ad personalisation off.
      if (config.cookieless) command("set", { client_storage: "none", allow_google_signals: false, allow_ad_personalization_signals: false });
      win.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js", page_location: location });
    }
    else {
      command("js", new Date());
      command("config", config.ga4Id, { send_page_view: false, page_location: location, page_referrer: previousPage, allow_google_signals: false, allow_ad_personalization_signals: false, ...(config.cookieless ? { client_storage: "none" } : {}) });
    }
    const id = "oqc-google-analytics";
    if (!doc.getElementById(id)) {
      const script = doc.createElement("script"); script.id = id; script.async = true;
      script.src = config.mode === "gtm" ? `https://www.googletagmanager.com/gtm.js?id=${config.gtmId}` : `https://www.googletagmanager.com/gtag/js?id=${config.ga4Id}`;
      doc.head.appendChild(script);
    }
  }
  function pageView(path) {
    const location = publicAnalyticsUrl(path, origin);
    if (!allowed() || !location || location === lastPage) return false;
    const sent = emit("page_view", { page_location: location, page_path: new URL(location).pathname, page_title: doc.title, page_referrer: previousPage });
    if (sent) { lastPage = location; previousPage = location; }
    return sent;
  }
  const onLead = event => {
    const { form_type, market } = event.detail || {};
    if (event.detail?.event !== "generate_lead" || !["trial", "contact"].includes(form_type) || !["USA", "Australia", "Other"].includes(market)) return;
    emit("generate_lead", { form_type, market }); // Only a confirmed first-party save signal; no form field values.
  };
  const onClick = event => {
    const href = event.target?.closest?.("a[href]")?.getAttribute("href") || "";
    const channel = href.startsWith("tel:") ? "phone" : href.startsWith("mailto:") ? "email" : /^https:\/\/(?:wa\.me|api\.whatsapp\.com)\//.test(href) ? "whatsapp" : null;
    if (channel) emit("contact_click", { contact_channel: channel });
  };
  win.addEventListener("oqc:lead-saved", onLead); doc.addEventListener("click", onClick);
  // Core Web Vitals from real visits (Next.js useReportWebVitals). Only the
  // metric itself and the public page path are sent.
  const VITALS = new Set(["LCP", "INP", "CLS", "FCP", "TTFB"]);
  function webVital(metric) {
    if (!metric || !VITALS.has(metric.name) || !Number.isFinite(metric.value)) return false;
    const location = publicAnalyticsUrl(win.location.href, origin);
    if (!location) return false;
    return emit(metric.name, {
      value: Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value),
      metric_value: metric.value,
      metric_delta: metric.delta,
      metric_id: String(metric.id || "").slice(0, 60),
      metric_rating: ["good", "needs-improvement", "poor"].includes(metric.rating) ? metric.rating : undefined,
      page_path: new URL(location).pathname,
      non_interaction: true,
    });
  }
  return {
    setConsent, pageView, webVital,
    destroy() {
      win.removeEventListener("oqc:lead-saved", onLead); doc.removeEventListener("click", onClick);
      setConsent(false);
    },
  };
}
