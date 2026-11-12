// Picks the sitemap URLs changed in the last N days, for the weekly IndexNow run.
// Pure function (no network) so it can be unit-tested; the caller fetches the live sitemap.
export function recentSitemapUrls(xml, { now = new Date(), days = 7, limit = 250 } = {}) {
  const cutoff = now.getTime() - days * 864e5;
  const urls = [];
  for (const [, block] of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const loc = block.match(/<loc>(.*?)<\/loc>/)?.[1];
    const lastmod = block.match(/<lastmod>(.*?)<\/lastmod>/)?.[1];
    if (!loc || !lastmod) continue;
    const t = Date.parse(lastmod);
    if (Number.isNaN(t) || t < cutoff || t > now.getTime() + 864e5) continue;
    urls.push({ url: new URL(loc.replace(/&amp;/g, "&")).href, t });
  }
  return [...new Map(urls.sort((a, b) => b.t - a.t).map((u) => [u.url, u])).values()].slice(0, limit).map((u) => u.url);
}
