// Read-only routing verification. Local country headers simulate edge geolocation;
// live headers do not establish the physical location of a visitor.
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import nextConfig from '../next.config.mjs';
const base=(process.argv[2]||'http://localhost:3012').replace(/\/$/,''),out=process.argv[3]||'artifacts/redirects';mkdirSync(out,{recursive:true});
const report={base,homepageChecks:0,redirects:0,destinations:0,missingRoutes:0,failures:[],notes:'Read-only. Header/cookie/UA matrix verifies routing, not physical-country access. No form submissions.'};
async function get(path,options={}){return fetch(base+path,{redirect:'manual',signal:AbortSignal.timeout(30000),...options});}
const cases=[];
for(const country of ['US','GB','AU','CA','FR','DE','XX'])for(const ua of ['Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome','Mozilla/5.0 (iPhone; CPU iPhone OS 18_0) Mobile Safari','OQC-Release-AuditBot/1.0'])cases.push({country,ua});
for(const item of cases){for(const cookie of ['', 'oqc_region_seen=1']){
 const r=await get('/?utm_source=redirect-check',{headers:{'x-vercel-ip-country':item.country,'user-agent':item.ua,...(cookie?{cookie}:{})}});
 assert.equal(r.status,200,JSON.stringify(item));assert.equal(r.headers.get('location'),null);assert.equal((r.headers.get('set-cookie')||'').includes('oqc_region_seen'),false);const html=await r.text();assert.ok(html.includes('class="home-hero '));const canonical=html.match(/rel="canonical" href="([^"]+)"/)?.[1];assert.ok(canonical);assert.equal(new URL(canonical).pathname,'/');report.homepageChecks++;
}}
for(const path of ['/','/?view=global','/?view=global&utm_campaign=home-check']){const r=await get(path,{method:'HEAD',headers:{'x-vercel-ip-country':'US'}});assert.equal(r.status,200);assert.equal(r.headers.get('location'),null);report.homepageChecks++;}
const rules=await nextConfig.redirects(),destinations=new Set();let cursor=0;
await Promise.all(Array.from({length:3},async()=>{while(cursor<rules.length){const rule=rules[cursor++];try{
 const r=await get(rule.source+'?utm_source=redirect-check&utm_campaign=country%20selection&gclid=sample-123');assert.equal(r.status,rule.permanent?308:307,rule.source);
 const location=r.headers.get('location');assert.ok(location&&!location.includes(','),'One Location target');const target=new URL(location,base);assert.equal(target.origin,new URL(base).origin);assert.equal(target.pathname,rule.destination);assert.equal(target.searchParams.get('utm_source'),'redirect-check');assert.equal(target.searchParams.get('utm_campaign'),'country selection');assert.equal(target.searchParams.get('gclid'),'sample-123');destinations.add(rule.destination);report.redirects++;await r.body?.cancel();
 }catch(e){report.failures.push({source:rule.source,error:e.message});}}}));
cursor=0;const targets=[...destinations];
await Promise.all(Array.from({length:3},async()=>{while(cursor<targets.length){const path=targets[cursor++];try{const r=await get(path);assert.equal(r.status,200,path);assert.equal(r.headers.get('location'),null,path+' must end after one redirect');report.destinations++;await r.body?.cancel();}catch(e){report.failures.push({destination:path,error:e.message});}}}));
for(const path of ['/locations/not-a-country','/locations/united-states/not-a-city','/not-a-known-page-routing-check']){const r=await get(path);assert.equal(r.status,404,path);assert.equal(r.headers.get('location'),null);await r.body?.cancel();report.missingRoutes++;}
const admin=await get('/admin');assert.equal(admin.status,307);assert.equal(new URL(admin.headers.get('location'),base).pathname,'/admin/login');await admin.body?.cancel();report.adminProtected=true;
writeFileSync(out+'/summary.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));assert.equal(report.failures.length,0);
