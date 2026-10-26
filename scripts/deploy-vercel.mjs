import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const project='prj_q3qTOTMNxuDfgmd5XoCaoWVhQBVu',team='team_8Xig9mSvNd3XLAzNbQgwPapo';const headers={Authorization:`Bearer ${process.env.VERCEL_TOKEN}`,'Content-Type':'application/json'};
async function api(path,method='GET',body){const r=await fetch(`https://api.vercel.com${path}${path.includes('?')?'&':'?'}teamId=${team}`,{method,headers,body:body?JSON.stringify(body):undefined});const text=await r.text();let d;try{d=JSON.parse(text)}catch{d={message:text}}if(!r.ok)throw Error(`${method} ${path}: ${r.status} ${JSON.stringify(d)}`);return d;}
const current=await api(`/v9/projects/${project}`);if(current.link) throw Error('This release procedure expects the documented disconnected Git integration. Review the current project link before deploying.');
if(execFileSync('git',['status','--porcelain'],{encoding:'utf8'}).trim()) throw Error('Commit the reviewed release before deploying.');
const sourceCommit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const env=['NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'].map(key=>({key,value:process.env[key],type:'plain',target:['production','preview','development']}));
env.push({key:'NEXT_PUBLIC_SITE_URL',value:'https://www.onlinequrancollege.com',type:'plain',target:['production','preview','development']});
if(env.some(x=>!x.value))throw Error('Missing public app configuration');
await api(`/v10/projects/${project}/env?upsert=true`,'POST',env);console.log('Public app configuration saved.');
const names=execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(Boolean);
const uploads=new Map();
const files=names.map(file=>{if(file.startsWith('artifacts/')||file.startsWith('.env')&&file!=='.env.example')throw Error('Unexpected private file');const data=readFileSync(file);const sha=createHash('sha1').update(data).digest('hex');uploads.set(sha,data);return {file,sha,size:data.length};});
// Upload bounded individual files, then reference their digests in a small deployment request.
// This avoids carrying all encoded media through a single proxy/API request.
const pending=[...uploads];let index=0,uploaded=0;
await Promise.all(Array.from({length:4},async()=>{while(index<pending.length){const [sha,data]=pending[index++];const response=await fetch(`https://api.vercel.com/v2/files?teamId=${team}`,{method:'POST',headers:{Authorization:headers.Authorization,'Content-Type':'application/octet-stream','Content-Length':String(data.length),'x-vercel-digest':sha,'x-vercel-size':String(data.length)},body:data});if(!response.ok)throw Error(`File upload failed: ${response.status} ${await response.text()}`);await response.arrayBuffer();uploaded++;if(uploaded%100===0)console.log(`Uploaded ${uploaded}/${pending.length} source files.`);}}));
const d=await api('/v13/deployments','POST',{name:'project',project,target:'production',files,meta:{sourceCommit,sourceRepository:'Ehtisham1239/app.com'},projectSettings:{framework:'nextjs',buildCommand:'npm run build',installCommand:'npm ci',outputDirectory:null,rootDirectory:null}});
mkdirSync('artifacts',{recursive:true});
writeFileSync('artifacts/vercel-deployment.json',JSON.stringify({teamId:team,projectId:project,deploymentId:d.id,url:d.url,sourceCommit},null,2));console.log('Production deployment submitted:',d.id,d.url,d.readyState,'Files:',files.length);
