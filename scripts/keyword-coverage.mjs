// Visible-topic coverage, not search-volume or ranking measurement. Owned public GETs only.
import { mkdirSync, writeFileSync } from 'node:fs';
import { SEARCH_INTENTS } from '../src/lib/search-intent.js';
import { getLocation, countryInName } from '../src/lib/locations.js';
import { textContent } from '../src/lib/seo.js';
import { auditOrigin } from './lib/audit-origin.mjs';

const base = auditOrigin(process.argv[2]);
const output = process.argv[3] || 'artifacts/keyword-coverage'; mkdirSync(output, { recursive: true });
const decode = s => String(s || '').replace(/&quot;/g, '"').replace(/&#x([0-9a-f]+);/gi, (_, x) => String.fromCodePoint(parseInt(x, 16))).replace(/&#(\d+);/g, (_, x) => String.fromCodePoint(Number(x))).replace(/&amp;/g, '&');
const normal = s => decode(s).toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
async function get(path) { const r = await fetch(base.origin + path, { redirect: 'manual', signal: AbortSignal.timeout(30000) }); if ([401, 403, 429].includes(r.status)) throw Error('Access/rate wall; stopped'); if (r.status !== 200) throw Error(`${path}: HTTP ${r.status}`); const body = await r.text(); if (Buffer.byteLength(body) > 2500000) throw Error('Response cap'); return body; }
const xml = await get('/sitemap.xml'), paths = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => new URL(decode(m[1])).pathname);
if (!paths.length || paths.length > 250 || new Set(paths).size !== paths.length) throw Error('Unexpected sitemap size/duplicates');
const rows = [], failures = []; let index = 0, stopped = false;
await Promise.all(Array.from({ length: 3 }, async () => {
  while (!stopped && index < paths.length) {
    const path = paths[index++];
    try {
      const html = await get(path), title = decode(textContent(html.match(/<title>(.*?)<\/title>/s)?.[1] || ''));
      const heading = decode(textContent(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1] || ''));
      const main = decode(textContent(html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1] || ''));
      let phrase = SEARCH_INTENTS[path]?.phrase, source = 'Curated offering-matched topic';
      if (!phrase && path.startsWith('/locations/')) {
        const [, , countrySlug, citySlug] = path.split('/'), country = getLocation(countrySlug), city = country?.cities.find(c => c.slug === citySlug);
        if (!country || (citySlug && !city)) throw Error('Unknown location in sitemap');
        phrase = `online Quran classes in ${city ? `${city.name}, ${country.name}` : countryInName(country)}`; source = 'Existing local service and scheduling context';
      }
      if (!phrase) { phrase = heading || title.replace(/\s*[|·—]\s*(?:OQC|Online Quran College)\s*$/i, '').trim(); source = 'Published page topic; preserve original article, profile or policy intent'; }
      const placements = [['title', title], ['h1', heading], ['main', main]].filter(([, value]) => normal(value).includes(normal(phrase))).map(([key]) => key);
      if (!phrase || !placements.includes('main')) failures.push({ path, phrase, error: 'Topic is not present in visible main content' });
      rows.push({ path, phrase, source, placements });
    } catch (error) { failures.push({ path, error: error.message }); if (error.message.startsWith('Access/rate wall')) stopped = true; }
  }
}));
rows.sort((a, b) => a.path.localeCompare(b.path));
const summary = { checkedAt: new Date().toISOString(), base: base.origin, declared: paths.length, mapped: rows.length, curatedTopics: Object.keys(SEARCH_INTENTS).length, failures, stopped, evidence: 'Topic relevance and visible placement only. Search volumes, top-ten rankings, difficulty and traffic are unverified. No meta-keywords tag or hidden keyword list added.' };
writeFileSync(output + '/map.json', JSON.stringify({ checkedAt: summary.checkedAt, evidence: summary.evidence, rows }, null, 2) + '\n');
writeFileSync(output + '/summary.json', JSON.stringify(summary, null, 2) + '\n');
console.log(JSON.stringify(summary, null, 2));
if (failures.length || rows.length !== paths.length) process.exitCode = 1;
