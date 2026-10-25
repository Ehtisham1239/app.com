// Read-only homepage/country navigation. No enquiries or staff actions.
import {chromium,devices} from 'playwright';
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
const base=(process.argv[2]||'http://localhost:3012').replace(/\/$/,''),out=process.argv[3]||'artifacts/home-routing/browser';mkdirSync(out,{recursive:true});
const report={base,cases:[],browserErrors:[],submittedForms:0,scope:'Chromium desktop/mobile emulation; chat stubbed; owned-site GET/HEAD only; no form submissions'};
for(const entry of [{name:'desktop-fresh',viewport:{width:1440,height:1000},country:'GB'},{name:'desktop-returning',viewport:{width:1440,height:1000},country:'US',seen:true},{name:'mobile-fresh',...devices['Pixel 5'],country:'AU'}]){
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:process.env.CHROMIUM_ARGS_JSON?JSON.parse(process.env.CHROMIUM_ARGS_JSON):['--no-sandbox','--disable-dev-shm-usage']});
 try{
  const context=await browser.newContext({...entry,extraHTTPHeaders:base.startsWith('http://localhost')?{'x-vercel-ip-country':entry.country}:{}});
  if(entry.seen)await context.addCookies([{name:'oqc_region_seen',value:'1',url:base}]);
  const page=await context.newPage();page.on('pageerror',e=>report.browserErrors.push({case:entry.name,error:e.message}));
  await page.route('**/*',async route=>{
   const req=route.request();if(req.url().startsWith('https://app.hatchium.ai/'))return route.fulfill({contentType:'application/javascript',body:'/* release check stub */'});
   if(/submit_trial_application|submit_contact_message/.test(req.url())){report.submittedForms++;return route.abort();}
   if(base.startsWith('https://')&&new URL(req.url()).origin===new URL(base).origin){assert.ok(['GET','HEAD'].includes(req.method()));const r=await fetch(req.url(),{method:req.method(),headers:await req.allHeaders(),redirect:'manual',signal:AbortSignal.timeout(30000)});const headers=Object.fromEntries(r.headers);delete headers['content-length'];delete headers['content-encoding'];return route.fulfill({status:r.status,headers,body:Buffer.from(await r.arrayBuffer())});}
   return route.continue();
  });
  const response=await page.goto(base+'/',{waitUntil:'load'});assert.equal(response.status(),200);assert.equal(new URL(page.url()).pathname,'/');await page.locator('.home-hero h1').waitFor();assert.equal(await page.locator('#c-name,#t-name').count(),0);
  {const markets=page.getByRole('navigation',{name:'Priority study locations'});assert.equal(await markets.getByRole('link').count(),4);for(const slug of ['united-states','united-kingdom','canada','australia'])assert.equal(await markets.locator('a[href="/locations/'+slug+'"]').count(),1);}
  await page.locator('main a[href="/locations/united-states"]').first().click();await page.waitForURL('**/locations/united-states');await page.getByRole('heading',{level:1}).filter({hasText:'United States'}).waitFor();
  await page.locator('.site-header a[href="/"]').first().click();await page.waitForURL(url=>url.pathname==='/');await page.locator('.home-hero h1').waitFor();
  await page.reload({waitUntil:'load'});assert.equal(new URL(page.url()).pathname,'/');await page.locator('.home-hero h1').waitFor();assert.equal(await page.locator('#c-name,#t-name').count(),0);
  {const markets=page.getByRole('navigation',{name:'Priority study locations'});assert.equal(await markets.getByRole('link').count(),4);for(const slug of ['united-states','united-kingdom','canada','australia'])assert.equal(await markets.locator('a[href="/locations/'+slug+'"]').count(),1);}
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.screenshot({path:`${out}/${entry.name}-home.png`});
  for(const [slug,name]of [['united-kingdom','United Kingdom'],['australia','Australia']]){const r=await page.goto(base+'/locations/'+slug,{waitUntil:'load'});assert.equal(r.status(),200);assert.equal(new URL(page.url()).pathname,'/locations/'+slug);await page.getByRole('heading',{level:1}).filter({hasText:name}).waitFor();}
  report.cases.push({case:entry.name,homeRemainsHome:true,explicitCountryNavigation:true,logoReturnsHome:true,reloadRemainsHome:true,countryPagesSeparate:true});console.log('PASS '+entry.name);
 }finally{await browser.close();}
}
assert.deepEqual(report.browserErrors,[]);assert.equal(report.submittedForms,0);writeFileSync(out+'/summary.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
