// Approximate local-currency display. Owner decision (29 Oct 2026): show live
// converted prices for guidance. Approved prices saved in the CMS always win, and
// a converted figure is labelled as approximate; the coordinator confirms the fee.

export const FX_SOURCE = { name: "ExchangeRate-API", url: "https://www.exchangerate-api.com" };
const FX_URL = "https://open.er-api.com/v6/latest/USD";

// Owner decision (8 Nov 2026): prices are shown only in GBP, USD, AUD and AED.
// Visitors from every other country see USD.
export const DISPLAY_CURRENCIES = ["AED", "AUD", "GBP", "USD"];

// Visitor country (ISO 3166-1 alpha-2) to the currency shown by default.
export const COUNTRY_CURRENCY = { US: "USD", GB: "GBP", AU: "AUD", AE: "AED" };

// Fallback when the host sends no visitor-country header (Hostinger sends none): the
// browser's time zone picks the currency. Nothing leaves the browser. Unknown zones
// return null so the page stays on USD.
const UK_ZONES = new Set(["Europe/London", "Europe/Belfast", "Europe/Guernsey", "Europe/Jersey", "Europe/Isle_of_Man", "GB", "GB-Eire"]);
export function currencyForTimeZone(timeZone) {
  const zone = String(timeZone || "");
  if (UK_ZONES.has(zone)) return "GBP";
  if (zone.startsWith("Australia/")) return "AUD";
  if (zone === "Asia/Dubai") return "AED";
  if (zone.startsWith("America/") || zone.startsWith("US/") || zone === "Pacific/Honolulu") return "USD";
  return null;
}

export function currencyForCountry(country) {
  return COUNTRY_CURRENCY[String(country || "").toUpperCase()] ?? null;
}

// Daily USD-based rates, cached for six hours. Returns null when unavailable so
// pages fall back to "ask for a quote" instead of showing a guessed figure.
export async function getUsdRates() {
  try {
    const response = await fetch(FX_URL, { next: { revalidate: 21600 }, signal: AbortSignal.timeout(5000) });
    if (!response.ok) return null;
    const data = await response.json();
    if (data?.result !== "success" || !data.rates || typeof data.rates !== "object") return null;
    const rates = {};
    for (const [code, value] of Object.entries(data.rates)) if (/^[A-Z]{3}$/.test(code) && Number.isFinite(value) && value > 0) rates[code] = value;
    if (rates.USD !== 1) return null;
    return { base: "USD", rates, updated: typeof data.time_last_update_utc === "string" ? data.time_last_update_utc.slice(5, 16) : null };
  } catch {
    return null;
  }
}

// Converts minor units between currencies and rounds to a whole unit, since the
// result is an approximation rather than a billable amount.
export function convertMinor(minor, from, to, fx) {
  const fromRate = fx?.rates?.[from], toRate = fx?.rates?.[to];
  if (minor === null || minor === undefined || !fromRate || !toRate) return null;
  return Math.round((Number(minor) / 100) * (toRate / fromRate)) * 100;
}

// Price to show for a plan: the approved price in that currency when one exists,
// otherwise an approximate conversion from an approved price.
export function displayPrice(prices, currency, fx) {
  const list = Array.isArray(prices) ? prices : [];
  const exact = list.find((p) => p.currency === currency);
  if (exact) return { amount_minor: exact.amount_minor, currency, approximate: false };
  const source = list.find((p) => p.currency === "USD") ?? list[0];
  const converted = source ? convertMinor(source.amount_minor, source.currency, currency, fx) : null;
  return converted === null ? null : { amount_minor: converted, currency, approximate: true, from: source };
}

// Currencies offered in a selector: only the four display currencies. USD is always
// offered; the others need an approved price or a live rate (all four when rates are
// unavailable, so the page can still ask for a quote). The extra argument is kept for
// existing callers but cannot add a currency outside the four.
export function currencyOptions(plans, fx, extra = []) {
  const approved = new Set((plans || []).flatMap((p) => (p.prices || []).map((x) => x.currency)));
  void extra;
  return DISPLAY_CURRENCIES.filter((code) => code === "USD" || approved.has(code) || !fx || fx.rates?.[code]);
}
