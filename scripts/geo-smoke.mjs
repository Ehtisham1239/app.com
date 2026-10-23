import assert from 'node:assert/strict';
const base=process.argv[2]||'http://localhost:3012';
const report={base,markets:0,manualHome:false,directCourse:false,crawler:false,legacy:false};
for(const [code,slug]of [['GB','united-kingdom'],['US','united-states'],['AU','australia'],['CA','canada'],['FR','france'],['DE','germany']]){const r=await fetch(base+'/?utm_source=geo-check',{headers:{'x-vercel-ip-country':code,'user-agent':'Synthetic browser check'},redirect:'manual'});assert.equal(r.status,307);const dest=new URL(r.headers.get('location'),base);assert.equal(dest.pathname,'/locations/'+slug);assert.equal(dest.searchParams.get('utm_source'),'geo-check');assert.match(r.headers.get('cache-control'),/private.*no-store/);assert.match(r.headers.get('set-cookie'),/oqc_region_seen=1/);report.markets++;}
for(const options of [{url:'/?view=global',headers:{'x-vercel-ip-country':'GB'}},{url:'/',headers:{'x-vercel-ip-country':'GB',cookie:'oqc_region_seen=1'}}])assert.equal((await fetch(base+options.url,{headers:options.headers,redirect:'manual'})).status,200);report.manualHome=true;
assert.equal((await fetch(base+'/courses/noorani-qaida',{headers:{'x-vercel-ip-country':'GB'},redirect:'manual'})).status,200);report.directCourse=true;
assert.equal((await fetch(base+'/',{headers:{'x-vercel-ip-country':'GB','user-agent':'Googlebot'},redirect:'manual'})).status,200);report.crawler=true;
const legacy=await fetch(base+'/online-quran-classes-usa',{redirect:'manual'});assert.equal(legacy.status,308);assert.equal(new URL(legacy.headers.get('location'),base).pathname,'/locations/united-states');report.legacy=true;
console.log(JSON.stringify(report,null,2));
