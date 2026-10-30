import test from 'node:test';
import assert from 'node:assert/strict';
import { issueCodeChunks } from '../src/lib/results/issue-codes.js';

test('all requested parent codes are retained across small chunks', async()=>{
  const ids=Array.from({length:1205},(_,i)=>String(i));const collected=[];
  const result=await issueCodeChunks({ids,rpc:async(name,args)=>{assert.equal(name,'guardian_issue_codes_chunk');assert.ok(args.p_guardian_ids.length<=20);return{data:args.p_guardian_ids.map(id=>({guardian_id:id,code:'synthetic'}))};},onChunk:chunk=>collected.push(...chunk)});
  assert.equal(result.more,false);assert.equal(collected.length,1205);assert.equal(collected[1204].guardian_id,'1204');
});
test('a later outage retains successful codes and retries only remaining parents', async()=>{
  const ids=Array.from({length:25},(_,i)=>String(i));const collected=[];let calls=0;
  let failure;try{await issueCodeChunks({ids,rpc:async(_,args)=>++calls===1?{data:args.p_guardian_ids.map(id=>({guardian_id:id}))}:{error:{message:'down'}},onChunk:chunk=>collected.push(...chunk)});}catch(error){failure=error;}
  assert.equal(collected.length,20);assert.deepEqual(failure.remainingIds,ids.slice(20));
  await issueCodeChunks({ids:failure.remainingIds,rpc:async(_,args)=>({data:args.p_guardian_ids.map(id=>({guardian_id:id}))}),onChunk:chunk=>collected.push(...chunk)});
  assert.equal(new Set(collected.map(c=>c.guardian_id)).size,25);
});
test('default code issue stops when the database runs out of parents without codes',async()=>{
  let calls=0,count=0;await issueCodeChunks({rpc:async()=>({data:Array.from({length:++calls===1?20:3},()=>({code:'synthetic'}))}),onChunk:chunk=>count+=chunk.length});assert.equal(calls,2);assert.equal(count,23);
});
