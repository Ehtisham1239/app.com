import {test} from 'node:test';
import assert from 'node:assert/strict';
import robotsMetadata from '../src/app/robots.js';
const metadata=robotsMetadata();
// robots.js returns one rule group per user agent (all crawlers plus an explicit PerplexityBot group).
const groups=[metadata.rules].flat();
const toList=v=>[v??[]].flat();
test('public robots file permits learning pages and excludes staff and API routes for every crawler group',()=>{
 assert.ok(groups.some(g=>toList(g.userAgent).includes('*')),'a catch-all group exists');
 for(const group of groups){
  const rules=[...toList(group.allow).map(path=>({allow:true,path})),...toList(group.disallow).map(path=>({allow:false,path}))];
  const allowed=path=>rules.filter(r=>path.startsWith(r.path)).sort((a,b)=>b.path.length-a.path.length||Number(b.allow)-Number(a.allow))[0]?.allow??true;
  for(const path of ['/','/courses','/blog','/locations/united-kingdom/london','/free-trial'])assert.equal(allowed(path),true,`${group.userAgent} ${path}`);
  for(const path of ['/admin','/admin/login','/auth/callback','/api/private','/parents'])assert.equal(allowed(path),false,`${group.userAgent} ${path}`);
 }
 assert.equal(new URL(metadata.sitemap).pathname,'/sitemap.xml');
});
