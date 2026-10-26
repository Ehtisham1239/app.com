import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../.next', import.meta.url));
const pending = [resolve(root, 'server')], missing = [], assets = new Set();
let pages = 0;
while (pending.length) {
  const directory = pending.pop();
  for (const name of readdirSync(directory)) {
    const path = resolve(directory, name);
    if (statSync(path).isDirectory()) { pending.push(path); continue; }
    if (!path.endsWith('.html')) continue;
    pages++;
    for (const match of readFileSync(path, 'utf8').matchAll(/\/_next\/static\/[\w./-]+\.(?:css|js|woff2?)/g)) {
      const asset = match[0]; assets.add(asset);
      if (!existsSync(resolve(root, asset.slice('/_next/'.length)))) missing.push({ page: path.slice(root.length + 1), asset });
    }
  }
}
if (!pages || missing.length) throw Error(`Build asset integrity failed: ${JSON.stringify({ pages, missing })}`);
console.log(`Build asset integrity: ${pages} rendered HTML files, ${assets.size} unique static assets; zero missing references.`);
