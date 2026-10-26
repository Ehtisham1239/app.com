import sharp from 'sharp';
import { readFileSync, existsSync } from 'node:fs';

// Keep the photographic masters in Git. Derive responsive files before Next's
// build so a fresh checkout serves every AVIF/WebP size without runtime work.
const manifest = JSON.parse(readFileSync('src/lib/image-manifest.json'));
const scenes = manifest.filter(image => image.replacesLegacyVisual);
let index = 0, created = 0;
await Promise.all(Array.from({ length: 3 }, async () => {
  while (index < scenes.length) {
    const scene = scenes[index++];
    const master = `public${scene.url}`;
    if (!existsSync(master)) throw Error(`Missing learning-image master: ${scene.name}`);
    for (const variant of [...scene.variants, ...scene.avif]) {
      const path = `public${variant.url}`;
      if (existsSync(path)) continue;
      const image = sharp(master).resize({ width: variant.width });
      await (path.endsWith('.avif') ? image.avif({ quality: 52, effort: 4 }) : image.webp({ quality: 80, effort: 5 })).toFile(path);
      created++;
    }
  }
}));
console.log(`Learning imagery: ${scenes.length} masters checked, ${created} responsive files created`);
