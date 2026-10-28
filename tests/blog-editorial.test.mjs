import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripHtml } from '../src/lib/format.js';

test('published fallback articles respect the owner’s 1,000-word editorial maximum', () => {
  const { posts } = JSON.parse(readFileSync(new URL('../src/lib/seed-content.json', import.meta.url)));
  for (const post of posts) {
    // Also include the title and excerpt, so the cap is not defeated by moving
    // paragraphs into those fields. Navigation/related cards are not articles.
    const words = stripHtml(`${post.title} ${post.excerpt || ''} ${post.body_html}`).split(/\s+/).filter(Boolean).length;
    assert.ok(words > 0 && words <= 1000, `${post.slug}: ${words} article words`);
  }
});
