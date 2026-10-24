import test from 'node:test';
import assert from 'node:assert/strict';
import {articleNavigation} from '../src/lib/article-navigation.js';
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
