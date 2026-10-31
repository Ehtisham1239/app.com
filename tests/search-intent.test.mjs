import {test} from 'node:test';import assert from 'node:assert/strict';import {existsSync,readFileSync} from 'node:fs';
import {SEARCH_INTENTS} from '../src/lib/search-intent.js';import {courseVisual} from '../src/lib/card-presentation.js';
const seed=JSON.parse(readFileSync(new URL('../src/lib/seed-content.json',import.meta.url)));
test('site-wide search themes have separate principal routes and qualified evidence',()=>{
 const rows=Object.entries(SEARCH_INTENTS);assert.equal(rows.length,22);assert.equal(new Set(rows.map(([,r])=>r.phrase)).size,22);
 const map=JSON.parse(readFileSync(new URL('../content/seo-intent-map.json',import.meta.url))).competitorResearch;assert.match(map.evidence,/not confirmed top-ten rankings/);assert.equal(map.themes.length,10);
 for(const [path,r]of rows){assert.ok(path.startsWith('/'));assert.ok(r.heading&&r.intro);assert.ok((r.heading+' '+r.intro).toLowerCase().includes(r.phrase.toLowerCase()));}
});
test('every supported course retains a real image even when CMS cover fields are blank',()=>{
 for(const course of seed.courses){const visual=courseVisual({...course,cover_url:' ',cover_alt:' '});assert.ok(existsSync(new URL('../public'+visual.src,import.meta.url)),course.slug);assert.ok(visual.alt.length>25);}
 const custom=courseVisual({slug:'custom',cover_url:'/custom.webp',cover_alt:'A custom approved course illustration'});assert.equal(custom.src,'/custom.webp');assert.equal(custom.alt,'A custom approved course illustration');
});
