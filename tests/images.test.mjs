import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import sharp from 'sharp';
import {createHash} from 'node:crypto';
import {analyzeSeo} from '../src/lib/seo.js';
const manifest=JSON.parse(readFileSync(new URL('../src/lib/image-manifest.json',import.meta.url)));
test('generated covers have real responsive dimensions and bounded payloads',async()=>{
 assert.equal(new Set(manifest.map(image=>image.name)).size,manifest.length);
 assert.equal(manifest.filter(image=>image.kind === "map").length,0);
 assert.equal(manifest.filter(image=>image.replacesLegacyVisual).length,171);
 for(const image of manifest){assert.ok(image.alt.length>30);assert.equal(image.width,1200);assert.deepEqual(image.variants.map(v=>v.width),[400,800,1200]);
 for(const variant of [...image.variants,...(image.avif||[])]){const path=new URL(`../public${variant.url}`,import.meta.url);const m=await sharp(readFileSync(path)).metadata();assert.equal(m.width,variant.width);assert.ok(statSync(path).size<200000,`${variant.url} is too large`);}}
});
test('original homepage artwork and approved accessible hero stay byte-identical',()=>{
 const protectedFiles={
  'public/brand/hero.webp':'2b8d1ad32a0067f608e014544d9d384cb7a6308833e252b1775d6cf411cbed0e',
  'public/brand/hero-320.webp':'dad63c68154b4c8b0a535706dad4c80b781f88d052321b5cd527002eec6ba173',
  // AVIF copies of the same artwork (26 Oct 2026): half the bytes for the mobile LCP image.
  'public/brand/hero.avif':'8e0ea0d7038dab326d28ff67d695a8e703a305da09a6beae6f2bdf14e695abae',
  'public/brand/hero-320.avif':'597cc2b4a571708eb5b3a930fc3405404e4fc2c6169a8e20de464187a1d09414',
  'public/brand/logo-160.webp':'8a7e6365d2653d25343039a39980301960d86a199d383b778795c4adc9e9a4a0',
  'src/components/site/hero.jsx':'b8e48571cdb936baf3ccd33e534f8864c2987b98f306fc30d38cd37edcf8aa68'
 };
 for(const [file,hash] of Object.entries(protectedFiles))assert.equal(createHash('sha256').update(readFileSync(new URL(`../${file}`,import.meta.url))).digest('hex'),hash,file);
});
test('every regional CMS cover resolves to a unique learning scene with matching alternative text',()=>{
 const regional=manifest.filter(image=>image.name.startsWith('map-'));
 assert.equal(regional.length,165);
 assert.equal(new Set(regional.map(image=>image.url)).size,165);
 for(const image of regional){
  assert.match(image.url,/\/oqc-learning-/);
  assert.doesNotMatch(image.alt,/\bmap\b|outline|coordinates/i);
  assert.equal(image.kind,'photo');
  assert.equal(image.avif.length,3);
  assert.ok(image.previous_urls.some(url=>url.includes('map-')&&url.startsWith('https://')),image.name);
 }
 const aliases=manifest.flatMap(image=>[image.url,image.storage_url,...(image.previous_urls||[])].filter(Boolean).map(url=>[url,image.name]));
 const owners=new Map();for(const [url,name]of aliases){assert.ok(!owners.has(url)||owners.get(url)===name,`Ambiguous alias ${url}`);owners.set(url,name);}
});
test('all course, blog and location fallback covers resolve to registered generated assets',()=>{
 const seed=JSON.parse(readFileSync(new URL('../src/lib/seed-content.json',import.meta.url)));
 const covers=[...seed.courses,...seed.posts,...seed.pages.filter(p=>p.slug==='about'||/^(locations-|learning-)/.test(p.slug))];
 assert.equal(new Set(covers.map(row=>row.cover_url)).size,covers.length,'Distinct content needs distinct covers');
 for(const row of covers){assert.ok(manifest.some(m=>m.storage_url===row.cover_url),row.slug);assert.ok(row.cover_alt.length>30,row.slug);}
});
test('CMS SEO audit catches a cover without descriptive alt text',()=>{
 assert.equal(analyzeSeo({cover_url:'/test.webp'}).checks.find(c=>c.id==='alt').pass,false);
 assert.equal(analyzeSeo({cover_url:'/test.webp',cover_alt:'A learner studying a workbook'}).checks.find(c=>c.id==='alt').pass,true);
});
