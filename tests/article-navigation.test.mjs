import test from 'node:test';
import assert from 'node:assert/strict';
import {articleNavigation} from '../src/lib/article-navigation.js';
import {cleanHtml} from '../src/lib/sanitize.js';
test('article links have unique stable targets for duplicate headings',()=>{
 const result=articleNavigation('<h2>Practice &amp; review</h2><p>Keep this paragraph.</p><h2>Practice &amp; review</h2>');
 assert.equal(new Set(result.headings.map(h=>h.id)).size,2);
 assert.equal(result.headings[0].title,'Practice & review');
 for(const h of result.headings)assert.ok(result.html.includes(`id="${h.id}"`));
 assert.ok(result.html.includes('<p>Keep this paragraph.</p>'));
});
test('article navigation preserves inline heading markup and supplies nonempty safe IDs',()=>{
 const result=articleNavigation('<h2><em>قرآن</em></h2><h2>???</h2><h3>Subtopic</h3>');
 assert.equal(result.headings.length,2);
 for(const h of result.headings)assert.match(h.id,/^[a-z0-9-]+$/);
 assert.ok(result.html.includes('<em>قرآن</em>'));
 assert.ok(result.html.includes('<h3>Subtopic</h3>'));
});


test("article tables keep captions and header scope inside keyboard-scrollable regions", () => {
  const raw = '<table><caption>Lesson comparison</caption><thead><tr><th scope="col">Plan</th></tr></thead><tbody><tr><td>Monthly</td></tr></tbody></table><table><tr><th scope="invalid">Other</th></tr></table>';
  const { html } = articleNavigation(cleanHtml(raw));
  assert.ok(html.includes('role="region" aria-label="Scrollable table 1" tabindex="0"><table><caption>Lesson comparison</caption>'));
  assert.ok(html.includes('<th scope="col">Plan</th>'));
  assert.ok(html.includes('</table></div><div class="article-table-scroll" role="region" aria-label="Scrollable table 2"'));
  assert.ok(!html.includes('scope="invalid"'));
});
