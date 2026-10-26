import test from 'node:test';
import assert from 'node:assert/strict';
import { relatedArticles, articleResources } from '../src/lib/article-resources.js';

test('related reading prefers the same learning task over a broad category and excludes the current article', () => {
  const current = { slug: 'importance-of-reciting-quran-with-tajweed', category: 'General' };
  const sameTask = { slug: 'tajweed-practice-with-feedback', category: 'Recitation' };
  const broad = { slug: 'other', category: 'General' };
  assert.deepEqual(relatedArticles(current, [current, broad, sameTask], 1), [sameTask]);
  assert.deepEqual(relatedArticles(current, []), []);
});

test('new CMS articles receive a useful fallback without fabricated article or course URLs', () => {
  const resources = articleResources({ slug: 'new-editorial-post' });
  assert.ok(resources.links.every(link => ['/learn', '/courses'].includes(link.href)));
  assert.equal(relatedArticles({ slug: 'new' }, [{ slug: 'a' }, { slug: 'b' }], 1).length, 1);
});
