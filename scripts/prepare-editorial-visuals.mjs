import sharp from 'sharp';
import {readFileSync,writeFileSync} from 'node:fs';
const jobs=JSON.parse(readFileSync('artifacts/next-visual-sources.json'));
const alts={
'course-hifz-memory':'Teenage learner listening on headphones while reviewing an open book on a wooden stand',
'course-islamic-studies':'Mother and two children discussing picture cards about kindness, sharing and caring for plants',
'blog-kids-learning':'Father helping his daughter adjust her headset before an online lesson',
'blog-tajweed-recitation':'Adult learner practising recitation beside a desktop microphone and an open book',
'blog-memory-techniques':'Revision notebook, flashcards, timer and closed book arranged for a memorisation routine',
'blog-translation-arabic':'Two reference books and a notebook arranged for comparing translation and language study',
'blog-accessible-setup':'Organised online learning desk with raised laptop, separate keyboard, headphones and task lamp',
'blog-parent-progress':'Mother discussing a lesson on a laptop while taking progress notes beside her child',
'blog-family-siblings':'Two siblings using separate study spaces with a parent helping the younger learner',
'blog-usa-teacher':'Parent reviewing online lesson options with a laptop and a checklist at a home desk',
'blog-australia-schedule':'Sunlit study desk with a clock, weekly planner and laptop for scheduling online lessons',
'blog-qaida-reading':'Child following beginner letters in a workbook beside a closed book on a wooden stand',
'blog-adult-beginner':'Adult beginner in a sage hijab studying a workbook during an online lesson at home',
'blog-first-trial':'Mother and child greeting an online teacher on a laptop at the start of a lesson',
'blog-feedback-practice':'Teenage learner listening to feedback on headphones and taking notes beside a laptop',
'blog-school-hifz':'School backpack, revision planner and book stand arranged for balancing study and memorisation',
'blog-enrolment-questions':'Parent preparing an enrolment checklist beside a laptop, calendar and notebook',
'guide-tajweed':'Adult learner listening carefully during a recitation lesson with a book stand and microphone',
'guide-kids':'Young girl arranging beginner alphabet pieces beside a workbook with her mother nearby',
'guide-adults':'Mature learner wearing reading glasses studying a beginner workbook beside a laptop',
'guide-islamic-values':'Mother and children caring for a small plant together as an everyday lesson in kindness',
'home-college-welcome':'Family arranging a calm home study space with a workbook, lamp and laptop',
'contact-coordinator':'Illustrative admissions coordinator wearing a headset at an organised desk with a laptop',
'trial-welcome':'Young boy smiling at a laptop during his first lesson with his mother seated nearby',
'home-learning-paths':'Alphabet blocks, a closed book on a stand and a notebook representing different learning stages'
};
const old=JSON.parse(readFileSync('src/lib/image-manifest.json')).filter(m=>m.kind!=='map');const out=[];let index=0;
await Promise.all(Array.from({length:3},async()=>{while(index<jobs.length){const job=jobs[index++];if(!job.path||!alts[job.name])throw Error(`Missing image or alt: ${job.name}`);const meta=await sharp(job.path).metadata();const variants=[],avif=[];
for(const width of [400,800,1200]){for(const format of ['webp','avif']){const url=`/images/learning/${job.name}-${width}.${format}`;const image=sharp(job.path).resize({width});const info=await (format==='webp'?image.webp({quality:80,effort:5}):image.avif({quality:52,effort:4})).toFile(`public${url}`);(format==='webp'?variants:avif).push({url,width,bytes:info.size});}}
out.push({name:job.name,url:variants.at(-1).url,width:1200,height:Math.round(meta.height*1200/meta.width),alt:alts[job.name],kind:'photo',variants,avif,storage_url:`https://lgbwidraztavhhbnbfhr.supabase.co/storage/v1/object/public/media/visuals/2026-10/${job.name}-1200.webp`});console.log('Prepared',job.name);}}));
for(const asset of old){asset.kind='photo';asset.avif=[];for(const width of [400,800,1200]){const url=`/images/learning/${asset.name}-${width}.avif`;const info=await sharp(`public${asset.url}`).resize({width}).avif({quality:52,effort:4}).toFile(`public${url}`);asset.avif.push({url,width,bytes:info.size});}}
const photos=[...old,...out].sort((a,b)=>a.name.localeCompare(b.name));writeFileSync('artifacts/editorial-visual-manifest.json',JSON.stringify(photos,null,2));console.log({photos:photos.length,webp:photos.reduce((n,m)=>n+m.variants.at(-1).bytes,0),avif:photos.reduce((n,m)=>n+m.avif.at(-1).bytes,0)});
