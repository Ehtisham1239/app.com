import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import sharp from 'sharp';
import {analyzeSeo} from '../src/lib/seo.js';
const manifest=JSON.parse(readFileSync(new URL('../src/lib/image-manifest.json',import.meta.url)));
test('generated covers have real responsive dimensions and bounded payloads',async()=>{
 assert.equal(manifest.length,7);
 for(const image of manifest){assert.ok(image.alt.length>30);assert.equal(image.width,1200);assert.deepEqual(image.variants.map(v=>v.width),[400,800,1200]);
 for(const variant of image.variants){const path=new URL(`../public${variant.url}`,import.meta.url);const m=await sharp(readFileSync(path)).metadata();assert.equal(m.width,variant.width);assert.ok(statSync(path).size<200000,`${variant.url} is too large`);}}
});
test('all course, blog and location fallback covers resolve to registered generated assets',()=>{
 const seed=JSON.parse(readFileSync(new URL('../src/lib/seed-content.json',import.meta.url)));
 for(const row of [...seed.courses,...seed.posts,...seed.pages.filter(p=>p.slug==='about'||/^(locations-|learning-)/.test(p.slug))]){assert.ok(manifest.some(m=>m.storage_url===row.cover_url),row.slug);assert.ok(row.cover_alt.length>30,row.slug);}
});
test('CMS SEO audit catches a cover without descriptive alt text',()=>{
 assert.equal(analyzeSeo({cover_url:'/test.webp'}).checks.find(c=>c.id==='alt').pass,false);
 assert.equal(analyzeSeo({cover_url:'/test.webp',cover_alt:'A learner studying a workbook'}).checks.find(c=>c.id==='alt').pass,true);
});
