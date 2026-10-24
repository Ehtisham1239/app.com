// Mobile entry, explicit enquiry activation and navigation. Never submits an enquiry.
import {chromium,devices} from 'playwright';
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
const base=(process.argv[2]||'http://localhost:3012').replace(/\/$/,''),out=process.argv[3]||'artifacts/mobile-entry';mkdirSync(out,{recursive:true});
const launch=()=>chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:process.env.CHROMIUM_ARGS_JSON?JSON.parse(process.env.CHROMIUM_ARGS_JSON):['--no-sandbox','--disable-dev-shm-usage']});
let browser;
const report={base,cases:[],errors:[],submittedForms:0,transport:'Owned-site read requests only; chat stubbed; no form submitted'};
const local=base.startsWith('http://localhost');
try {
 for(const device of [{name:'iPhone portrait',...devices['iPhone 13']},{name:'Android portrait',...devices['Pixel 5']},{name:'iPhone landscape',...devices['iPhone 13'],viewport:{width:844,height:390}},{name:'Tablet',...devices['iPad Mini']}]){
  browser=await launch();
  const context=await browser.newContext({...device,extraHTTPHeaders:local?{'x-vercel-ip-country':'US'}:{}}),page=await context.newPage();
  page.on('pageerror',e=>report.errors.push({device:device.name,error:e.message}));
  await page.route('https://app.hatchium.ai/**',route=>route.fulfill({contentType:'text/javascript',body:'/* release check stub */'}));
  await page.route('**/*',async route=>{
   const req=route.request();if(/submit_trial_application|submit_contact_message/.test(req.url())){report.submittedForms++;return route.abort();}
   if(!local&&req.url().startsWith(base+'/')){assert.ok(['GET','HEAD'].includes(req.method()));const r=await fetch(req.url(),{method:req.method(),headers:await req.allHeaders(),redirect:'manual',signal:AbortSignal.timeout(30000)});const headers=Object.fromEntries(r.headers);delete headers['content-length'];delete headers['content-encoding'];return route.fulfill({status:r.status,headers,body:Buffer.from(await r.arrayBuffer())});}
   return route.fallback();
  });
  const r=await page.goto(base+'/',{waitUntil:'load'});assert.equal(r.status(),200);assert.equal(new URL(page.url()).pathname,'/');
  await page.evaluate(()=>document.fonts.ready);assert.equal(await page.evaluate(()=>scrollY),0);
  assert.equal(await page.locator('#c-name,#t-name').count(),0);assert.ok(await page.locator('main h1').isVisible());
  const h1=await page.locator('main h1').boundingBox();assert.ok(h1.y>=0&&h1.y<device.viewport.height,device.name+' homepage heading on entry');
  assert.equal(await page.evaluate(()=>['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)),false);
  const visual=page.locator('[data-hero-visual] img').first();await visual.evaluate(img=>img.decode());assert.ok((await visual.boundingBox()).y>h1.y,'Home copy should precede image on mobile');
  assert.ok(await page.evaluate(()=>scrollY<=2),'Image decoding must not move the home entry');
  assert.ok((await page.locator('.site-header').boundingBox()).y>=-2,'Home header stays visible');
  await page.screenshot({path:`${out}/${device.name.replaceAll(' ','-')}-home.png`,fullPage:false});
  await page.locator('#contact').scrollIntoViewIfNeeded();assert.equal(await page.locator('#c-name').count(),0,'Scrolling must not mount or focus form');
  await page.getByRole('button',{name:'Open enquiry form',exact:true}).click();await page.locator('#c-name').waitFor();assert.equal(await page.evaluate(()=>document.activeElement.id),'','No field should steal focus on activation');
  await page.goto(base+'/',{waitUntil:'load'});assert.equal(await page.locator('#c-name,#t-name').count(),0);assert.equal(await page.evaluate(()=>scrollY),0);
  await page.reload({waitUntil:'load'});assert.ok(await page.evaluate(()=>scrollY<=2),'Reload remains at the top (two-pixel browser rounding tolerance)');assert.equal(await page.locator('#c-name,#t-name').count(),0);
  await page.locator('.hero-actions a[href="/free-trial"]').click();await page.waitForURL('**/free-trial');await page.locator('#t-name').waitFor();
  const image=await page.locator('[data-hero-visual]').boundingBox(),form=await page.locator('#trial-form').boundingBox();assert.ok(image.y<form.y,'Trial introduction and image precede form');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  report.cases.push({device:device.name,homeFirst:true,noAutomaticForm:true,explicitFormActivation:true,reloadHomeFirst:true,trialIntroductionFirst:true});await context.close();await browser.close();browser=undefined;
 }
 browser=await launch();
 const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage();
 await page.route('https://app.hatchium.ai/**',r=>r.abort());
 if(!local)await page.route(base+'/**',async route=>{const req=route.request();assert.equal(req.method(),'GET');const r=await fetch(req.url(),{headers:await req.allHeaders(),redirect:'manual'});const headers=Object.fromEntries(r.headers);delete headers['content-length'];delete headers['content-encoding'];await route.fulfill({status:r.status,headers,body:Buffer.from(await r.arrayBuffer())});});
 for(const path of ['/courses','/courses/noorani-qaida','/pricing?currency=NOK','/locations/united-kingdom/london','/faq','/contact','/free-trial','/privacy-policy','/blog']){
  await page.goto(base+path,{waitUntil:'load'});await page.locator('[data-hero-visual] img').first().evaluate(img=>img.decode());assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,path);
  if(['/courses/noorani-qaida','/locations/united-kingdom/london','/free-trial'].includes(path))await page.screenshot({path:`${out}/desktop-${path.split('/').at(-1)}.png`,fullPage:true});
  if(path.includes('currency=NOK')){assert.equal(await page.getByLabel('Display currency',{exact:true}).first().inputValue(),'NOK');await page.getByText('Ask for the fee in NOK').first().waitFor();}
 }
 report.desktopTemplates=9;await context.close();assert.deepEqual(report.errors,[]);assert.equal(report.submittedForms,0);
}finally{await browser?.close();}
writeFileSync(out+'/summary.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
