import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const base=(process.argv[2]||'http://localhost:3012').replace(/\/$/,'');
const report={base,views:[],faq:false,pricing:false,about:false,articleNavigation:false,logosRemoved:true,errors:[],vendor:'stubbed; no leads or chat messages submitted'};
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
try{for(const width of [320,390,1440]){
 const page=await browser.newPage({viewport:{width,height:1000}});
 page.on('pageerror',e=>report.errors.push(e.message));
 await page.route('https://**/*',async route=>{const req=route.request();if(req.url().includes('app.hatchium.ai'))return route.fulfill({contentType:'text/javascript',body:'/* stub */'});const r=await fetch(req.url(),{headers:await req.allHeaders(),redirect:'manual'});const h=Object.fromEntries(r.headers);delete h['content-length'];delete h['content-encoding'];await route.fulfill({status:r.status,headers:h,body:Buffer.from(await r.arrayBuffer())});});
 for(const path of ['/courses','/blog','/learn','/faq','/pricing','/locations','/about','/blog/importance-of-reciting-quran-with-tajweed']){
  await page.goto(base+path,{waitUntil:'networkidle'});
  assert.equal(await page.locator('main h1').count(),1,path);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${path} ${width}`);
  assert.equal(await page.locator('main .visual-logo').count(),0);
  const images=page.locator('main picture img');
  for(const img of await images.all()){await img.scrollIntoViewIfNeeded();await img.evaluate(i=>i.decode());const data=await img.evaluate(i=>({src:i.currentSrc,alt:i.alt}));assert.match(data.src,/-r2-/);assert.ok(data.alt.length>20);}
  if(path==='/faq'){assert.equal(await page.getByText(/Market:/).count(),0);const summary=page.locator('.faq-card summary').first();await summary.focus();await page.keyboard.press('Enter');assert.equal(await summary.evaluate(e=>e.parentElement.open),true);report.faq=true;}
  if(path==='/pricing'){const currency=page.getByLabel('Display currency').first();await currency.selectOption('GBP');await page.waitForFunction(()=>{const t=document.querySelector('.pricing-card')?.textContent||'';return t.includes('£')||t.includes('Ask for the fee in GBP');});assert.equal(await currency.inputValue(),'GBP');report.pricing=true;}
  if(path==='/about'){assert.equal(await page.locator('article.editorial-card').count(),4);assert.ok(await page.getByRole('heading',{name:'Our mission',exact:true}).count());report.about=true;}
  if(path.startsWith('/blog/')){const links=page.getByRole('navigation',{name:'In this article'}).getByRole('link');assert.ok(await links.count()>2);for(const link of await links.all()){const href=await link.getAttribute('href');assert.equal(await page.locator(href).count(),1);}const schemas=await page.locator('script[type="application/ld+json"]').evaluateAll(nodes=>nodes.map(n=>JSON.parse(n.textContent)));const article=schemas.find(s=>s['@type']==='BlogPosting');assert.ok(article.wordCount>400);assert.match(article.image,/-r2-/);assert.ok(schemas.some(s=>s['@type']==='BreadcrumbList'));report.articleNavigation=true;}
  report.views.push({path,width,images:await images.count()});
  if([390,1440].includes(width)&&['/courses','/pricing','/about','/faq','/blog','/learn','/locations'].includes(path)){await page.locator('main').scrollIntoViewIfNeeded();if(path==='/courses')await page.locator('.course-card').first().scrollIntoViewIfNeeded();await page.screenshot({path:`artifacts/redesign-${path.slice(1)}-${width}.png`});}
 }
 await page.close();
}}finally{await browser.close();}
assert.deepEqual(report.errors,[]);console.log(JSON.stringify(report,null,2));
