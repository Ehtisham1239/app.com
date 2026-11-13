import {test} from 'node:test';
import assert from 'node:assert/strict';
import {permitsMutation} from '../src/lib/request-origin.js';
test('CMS revalidation rejects cross-origin browser requests',()=>{
 const url='https://college.example/api/revalidate';
 assert.equal(permitsMutation(new Request(url,{headers:{origin:'https://other.example'}})),false);
 assert.equal(permitsMutation(new Request(url,{headers:{origin:'null'}})),false);
 assert.equal(permitsMutation(new Request(url,{headers:{'sec-fetch-site':'cross-site'}})),false);
 assert.equal(permitsMutation(new Request(url,{headers:{origin:'https://college.example'}})),true);
 assert.equal(permitsMutation(new Request(url)),true);
});

test('behind a reverse proxy the public host is accepted, other sites still are not', () => {
 const internal = 'http://localhost:3000/api/usa-lead-notification';
 const site = 'https://www.onlinequrancollege.com';
 const req = (headers) => new Request(internal, { method: 'POST', headers });
 assert.equal(permitsMutation(req({ origin: site, host: 'www.onlinequrancollege.com', 'sec-fetch-site': 'same-origin' })), true, 'Host header (Hostinger)');
 assert.equal(permitsMutation(req({ origin: site, 'x-forwarded-host': 'www.onlinequrancollege.com', host: 'localhost:3000' })), true, 'X-Forwarded-Host');
 assert.equal(permitsMutation(req({ origin: 'https://evil.example', host: 'www.onlinequrancollege.com' })), false);
 assert.equal(permitsMutation(req({ origin: 'https://onlinequrancollege.com.evil.example', host: 'www.onlinequrancollege.com' })), false);
 assert.equal(permitsMutation(req({ origin: site, host: 'www.onlinequrancollege.com', 'sec-fetch-site': 'cross-site' })), false);
 assert.equal(permitsMutation(req({ origin: 'null', host: 'www.onlinequrancollege.com' })), false);
});
