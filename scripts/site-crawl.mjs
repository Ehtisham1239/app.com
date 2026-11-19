// Free, dependency-free site crawler (a licence-free stand-in for the Screaming Frog CLI).
// Read-only: GET requests only, polite (4 at a time), honours robots.txt, same host only.
// Seeds: the home page + every URL in the sitemap(s). Follows <a href> links.
// Usage: node scripts/site-crawl.mjs <origin> [--out artifacts/site-crawl] [--max-pages 2000] [--concurrency 4]
// Writes Screaming-Frog-style CSVs (internal_all.csv, response_codes_*.csv, page_titles_*.csv, ...)
// plus broken_links_sources.csv and crawl_meta.json. Summarise with scripts/sf-crawl-summary.mjs.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const UA = "OQC-Site-Crawl/1.0 (+https://www.onlinequrancollege.com)";
const MAX_HTML_BYTES = 2_000_000;

const decode = (s) => s
  .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'")
  .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ");
const squash = (s) => decode(s.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();

export function attr(tag, name) {
  const m = tag.match(new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"));
  return m ? decode(m[1] ?? m[2] ?? m[3] ?? "") : null;
}

export function normalise(href, base) {
  try {
    const u = new URL(decode(href).trim(), base);
    if (!/^https?:$/.test(u.protocol)) return null;
    u.hash = "";
    return u.href;
  } catch { return null; }
}

export function parseRobots(text) {
  const rules = [];
  const sitemaps = [];
  let agents = [];
  let inRules = false;
  for (const raw of text.split(/\r?\n/)) {
    const m = raw.replace(/#.*/, "").trim().match(/^([A-Za-z-]+)\s*:\s*(.*)$/);
    if (!m) continue;
    const key = m[1].toLowerCase();
    const value = m[2].trim();
    if (key === "sitemap") sitemaps.push(value);
    else if (key === "user-agent") {
      if (inRules) { agents = []; inRules = false; }
      agents.push(value);
    } else if (key === "allow" || key === "disallow") {
      inRules = true;
      if (agents.includes("*") && value) {
        const source = value.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\\\$$/, "$");
        rules.push({ allow: key === "allow", length: value.length, pattern: new RegExp(`^${source}`) });
      }
    }
  }
  const allowed = (path) => {
    let best = null;
    for (const r of rules) if (r.pattern.test(path) && (!best || r.length >= best.length)) best = r;
    return !best || best.allow;
  };
  return { allowed, sitemaps };
}

export function analyseHtml(html) {
  const head = html.split(/<\/head>/i)[0] || "";
  const title = head.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  let description = "";
  let robots = "";
  let canonical = "";
  for (const tag of head.match(/<meta\b[^>]*>/gi) || []) {
    const name = (attr(tag, "name") || "").toLowerCase();
    if (name === "description" && !description) description = attr(tag, "content") || "";
    if (name === "robots" || name === "googlebot") robots += `${robots ? "," : ""}${attr(tag, "content") || ""}`;
  }
  for (const tag of head.match(/<link\b[^>]*>/gi) || []) {
    if ((attr(tag, "rel") || "").toLowerCase().split(/\s+/).includes("canonical") && !canonical) canonical = attr(tag, "href") || "";
  }
  const h1s = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => squash(m[1]));
  const noScript = html.replace(/<(script|style|noscript)\b[\s\S]*?<\/\1>/gi, " ");
  const text = squash(noScript.replace(/<head\b[\s\S]*?<\/head>/i, " "));
  const imgs = html.match(/<img\b[^>]*>/gi) || [];
  return {
    title: title ? squash(title[1]) : "",
    description: description.trim(),
    robots: robots.toLowerCase(),
    canonical,
    h1: h1s[0] || "",
    h1Count: h1s.length,
    words: text ? text.split(" ").length : 0,
    imagesMissingAlt: imgs.filter((t) => attr(t, "alt") === null).length,
  };
}

export function extractLinks(html, base) {
  const out = new Set();
  for (const m of html.matchAll(/<a\b[^>]*?\shref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi)) {
    const url = normalise(m[1] ?? m[2] ?? m[3] ?? "", base);
    if (url) out.add(url);
  }
  return [...out];
}

const RETRY_STATUS = new Set([429, 503]);

// GET with up to 3 retries on 429/503, honouring Retry-After (seconds, capped at 30) or backing off 1s/2s/4s.
async function get(url, timeoutMs = 30000, baseDelayMs = Number(process.env.SITE_CRAWL_RETRY_MS) || 1000) {
  let res = await getOnce(url, timeoutMs);
  for (let attempt = 0; attempt < 3 && RETRY_STATUS.has(res.status); attempt += 1) {
    const asked = Number(res.headers.get("retry-after"));
    const wait = Number.isFinite(asked) && asked > 0 ? Math.min(asked * 1000, 30000) : baseDelayMs * 2 ** attempt;
    await new Promise((resolve) => setTimeout(resolve, wait));
    res = await getOnce(url, timeoutMs);
  }
  return res;
}

async function getOnce(url, timeoutMs) {
  const started = performance.now();
  try {
    const res = await fetch(url, { redirect: "manual", headers: { "user-agent": UA, accept: "text/html,application/xhtml+xml,*/*;q=0.5" }, signal: AbortSignal.timeout(timeoutMs) });
    const seconds = (performance.now() - started) / 1000;
    const type = res.headers.get("content-type") || "";
    let body = "";
    let size = Number(res.headers.get("content-length")) || 0;
    if (/text\/html|xml|text\/plain/i.test(type)) {
      body = (await res.text()).slice(0, MAX_HTML_BYTES);
      size = size || body.length;
    } else await res.body?.cancel();
    return { status: res.status, statusText: res.statusText, headers: res.headers, type, body, size, seconds };
  } catch (error) {
    return { status: 0, statusText: error?.cause?.code || error?.name || "Error", headers: new Headers(), type: "", body: "", size: 0, seconds: (performance.now() - started) / 1000 };
  }
}

async function readSitemaps(urls, host, warnings, depth = 0) {
  const found = new Set();
  for (const url of urls) {
    const res = await get(url);
    if (res.status !== 200) { warnings.push(`Sitemap ${url} returned ${res.status || res.statusText}`); continue; }
    const locs = [...res.body.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((m) => normalise(m[1], url)).filter(Boolean);
    if (/<sitemapindex/i.test(res.body) && depth < 2) {
      for (const u of await readSitemaps(locs, host, warnings, depth + 1)) found.add(u);
    } else for (const u of locs) if (new URL(u).host === host) found.add(u);
  }
  return found;
}

export async function crawl({ origin, maxPages = 2000, concurrency = 4, log = () => {} }) {
  const base = new URL(origin);
  const host = base.host;
  const warnings = [];
  const robotsRes = await get(new URL("/robots.txt", base).href);
  const robots = robotsRes.status === 200 ? parseRobots(robotsRes.body) : { allowed: () => true, sitemaps: [] };
  if (robotsRes.status !== 200) warnings.push(`robots.txt returned ${robotsRes.status || robotsRes.statusText}; crawling without rules`);
  const declared = robots.sitemaps.map((u) => normalise(u, base)).filter(Boolean);
  const sitemapUrls = declared.length ? declared : [new URL("/sitemap.xml", base).href];
  const inSitemap = await readSitemaps(sitemapUrls, host, warnings);
  if (!inSitemap.size) warnings.push("No sitemap URLs found");

  const home = normalise("/", base);
  const queue = [home, ...inSitemap];
  const queued = new Set(queue);
  const rows = new Map();
  const inlinks = new Map(); // target -> Set(source)
  const linkPairs = [];
  let active = 0;

  const addInlink = (source, target) => {
    if (!inlinks.has(target)) inlinks.set(target, new Set());
    inlinks.get(target).add(source);
    linkPairs.push([source, target]);
  };
  const enqueue = (url) => {
    if (queued.has(url) || new URL(url).host !== host) return;
    if (queued.size >= maxPages) { if (!warnings.includes(`Stopped at --max-pages ${maxPages}`)) warnings.push(`Stopped at --max-pages ${maxPages}`); return; }
    queued.add(url);
    queue.push(url);
  };

  async function visit(url) {
    const path = new URL(url).pathname + new URL(url).search;
    if (!robots.allowed(path)) {
      rows.set(url, { url, status: 0, statusText: "Blocked by robots.txt", indexability: "Non-Indexable", indexStatus: "Blocked by robots.txt" });
      return;
    }
    const res = await get(url);
    const row = { url, status: res.status, statusText: res.statusText || (res.status === 0 ? "No Response" : ""), type: res.type.split(";")[0].trim(), seconds: res.seconds, size: res.size, redirect: "" };
    const xRobots = (res.headers.get("x-robots-tag") || "").toLowerCase();
    if (res.status >= 300 && res.status < 400) {
      const target = normalise(res.headers.get("location") || "", url);
      row.redirect = target || "";
      row.indexability = "Non-Indexable";
      row.indexStatus = "Redirected";
      if (target) { addInlink(url, target); enqueue(target); }
    } else if (res.type.includes("html") && res.body) {
      const a = analyseHtml(res.body);
      Object.assign(row, { title: a.title, description: a.description, h1: a.h1, h1Count: a.h1Count, words: a.words, imagesMissingAlt: a.imagesMissingAlt, canonical: a.canonical, metaRobots: [a.robots, xRobots].filter(Boolean).join(",") });
      const noindex = /noindex|none/.test(`${a.robots},${xRobots}`);
      const canonicalUrl = a.canonical ? normalise(a.canonical, url) : "";
      if (res.status !== 200) { row.indexability = "Non-Indexable"; row.indexStatus = res.statusText || `HTTP ${res.status}`; }
      else if (noindex) { row.indexability = "Non-Indexable"; row.indexStatus = "noindex"; }
      else if (canonicalUrl && canonicalUrl !== url) { row.indexability = "Non-Indexable"; row.indexStatus = "Canonicalised"; }
      else { row.indexability = "Indexable"; row.indexStatus = ""; }
      if (res.status === 200) for (const link of extractLinks(res.body, url)) {
        if (new URL(link).host === host) { addInlink(url, link); enqueue(link); }
      }
    } else {
      row.indexability = res.status === 200 ? "Indexable" : "Non-Indexable";
      row.indexStatus = res.status === 200 ? "" : res.statusText || (res.status === 0 ? "No Response" : `HTTP ${res.status}`);
    }
    rows.set(url, row);
  }

  await new Promise((resolve) => {
    const pump = () => {
      while (active < concurrency && queue.length) {
        const url = queue.shift();
        active += 1;
        visit(url).catch((e) => warnings.push(`${url}: ${e.message}`)).finally(() => {
          active -= 1;
          if (rows.size % 50 === 0) log(`crawled ${rows.size}, queued ${queue.length}`);
          pump();
        });
      }
      if (!active && !queue.length) resolve();
    };
    pump();
  });

  const result = [...rows.values()].map((r) => ({
    ...r,
    inlinks: inlinks.get(r.url)?.size || 0,
    inSitemap: inSitemap.has(r.url),
  }));
  return { rows: result, linkPairs, warnings, sitemapCount: inSitemap.size, robotsFound: robotsRes.status === 200 };
}

const q = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
const csv = (header, lines) => `${[header.map(q).join(","), ...lines.map((l) => l.map(q).join(","))].join("\n")}\n`;

export function writeOutputs(dir, { rows, linkPairs, warnings, sitemapCount, robotsFound }, meta) {
  mkdirSync(dir, { recursive: true });
  const H = ["Address", "Content Type", "Status Code", "Status", "Indexability", "Indexability Status", "Title 1", "Title 1 Length", "Meta Description 1", "Meta Description 1 Length", "H1-1", "H1 Count", "Canonical Link Element 1", "Meta Robots 1", "Word Count", "Response Time", "Size (bytes)", "Inlinks", "In Sitemap", "Redirect URL", "Images Missing Alt"];
  const line = (r) => [r.url, r.type || "", r.status, r.statusText || "", r.indexability || "", r.indexStatus || "", r.title ?? "", (r.title ?? "").length, r.description ?? "", (r.description ?? "").length, r.h1 ?? "", r.h1Count ?? "", r.canonical ?? "", r.metaRobots ?? "", r.words ?? "", r.seconds != null ? r.seconds.toFixed(3) : "", r.size ?? "", r.inlinks, r.inSitemap ? "Yes" : "No", r.redirect || "", r.imagesMissingAlt ?? ""];
  const sorted = [...rows].sort((a, b) => a.url.localeCompare(b.url));
  const write = (name, subset) => writeFileSync(join(dir, name), csv(H, subset.map(line)));
  const html200 = sorted.filter((r) => r.status === 200 && /html/.test(r.type || "") && r.indexability === "Indexable");
  write("internal_all.csv", sorted);
  write("response_codes_client_error_4xx.csv", sorted.filter((r) => r.status >= 400 && r.status < 500));
  write("response_codes_server_error_5xx.csv", sorted.filter((r) => r.status >= 500));
  write("response_codes_redirection_3xx.csv", sorted.filter((r) => r.status >= 300 && r.status < 400));
  write("page_titles_missing.csv", html200.filter((r) => !(r.title || "").trim()));
  write("meta_description_missing.csv", html200.filter((r) => !(r.description || "").trim()));
  write("h1_missing.csv", html200.filter((r) => !(r.h1 || "").trim()));
  const byTitle = new Map();
  for (const r of html200) if (r.title) byTitle.set(r.title.toLowerCase(), [...(byTitle.get(r.title.toLowerCase()) || []), r]);
  write("page_titles_duplicate.csv", [...byTitle.values()].filter((g) => g.length > 1).flat());
  const bad = new Map(sorted.filter((r) => r.status === 0 || r.status >= 400).map((r) => [r.url, r]));
  writeFileSync(join(dir, "broken_links_sources.csv"), csv(["Source", "Target", "Status Code", "Status"], linkPairs.filter(([, t]) => bad.has(t) && bad.get(t).statusText !== "Blocked by robots.txt").map(([s, t]) => [s, t, bad.get(t).status, bad.get(t).statusText])));
  writeFileSync(join(dir, "crawl_meta.json"), `${JSON.stringify({ ...meta, finished: new Date().toISOString(), urls: rows.length, sitemapUrls: sitemapCount, robotsFound, warnings }, null, 2)}\n`);
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  const args = process.argv.slice(2);
  const opt = (name, fallback) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : fallback; };
  const origin = args.find((a) => /^https?:\/\//.test(a));
  if (!origin) { console.error("Usage: node scripts/site-crawl.mjs <origin> [--out dir] [--max-pages n] [--concurrency n]"); process.exit(2); }
  const out = opt("--out", "artifacts/site-crawl");
  const started = new Date().toISOString();
  const result = await crawl({ origin, maxPages: Number(opt("--max-pages", 2000)), concurrency: Number(opt("--concurrency", 4)), log: console.log });
  const homeRow = result.rows.find((r) => r.url === new URL("/", origin).href);
  if (!homeRow || homeRow.status !== 200) { console.error(`FAIL: home page did not return 200 (${homeRow ? homeRow.status : "not crawled"}).`); process.exit(2); }
  writeOutputs(out, result, { origin, started, userAgent: UA });
  for (const w of result.warnings) console.warn(`warning: ${w}`);
  console.log(`Crawled ${result.rows.length} URLs into ${out}`);
}
