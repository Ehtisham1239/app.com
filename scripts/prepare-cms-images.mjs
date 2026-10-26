// Optional regeneration of the three current public CMS uploads. Production
// deploys use the committed derivatives and never need to download originals.
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

const sources = JSON.parse(readFileSync('content/cms-image-sources.json', 'utf8'));
const manifest = [];
mkdirSync('public/images/cms', { recursive: true });
for (const source of sources) {
  if (!/^https:\/\/lgbwidraztavhhbnbfhr\.supabase\.co\/storage\/v1\/object\/public\/media\/uploads\/[a-zA-Z0-9/_.-]+$/.test(source.url)) throw Error('Unexpected image origin');
  const response = await fetch(source.url, { signal: AbortSignal.timeout(30000) });
  if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) throw Error('Cannot read CMS image');
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length > 20_000_000) throw Error('CMS image exceeds source cap');
  const hash = createHash('sha256').update(bytes).digest('hex');
  if (hash !== source.sha256) throw Error('CMS original changed; review before re-encoding');
  const variants = [], avif = [];
  for (const width of [400, 800, 1200]) for (const format of ['webp', 'avif']) {
    const url = `/images/cms/${hash.slice(0, 16)}-${width}.${format}`;
    const image = sharp(bytes).rotate().resize({ width, withoutEnlargement: true });
    const info = await (format === 'webp' ? image.webp({ quality: 80, effort: 5 }) : image.avif({ quality: 53, effort: 5 })).toFile('public' + url);
    (format === 'webp' ? variants : avif).push({ url, width: info.width, height: info.height, bytes: info.size });
  }
  const largest = variants.at(-1);
  manifest.push({ storage_url: source.url, source_sha256: hash, url: largest.url, width: largest.width, height: largest.height, variants, avif });
  console.log(`CMS image: ${bytes.length} source bytes -> ${avif[0].bytes} mobile AVIF bytes`);
}
writeFileSync('src/lib/cms-image-manifest.json', JSON.stringify(manifest, null, 2) + '\n');
