// Real results/guardian PostgreSQL functions plus the production React components
// and session route. Local HTTP/Auth adapters only; synthetic records, no live writes.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { build } from 'esbuild';
import { PGlite } from '@electric-sql/pglite';
import { pgcrypto } from '@electric-sql/pglite/contrib/pgcrypto';
import { chromium } from 'playwright';
import { readResultsFile, toImportRows } from '../src/lib/results/import.js';

const require = createRequire(import.meta.url);
const out = process.argv[2] || 'artifacts/results-portal';
mkdirSync(out, { recursive: true });
const report = { scope: 'Synthetic local PostgreSQL + real React/session route; local Auth/HTTP adapters. No production writes, messages or analytics.', checks: [], errors: [], viewports: [] };
const db = new PGlite({ extensions: { pgcrypto } });
const one = async (sql, args = []) => (await db.query(sql, args)).rows[0];
const staff = { academic: 'a1111111-1111-4111-8111-111111111111', admin: 'a2222222-2222-4222-8222-222222222222' };
async function as(role, id = '') { await db.exec(`reset role; set role ${role}`); await db.query("select set_config('request.jwt.claim.sub',$1,false)", [id]); }
let server, browser;
try {
  await db.exec(readFileSync('supabase/tests/local_shim.sql', 'utf8'));
  for (const file of readdirSync('supabase/migrations').sort()) {
    if (/20261013000800|20261013001400/.test(file)) continue;
    await db.exec(readFileSync(`supabase/migrations/${file}`, 'utf8'));
  }
  for (const [role, id] of Object.entries(staff)) await db.query('insert into auth.users(id,email,raw_app_meta_data) values($1,$2,$3)', [id, `${role}@example.invalid`, { role }]);
  const student = await one("insert into public.students(full_name) values('Amina Example') returning id, student_code");
  const guardian = await one("insert into public.guardians(full_name,client_id) values('Example Parent','DEMO-2026') returning id");
  await db.query('insert into public.student_guardians(student_id,guardian_id) values($1,$2)', [student.id, guardian.id]);
  await as('authenticated', staff.academic);
  for (const [code, title, marks, remarks] of [['READING-T1', 'Quran reading & Tajweed', '91', 'Clear pronunciation and a steady reading pace. Continue practising the rules of noon sakinah.'], ['HIFZ-T1', 'Memorisation & revision', '87', 'A consistent revision routine. Keep giving earlier lessons the same attention as new learning.']]) {
    const assessment = await one("insert into public.assessments(code,title,assessment_date,period_label,total_marks,status,grade_bands) values($1,$2,'2026-10-30','Term 1 · 2026',100,'active',$3) returning *", [code, title, JSON.stringify([{grade:'A',min_percent:85,label:'Example grade label'},{grade:'B',min_percent:70},{grade:'C',min_percent:0}])]);
    const parsed = await readResultsFile(new File([`student_code,marks_obtained,teacher_remarks\n${student.student_code},${marks},${remarks}\n`], `${code}.csv`));
    const batch = await one('insert into public.result_import_batches(assessment_id,original_filename,file_sha256) values($1,$2,$3) returning id', [assessment.id, parsed.name, parsed.sha256]);
    for (const row of toImportRows(parsed.rows, batch.id, assessment)) await db.query('insert into public.result_import_rows(batch_id,row_number,student_code,student_name,marks_text,grade,teacher_remarks) values($1,$2,$3,$4,$5,$6,$7)', [row.batch_id,row.row_number,row.student_code,row.student_name,row.marks_text,row.grade,row.teacher_remarks]);
    await db.query('select public.results_submit_batch($1)', [batch.id]);
    await as('authenticated', staff.admin);
    await db.query("select public.results_decide_batch($1,true,'Synthetic QA review')", [batch.id]);
    assert.equal((await one('select public.results_publish_batch($1) n', [batch.id])).n, 1);
    await as('authenticated', staff.academic);
  }
  await as('authenticated', staff.admin);
  const code = (await one('select public.guardian_issue_code($1) code', [guardian.id])).code;
  const cert = await one("insert into public.certificates(student_id,title,status,signed_by) values($1,'Certificate of Achievement','issued','Example academic reviewer') returning id", [student.id]);
  const result = await one('select id from public.student_results where student_id=$1 limit 1', [student.id]);
  await db.query('select public.results_link_certificate($1,$2)', [result.id, cert.id]);
  report.checks.push('CSV → preview mapping → real database submission → separate approval → atomic publication → issued certificate link');

  const aliases = builder => builder.onResolve({ filter: /^@\// }, args => {
    const stem = resolve('src', args.path.slice(2));
    for (const ext of ['', '.js', '.jsx']) { try { readFileSync(stem + ext); return { path: stem + ext }; } catch { /* Try the next module extension. */ } }
  });
  const routeBundle = await build({ entryPoints: ['src/app/api/parent-session/route.js'], bundle:true, write:false, format:'esm', platform:'node', plugins:[{name:'local-route-adapters',setup(builder){
    builder.onResolve({filter:/^next\/server$/},()=>({path:pathToFileURL(require.resolve('next/server')).href,external:true}));
    builder.onResolve({filter:/^next\/headers$|^@\/lib\/supabase\/public$/},args=>({path:args.path,namespace:'fixture'}));
    builder.onLoad({filter:/.*/,namespace:'fixture'},args=>({contents:args.path==='next/headers'?'export const cookies=async()=>globalThis.__resultsFixtureApi.cookies;':'export const publicDb={rpc:(...args)=>globalThis.__resultsFixtureApi.rpc(...args)};'}));
    aliases(builder);
  }}]});
  const handlers = await import('data:text/javascript;base64,'+Buffer.from(routeBundle.outputFiles[0].text).toString('base64'));
  const entry = `import React from 'react'; import {createRoot} from 'react-dom/client';
import {MarksSheet} from './src/components/results/marks-sheet.jsx';
import {ResultCard} from './src/components/results/result-card.jsx';
import {ParentSessionGuard} from './src/components/results/parent-session-guard.jsx';
import {ParentSignInForm,ParentSignOut} from './src/app/parents/sign-in-form.jsx';
const data=window.__oqcFixture; window.__refresh=()=>location.assign('/fixture/results');
createRoot(document.querySelector('#app')).render(data.children ? <ParentSessionGuard><div className="page-wrap max-w-5xl py-8"><header className="mb-5 flex flex-wrap justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-gold-700">Design preview · example data</p><h1 className="font-display text-3xl text-mushaf-900">Your child’s academic record</h1></div><ParentSignOut/></header>{data.children.map(k=><React.Fragment key={k.id}><MarksSheet student={k} period="Term 1 · 2026" results={k.results} certificateHref={id=>'/fixture/certificate/'+id}/><div className="mt-8"><ResultCard studentName={k.name} studentCode={k.code} result={k.results[0]} preview/></div></React.Fragment>)}</div></ParentSessionGuard> : <div className="page-wrap max-w-xl py-12"><h1 className="mb-5 font-display text-3xl text-mushaf-900">Student result</h1><ParentSignInForm/></div>);`;
  const js = (await build({stdin:{contents:entry,resolveDir:process.cwd(),loader:'jsx'},jsx:'automatic',bundle:true,write:false,format:'iife',define:{'process.env.NODE_ENV':'"production"'},plugins:[{name:'local-browser-adapters',setup(builder){
    builder.onResolve({filter:/^next\/navigation$|^@\/lib\/supabase\/public$/},args=>({path:args.path,namespace:'fixture'}));
    builder.onLoad({filter:/.*/,namespace:'fixture'},args=>({contents:args.path==='next/navigation'?'export function useRouter(){return {refresh:()=>window.__refresh()}}':'export function getPublicBrowserClient(){return {rpc:async(name,args)=>{const r=await fetch("/fixture/rpc",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({name,args})});return r.json()}}}'}));
    aliases(builder);
  }}]})).outputFiles[0].text;
  const home = readFileSync('.next/server/app/index.html','utf8');
  const fontClass = home.match(/<html[^>]*class="([^"]*)"/)?.[1] || home.match(/<body[^>]*class="([^"]*)"/)?.[1] || '';
  const sheets = [...home.matchAll(/<link[^>]*href="([^\"]+\.css)"[^>]*>/g)].map(m=>m[1]);
  async function rpc(name,args) {
    await as('anon');
    if(name==='parent_sign_in')return {data:(await one('select public.parent_sign_in($1,$2) data',[args.p_client_id,args.p_code])).data,error:null};
    if(name==='parent_session_active')return {data:(await one('select public.parent_session_active($1) data',[args.p_token])).data,error:null};
    if(name==='parent_sign_out'){await db.query('select public.parent_sign_out($1)',[args.p_token]);return {data:null,error:null};}
    throw Error('Unexpected RPC');
  }
  const cookieValue = headers => /(?:^|;\s*)oqc_parent=([^;]*)/.exec(headers.cookie||'')?.[1];
  const html = data => `<!doctype html><html class="${fontClass}"><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>OQC result card — synthetic design preview</title>${sheets.map(h=>`<link rel="stylesheet" href="${h}">`).join('')}</head><body class="bg-paper"><div id="app"></div><script>window.__oqcFixture=${JSON.stringify(data).replace(/</g,'\\u003c')}</script><script src="/fixture/app.js"></script></body></html>`;
  server = createServer(async(req,res)=>{try{
    res.setHeader('cache-control','private, no-store');
    const path=new URL(req.url,'http://localhost').pathname;
    if(path==='/fixture/app.js'){res.setHeader('content-type','text/javascript');res.end(js);return;}
    if(path.startsWith('/_next/static/')||path.startsWith('/brand/')){
      const file=path.startsWith('/_next/static/')?'.next/static/'+path.slice('/_next/static/'.length):'public'+path;
      if(file.includes('..'))throw Error('Invalid fixture asset');
      res.setHeader('content-type',file.endsWith('.css')?'text/css':file.endsWith('.woff2')?'font/woff2':file.endsWith('.webp')?'image/webp':'image/png');res.end(readFileSync(file));return;
    }
    if(path==='/fixture/rpc'){
      const chunks=[];for await(const c of req)chunks.push(c);const body=JSON.parse(Buffer.concat(chunks));
      assert.equal(body.name,'parent_sign_in');res.setHeader('content-type','application/json');res.end(JSON.stringify(await rpc(body.name,body.args)));return;
    }
    if(path==='/api/parent-session'){
      const saved=[];globalThis.__resultsFixtureApi={rpc,cookies:{get:()=>({value:cookieValue(req.headers)}),set:(name,value,options)=>saved.push(`${name}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${options.maxAge}`)}};
      const chunks=[];for await(const c of req)chunks.push(c);
      const request=new Request(base+req.url,{method:req.method,headers:req.headers,...(['POST'].includes(req.method)?{body:Buffer.concat(chunks)}:{})});
      const reply=await handlers[req.method](request);res.writeHead(reply.status,{...Object.fromEntries(reply.headers),...(saved.length?{'set-cookie':saved}:{})});res.end(await reply.text());return;
    }
    await as('anon');
    const data=cookieValue(req.headers)?(await one('select public.parent_results($1) data',[cookieValue(req.headers)])).data:null;
    res.setHeader('content-type','text/html');res.end(html(data?{children:data}:{}));
  }catch(e){report.errors.push(e.message);res.statusCode=500;res.end('Fixture error');}});
  await new Promise(done=>server.listen(0,'127.0.0.1',done));
  const base=`http://127.0.0.1:${server.address().port}`;
  browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
  let context=await browser.newContext({viewport:{width:1440,height:1100}});
  let page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
  await page.goto(base+'/fixture/results');
  await page.getByRole('button',{name:'View result',exact:true}).click();
  await page.getByRole('alert').filter({hasText:'12-character'}).waitFor();
  await page.getByLabel('Client ID',{exact:true}).fill('DEMO-2026');
  await page.getByLabel('Access code',{exact:true}).fill(code);
  await page.getByRole('button',{name:'View result',exact:true}).click();
  await page.getByRole('heading',{name:'Student result card',exact:true}).waitFor();
  assert.ok((await context.cookies()).some(c=>c.name==='oqc_parent'&&c.httpOnly));
  assert.equal(await page.evaluate(()=>document.cookie.includes('oqc_parent')),false);
  report.checks.push('real guardian code → sign-in → actual session route → httpOnly cookie → only published own-family results');
  for(const width of [320,390,768,1440]){
    await page.setViewportSize({width,height:1100});
    await page.locator('.marks-sheet img').evaluate(i=>i.decode());
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,`${width}px overflow`);
    if([390,1440].includes(width))await page.locator('.marks-sheet').screenshot({path:`${out}/OQC_Result_Card_${width}.png`});
    report.viewports.push({width,noOverflow:true,logoDecoded:true});
  }
  await page.setViewportSize({width:390,height:1100});
  await page.evaluate(()=>document.documentElement.style.fontSize='32px');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'200% text reflow');
  await page.evaluate(()=>document.documentElement.style.fontSize='');
  assert.equal(await page.getByRole('button',{name:/download|print|export/i}).count(),0);
  report.checks.push('320/390/768/1440px, 200% text, decoded original logo, no parent download/print controls');
  await page.clock.install();
  await page.clock.fastForward(31*60*1000);
  await page.getByRole('heading',{name:'Your session has ended',exact:true}).waitFor();
  assert.equal(await page.locator('.marks-sheet').count(),0);
  report.checks.push('idle tab removes private result after 30 minutes');
  await context.close();
  context=await browser.newContext({viewport:{width:390,height:1100}});
  page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
  await page.goto(base+'/fixture/results');
  await page.getByLabel('Client ID',{exact:true}).fill('DEMO-2026');await page.getByLabel('Access code',{exact:true}).fill(code);
  await page.getByRole('button',{name:'View result',exact:true}).click();await page.locator('.marks-sheet').waitFor();
  await page.route('**/api/parent-session',route=>route.request().method()==='DELETE'?route.fulfill({status:503,body:'{}'}):route.continue());
  await page.getByRole('button',{name:'Sign out',exact:true}).click();await page.getByRole('alert').filter({hasText:'could not sign you out'}).waitFor();
  assert.equal(await page.getByRole('button',{name:'Sign out',exact:true}).isEnabled(),true);
  await page.unroute('**/api/parent-session');
  const before=(await context.cookies()).find(c=>c.name==='oqc_parent').value;
  await page.getByRole('button',{name:'Sign out',exact:true}).click();await page.getByRole('button',{name:'View result',exact:true}).waitFor();
  await as('anon');assert.equal((await one('select public.parent_session_active($1) active',[before])).active,false);
  report.checks.push('failed sign-out is retryable; successful sign-out revokes DB token and clears private view');
  assert.deepEqual(report.errors,[]);
  await context.close();
} finally {
  if(browser)await browser.close();
  if(server){server.closeAllConnections();await new Promise(done=>server.close(done));}
  await db.close();
  writeFileSync(`${out}/summary.json`,JSON.stringify(report,null,2));
}
console.log(JSON.stringify({checks:report.checks.length,viewportCases:report.viewports.length,errors:report.errors.length,scope:report.scope},null,2));
