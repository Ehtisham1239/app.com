import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {LOCATIONS,locationPath} from '../src/lib/locations.js';
const base=(process.argv[2]||'http://localhost:3012').replace(/\/$/,'');
const manifest=JSON.parse(readFileSync(new URL('../src/lib/image-manifest.json',import.meta.url)));
const report={base,assets:0,locations:0,pages:[],vendor:'stubbed for deterministic visual checks'};
for(const m of manifest)for(const v of m.variants){const r=await fetch(base+v.url);assert.equal(r.status,200,v.url);assert.match(r.headers.get('content-type'),/image\/webp/);assert.equal((await r.arrayBuffer()).byteLength,v.bytes);report.assets++;}
const paths=LOCATIONS.flatMap(c=>[locationPath(c),...c.cities.map(city=>locationPath(c,city))]);
let index=0;await Promise.all(Array.from({length:6},async()=>{while(index<paths.length){const path=paths[index++];const r=await fetch(base+path);assert.equal(r.status,200,path);const html=await r.text();assert.match(html,/srcSet="\/images\/learning\//,path);assert.match(html,/property="og:image:alt"/,path);assert.equal((html.match(/<h1[\s>]/g)||[]).length,1,path);report.locations++;}}));
const sitemap=await(await fetch(base+'/sitemap.xml')).text();assert.match(sitemap,/<image:loc>/);
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try{for(const width of [390,1440]){const page=await browser.newPage({viewport:{width,height:1000},deviceScaleFactor:1});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>{window.__shifts=0;new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)window.__shifts+=e.value;}).observe({type:'layout-shift',buffered:true});});
await page.route('https://**/*',async route=>{const req=route.request();if(req.url().includes('app.hatchium.ai'))return route.fulfill({contentType:'application/javascript',body:'/* vendor stub */'});const r=await fetch(req.url(),{method:req.method(),headers:await req.allHeaders(),redirect:'manual'});const headers=Object.fromEntries(r.headers);delete headers['content-length'];delete headers['content-encoding'];await route.fulfill({status:r.status,headers,body:Buffer.from(await r.arrayBuffer())});});
for(const path of ['/locations/united-states','/locations/australia','/courses/noorani-qaida','/blog/choose-online-quran-teacher-usa','/learn/quran-for-kids']){await page.goto(base+path,{waitUntil:'networkidle'});const cover=page.locator('img[srcset^="/images/learning/"]').first();await cover.scrollIntoViewIfNeeded();await cover.evaluate(img=>img.decode());const data=await cover.evaluate(img=>({alt:img.alt,naturalWidth:img.naturalWidth,source:new URL(img.currentSrc).pathname}));assert.ok(data.alt.length>25);assert.ok(data.naturalWidth>0);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,path);const layoutShift=await page.evaluate(()=>window.__shifts);assert.ok(layoutShift<0.1,`${path}: layout shift ${layoutShift}`);report.pages.push({path,width,...data,layoutShift});}
assert.deepEqual(errors,[]);await page.close();}}finally{await browser.close();}
console.log(JSON.stringify(report,null,2));
