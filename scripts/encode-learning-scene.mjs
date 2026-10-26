import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';

const [assetName, source] = process.argv.slice(2);
const plan = JSON.parse(readFileSync('content/visuals/oqc-scene-plan-v3.json'));
const job = plan.jobs.find(item => item.assetName === assetName);
if (!job || !source || !existsSync(source)) throw Error('Known asset name and existing source image are required');
mkdirSync('artifacts/professional-source-jobs', { recursive: true });
mkdirSync('public/images/learning', { recursive: true });
const metadata = await sharp(source).metadata();
const variants = [], avif = [];
const masterPath = `public/images/learning/${job.fileStem}-1200.webp`;
await sharp(source).resize({ width: 1200 }).webp({ quality: 80, effort: 5 }).toFile(masterPath);
for (const width of [400, 800, 1200]) {
  for (const format of ['webp', 'avif']) {
    const url = `/images/learning/${job.fileStem}-${width}.${format}`;
    const info = format === 'webp' && width === 1200 ? { size: statSync(masterPath).size } : await (format === 'webp' ? sharp(masterPath).resize({ width }).webp({ quality: 80, effort: 5 }) : sharp(masterPath).resize({ width }).avif({ quality: 52, effort: 4 })).toFile(`public${url}`);
    (format === 'webp' ? variants : avif).push({ url, width, bytes: info.size });
  }
}
const record = { ...job, url: variants.at(-1).url, width: 1200, height: Math.round(1200 * metadata.height / metadata.width), variants, avif, kind: 'photo', provenance: 'AI-generated editorial learning scene' };
writeFileSync(`artifacts/professional-source-jobs/${assetName}.json`, JSON.stringify(record, null, 2));
console.log(`Encoded ${assetName}: 6 responsive files`);
