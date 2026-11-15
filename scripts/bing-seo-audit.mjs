// Read-only audit of every live sitemap page against the checks Bing Webmaster Tools' SEO
// reports raise: title length (Bing recommends <= 65 characters), meta description (< 160,
// and short ones are flagged), exactly one H1, <html lang>, images without alt, one
// self-referencing canonical, noindex pages in the sitemap, and duplicate titles/descriptions.
// Usage: node scripts/bing-seo-audit.mjs [origin]   (writes artifacts/bing-seo-audit/report.{json,md})
import { mkdirSync, writeFileSync, appendFileSync } from "node:fs";

const origin = (process.argv[2] || "https://www.onlinequrancollege.com").replace(/\/$/, "");
const LIMITS = { titleMax: 65, descMax: 160, descShort: 120 };
const CONCURRENCY = 4;

const decode = (s) => s
  .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'")
  .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ").trim();

async function get(url) {
  const res = await fetch(url, { redirect: "manual", headers: { "user-agent": "OQC-Bing-SEO-Audit/1.0 (+https://www.onlinequrancollege.com)" }, signal: AbortSignal.timeout(30000) });
  return { status: res.status, headers: res.headers, text: await res.text() };
}

export function auditHtml(html, url) {
  const head = html.split("</head>")[0] || "";
  const body = html.slice(head.length);
  const titles = [...head.matchAll(/<title[^>]*>([\s\S]*?)<\/title>/gi)].map((m) => decode(m[1]));
  const descs = [...head.matchAll(/<meta\s+name="description"\s+content="([^"]*)"/gi)].map((m) => decode(m[1]));
  const canonicals = [...head.matchAll(/<link\s+rel="canonical"\s+href="([^"]+)"/gi)].map((m) => decode(m[1]));
  const h1 = (body.match(/<h1[\s>]/gi) || []).length;
  const imgs = [...body.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);
  const noAlt = imgs.filter((tag) => !/\salt=/i.test(tag)).length;
  const lang = /<html[^>]*\slang="[^"]+"/i.test(html);
  const noindex = /<meta[^>]*name="robots"[^>]*content="[^"]*noindex/i.test(head);
  const issues = [];
  const title = titles[0] || "";
  const desc = descs[0] || "";
  if (!title) issues.push("title missing");
  if (titles.length > 1) issues.push("multiple titles");
  if (title.length > LIMITS.titleMax) issues.push(`title too long (${title.length})`);
  if (!desc) issues.push("meta description missing");
  if (descs.length > 1) issues.push("multiple meta descriptions");
  if (desc.length >= LIMITS.descMax) issues.push(`description too long (${desc.length})`);
  else if (desc && desc.length < LIMITS.descShort) issues.push(`description short (${desc.length})`);
  if (h1 === 0) issues.push("no H1");
  if (h1 > 1) issues.push(`multiple H1 (${h1})`);
  if (!lang) issues.push("html lang missing");
  if (noAlt) issues.push(`images without alt (${noAlt})`);
  if (canonicals.length !== 1) issues.push(`canonical count ${canonicals.length}`);
  else if (new URL(canonicals[0], url).href.replace(/\/$/, "") !== url.replace(/\/$/, "")) issues.push("canonical points elsewhere");
  if (noindex) issues.push("noindex but in sitemap");
  return { title, desc, h1, sizeKB: Math.round(Buffer.byteLength(html) / 1024), issues };
}

async function main() {
  const sitemap = await get(`${origin}/sitemap.xml`);
  if (sitemap.status !== 200) throw new Error(`sitemap returned ${sitemap.status}`);
  const urls = [...new Set([...sitemap.text.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => decode(m[1])))];
  const results = [];
  let next = 0;
  async function worker() {
    while (next < urls.length) {
      const url = urls[next++];
      try {
        const page = await get(url);
        if (page.status !== 200) { results.push({ url, status: page.status, issues: [`HTTP ${page.status}`] }); continue; }
        const xrobots = page.headers.get("x-robots-tag") || "";
        const r = auditHtml(page.text, url);
        if (/noindex/i.test(xrobots)) r.issues.push("x-robots-tag noindex but in sitemap");
        results.push({ url, status: 200, ...r });
      } catch (error) {
        results.push({ url, status: 0, issues: [`fetch failed: ${error.message}`] });
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  results.sort((a, b) => a.url.localeCompare(b.url));

  for (const field of ["title", "desc"]) {
    const groups = new Map();
    for (const r of results) if (r[field]) groups.set(r[field], [...(groups.get(r[field]) || []), r]);
    for (const [, group] of groups) if (group.length > 1) for (const r of group) r.issues.push(`duplicate ${field === "desc" ? "description" : "title"} (${group.length} pages)`);
  }

  const counts = {};
  for (const r of results) for (const i of r.issues) { const k = i.replace(/\s*\(.*\)$/, ""); counts[k] = (counts[k] || 0) + 1; }
  const sizes = results.filter((r) => r.sizeKB).map((r) => r.sizeKB).sort((a, b) => a - b);
  const summary = { origin, checkedAt: new Date().toISOString(), pages: results.length, pagesWithIssues: results.filter((r) => r.issues.length).length, issueCounts: counts, htmlKB: { median: sizes[Math.floor(sizes.length / 2)], max: sizes.at(-1) } };

  mkdirSync("artifacts/bing-seo-audit", { recursive: true });
  writeFileSync("artifacts/bing-seo-audit/report.json", JSON.stringify({ summary, results }, null, 2));
  const md = [`# Bing SEO audit — ${origin}`, "", `Checked ${summary.pages} sitemap pages at ${summary.checkedAt}; ${summary.pagesWithIssues} with at least one issue. HTML size median ${summary.htmlKB.median} KB, max ${summary.htmlKB.max} KB.`, "", "| Issue | Pages |", "| --- | --- |", ...Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([k, v]) => `| ${k} | ${v} |`), "", "| Page | Issues |", "| --- | --- |", ...results.filter((r) => r.issues.length).map((r) => `| ${r.url.replace(origin, "") || "/"} | ${r.issues.join("; ")} |`)].join("\n");
  writeFileSync("artifacts/bing-seo-audit/report.md", md);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, md);
  console.log(JSON.stringify(summary, null, 2));
}

if (import.meta.url === `file://${process.argv[1]}`) await main();
