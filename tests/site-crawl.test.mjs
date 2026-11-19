import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { mkdtempSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { crawl, writeOutputs, parseRobots, analyseHtml, extractLinks } from "../scripts/site-crawl.mjs";
import { parseCsv, summarise, toMarkdown } from "../scripts/sf-crawl-summary.mjs";

const page = (title, body, head = "") => `<!doctype html><html><head><title>${title}</title>${head}</head><body>${body}</body></html>`;

function startServer() {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, "http://x");
    const send = (status, type, body, extra = {}) => { res.writeHead(status, { "content-type": type, ...extra }); res.end(body); };
    switch (url.pathname) {
      case "/robots.txt": return send(200, "text/plain", "User-agent: *\nDisallow: /private\nSitemap: /sitemap.xml\n");
      case "/sitemap.xml": return send(200, "application/xml", `<urlset><url><loc>http://${req.headers.host}/</loc></url><url><loc>http://${req.headers.host}/orphan</loc></url><url><loc>http://${req.headers.host}/noindex</loc></url></urlset>`);
      case "/": return send(200, "text/html", page("Home", `<h1>Home</h1><a href="/a">a</a> <a href="/gone">gone</a> <a href="/redir">redir</a> <a href="/boom">boom</a> <a href="/private">p</a> <a href="/dup1">d1</a> <a href="/dup2">d2</a> <a href="/noindex">n</a> <a href="https://elsewhere.test/x">ext</a> <a href="/a#frag">frag</a>`, '<meta name="description" content="Home page">'));
      case "/a": return send(200, "text/html", page("A page", "<h1>A</h1><h1>Two</h1><img src=x.png><img src=y.png alt=''>", '<link rel="canonical" href="/a">'));
      case "/redir": return send(301, "text/html", "", { location: "/a" });
      case "/boom": return send(500, "text/html", page("Boom", "<h1>Boom</h1>"));
      case "/dup1": case "/dup2": return send(200, "text/html", page("Same title", "<h1>D</h1>", '<meta name="description" content="d">'));
      case "/noindex": return send(200, "text/html", page("", "<p>No h1</p>", '<meta name="robots" content="noindex">'));
      case "/orphan": return send(200, "text/html", page("Orphan", "<h1>O</h1>"));
      case "/private": return send(200, "text/html", page("Private", "<h1>P</h1>"));
      default: return send(404, "text/html", page("Not found", "<h1>404</h1>"));
    }
  });
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(server)));
}

test("crawler finds status codes, redirects, indexability, orphans and writes CSVs", async () => {
  const server = await startServer();
  try {
    const origin = `http://127.0.0.1:${server.address().port}`;
    const result = await crawl({ origin, concurrency: 3 });
    const byPath = Object.fromEntries(result.rows.map((r) => [new URL(r.url).pathname, r]));
    assert.equal(byPath["/"].status, 200);
    assert.equal(byPath["/gone"].status, 404);
    assert.equal(byPath["/boom"].status, 500);
    assert.equal(byPath["/redir"].status, 301);
    assert.equal(byPath["/redir"].redirect, `${origin}/a`);
    assert.equal(byPath["/private"].statusText, "Blocked by robots.txt");
    assert.equal(byPath["/noindex"].indexStatus, "noindex");
    assert.equal(byPath["/orphan"].inlinks, 0);
    assert.equal(byPath["/orphan"].inSitemap, true);
    assert.equal(byPath["/a"].h1Count, 2);
    assert.equal(byPath["/a"].imagesMissingAlt, 1);
    assert.equal(byPath["/a"].inlinks, 2, "home link plus redirect source, fragment ignored");
    assert.ok(!result.rows.some((r) => r.url.includes("elsewhere.test")), "external hosts are not crawled");

    const dir = mkdtempSync(join(tmpdir(), "crawl-"));
    writeOutputs(dir, result, { origin });
    for (const f of ["internal_all.csv", "response_codes_client_error_4xx.csv", "response_codes_server_error_5xx.csv", "page_titles_duplicate.csv", "broken_links_sources.csv", "crawl_meta.json"]) assert.ok(existsSync(join(dir, f)), f);
    const summary = summarise(parseCsv(readFileSync(join(dir, "internal_all.csv"), "utf8")));
    assert.equal(summary.serverErrors.length, 1);
    assert.equal(summary.clientErrors.length, 1);
    assert.equal(summary.blocked.length, 1);
    assert.equal(summary.orphans.length, 1);
    assert.equal(summary.duplicateTitles.length, 2);
    assert.equal(summary.missingH1.length, 0, "every indexable page has an h1; the noindex page is excluded");
    assert.ok(summary.sitemapProblems.some((r) => r.Address.endsWith("/noindex")));
    const md = toMarkdown(summary, { site: origin });
    assert.match(md, /\| Sitemap pages with no internal links \(orphans\) \| 1 \|/);
    assert.match(md, /\| Blocked by robots\.txt \| 1 \|/);
    assert.match(md, /\| Indexable pages with duplicate titles \| 2 \|/);
    const broken = readFileSync(join(dir, "broken_links_sources.csv"), "utf8");
    assert.match(broken, /\/gone/);
    assert.doesNotMatch(broken, /\/private/);
  } finally { server.close(); }
});

test("robots, html analysis and link extraction helpers", () => {
  const r = parseRobots("User-agent: *\nDisallow: /staff\nAllow: /staff/public\nUser-agent: Other\nDisallow: /\n");
  assert.equal(r.allowed("/staff/x"), false);
  assert.equal(r.allowed("/staff/public"), true);
  assert.equal(r.allowed("/blog"), true);
  const a = analyseHtml(page("T &amp; U", "<h1>Hi <b>there</b></h1><p>one two three</p>", '<meta name="description" content="D"><meta name="robots" content="noindex,follow">'));
  assert.equal(a.title, "T & U");
  assert.equal(a.h1, "Hi there");
  assert.equal(a.robots, "noindex,follow");
  assert.deepEqual(extractLinks('<a href="/x">1</a><a href=\'mailto:a@b.c\'>2</a><a href="/x#y">3</a>', "https://s.test/p"), ["https://s.test/x"]);
});

test("workflow is pinned, least-privilege and read-only", () => {
  const yml = readFileSync(new URL("../.github/workflows/oqc-site-crawl.yml", import.meta.url), "utf8");
  assert.match(yml, /permissions:\s*\n\s*contents: read/);
  assert.doesNotMatch(yml, /uses: [^\n]+@(v\d|main|master)\b/);
  assert.match(yml, /schedule:/);
  assert.match(yml, /node scripts\/site-crawl\.mjs/);
});

test("crawler retries 429 and recovers", async () => {
  process.env.SITE_CRAWL_RETRY_MS = "5";
  const { crawl: freshCrawl } = await import(`../scripts/site-crawl.mjs?retry=${Date.now()}`);
  let hits = 0;
  const server = http.createServer((req, res) => {
    if (req.url === "/robots.txt" || req.url === "/sitemap.xml") { res.writeHead(404); return res.end(); }
    hits += 1;
    if (hits <= 2) { res.writeHead(429, { "content-type": "text/html" }); return res.end("slow down"); }
    res.writeHead(200, { "content-type": "text/html" });
    res.end(page("Home", "<h1>Home</h1>"));
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    const result = await freshCrawl({ origin: `http://127.0.0.1:${server.address().port}`, concurrency: 1 });
    const home = result.rows.find((r) => new URL(r.url).pathname === "/");
    assert.equal(home.status, 200);
    assert.equal(hits, 3, "two 429s then success");
  } finally { server.close(); delete process.env.SITE_CRAWL_RETRY_MS; }
});
