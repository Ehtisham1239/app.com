// Read-only release checks for the five original October editorial articles.
import assert from 'node:assert/strict';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {auditPage,launchAuditBrowser,loadedImage} from './lib/browser-audit.mjs';
const base=(process.argv[2]||'http://127.0.0.1:3012').replace(/\/$/,''),out=process.argv[3]||'artifacts/editorial-release';
const posts=JSON.parse(readFileSync('content/blog/2026-10-28/posts.json','utf8'));
mkdirSync(out,{recursive:true});
const report={base,articles:[],cases:[],browserErrors:[],formSubmissions:0,scope:'Public editorial HTML/schema/image/navigation checks; no form submissions, rankings or official rich-result certification.'};
for(const post of posts){
 const r=await fetch(`${base}/blog/${post.slug}`,{signal:AbortSignal.timeout(30000)});assert.equal(r.status,200,post.slug);const html=await r.text();
 const graph=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
 const article=graph.find(s=>s['@type']==='BlogPosting');assert.ok(article.wordCount>=1000,post.slug);assert.equal(article.author.name,'Online Quran College');
 assert.ok(html.includes('AI-generated editorial illustration'));assert.equal((html.match(/<h1[\s>]/g)||[]).length,1);
 assert.ok(html.includes(post.seo_title.replaceAll('&','&amp;')));assert.ok(article.image.endsWith(post.cover_url));
 report.articles.push({slug:post.slug,status:200,words:article.wordCount,image:article.image,author:article.author.name});
}
const browser=await launchAuditBrowser();
try{
 for(const width of [390,1440]){
  const session=await auditPage(browser,base,report,{viewport:{width,height:1000}});
  try{
   for(const post of posts){
    const {page}=session;await page.goto(`${base}/blog/${post.slug}`,{waitUntil:'networkidle'});
    await loadedImage(page,'[data-hero-visual] img');
    const result=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,words:document.querySelector('.prose-oqc').textContent.trim().split(/\s+/).length,alt:document.querySelector('[data-hero-visual] img').alt,anchors:[...document.querySelectorAll('nav[aria-label="In this article"] a')].every(a=>Boolean(document.getElementById(a.getAttribute('href').slice(1))))}));
    assert.equal(result.overflow,false);assert.ok(result.words>=1000);assert.ok(result.alt.length>30);assert.ok(result.anchors);
    if(post===posts[0])await page.screenshot({path:`${out}/first-article-${width}.png`,fullPage:true});
    report.cases.push({width,slug:post.slug,words:result.words,overflow:false,imageDecoded:true,tocAnchors:true});
   }
  }finally{await session.context.close();}
 }
}finally{await browser.close();}
assert.deepEqual(report.browserErrors,[]);assert.equal(report.formSubmissions,0);
const feed=await fetch(base+'/blog/feed.xml');const xml=await feed.text();for(const post of posts)assert.ok(xml.includes('/blog/'+post.slug));
const sitemap=await fetch(base+'/sitemap.xml');const map=await sitemap.text();for(const post of posts)assert.ok(map.includes('/blog/'+post.slug));
report.feedAndSitemapContainAllFive=true;
writeFileSync(`${out}/summary.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
