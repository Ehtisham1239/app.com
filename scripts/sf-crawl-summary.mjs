// Summarises a Screaming Frog SEO Spider headless export (internal_all.csv + the filtered
// tab exports) into a Markdown report for the GitHub job summary.
// Usage: node scripts/sf-crawl-summary.mjs <export-folder> [--fail-on-5xx]
//   writes <export-folder>/summary.md and appends it to $GITHUB_STEP_SUMMARY when set.
// Read-only: it never touches the site. Exit 1 only with --fail-on-5xx and a 5xx URL.
import { existsSync, readFileSync, writeFileSync, appendFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

export function parseCsv(text) {
  const src = text.replace(/^﻿/, "");
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < src.length; i += 1) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"' && src[i + 1] === '"') { field += '"'; i += 1; }
      else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") { row.push(field); field = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i += 1;
      row.push(field); field = "";
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
    } else field += ch;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  if (!rows.length) return [];
  const [header, ...body] = rows;
  return body.map((r) => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ""])));
}

const num = (v) => Number.parseFloat(v) || 0;
const isHtml = (r) => /text\/html/i.test(r["Content Type"] || "");

export function summarise(rows) {
  const html = rows.filter(isHtml);
  const ok = html.filter((r) => num(r["Status Code"]) === 200);
  const indexable = ok.filter((r) => (r.Indexability || "").toLowerCase() === "indexable");
  const byClass = (lo, hi) => rows.filter((r) => num(r["Status Code"]) >= lo && num(r["Status Code"]) < hi);
  const blank = (col) => indexable.filter((r) => !(r[col] || "").trim());
  return {
    total: rows.length,
    htmlPages: html.length,
    indexable: indexable.length,
    nonIndexable: ok.length - indexable.length,
    redirects: byClass(300, 400),
    clientErrors: byClass(400, 500),
    serverErrors: byClass(500, 600),
    noResponse: rows.filter((r) => num(r["Status Code"]) === 0),
    missingTitle: blank("Title 1"),
    missingMeta: blank("Meta Description 1"),
    missingH1: blank("H1-1"),
    slow: indexable.filter((r) => num(r["Response Time"]) > 2),
  };
}

const list = (rows, max = 15) => rows.slice(0, max)
  .map((r) => `- ${r.Address}${r.Inlinks ? ` (${r.Inlinks} inlinks)` : ""}`).join("\n")
  + (rows.length > max ? `\n- … and ${rows.length - max} more (see CSV artifact)` : "");

export function toMarkdown(s, meta = {}) {
  const line = (label, rows) => `| ${label} | ${rows.length} |`;
  const parts = [
    `## Screaming Frog crawl${meta.site ? `: ${meta.site}` : ""}`,
    meta.note ? `> ${meta.note}\n` : "",
    "| Check | URLs |", "| --- | ---: |",
    `| Crawled URLs | ${s.total} |`, `| HTML pages | ${s.htmlPages} |`,
    `| Indexable HTML 200 | ${s.indexable} |`, `| Non-indexable HTML 200 | ${s.nonIndexable} |`,
    line("3xx redirects", s.redirects), line("4xx client errors", s.clientErrors),
    line("5xx server errors", s.serverErrors), line("No response", s.noResponse),
    line("Indexable pages missing title", s.missingTitle),
    line("Indexable pages missing meta description", s.missingMeta),
    line("Indexable pages missing H1", s.missingH1),
    line("Indexable pages slower than 2 s", s.slow), "",
  ];
  for (const [title, rows] of [["5xx server errors", s.serverErrors], ["4xx client errors", s.clientErrors], ["No response", s.noResponse], ["Missing title", s.missingTitle], ["Missing H1", s.missingH1]]) {
    if (rows.length) parts.push(`### ${title}`, list(rows), "");
  }
  return parts.join("\n");
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  const dir = process.argv[2];
  if (!dir) { console.error("Usage: node scripts/sf-crawl-summary.mjs <export-folder> [--fail-on-5xx]"); process.exit(2); }
  const file = join(dir, "internal_all.csv");
  if (!existsSync(file)) { console.error(`BLOCKED: ${file} not found; the crawl exported nothing.`); process.exit(2); }
  const summary = summarise(parseCsv(readFileSync(file, "utf8")));
  if (!summary.total) { console.error("FAIL: internal_all.csv has no rows."); process.exit(2); }
  const md = toMarkdown(summary, { site: process.env.SF_SITE, note: process.env.SF_NOTE });
  writeFileSync(join(dir, "summary.md"), md);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${md}\n`);
  console.log(md);
  if (process.argv.includes("--fail-on-5xx") && summary.serverErrors.length) process.exit(1);
}
