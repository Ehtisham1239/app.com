// Checks that each phrase in the 50-keyword map is visible on its one target page.
// Visible placement only; it does not measure demand or rankings.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { textContent } from '../src/lib/seo.js';
import { auditOrigin } from './lib/audit-origin.mjs';

const base = auditOrigin(process.argv[2]);
const output = process.argv[3] || 'artifacts/keyword-map';
mkdirSync(output, { recursive: true });
const map = JSON.parse(readFileSync(new URL('../content/seo-agent/keyword-map-50-2026-10-29.json', import.meta.url), 'utf8'));
const decode = s => String(s || '').replace(/&quot;/g, '"').replace(/&#x([0-9a-f]+);/gi, (_, x) => String.fromCodePoint(parseInt(x, 16))).replace(/&#(\d+);/g, (_, x) => String.fromCodePoint(Number(x))).replace(/&amp;/g, '&').replace(/&#39;|&apos;/g, "'");
// Treat British and American spellings and hyphenation as the same phrase.
const normal = s => decode(s).toLowerCase().replace(/memoris/g, 'memoriz').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const pages = new Map();
async function page(path) {
  if (!pages.has(path)) pages.set(path, (async () => {
    const r = await fetch(base.origin + path, { redirect: 'manual', signal: AbortSignal.timeout(30000) });
    if (r.status !== 200) throw Error(`HTTP ${r.status}`);
    const html = await r.text();
    return {
      title: decode(textContent(html.match(/<title>(.*?)<\/title>/s)?.[1] || '')),
      h1: decode(textContent(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1] || '')),
      main: decode(textContent(html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1] || '')),
      noindex: /<meta name="robots" content="[^"]*noindex/.test(html),
    };
  })());
  return pages.get(path);
}
const rows = [], failures = [];
for (const k of map.keywords) {
  try {
    const p = await page(k.page);
    const placements = ['title', 'h1', 'main'].filter(key => normal(p[key]).includes(normal(k.phrase)));
    rows.push({ phrase: k.phrase, page: k.page, placements });
    if (p.noindex) failures.push({ phrase: k.phrase, page: k.page, error: 'Target page is noindex' });
    else if (!placements.includes('main')) failures.push({ phrase: k.phrase, page: k.page, error: 'Phrase not in visible main content' });
  } catch (error) { failures.push({ phrase: k.phrase, page: k.page, error: error.message }); }
}
const summary = { checkedAt: new Date().toISOString(), base: base.origin, keywords: map.keywords.length, inTitleOrH1: rows.filter(r => r.placements.some(p => p !== 'main')).length, failures };
writeFileSync(output + '/rows.json', JSON.stringify(rows, null, 2) + '\n');
writeFileSync(output + '/summary.json', JSON.stringify(summary, null, 2) + '\n');
console.log(JSON.stringify(summary, null, 2));
if (failures.length) process.exitCode = 1;
