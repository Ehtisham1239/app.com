import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseCsv, summarise, toMarkdown } from "../scripts/sf-crawl-summary.mjs";

const csv = [
  '﻿"Address","Content Type","Status Code","Indexability","Title 1","Meta Description 1","H1-1","Response Time","Inlinks"',
  '"https://x.test/","text/html; charset=utf-8","200","Indexable","Home, with comma","Desc","Welcome","0.4","10"',
  '"https://x.test/a","text/html","200","Indexable","","","","2.6","3"',
  '"https://x.test/b","text/html","200","Non-Indexable","T","","H","0.2","1"',
  '"https://x.test/gone","text/html","404","","","","","0.1","4"',
  '"https://x.test/boom","text/html","503","","","","","0.1","2"',
  '"https://x.test/old","text/html","301","","","","","0.1","1"',
  '"https://x.test/logo.png","image/png","200","Indexable","","","","0.1","9"',
].join("\r\n");

test("parseCsv handles BOM, quotes and commas", () => {
  const rows = parseCsv(csv);
  assert.equal(rows.length, 7);
  assert.equal(rows[0]["Title 1"], "Home, with comma");
  assert.equal(rows[0].Address, "https://x.test/");
});

test("summarise counts only indexable HTML for content checks", () => {
  const s = summarise(parseCsv(csv));
  assert.equal(s.total, 7);
  assert.equal(s.indexable, 2);
  assert.equal(s.nonIndexable, 1);
  assert.equal(s.clientErrors.length, 1);
  assert.equal(s.serverErrors.length, 1);
  assert.equal(s.redirects.length, 1);
  assert.equal(s.missingTitle.length, 1);
  assert.equal(s.missingMeta.length, 1);
  assert.equal(s.missingH1.length, 1);
  assert.equal(s.slow.length, 1);
});

test("markdown names the failing URLs", () => {
  const md = toMarkdown(summarise(parseCsv(csv)), { site: "https://x.test" });
  assert.match(md, /5xx server errors/);
  assert.match(md, /https:\/\/x\.test\/boom/);
});

test("workflow is pinned, least-privilege and never prints the licence", () => {
  const yml = readFileSync(new URL("../.github/workflows/oqc-screaming-frog.yml", import.meta.url), "utf8");
  assert.match(yml, /permissions:\s*\n\s*contents: read/);
  assert.doesNotMatch(yml, /uses: [^\n]+@(v\d|main|master)\b/);
  assert.doesNotMatch(yml, /echo[^\n]*secrets\./);
  assert.match(yml, /sha256sum -c/);
});
