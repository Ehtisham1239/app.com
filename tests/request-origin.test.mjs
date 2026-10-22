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
