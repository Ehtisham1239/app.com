// Pure helpers for the admin SEO growth workspace. No data is invented:
// unknown values stay null and are shown as an em dash by the page.

export const GROWTH_MARKETS = ["UK", "USA", "Canada", "Australia", "UAE", "Both"];

/** Click-through rate as a percentage with one decimal, or null when it cannot be measured. */
export function ctrPercent(clicks, impressions) {
  const c = Number(clicks);
  const i = Number(impressions);
  if (clicks == null || impressions == null || !Number.isFinite(c) || !Number.isFinite(i) || i <= 0 || c < 0) return null;
  return Math.round((c / i) * 1000) / 10;
}

/** Plan progress per market: total planned, complete and blocked records. Unknown markets are grouped as "Other". */
export function marketProgress(tasks) {
  const rows = new Map(GROWTH_MARKETS.map((market) => [market, { market, total: 0, complete: 0, blocked: 0 }]));
  for (const task of Array.isArray(tasks) ? tasks : []) {
    const key = rows.has(task?.market) ? task.market : "Other";
    if (!rows.has(key)) rows.set(key, { market: key, total: 0, complete: 0, blocked: 0 });
    const row = rows.get(key);
    row.total += 1;
    if (task.status === "complete") row.complete += 1;
    if (task.status === "blocked") row.blocked += 1;
  }
  return [...rows.values()].filter((row) => row.total > 0);
}
