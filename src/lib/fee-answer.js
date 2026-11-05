import { displayPrice } from "./fx.js";
import { formatMoney } from "./format.js";

// A short, direct answer to "How much do online Quran classes cost?" built from the
// published plans, so it can never disagree with the price cards. Search Console
// (25–30 Oct 2026) showed "how much do online quran classes cost in the uk?" at
// position 8, so the UK figure is given in pounds as well. Approved CMS prices win;
// a converted figure is labelled "about", and with no rates the pounds line is omitted.
export const FEE_QUESTION = "How much do online Quran classes cost?";

const range = (values) => (values.length ? [Math.min(...values), Math.max(...values)] : []);
const fmtRange = ([low, high], currency) => (low === high ? formatMoney(low, currency) : `${formatMoney(low, currency)} to ${formatMoney(high, currency)}`);

export function feeAnswer(plans, fx, localCurrency = "GBP", place = "the UK") {
  const rows = (Array.isArray(plans) ? plans : [])
    .map((plan) => ({ plan, usd: displayPrice(plan.prices, "USD", fx), local: displayPrice(plan.prices, localCurrency, fx) }))
    .filter((row) => row.usd && Number.isFinite(row.usd.amount_minor));
  if (!rows.length) return null;

  const usd = range(rows.map((row) => row.usd.amount_minor));
  const classes = range(rows.map((row) => Number(row.plan.classes_per_week)).filter((n) => Number.isFinite(n) && n > 0));
  const minutes = range(rows.map((row) => Number(row.plan.duration_min)).filter((n) => Number.isFinite(n) && n > 0));
  const localRows = rows.filter((row) => row.local);
  const local = localCurrency !== "USD" && localRows.length === rows.length ? range(localRows.map((row) => row.local.amount_minor)) : null;
  const approximate = localRows.some((row) => row.local.approximate);

  const perWeek = classes.length && Number.isFinite(classes[0]) ? (classes[0] === classes[1] ? `${classes[0]}` : `${classes[0]} to ${classes[1]}`) : null;
  const length = minutes.length && Number.isFinite(minutes[0]) ? (minutes[0] === minutes[1] ? `${minutes[0]}-minute` : `${minutes[0]}- to ${minutes[1]}-minute`) : null;
  const lessons = perWeek && length ? ` for ${perWeek} live one-to-one ${length} classes a week` : " for live one-to-one classes";
  const sentences = [
    `Monthly fees at Online Quran College range from ${fmtRange(usd, "USD")}${lessons}.`,
    ...(local ? [`In ${place} that is ${approximate ? "about " : ""}${fmtRange(local, localCurrency)} a month${approximate ? " at today's exchange rate" : ""}.`] : []),
    "Eligible plans start with a free 3-day trial (the Weekend plan is excluded).",
    "Families with more than one learner can receive 15% off each additional child's monthly fee through the sibling discount.",
    "The coordinator confirms the exact fee and payment currency before you enrol.",
  ];
  return { question: FEE_QUESTION, answer: sentences.join(" "), usd, local, localCurrency, approximate };
}
