import {test} from 'node:test';
import assert from 'node:assert/strict';
import config from '../next.config.mjs';
test('URLs carrying the jkit-ajax-request parameter are noindex',async()=>{
 const rules=await config.headers();
 const rule=rules.find(r=>(r.has||[]).some(h=>h.type==='query'&&h.key==='jkit-ajax-request'));
 assert.ok(rule,'rule exists');
 assert.equal(rule.source,'/:path*');
 assert.deepEqual(rule.headers,[{key:'X-Robots-Tag',value:'noindex, nofollow'}]);
});
