// Production import/review components against a synthetic PostgREST-shaped
// adapter with the real 1,000-row response cap. No auth/database/network writes.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFileSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { build } from 'esbuild';
import { chromium } from 'playwright';

const output = process.argv[2] || 'artifacts/results-admin';
mkdirSync(output,{recursive:true});
const report={checks:[],errors:[],writes:0,scope:'Actual React import/review screens; 1,205 synthetic rows; capped in-memory PostgREST adapter, no external services'};
const fixture=`import React,{Suspense} from 'react';import {createRoot} from 'react-dom/client';
import ImportPage from './src/app/admin/(panel)/results/import/page.jsx';
import BatchPage from './src/app/admin/(panel)/results/batches/[id]/page.jsx';
const assessment={id:'assessment',code:'TERM1-2026',title:'Synthetic assessment',total_marks:100,grade_bands:[],period_label:'Term 1',assessment_date:'2026-10-30'};
const batch={id:'batch',assessments:assessment,created_by:'other-staff',status:'needs_review',original_filename:'example.csv',created_at:'2026-10-30',total_rows:1205,valid_rows:1204,invalid_rows:1,duplicate_rows:0,excluded_rows:0};
const all=Array.from({length:1205},(_,i)=>({id:'row-'+(i+1),row_number:i+1,student_code:'OQC-'+String(i+1).padStart(5,'0'),student_name:'Example '+(i+1),marks_text:'80',grade:'',teacher_remarks:'',marks_obtained:80,errors:i===1204?['Example invalid row']:[],status:i===1204?'invalid':'valid'}));
window.fixtureClient={auth:{getUser:async()=>({data:{user:{id:'staff'}}})},from(table){let filters=[],start=0,end=999,limit=1000;const api={select(){return api},eq(k,v){filters.push([k,v]);return api},order(){return api},limit(n){limit=Math.min(n,1000);return api},range(a,b){start=a;end=b;return api},maybeSingle(){return api},single(){return api},then(resolve){let data=table==='assessments'?[assessment]:table==='result_import_batches'?batch:all;let count;if(Array.isArray(data)){data=data.filter(row=>filters.every(([k,v])=>k==='batch_id'||k==='status'&&table==='assessments'||row[k]===v));count=data.length;data=data.slice(start,Math.min(end+1,start+limit));}return Promise.resolve({data,error:null,count}).then(resolve)}};return api},rpc(){window.fixtureWrites++;throw Error('Unexpected fixture mutation')}};
window.fixtureWrites=0;const params=Promise.resolve({id:'batch'});
createRoot(document.querySelector('#app')).render(<div className="admin-root p-5"><Suspense fallback={<p>Loading fixture</p>}>{location.pathname.includes('batch')?<BatchPage params={params}/>:<ImportPage/>}</Suspense></div>);`;
const code=(await build({stdin:{contents:fixture,resolveDir:process.cwd(),loader:'jsx'},jsx:'automatic',bundle:true,write:false,format:'iife',define:{'process.env.NODE_ENV':'"production"'},plugins:[{name:'ui-fixture',setup(builder){
  builder.onResolve({filter:/^next\/link$|^next\/navigation$|^@\/lib\/admin\/access$|^@\/lib\/supabase\/browser$|^sonner$/},args=>({path:args.path,namespace:'fixture'}));
  builder.onLoad({filter:/.*/,namespace:'fixture'},args=>({resolveDir:process.cwd(),contents:args.path==='next/link'?'import React from "react";export default function Link(props){return React.createElement("a",props)}':args.path==='next/navigation'?'export const useRouter=()=>({push(){},refresh(){},replace(){}});export const usePathname=()=>"/admin/results";':args.path==='@/lib/admin/access'?'export const useAccess=()=>({can:()=>true});':args.path==='sonner'?'export const toast={error(){},success(){}};':'export const getBrowserClient=()=>window.fixtureClient;'}));
  builder.onResolve({filter:/^@\//},args=>{const stem=resolve('src',args.path.slice(2));for(const ext of ['','.js','.jsx']){try{readFileSync(stem+ext);return{path:stem+ext}}catch{/* next extension */}}});
}}]})).outputFiles[0].text;
const styles=readdirSync('.next/static/chunks').filter(n=>n.endsWith('.css')).map(n=>`/_next/static/chunks/${n}`);
const server=createServer((req,res)=>{try{const path=new URL(req.url,'http://localhost').pathname;if(path==='/fixture.js'){res.setHeader('content-type','text/javascript');res.end(code);return;}if(path.startsWith('/_next/static/')||path.startsWith('/brand/')){if(path.includes('..'))throw Error('Bad path');res.setHeader('content-type',path.endsWith('.css')?'text/css':path.endsWith('.woff2')?'font/woff2':'image/png');res.end(readFileSync(path.startsWith('/_next/')?'.next/'+path.slice(7):'public'+path));return;}res.setHeader('content-type','text/html');res.end(`<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1">${styles.map(p=>`<link rel="stylesheet" href="${p}">`).join('')}<div id="app"></div><script src="/fixture.js"></script>`);}catch(e){res.statusCode=500;res.end(e.message);}});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}});page.on('pageerror',e=>report.errors.push(e.message));
  const base=`http://127.0.0.1:${server.address().port}`;
  await page.goto(base+'/import');await page.locator('select').first().selectOption('assessment');
  const csv='student_code,marks_obtained\n'+Array.from({length:1205},(_,i)=>'OQC-'+String(i+1).padStart(5,'0')+',80').join('\n');
  await page.locator('input[type=file]').setInputFiles({name:'large.csv',mimeType:'text/csv',buffer:Buffer.from(csv)});
  await page.getByText('1205 rows · 0 flagged',{exact:true}).waitFor();
  for(let i=0;i<10;i++)await page.getByRole('button',{name:'Next page',exact:true}).click();
  await page.getByRole('cell',{name:'OQC-01001',exact:true}).waitFor();
  report.checks.push('preview can inspect row 1,001 of a 1,205-row CSV before saving');
  await page.locator('input[type=file]').setInputFiles({name:'wrong-total.csv',mimeType:'text/csv',buffer:Buffer.from('student_code,marks_obtained,total_marks\nOQC-00001,80,200')});
  await page.getByText(/different maximum mark/).waitFor();assert.equal(await page.getByRole('button',{name:'Upload for review',exact:true}).isDisabled(),true);
  report.checks.push('wrong maximum mark cannot be uploaded');
  await page.goto(base+'/batch');await page.getByRole('button',{name:'Next page',exact:true}).waitFor();
  for(let i=0;i<10;i++){await page.getByRole('button',{name:'Next page',exact:true}).click();await page.getByRole('cell',{name:String((i+1)*100+1),exact:true}).waitFor();}
  await page.getByText('OQC-01001',{exact:true}).waitFor();
  await page.getByRole('tab',{name:/Needs fixing/}).click();await page.getByText('Example invalid row',{exact:true}).waitFor();
  await page.getByText('OQC-01205',{exact:true}).waitFor();
  report.checks.push('saved review paginates beyond the 1,000-row cap and filters the invalid row at 1,205');
  report.writes=await page.evaluate(()=>window.fixtureWrites);assert.equal(report.writes,0);assert.deepEqual(report.errors,[]);
}finally{await browser.close();server.closeAllConnections();await new Promise(done=>server.close(done));writeFileSync(`${output}/summary.json`,JSON.stringify(report,null,2));}
console.log(JSON.stringify(report,null,2));
