// Formatting helpers shared by the website and the admin panel.

export function formatMoney(minor, currency = "USD", { compact = false } = {}) {
  if (minor === null || minor === undefined || Number.isNaN(Number(minor))) return "—";
  const amount = Number(minor) / 100;
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency,
      minimumFractionDigits: amount % 1 === 0 && !compact ? 0 : currencyDigits(currency),
      maximumFractionDigits: currencyDigits(currency),
      notation: compact ? "compact" : "standard",
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function toMinor(value) {
  const n = Number(String(value ?? "").replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

export function fromMinor(minor) {
  if (minor === null || minor === undefined || minor === "") return "";
  return (Number(minor) / 100).toFixed(2).replace(/\.00$/, "");
}

const dateCache = new Map();
function dtf(options) {
  const key = JSON.stringify(options);
  if (!dateCache.has(key)) dateCache.set(key, new Intl.DateTimeFormat("en-GB", options));
  return dateCache.get(key);
}

export function formatDate(value, timeZone) {
  if (!value) return "—";
  const d = typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(value + "T12:00:00Z") : new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return dtf({ day: "numeric", month: "short", year: "numeric", ...(timeZone ? { timeZone } : {}) }).format(d);
}

export function formatDateTime(value, timeZone) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return dtf({
    day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true,
    ...(timeZone ? { timeZone } : {}),
  }).format(d);
}

export function formatTime(value, timeZone) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return dtf({ hour: "numeric", minute: "2-digit", hour12: true, ...(timeZone ? { timeZone } : {}) }).format(d);
}

export function formatWeekdayDate(value, timeZone) {
  if (!value) return "—";
  const d = new Date(value);
  return dtf({ weekday: "short", day: "numeric", month: "short", ...(timeZone ? { timeZone } : {}) }).format(d);
}

export function timeAgo(value) {
  if (!value) return "";
  const diff = (Date.now() - new Date(value).getTime()) / 1000;
  const abs = Math.abs(diff);
  const units = [
    [60, "second", 1],
    [3600, "minute", 60],
    [86400, "hour", 3600],
    [604800, "day", 86400],
    [2629800, "week", 604800],
    [31557600, "month", 2629800],
    [Infinity, "year", 31557600],
  ];
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  for (const [limit, unit, size] of units) {
    if (abs < limit) return rtf.format(-Math.round(diff / size), unit);
  }
  return "";
}

export function initials(name = "") {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function slugify(text = "") {
  return text
    .toString()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function stripHtml(html = "") {
  return html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

export function truncate(text = "", length = 160) {
  if (text.length <= length) return text;
  return text.slice(0, length - 1).replace(/\s+\S*$/, "") + "…";
}

export function arabicDigits(n) {
  return String(n).replace(/[0-9]/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
}

export function whatsappLink(number, text) {
  const digits = String(number || "").replace(/[^0-9]/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

// Converts a local wall-clock time in a time zone to the same instant in another zone (for display).
export function zonedLabel(date, timeZone) {
  try {
    return dtf({ hour: "numeric", minute: "2-digit", hour12: true, timeZone, timeZoneName: "short" }).format(date);
  } catch {
    return "";
  }
}

// The application stores all amounts as hundredths, including whole-unit currencies.
// This keeps existing invoices and RPCs compatible; do not reinterpret stored values.
export function currencyDigits(currency) {
  try { return new Intl.NumberFormat("en", { style: "currency", currency }).resolvedOptions().maximumFractionDigits; } catch { return 2; }
}
export function validPriceAmount(value, currency) {
  const input = String(value ?? "").trim();
  const digits = currencyDigits(currency);
  if (!new RegExp(`^\\d+(?:\\.\\d{1,${Math.max(1, digits)}})?$`).test(input)) return false;
  if (digits === 0 && input.includes(".") && Number(input.split(".")[1]) !== 0) return false;
  return Number(input) * 100 <= 2147483647;
}
