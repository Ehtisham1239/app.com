import sharp from 'sharp';
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
const old=JSON.parse(readFileSync('src/lib/image-manifest.json'));
const jobs=[...JSON.parse(readFileSync('artifacts/regenerated-first.json')),...readdirSync('artifacts').filter(n=>/^regen-.+\.json$/.test(n)).map(n=>JSON.parse(readFileSync(`artifacts/${n}`)))];
const photos=old.filter(m=>m.kind==='photo');
if(jobs.length!==photos.length||new Set(jobs.map(j=>j.name)).size!==photos.length)throw Error(`Expected ${photos.length} unique regenerated photographs; received ${jobs.length}`);
const altChanges={
 'course-islamic-studies':'Mother and daughter discussing an Islamic studies activity beside a tablet and a green book',
 'home-learning-paths':'Beginner workbook, closed green book on a stand and notebook arranged for different learning stages',
 'guide-islamic-values':'Mother and young son watering a small indoor plant together as a lesson in kindness',
 'family-online-quran-study':'Mother and son looking towards a laptop teacher with an open beginner workbook between them',
 'home-college-welcome':'Parents encouraging their daughter during a laptop lesson with a workbook at a bright home desk'
};
let index=0;const results=[];
await Promise.all(Array.from({length:3},async()=>{while(index<jobs.length){const job=jobs[index++],before=photos.find(m=>m.name===job.name);if(!before)throw Error(job.name);const variants=[],avif=[];for(const width of [400,800,1200])for(const format of ['webp','avif']){const url=`/images/learning/${job.name}-r2-${width}.${format}`;const pipeline=sharp(job.path).resize({width,height:Math.round(width*2/3),fit:'cover'});const info=await(format==='webp'?pipeline.webp({quality:80,effort:5}):pipeline.avif({quality:53,effort:4})).toFile(`public${url}`);(format==='webp'?variants:avif).push({url,width,bytes:info.size});}results.push({...before,url:variants.at(-1).url,height:800,variants,avif,alt:altChanges[job.name]||before.alt,storage_url:`https://lgbwidraztavhhbnbfhr.supabase.co/storage/v1/object/public/media/regenerated/2026-10/${job.name}-r2-1200.webp`,previous_urls:[...new Set([before.url,before.storage_url,...(before.previous_urls||[])])]});console.log('Prepared',job.name);}}));
const maps=JSON.parse(readFileSync('artifacts/location-visual-manifest.json')).map(m=>{const before=old.find(o=>o.name===m.name);return{...m,previous_urls:[...new Set([before.url,before.storage_url,...(before.previous_urls||[])])]};});
writeFileSync('artifacts/regenerated-manifest-before.json',JSON.stringify(old));
const manifest=[...results,...maps].sort((a,b)=>a.name.localeCompare(b.name));writeFileSync('src/lib/image-manifest.json',JSON.stringify(manifest,null,2));
const seed=JSON.parse(readFileSync('src/lib/seed-content.json'));const q=s=>"'"+s.replaceAll("'","''")+"'";const sql=[];
for(const [key,table]of[['courses','courses'],['posts','blog_posts'],['pages','pages']])for(const row of seed[key]){const m=manifest.find(m=>m.previous_urls.includes(row.cover_url));if(!m)continue;sql.push(`update public.${table} set cover_url=${q(m.storage_url)},cover_alt=${q(m.alt)} where slug=${q(row.slug)} and cover_url=${q(row.cover_url)};`);row.cover_url=m.storage_url;row.cover_alt=m.alt;}
writeFileSync('src/lib/seed-content.json',JSON.stringify(seed));writeFileSync('supabase/migrations/20261023000300_regenerated_visuals.sql','-- Replace only the previous generated cover, preserving custom editor uploads.\n'+sql.join('\n')+'\n');writeFileSync('artifacts/regenerated-photo-sources.json',JSON.stringify(jobs,null,2));console.log({photos:results.length,maps:maps.length,coverUpdates:sql.length});
