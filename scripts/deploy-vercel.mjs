import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';import {execFileSync} from 'node:child_process';
const project='prj_q3qTOTMNxuDfgmd5XoCaoWVhQBVu',team='team_8Xig9mSvNd3XLAzNbQgwPapo';const headers={Authorization:`Bearer ${process.env.VERCEL_TOKEN}`,'Content-Type':'application/json'};
async function api(path,method='GET',body){const r=await fetch(`https://api.vercel.com${path}${path.includes('?')?'&':'?'}teamId=${team}`,{method,headers,body:body?JSON.stringify(body):undefined});const text=await r.text();let d;try{d=JSON.parse(text)}catch{d={message:text}}if(!r.ok)throw Error(`${method} ${path}: ${r.status} ${JSON.stringify(d)}`);return d;}
const current=await api(`/v9/projects/${project}`);if(current.link) throw Error('This release procedure expects the documented disconnected Git integration. Review the current project link before deploying.');
if(execFileSync('git',['status','--porcelain'],{encoding:'utf8'}).trim()) throw Error('Commit the reviewed release before deploying.');
const sourceCommit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const env=['NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'].map(key=>({key,value:process.env[key],type:'plain',target:['production','preview','development']}));
env.push({key:'NEXT_PUBLIC_SITE_URL',value:'https://project-umber-three-93.vercel.app',type:'plain',target:['production','preview','development']});
if(env.some(x=>!x.value))throw Error('Missing public app configuration');
await api(`/v10/projects/${project}/env?upsert=true`,'POST',env);console.log('Public app configuration saved.');
const names=execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(Boolean);
const files=names.map(file=>{if(file.startsWith('artifacts/')||file.startsWith('.env')&&file!=='.env.example')throw Error('Unexpected private file');return {file,data:readFileSync(file).toString('base64'),encoding:'base64'};});
const d=await api('/v13/deployments','POST',{name:'project',project,target:'production',files,meta:{sourceCommit,sourceRepository:'Ehtisham1239/app.com'},projectSettings:{framework:'nextjs',buildCommand:'npm run build',installCommand:'npm ci',outputDirectory:null,rootDirectory:null}});
mkdirSync('artifacts',{recursive:true});
writeFileSync('artifacts/vercel-deployment.json',JSON.stringify({teamId:team,projectId:project,deploymentId:d.id,url:d.url,sourceCommit},null,2));console.log('Production deployment submitted:',d.id,d.url,d.readyState,'Files:',files.length);
