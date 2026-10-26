// Read-only release gate for every declared public page. No account or form mutations.
import assert from "node:assert/strict";
import {mkdirSync,writeFileSync} from "node:fs";
const base=(process.argv[2]||"http://localhost:3012").replace(/\/$/,"");
const out=process.argv[3]||"artifacts/page-quality";mkdirSync(out,{recursive:true});
const decode=s=>String(s||"").replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&#x([0-9a-f]+);/gi,(_,v)=>String.fromCodePoint(parseInt(v,16))).replace(/&#(\d+);/g,(_,v)=>String.fromCodePoint(+v));
const attrs=s=>Object.fromEntries([...s.matchAll(/([\w:-]+)="([^"]*)"/g)].map(m=>[m[1],decode(m[2])]));
async function get(path){const r=await fetch(base+path,{redirect:"manual",signal:AbortSignal.timeout(30000)});return {status:r.status,body:await r.text(),headers:Object.fromEntries(r.headers)};}
const sitemap=await get("/sitemap.xml");assert.equal(sitemap.status,200);
const urls=[...sitemap.body.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>new URL(decode(m[1]))),canonicalOrigin=urls[0].origin;
const rows=[],failures=[],images=new Set();let cursor=0;
await Promise.all(Array.from({length:3},async()=>{while(cursor<urls.length){const url=urls[cursor++],path=url.pathname;try{
 const {status,body}=await get(path),metas=[...body.matchAll(/<meta\b[^>]*>/g)].map(m=>attrs(m[0]));
 const title=decode(body.match(/<title>(.*?)<\/title>/s)?.[1]),description=metas.find(m=>m.name==="description")?.content;
 const canonical=[...body.matchAll(/<link\b[^>]*>/g)].map(m=>attrs(m[0])).find(m=>m.rel==="canonical")?.href;
 const graph=[...body.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap(m=>{const value=JSON.parse(m[1]);return value["@graph"]||[value];});
 const web=graph.find(x=>x["@type"]==="WebPage"),org=graph.find(x=>[].concat(x["@type"]).includes("EducationalOrganization")&&x["@id"]===canonicalOrigin+"/#organization");
 const visual=body.match(/data-hero-visual[^>]*>([\s\S]*?)<\/section>/)?.[1]||body.match(/<picture class="hero-immersive-media">([\s\S]*?)<\/picture>/)?.[1]||(path==="/free-trial"?body.match(/<main[^>]*>([\s\S]*?)<\/main>/)?.[1]:"")||"",heroImages=[...visual.matchAll(/<img\b[^>]*>/g)].map(m=>attrs(m[0]));
 const og=metas.find(m=>m.property==="og:title")?.content,ogDesc=metas.find(m=>m.property==="og:description")?.content;
 for(const [condition,reason]of [[status===200,"status"],[Boolean(title&&description),"title/description"],[Boolean(canonical&&new URL(canonical).href===url.href),"canonical"],[(body.match(/<h1[\s>]/g)||[]).length===1,"one H1"],[Boolean(web&&new URL(web.url).href===url.href),"WebPage identity"],[Boolean(org),"shared organisation"],[heroImages.length>0,"top visual"],[heroImages.every(x=>x.alt?.trim()&&+x.width>0&&+x.height>0),"image alt/dimensions"],[Boolean(og&&ogDesc),"social metadata"],[graph.every(x=>x["@type"]!=="Course"||(!x.hasCourseInstance&&x.provider&&x.name&&x.description)),"course fields"]])if(!condition)failures.push({path,reason});
 for(const image of heroImages)if(image.src?.startsWith("/"))images.add(image.src);
 rows.push({path,status,title,description,canonical,heroImages:heroImages.map(x=>x.src),schemas:graph.map(x=>x["@type"])});
}catch(error){failures.push({path,reason:error.message});}}}));
for(const field of ["title","description"]){const values=new Map();for(const row of rows){if(values.has(row[field]))failures.push({path:row.path,reason:`duplicate ${field}`,other:values.get(row[field])});values.set(row[field],row.path);}}
const robots=await get("/robots.txt");assert.equal(robots.status,200);assert.match(robots.headers["content-type"],/text\/plain/);assert.match(robots.body,/Disallow: \/admin/);assert.match(robots.body,/Allow: \//);assert.ok(robots.body.includes(canonicalOrigin+"/sitemap.xml"));
const assetChecks=[];for(const src of images){const r=await fetch(base+src);const bytes=(await r.arrayBuffer()).byteLength;assetChecks.push({src,status:r.status,bytes,type:r.headers.get("content-type")});if(r.status!==200||!r.headers.get("content-type")?.startsWith("image/"))failures.push({path:src,reason:"image response"});}
const summary={checkedAt:new Date().toISOString(),base,pages:rows.length,declared:urls.length,topImagesChecked:assetChecks.length,failures,robots:"static text/plain, public pages allowed, staff/API paths excluded",scope:"Public response/metadata/JSON-LD/hero-image checks; not a ranking or rich-result guarantee"};
writeFileSync(out+"/pages.json",JSON.stringify(rows,null,2));writeFileSync(out+"/assets.json",JSON.stringify(assetChecks,null,2));writeFileSync(out+"/summary.json",JSON.stringify(summary,null,2));console.log(JSON.stringify(summary,null,2));assert.equal(failures.length,0);
