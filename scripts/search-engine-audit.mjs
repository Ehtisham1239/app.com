// Read-only Google/Bing release checks. Owned public GETs only; no submissions.
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
const base = (process.argv[2] || "http://localhost:3012").replace(/\/$/, "");
const out = process.argv[3] || "artifacts/search-engines";
mkdirSync(out, { recursive: true });
const decode = s => String(s || "").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16))).replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n));
const attrs = tag => Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(m => [m[1], decode(m[2])]));
const tags = (html, tag) => [...html.matchAll(new RegExp(`<${tag}\\b[^>]*>`, "g"))].map(m => attrs(m[0]));
const cache = new Map(), failures = [], targets = new Map(), fragments = [], articles = [], listing = [], images = new Set();
async function read(path, userAgent) {
  if (!userAgent && cache.has(path)) return cache.get(path);
  assert.ok(path.startsWith("/") && !path.startsWith("//"));
  const r = await fetch(base + path, { redirect: "manual", headers: { "User-Agent": userAgent || "OQC-Public-SEO-Audit/1.0" }, signal: AbortSignal.timeout(30000) });
  assert.ok(r.status !== 403 && r.status !== 429, `Access/rate wall at ${path}; stopped`);
  const html = await r.text();
  assert.ok(Buffer.byteLength(html) < 2500000, `Response cap at ${path}`);
  const result = { status: r.status, html, headers: Object.fromEntries(r.headers) };
  if (!userAgent) cache.set(path, result);
  return result;
}
const check = (condition, path, issue) => { if (!condition) failures.push({ path, issue }); };
const sitemap = await read("/sitemap.xml");
assert.equal(sitemap.status, 200);
const urls = [...sitemap.html.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => new URL(decode(m[1])));
assert.ok(urls.length > 0 && urls.length <= 250);
const canonicalOrigin = urls[0].origin, canonicalPaths = new Set(urls.map(u => u.pathname));
function links(html, path) {
  for (const a of tags(html, "a")) {
    if (!a.href || a.href === "#" || /^(javascript|data|vbscript):/i.test(a.href)) { check(false, path, `Empty/unsafe link: ${a.href || "missing"}`); continue; }
    const url = new URL(a.href, canonicalOrigin + path);
    if (url.origin !== canonicalOrigin || /^\/(admin|auth|api)(\/|$)/.test(url.pathname)) continue;
    const destination = url.pathname + url.search;
    if (!targets.has(destination)) targets.set(destination, path);
    if (url.hash) fragments.push({ path, destination, id: decodeURIComponent(url.hash.slice(1)) });
  }
}
let cursor = 0;
await Promise.all(Array.from({ length: 3 }, async () => {
  while (cursor < urls.length) {
    const path = urls[cursor++].pathname, r = await read(path);
    check(r.status === 200, path, "Sitemap page response");
    links(r.html, path);
    check(tags(r.html, "meta").some(m => m.name === "robots" && /max-image-preview:large/.test(m.content)), path, "General crawler preview directive missing");
    check(tags(r.html, "link").some(link => link.rel === "alternate" && link.type === "application/rss+xml" && new URL(link.href, canonicalOrigin).pathname === "/blog/feed.xml"), path, "Article feed discovery missing");
    if (!path.startsWith("/blog/")) continue;
    const graph = [...r.html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap(m => { const v = JSON.parse(m[1]); return v["@graph"] || [v]; });
    const post = graph.find(v => v["@type"] === "BlogPosting");
    check(Boolean(post), path, "Missing BlogPosting");
    if (!post) continue;
    const body = r.html.match(/<div class="prose-oqc[^>]*>([\s\S]*?)<\/div>/)?.[1] || "";
    const times = tags(r.html, "time").map(t => t.dateTime || t.datetime);
    const metas = tags(r.html, "meta"), robots = metas.find(m => m.name === "robots")?.content || "";
    const image = typeof post.image === "string" ? post.image : post.image?.url;
    const hero = r.html.match(/data-hero-visual[^>]*>([\s\S]*?)<\/section>/)?.[1] || "";
    const heroImages = tags(hero, "img");
    check(Boolean(image && heroImages.some(img => new URL(img.src, canonicalOrigin).href === image)), path, "Article schema image differs from visible hero");
    if (image) { const u = new URL(image); if (u.origin === canonicalOrigin) images.add(u.pathname); }
    check(Boolean(post.author?.name && r.html.includes(post.author.name)), path, "Author not visible");
    check(Boolean(post.datePublished && times.includes(post.datePublished)), path, "Published time not visible/matching");
    if (post.dateModified?.slice(0, 10) > post.datePublished?.slice(0, 10)) check(times.includes(post.dateModified), path, "Updated time not visible/matching");
    check(/max-image-preview:large/.test(robots), path, "Large image preview missing for general crawlers");
    check(body.replace(/<[^>]*>/g, " ").trim().length > 400, path, "Article body missing");
    const ids = new Set(tags(r.html, "h2").map(h => h.id).filter(Boolean));
    for (const a of tags(r.html.match(/aria-label="In this article"[\s\S]*?<\/nav>/)?.[0] || "", "a")) check(ids.has(a.href?.slice(1)), path, "Table-of-contents target missing");
    articles.push({ path, author: post.author, image, datePublished: post.datePublished, dateModified: post.dateModified, words: post.wordCount });
  }
}));
const first = await read("/blog");
const topics = tags(first.html.match(/aria-label="Article topics"[\s\S]*?<\/nav>/)?.[0] || "", "a").map(a => a.href);
for (const category of ["Parents", "Tajweed", "Hifz"]) check(topics.some(href => new URL(href, canonicalOrigin).searchParams.get("category") === category), "/blog", `Published category omitted: ${category}`);
const listingPaths = new Set(["/blog", ...topics]);
for (const href of tags(first.html, "a").map(a => a.href)) if (href?.startsWith("/blog?page=")) listingPaths.add(href);
for (const path of listingPaths) {
  const r = await read(path); links(r.html, path);
  check(r.status === 200, path, "Blog navigation destination failed");
  const meta = tags(r.html, "meta"), canonical = tags(r.html, "link").find(l => l.rel === "canonical")?.href;
  const noindex = meta.some(m => m.name === "robots" && /noindex/.test(m.content));
  check(canonical === new URL(path, canonicalOrigin).href, path, "Blog canonical mismatch");
  check(path.includes("category=") ? noindex : !noindex, path, "Filter/pagination index directive mismatch");
  listing.push({ path, status: r.status, canonical, noindex });
}
for (const path of ["/blog?category=no-such-topic-oqc", "/blog?page=0", "/blog?page=-1", "/blog?page=1.5", "/blog?page=01", "/blog?page=9999", "/blog?page=1&page=2", "/blog?category=Parents&category=Hifz"]) {
  const r = await read(path); check(r.status === 404, path, `Invalid filter returned ${r.status} instead of 404`);
}
assert.ok(targets.size <= 1000);
const destinations = [...targets.keys()], targetResults = []; cursor = 0;
await Promise.all(Array.from({ length: 3 }, async () => {
  while (cursor < destinations.length) {
    const path = destinations[cursor++]; let current = path, r;
    for (let redirects = 0; redirects <= 5; redirects++) {
      r = await read(current);
      if (r.status < 300 || r.status >= 400 || !r.headers.location) break;
      const location = new URL(r.headers.location, canonicalOrigin + current);
      if (location.origin !== canonicalOrigin) break;
      current = location.pathname + location.search;
    }
    check(r.status === 200, path, `Internal destination returns ${r.status}`);
    targetResults.push({ path, status: r.status, final: current });
  }
}));
for (const f of fragments) { const r = cache.get(f.destination); if (r?.status === 200) check(new Set([...r.html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1])).has(f.id), f.path, `Missing anchor ${f.destination}#${f.id}`); }
for (const src of images) { const r = await fetch(base + src, { signal: AbortSignal.timeout(20000) }); check(r.status === 200 && r.headers.get("content-type")?.startsWith("image/"), src, "Article image unavailable"); await r.arrayBuffer(); }
const feed = await read("/blog/feed.xml");
check(feed.status === 200 && /application\/rss\+xml/.test(feed.headers["content-type"] || ""), "/blog/feed.xml", "RSS response/content type");
const feedPaths = [...feed.html.matchAll(/<item>[\s\S]*?<link>(.*?)<\/link>[\s\S]*?<\/item>/g)].map(m => new URL(decode(m[1])).pathname);
for (const a of articles) check(feedPaths.includes(a.path), a.path, "Current article not discoverable in bounded feed");
for (const p of feedPaths) check(canonicalPaths.has(p), p, "Feed includes noncanonical/noindex article");
for (const path of ["/", "/blog", articles[0]?.path].filter(Boolean)) {
  for (const bot of ["Googlebot", "bingbot"]) {
    const r = await read(path, bot); check(r.status === 200, path, `${bot} response`);
    check(!tags(r.html, "meta").some(m => ["robots", bot.toLowerCase()].includes(m.name) && /noindex/.test(m.content)), path, `${bot} accidentally excluded`);
  }
}
const summary = { checkedAt: new Date().toISOString(), base, sitemapPages: urls.length, articles: articles.length, categories: topics.length - 1, listingPages: listing.length, internalTargets: targetResults.length, fragmentReferences: fragments.length, articleImages: images.size, feedItems: feedPaths.length, botChecks: 6, failures, scope: "Public raw HTML and GET responses across sitemap, links and current blog articles; not Google/Bing indexing, official rich-result validation or field CWV." };
for (const [name, value] of Object.entries({ summary, articles, listing, targets: targetResults })) writeFileSync(`${out}/${name}.json`, JSON.stringify(value, null, 2));
console.log(JSON.stringify(summary, null, 2));
assert.equal(failures.length, 0);
