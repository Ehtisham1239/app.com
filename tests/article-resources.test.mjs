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

test('Canada and UAE planning guides share the international scheduling resources with the USA and Australia guides', () => {
  const australia = articleResources({ slug: 'quran-lessons-australia-time-zones' });
  for (const slug of ['online-quran-lessons-canada-time-zones', 'online-quran-lessons-uae-families']) assert.deepEqual(articleResources({ slug }), australia, slug);
  assert.deepEqual(australia.links.map(link => link.href), ['/locations', '/pricing']);
});

test('the USA fee comparison and the starting-age guide get their own topic resources, not the generic fallback', () => {
  const international = articleResources({ slug: 'quran-lessons-australia-time-zones' });
  assert.deepEqual(articleResources({ slug: 'online-quran-class-fees-usa-comparison' }), international);
  assert.deepEqual(articleResources({ slug: 'what-age-start-online-quran-classes' }), articleResources({ slug: 'choose-online-quran-classes-kids' }));
});

test('related articles give every post at least one inbound link and stay deterministic (19 Nov 2026)', async () => {
  const { relatedArticles } = await import('../src/lib/article-resources.js');
  const mk = (slug, category, tags) => ({ slug, category, tags });
  const posts = [
    mk('is-my-child-ready-for-hifz', 'Hifz', ['Hifz']), mk('how-long-does-hifz-take-online', 'Hifz', ['Hifz']),
    mk('sabaq-sabqi-manzil-explained', 'Hifz', ['Hifz']), mk('memorization-techniques-for-beginners', 'Hifz', ['Hifz']),
    mk('hifz-revision-with-school', 'Recitation & revision', ['Hifz']), mk('tajweed-rules-for-beginners', 'Tajweed', ['Tajweed']),
    mk('common-tajweed-mistakes', 'Tajweed', ['Tajweed']), mk('makharij-explained-for-beginners', 'Tajweed', ['Tajweed']),
    mk('tajweed-practice-with-feedback', 'Recitation & revision', ['Tajweed']),
  ];
  const inbound = new Map(posts.map(p => [p.slug, 0]));
  for (const p of posts) {
    const picks = relatedArticles(p, posts);
    assert.equal(picks.length, 3);
    assert.ok(!picks.some(x => x.slug === p.slug));
    assert.deepEqual(relatedArticles(p, posts).map(x => x.slug), picks.map(x => x.slug), 'same result every render');
    picks.forEach(x => inbound.set(x.slug, inbound.get(x.slug) + 1));
  }
  for (const [slug, n] of inbound) assert.ok(n >= 1, slug + ' gets at least one related link');
  assert.ok(relatedArticles(posts[0], posts).every(x => /hifz|memoriz|sabaq/.test(x.slug)), 'stays on topic');
});
