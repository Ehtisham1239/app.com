import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { legacyImageRedirects } from '../src/lib/legacy-image-redirects.js';

test('removed responsive image URLs retain permanent routes to existing current formats and widths', () => {
  const manifest = JSON.parse(readFileSync(new URL('../src/lib/image-manifest.json', import.meta.url)));
  const routes = legacyImageRedirects(manifest);
  assert.ok(routes.length > 20);
  assert.equal(new Set(routes.map(route => route.source)).size, routes.length);
  for (const route of routes) {
    assert.equal(route.permanent, true);
    for (const width of [400, 800, 1200]) for (const format of ['webp', 'avif']) {
      const target = route.destination.replace(':width', width).replace(':format', format);
      assert.equal(existsSync(new URL('../public' + target, import.meta.url)), true, target);
    }
  }
});
