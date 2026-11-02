import {test} from 'node:test';
import assert from 'node:assert/strict';
import robotsMetadata from '../src/app/robots.js';
const metadata=robotsMetadata();
const groups=Array.isArray(metadata.rules)?metadata.rules:[metadata.rules];
const robots=`${groups.map(group=>[
  `User-agent: ${group.userAgent}`,
  ...(Array.isArray(group.allow)?group.allow:[group.allow]).filter(Boolean).map(path=>`Allow: ${path}`),
  ...(Array.isArray(group.disallow)?group.disallow:[group.disallow]).filter(Boolean).map(path=>`Disallow: ${path}`),
].join('\n')).join('\n\n')}\nSitemap: ${metadata.sitemap}`;
test('public robots file permits learning pages and excludes staff and API routes',()=>{
 const rules=[...robots.matchAll(/^(Allow|Disallow):\s*(\S+)/gm)].map(m=>({allow:m[1]==='Allow',path:m[2]}));
 const allowed=path=>rules.filter(r=>path.startsWith(r.path)).sort((a,b)=>b.path.length-a.path.length||Number(b.allow)-Number(a.allow))[0]?.allow??true;
 for(const path of ['/','/courses','/blog','/locations/united-kingdom/london','/free-trial'])assert.equal(allowed(path),true,path);
 for(const path of ['/admin','/admin/login','/auth/callback','/api/private'])assert.equal(allowed(path),false,path);
 assert.match(robots,/^User-agent: \*$/m);assert.equal(new URL(metadata.sitemap).pathname,'/sitemap.xml');
});
