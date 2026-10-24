import {chromium,devices} from 'playwright';
import assert from 'node:assert/strict';
const base=(process.argv[2]||'http://localhost:3012').replace(/\/$/,'');
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const report={base,cases:[],transport:'Chat stubbed; no form submitted; country header simulation is local only'};
try {for(const device of [{name:'iPhone portrait',...devices['iPhone 13']},{name:'Android portrait',...devices['Pixel 5']},{name:'iPhone landscape',...devices['iPhone 13'],viewport:{width:844,height:390}},{name:'Tablet',...devices['iPad Mini']}]){
 const context=await browser.newContext({...device,extraHTTPHeaders:base.startsWith('http://localhost')?{'x-vercel-ip-country':'US'}:{}});
 const page=await context.newPage();
 await page.route('https://**/*',async route=>{const req=route.request();if(req.url().includes('app.hatchium.ai'))return route.fulfill({contentType:'text/javascript',body:'/* stub */'});const r=await fetch(req.url(),{headers:await req.allHeaders(),redirect:'manual'});const h=Object.fromEntries(r.headers);delete h['content-length'];delete h['content-encoding'];await route.fulfill({status:r.status,headers:h,body:Buffer.from(await r.arrayBuffer())});});
 const r=await page.goto(base+'/',{waitUntil:'networkidle'});assert.equal(r.status(),200);assert.equal(new URL(page.url()).pathname,'/');
 const photo=page.locator('.hero-portrait img');await photo.evaluate(img=>img.decode());
 const rect=await photo.boundingBox(),heading=await page.locator('main h1').boundingBox();
 assert.ok(rect.y<await page.evaluate(()=>innerHeight),device.name+' photo not visible on entry');assert.ok(rect.y<heading.y,device.name+' photo should precede heading');assert.equal(await page.evaluate(()=>scrollY),0);assert.equal(await page.locator('#t-name').count(),0);
 await page.locator('.hero-actions a[href="/free-trial"]').click();await page.waitForURL('**/free-trial');await page.locator('#t-name').waitFor();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 report.cases.push({device:device.name,photoFirst:true,trialLink:true});await context.close();
}}finally{await browser.close();}
if(base.startsWith('http://localhost')){const r=await fetch(base+'/',{redirect:'manual',headers:{'x-vercel-ip-country':'US','user-agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0'}});assert.equal(r.status,307,'Run local server with VERCEL=1 to simulate trusted country headers');assert.ok(r.headers.get('location').endsWith('/locations/united-states'));report.desktopSimulation=true;}
console.log(JSON.stringify(report,null,2));
