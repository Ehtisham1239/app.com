// Read-only release gate for every declared public page. No account or form mutations.
import assert from "node:assert/strict";
// Pages whose hero is a lead form by owner decision, not an image: the USA Google Ads
// landing page (CEO, 5 Nov 2026), indexable since 18 Nov 2026.
const FORM_HERO_PAGES=new Set(["/usa-quran-classes"]);
import {mkdirSync,writeFileSync} from "node:fs";
import { isWebPageIdentity } from "./lib/page-schema.mjs";
import { heroBackgroundUrls } from "./lib/hero-background.mjs";
const base=(process.argv[2]||"http://localhost:3012").replace(/\/$/,"");
const out=process.argv[3]||"artifacts/page-quality";mkdirSync(out,{recursive:true});
const decode=s=>String(s||"").replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&#x([0-9a-f]+);/gi,(_,v)=>String.fromCodePoint(parseInt(v,16))).replace(/&#(\d+);/g,(_,v)=>String.fromCodePoint(+v));
const attrs=s=>Object.fromEntries([...s.matchAll(/([\w:-]+)="([^"]*)"/g)].map(m=>[m[1],decode(m[2])]));
async function get(path){const r=await fetch(base+path,{redirect:"manual",signal:AbortSignal.timeout(30000)});return {status:r.status,body:await r.text(),headers:Object.fromEntries(r.headers)};}
const sitemap=await get("/sitemap.xml");assert.equal(sitemap.status,200);
const urls=[...sitemap.body.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>new URL(decode(m[1]))),canonicalOrigin=urls[0].origin;
const homepage=await get("/");assert.equal(homepage.status,200);
const homepageGraph=[...homepage.body.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap(m=>{const value=JSON.parse(m[1]);return value["@graph"]||[value];});
const organizationId=canonicalOrigin+"/#organization";
const globalOrganization=homepageGraph.some(x=>[].concat(x["@type"]).includes("EducationalOrganization")&&x["@id"]===organizationId);
assert.ok(globalOrganization,"homepage must define the shared EducationalOrganization entity");
const rows=[],failures=[],images=new Set();let cursor=0;
const stylesheetCache=new Map();
async function hasCssHeroBackground(body,pageUrl){
 if(!/<section\\b[^>]*class="[^"]*\\bhero\\b[^"]*"/i.test(body))return false;
 const links=[...body.matchAll(/<link\\b[^>]*>/g)].map(m=>attrs(m[0]));
 let found=false;
 for(const link of links){
  if(link.rel!=="stylesheet"||!link.href)continue;
  const cssUrl=new URL(link.href,pageUrl);
  if(cssUrl.origin!==canonicalOrigin)continue;
  const key=cssUrl.pathname+cssUrl.search;
  if(!stylesheetCache.has(key))stylesheetCache.set(key,(async()=>{const response=await get(key);return response.status===200?response.body:"";})());
  const css=await stylesheetCache.get(key);
  const sources=heroBackgroundUrls(css);
  if(!sources.length)continue;
  found=true;
  for(const source of sources){const asset=new URL(source,cssUrl);if(asset.origin===canonicalOrigin)images.add(asset.pathname);}
 }
 return found;
}
await Promise.all(Array.from({length:3},async()=>{while(cursor<urls.length){const url=urls[cursor++],path=url.pathname;try{
 const {status,body}=await get(path),metas=[...body.matchAll(/<meta\b[^>]*>/g)].map(m=>attrs(m[0]));
 const title=decode(body.match(/<title>(.*?)<\/title>/s)?.[1]),description=metas.find(m=>m.name==="description")?.content;
 const canonical=[...body.matchAll(/<link\b[^>]*>/g)].map(m=>attrs(m[0])).find(m=>m.rel==="canonical")?.href;
 const graph=[...body.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap(m=>{const value=JSON.parse(m[1]);return value["@graph"]||[value];});
 const web=graph.find(x=>isWebPageIdentity(x,url.href));
 const localOrg=graph.some(x=>[].concat(x["@type"]).includes("EducationalOrganization")&&x["@id"]===organizationId);
 const orgReference=graph.some(x=>x.about?.["@id"]===organizationId||x.provider?.["@id"]===organizationId||x.publisher?.["@id"]===organizationId);
 const org=localOrg||(globalOrganization&&orgReference);
 const visual=body.match(/data-hero-visual[^>]*>([\s\S]*?)<\/section>/)?.[1]||body.match(/<picture class="hero-immersive-media">([\s\S]*?)<\/picture>/)?.[1]||(path==="/free-trial"?body.match(/<main[^>]*>([\s\S]*?)<\/main>/)?.[1]:"")||"",heroImages=[...visual.matchAll(/<img\b[^>]*>/g)].map(m=>attrs(m[0]));
 const video=graph.find(x=>x["@type"]==="VideoObject");
 const player=[...body.matchAll(/<(?:video|iframe)\b[^>]*>/g)].map(m=>attrs(m[0])).find(x=>video&&(x.src===video.embedUrl||x.src===video.contentUrl));
 const validVideo=Boolean(video?.name&&video.description&&video.uploadDate&&video.thumbnailUrl?.[0]&&player&&+player.width>0&&+player.height>0);\n const cssHeroBackground=await hasCssHeroBackground(body,url);
 if(validVideo){const thumbnail=new URL(video.thumbnailUrl[0]);if(thumbnail.origin===canonicalOrigin)images.add(thumbnail.pathname);}
 const og=metas.find(m=>m.property==="og:title")?.content,ogDesc=metas.find(m=>m.property==="og:description")?.content;
 for(const [condition,reason]of [[status===200,"status"],[Boolean(title&&description),"title/description"],[Boolean(canonical&&new URL(canonical).href===url.href),"canonical"],[(body.match(/<h1[\s>]/g)||[]).length===1,"one H1"],[Boolean(web&&new URL(web.url).href===url.href),"WebPage identity"],[Boolean(org),"shared organisation"],[heroImages.length>0||validVideo||cssHeroBackground||FORM_HERO_PAGES.has(path),"top visual"],[!video||validVideo,"video metadata and matching player"],[heroImages.every(x=>x.alt?.trim()&&+x.width>0&&+x.height>0),"image alt/dimensions"],[Boolean(og&&ogDesc),"social metadata"],[graph.every(x=>x["@type"]!=="Course"||(x.hasCourseInstance?.courseMode==="Online"&&!x.startDate&&x.offers?.category&&x.provider&&x.name&&x.description)),"course fields"]])if(!condition)failures.push({path,reason});
 for(const image of heroImages)if(image.src?.startsWith("/"))images.add(image.src);
 rows.push({path,status,title,description,canonical,heroImages:heroImages.map(x=>x.src),cssHeroBackground,schemas:graph.map(x=>x["@type"])});
}catch(error){failures.push({path,reason:error.message});}}}));
for(const field of ["title","description"]){const values=new Map();for(const row of rows){if(values.has(row[field]))failures.push({path:row.path,reason:`duplicate ${field}`,other:values.get(row[field])});values.set(row[field],row.path);}}
const robots=await get("/robots.txt");assert.equal(robots.status,200);assert.match(robots.headers["content-type"],/text\/plain/);assert.match(robots.body,/Disallow: \/admin/);assert.match(robots.body,/Allow: \//);assert.ok(robots.body.includes(canonicalOrigin+"/sitemap.xml"));
const assetChecks=[];for(const src of images){const r=await fetch(base+src);const bytes=(await r.arrayBuffer()).byteLength;assetChecks.push({src,status:r.status,bytes,type:r.headers.get("content-type")});if(r.status!==200||!r.headers.get("content-type")?.startsWith("image/"))failures.push({path:src,reason:"image response"});}
const summary={checkedAt:new Date().toISOString(),base,pages:rows.length,declared:urls.length,topImagesChecked:assetChecks.length,failures,robots:"static text/plain, public pages allowed, staff/API paths excluded",scope:"Public response/metadata/JSON-LD, semantic hero images and verified CSS hero backgrounds; not a ranking or rich-result guarantee"};
writeFileSync(out+"/pages.json",JSON.stringify(rows,null,2));writeFileSync(out+"/assets.json",JSON.stringify(assetChecks,null,2));writeFileSync(out+"/summary.json",JSON.stringify(summary,null,2));console.log(JSON.stringify(summary,null,2));assert.equal(failures.length,0);
