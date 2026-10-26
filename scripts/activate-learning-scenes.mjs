import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import sharp from 'sharp';

const plan = JSON.parse(readFileSync('content/visuals/oqc-scene-plan-v3.json'));
const checkpoint = JSON.parse(readFileSync('content/visuals/oqc-completed-scenes-v3.json'));
const manifestPath = 'src/lib/image-manifest.json';
const manifest = JSON.parse(readFileSync(manifestPath));
const generated = readdirSync('artifacts/professional-source-jobs').filter(name => name.endsWith('.json')).map(name => JSON.parse(readFileSync(`artifacts/professional-source-jobs/${name}`)));
const scenes = new Map([...checkpoint.scenes, ...generated].map(scene => [scene.assetName, scene]));
const missing = plan.jobs.filter(job => !scenes.has(job.assetName));
if (missing.length && !process.argv.includes('--partial')) throw Error(`${missing.length} learning scenes still missing; no manifest changed`);
let activated = 0;
for (const asset of manifest) {
  const scene = scenes.get(asset.name);
  if (!scene) continue;
  const metadata = await sharp(`public${scene.url}`).metadata();
  const previous = [asset.url, asset.storage_url, ...(asset.previous_urls || []), ...asset.variants.map(v => v.url), ...(asset.avif || []).map(v => v.url)].filter(Boolean);
  asset.previous_urls = [...new Set(previous)].filter(url => url !== scene.url);
  asset.url = scene.url;
  asset.alt = scene.alt;
  asset.width = metadata.width;
  asset.height = metadata.height;
  asset.kind = 'photo';
  asset.provenance = 'AI-generated editorial learning scene';
  asset.replacesLegacyVisual = true;
  asset.variants = scene.variants.map(v => ({ ...v, bytes: statSync(`public${v.url}`).size }));
  asset.avif = scene.avif.map(v => ({ ...v, bytes: statSync(`public${v.url}`).size }));
  activated++;
}
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
const registry = manifest.filter(asset => asset.replacesLegacyVisual).map(({ name, url, alt, variants, avif }) => ({ name, url, alt, variants, avif }));
writeFileSync('content/visuals/oqc-active-scenes-v3.json', JSON.stringify({ mode: 'Built-in image_gen', complete: missing.length === 0, activated, pending: missing.map(job => job.assetName), scenes: registry }, null, 2) + '\n');
console.log(JSON.stringify({ activated, pending: missing.length, total: plan.jobs.length }));
