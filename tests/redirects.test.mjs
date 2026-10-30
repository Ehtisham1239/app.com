import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import nextConfig from '../next.config.mjs';
import {LOCATIONS,locationCmsSlug,locationPath} from '../src/lib/locations.js';
import {LEARNING_GUIDES} from '../src/lib/learning-guides.js';

const redirects=await nextConfig.redirects();
const bySource=new Map(redirects.map(r=>[r.source,r]));

test('homepage and canonical learning/location pages are not redirect sources',()=>{
  for(const path of ['/','/courses','/blog','/pricing','/free-trial','/locations',...LOCATIONS.flatMap(c=>[null,...c.cities].map(city=>locationPath(c,city)))])assert.equal(bySource.has(path),false,path);
  const source=readFileSync(new URL('../src/proxy.js',import.meta.url),'utf8');
  const matchers=JSON.parse(source.match(/matcher:\s*(\[[^\]]*\])/)[1]);
  assert.deepEqual(matchers,['/admin/:path*','/auth/:path*','/parents','/parents/:path*'],'Only staff/auth and the private parent portal need the proxy');
});

test('every legacy country and city CMS URL resolves to its own canonical page',()=>{
  for(const country of LOCATIONS)for(const city of [null,...country.cities]){
    const source='/'+locationCmsSlug(country,city),rule=bySource.get(source);
    assert.equal(rule?.destination,locationPath(country,city),source);assert.equal(rule.permanent,true);
  }
});

test('redirect sources are unique and have no self redirects, chains or external targets',()=>{
  assert.equal(bySource.size,redirects.length);
  for(const rule of redirects){assert.ok(rule.destination.startsWith('/')&&!rule.destination.startsWith('//'));assert.notEqual(rule.source,rule.destination);assert.equal(bySource.has(rule.destination),false,`${rule.source} creates a chain`);}
});

test('existing country, city, course and guide aliases retain their intended destinations',()=>{
  for(const [alias,country]of [['uk','united-kingdom'],['usa','united-states'],['australia','australia']])assert.equal(bySource.get('/online-quran-classes-'+alias)?.destination,'/locations/'+country);
  for(const city of ['london','birmingham','manchester','leeds','bradford','leicester'])assert.equal(bySource.get('/online-quran-classes-'+city)?.destination,'/locations/united-kingdom');
  for(const course of ['noorani-qaida','quran-nazara','hifz-quran','arabic-language','quran-translation','hadith-translation'])assert.equal(bySource.get('/'+course)?.destination,'/courses/'+course);
  for(const guide of LEARNING_GUIDES)assert.equal(bySource.get('/'+guide.slug)?.destination,guide.path);
  assert.equal(bySource.get('/login.html')?.destination,'/admin/login');assert.equal(bySource.get('/register')?.destination,'/free-trial');
});
