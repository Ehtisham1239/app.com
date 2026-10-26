import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import assert from 'node:assert/strict';
import { LOCATIONS, locationPath } from '../src/lib/locations.js';

const base = (process.argv[2] || 'http://127.0.0.1:3017').replace(/\/$/, '');
const manifest = JSON.parse(readFileSync('src/lib/image-manifest.json'));
const report = { base, pages: 0, regionalPages: 0, responsiveFiles: 0, errors: [], source: 'Local production build using read-only seed fallback; no CMS writes' };
const pages = [...(await (await fetch(`${base}/sitemap.xml`)).text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => new URL(match[1]).pathname);
const regional = new Map(LOCATIONS.flatMap(country => [null, ...country.cities].map(city => [locationPath(country, city), manifest.find(image => image.name === `map-${country.slug}${city ? `-${city.slug}` : ''}`)])));
assert.equal(regional.size, 165);
let index = 0;
await Promise.all(Array.from({ length: 8 }, async () => {
  while (index < pages.length) {
    const path = pages[index++];
    const response = await fetch(base + path);
    assert.equal(response.status, 200, path);
    const html = await response.text();
    assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, `${path}: one h1`);
    assert.match(html, /rel="canonical"/, `${path}: canonical`);
    for (const match of html.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/g)) assert.ok(!/\/map-/.test(match[1]), `${path}: map still visible`);
    const image = regional.get(path);
    if (image) {
      assert.match(html, new RegExp(`src="${image.url}"`), `${path}: expected learning scene`);
      const og = html.match(/<meta property="og:image" content="([^"]+)"/);
      assert.ok(og, `${path}: sharing image`);
      assert.ok(!og[1].includes('/map-'), `${path}: old map in metadata`);
      report.regionalPages++;
    }
    report.pages++;
  }
}));
assert.equal(report.regionalPages, 165);
const files = manifest.filter(image => image.replacesLegacyVisual).flatMap(image => [...image.variants, ...image.avif]);
index = 0;
await Promise.all(Array.from({ length: 8 }, async () => {
  while (index < files.length) {
    const file = files[index++];
    const response = await fetch(base + file.url);
    assert.equal(response.status, 200, file.url);
    assert.match(response.headers.get('content-type'), file.url.endsWith('.avif') ? /image\/avif/ : /image\/webp/);
    assert.ok((await response.arrayBuffer()).byteLength < 200000, `${file.url}: payload budget`);
    report.responsiveFiles++;
  }
}));
const sitemap = await (await fetch(`${base}/sitemap.xml`)).text();
assert.ok(!/<image:loc>[^<]*\/map-/.test(sitemap), 'Map imagery remains in sitemap');
report.legacyImageRedirects = 0;
for (const region of ['united-states', 'united-kingdom-london']) for (const version of ['', '-r2']) for (const width of [400, 800, 1200]) {
  const response = await fetch(`${base}/images/learning/map-${region}${version}-${width}.webp`, { redirect: 'manual' });
  assert.equal(response.status, 308);
  assert.equal(new URL(response.headers.get('location'), base).pathname, `/images/learning/oqc-learning-${region}-v3-${width}.webp`);
  report.legacyImageRedirects++;
}
mkdirSync('artifacts/mobile-visual-smoke', { recursive: true });
writeFileSync('artifacts/mobile-visual-smoke/image-audit.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report));
