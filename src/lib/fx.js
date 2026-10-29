// Approximate local-currency display. Owner decision (29 Oct 2026): show live
// converted prices for guidance. Approved prices saved in the CMS always win, and
// a converted figure is labelled as approximate; the coordinator confirms the fee.

export const FX_SOURCE = { name: "ExchangeRate-API", url: "https://www.exchangerate-api.com" };
const FX_URL = "https://open.er-api.com/v6/latest/USD";

// Visitor country (ISO 3166-1 alpha-2) to the currency shown by default.
export const COUNTRY_CURRENCY = {
  US: "USD", GB: "GBP", AU: "AUD", CA: "CAD", NZ: "NZD", IE: "EUR", FR: "EUR", DE: "EUR", NL: "EUR", BE: "EUR",
  IT: "EUR", ES: "EUR", PT: "EUR", AT: "EUR", FI: "EUR", GR: "EUR", LU: "EUR", MT: "EUR", CY: "EUR", SK: "EUR",
  SI: "EUR", EE: "EUR", LV: "EUR", LT: "EUR", HR: "EUR", AD: "EUR", MC: "EUR", SM: "EUR", VA: "EUR", XK: "EUR", ME: "EUR",
  CH: "CHF", LI: "CHF", SE: "SEK", NO: "NOK", DK: "DKK", IS: "ISK", PL: "PLN", CZ: "CZK", HU: "HUF", RO: "RON",
  BG: "BGN", AL: "ALL", BA: "BAM", RS: "RSD", MK: "MKD", MD: "MDL", UA: "UAH", BY: "BYN", TR: "TRY", RU: "RUB",
  PK: "PKR", IN: "INR", BD: "BDT", AE: "AED", SA: "SAR", QA: "QAR", KW: "KWD", BH: "BHD", OM: "OMR",
  MY: "MYR", SG: "SGD", ID: "IDR", HK: "HKD", JP: "JPY", CN: "CNY", ZA: "ZAR", NG: "NGN", KE: "KES", EG: "EGP",
  BR: "BRL", MX: "MXN",
};

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

// Currencies offered in a selector: USD, any currency with an approved price, and
// visitor/location currencies that have a live rate (all of them when rates are unavailable).
export function currencyOptions(plans, fx, extra = []) {
  const approved = new Set((plans || []).flatMap((p) => (p.prices || []).map((x) => x.currency)));
  return [...new Set(["USD", ...approved, ...extra, ...Object.values(COUNTRY_CURRENCY)])]
    .filter((code) => code === "USD" || approved.has(code) || !fx || fx.rates?.[code])
    .sort();
}
