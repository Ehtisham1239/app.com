import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const robots=readFileSync(new URL('../src/app/robots.txt',import.meta.url),'utf8');
test('public robots file permits learning pages and excludes staff and API routes',()=>{
 const rules=[...robots.matchAll(/^(Allow|Disallow):\s*(\S+)/gm)].map(m=>({allow:m[1]==='Allow',path:m[2]}));
 const allowed=path=>rules.filter(r=>path.startsWith(r.path)).sort((a,b)=>b.path.length-a.path.length||Number(b.allow)-Number(a.allow))[0]?.allow??true;
 for(const path of ['/','/courses','/blog','/locations/united-kingdom/london','/free-trial'])assert.equal(allowed(path),true,path);
 for(const path of ['/admin','/admin/login','/auth/callback','/api/private'])assert.equal(allowed(path),false,path);
 assert.match(robots,/^User-agent: \*$/m);assert.match(robots,/^Sitemap: https:\/\/project-umber-three-93\.vercel\.app\/sitemap\.xml$/m);
});
