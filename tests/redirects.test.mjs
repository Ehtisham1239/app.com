import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import nextConfig from '../next.config.mjs';
import {LOCATIONS,locationCmsSlug,locationPath} from '../src/lib/locations.js';
import {LEARNING_GUIDES} from '../src/lib/learning-guides.js';

const allRedirects=await nextConfig.redirects();
// Host-canonical rules (bare domain -> www) are the only absolute targets; path rules stay internal.
const hostRules=allRedirects.filter(r=>r.has?.some(h=>h.type==='host'));
const redirects=allRedirects.filter(r=>!hostRules.includes(r));
const bySource=new Map(redirects.map(r=>[r.source,r]));

test('host rules only send the bare domain to the canonical www origin',()=>{
  assert.equal(hostRules.length,1);
  for(const rule of hostRules){
    assert.deepEqual(rule.has,[{type:'host',value:'onlinequrancollege.com'}]);
    assert.equal(rule.destination,'https://www.onlinequrancollege.com/:path*');
    assert.equal(rule.permanent,true);
  }
});

test('homepage and canonical learning/location pages are not redirect sources',()=>{
  for(const path of ['/','/courses','/blog','/pricing','/free-trial','/locations',...LOCATIONS.flatMap(c=>[null,...c.cities].map(city=>locationPath(c,city)))])assert.equal(bySource.has(path),false,path);
  const source=readFileSync(new URL('../src/proxy.js',import.meta.url),'utf8');
  const matchers=JSON.parse(source.match(/matcher:\s*(\[[\s\S]*?^  \]),/m)[1]);
  assert.deepEqual(matchers,['/admin/:path*','/auth/:path*','/parents','/parents/:path*', ...['page','category'].map(key=>({source:'/blog',has:[{type:'query',key}]}))]);
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


test('recovered legacy memorisation and parenting articles map directly to relevant blog guides',()=>{
  for(const [source,target] of [['/how-to-learn-quran-by-heart-2','/blog/memorization-techniques-for-beginners'],['/start-teaching-the-quran-to-your-children','/blog/help-your-kids-learn-quran-online']]){
    assert.equal(bySource.get(source)?.destination,target);
    assert.equal(bySource.get(source)?.permanent,true);
  }
  assert.equal(bySource.has('/basic-islamic-education'),false,'Broad course scope still needs a separate decision');
});

test('indexed legacy WordPress course and services pages map to their exact current equivalents',()=>{
  for(const [source,target] of [['/quran-nazara-course','/courses/quran-nazara'],['/services','/courses'],['/hifz-ul-quran-course','/courses/hifz-quran']]){
    assert.equal(bySource.get(source)?.destination,target,source);
    assert.equal(bySource.get(source)?.permanent,true,source);
  }
  assert.equal(bySource.has('/ramzan-course'),false,'No current Ramadan course: keep the legacy URL a 404 rather than a soft-404 redirect');
});

test('legacy relative contact, course and location URLs reach the intended public pages', () => {
  for (const [source, destination] of [
    ['/book-now', '/free-trial'],
    ['/op/book-now-online-quran-free-classes', '/free-trial'],
    ['/:section(about|contact|pricing|privacy-policy)/pricing', '/pricing'],
    ['/:section(about|contact|pricing|privacy-policy)/hadith-translation', '/courses/hadith-translation'],
    ['/:section(about|contact|pricing|privacy-policy)/online-quran-classes-leeds', '/locations/united-kingdom'],
  ]) {
    assert.equal(bySource.get(source)?.destination, destination, source);
    assert.equal(bySource.get(source)?.permanent, true, source);
  }
});
