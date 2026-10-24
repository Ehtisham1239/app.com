// Geographic diagrams, rendered locally from public geographic data; no photo editing.
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import sharp from 'sharp';
import {LOCATIONS,locationCmsSlug,locationTimeZone} from '../src/lib/locations.js';
import {COUNTRY_ROUTES} from '../src/lib/geo-routing.js';
const source=process.env.VISUAL_SOURCE_DIR || '/workspace/oqc-visual-sources';
const geo=JSON.parse(readFileSync(`${source}/countries.geojson`));
const cities=JSON.parse(readFileSync(`${source}/cities.json`));
const code=Object.fromEntries(Object.entries(COUNTRY_ROUTES).map(([a,b])=>[b,a]));
const norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const names={'New York':'New York City',Frankfurt:'Frankfurt am Main',Aarhus:'Århus','Luxembourg City':'Luxembourg','Escaldes-Engordany':'les Escaldes'};
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
function point(country,city){let rows=cities.filter(row=>row.country===code[country.slug]&&norm(row.name)===norm(names[city.name]||city.name));if(['Houston','Dallas'].includes(city.name)&&code[country.slug]==='US')rows=rows.filter(row=>row.admin1==='TX');if(city.name==='Perth'&&code[country.slug]==='AU')rows=rows.filter(row=>row.admin1==='08');if(rows.length!==1)throw Error(`Ambiguous city ${country.name}/${city.name}: ${rows.length}`);return{...city,lng:+rows[0].lng,lat:+rows[0].lat};}
const project=([lng,lat])=>[lng, -180/Math.PI*Math.log(Math.tan(Math.PI/4+Math.max(-85,Math.min(85,lat))*Math.PI/360))];
const area=ring=>Math.abs(ring.reduce((s,p,i)=>{const q=ring[(i+1)%ring.length];return s+p[0]*q[1]-q[0]*p[1]},0))/2;
const box=points=>[Math.min(...points.map(p=>p[0])),Math.min(...points.map(p=>p[1])),Math.max(...points.map(p=>p[0])),Math.max(...points.map(p=>p[1]))];
function wrap(s,limit=18){const lines=[];for(const word of s.split(' ')){if(!lines.length||lines.at(-1).length+word.length+1>limit)lines.push(word);else lines[lines.length-1]+=' '+word;}return lines;}
mkdirSync('public/images/learning',{recursive:true});mkdirSync(`${source}/maps`,{recursive:true});const manifest=[],records=[];
for(const country of LOCATIONS){
 const feature=geo.features.find(f=>f.properties['ISO3166-1-Alpha-2']===code[country.slug] || (country.slug==='kosovo'&&f.properties.name==='Kosovo'));if(!feature)throw Error(`Missing country ${country.name}`);
 const polys=(feature.geometry.type==='Polygon'?[feature.geometry.coordinates]:feature.geometry.coordinates).map(p=>p[0]).sort((a,b)=>area(b)-area(a));const mainBox=box(polys[0]);const pad=Math.max(mainBox[2]-mainBox[0],mainBox[3]-mainBox[1])*.3;
 const selected=polys.filter(poly=>{const b=box(poly);return b[0]<mainBox[2]+pad&&b[2]>mainBox[0]-pad&&b[1]<mainBox[3]+pad&&b[3]>mainBox[1]-pad;});
 const marks=country.cities.map(city=>point(country,city));const projected=selected.map(poly=>poly.map(project));const bounds=box([...projected.flat(),...marks.map(p=>project([p.lng,p.lat]))]);
 const w=bounds[2]-bounds[0],h=bounds[3]-bounds[1],scale=Math.min(500/w,415/h);const tx=850-(bounds[0]+bounds[2])/2*scale,ty=410-(bounds[1]+bounds[3])/2*scale;
 const xy=p=>{const [x,y]=project(p);return[x*scale+tx,y*scale+ty]};
 // Quantisation reduces diagram complexity while preserving the visible outline at this size.
 const paths=selected.map(poly=>{let last;const pts=poly.map(p=>xy(p).map(v=>Math.round(v*2)/2)).filter(p=>{if(last&&Math.abs(p[0]-last[0])+Math.abs(p[1]-last[1])<1)return false;last=p;return true;});return'M'+pts.map(p=>p.join(',')).join('L')+'Z';}).join(' ');
 for(const city of [null,...marks]){
  const place=city?.name||country.name,slug=locationCmsSlug(country,city);const lines=wrap(place);const dots=(city?[city]:marks).map(p=>{const[x,y]=xy([p.lng,p.lat]);return`<circle cx="${x}" cy="${y}" r="18" fill="#f59e0b" opacity=".2"/><circle cx="${x}" cy="${y}" r="7" fill="#f59e0b" stroke="#fff" stroke-width="3"/>`;}).join('');
  const tz=locationTimeZone(country,city).replaceAll('_',' ');const svg=`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1200" height="800" viewBox="0 0 1200 800"><defs><pattern id="grid" width="44" height="44" patternUnits="userSpaceOnUse"><path d="M44 0H0V44" fill="none" stroke="#dceee4" stroke-width="1"/></pattern><linearGradient id="map" x2="1" y2="1"><stop stop-color="#006847"/><stop offset="1" stop-color="#15966a"/></linearGradient></defs><rect width="1200" height="800" fill="#f7fcf9"/><rect x="548" y="0" width="652" height="800" fill="#edf8f1"/><rect x="548" y="0" width="652" height="800" fill="url(#grid)"/><circle cx="1150" cy="40" r="210" fill="#dff2e7"/><text x="56" y="104" font-family="sans-serif" font-size="22" letter-spacing="3" fill="#006847">STUDY FROM HOME</text><rect x="56" y="203" width="52" height="4" rx="2" fill="#d9a441"/><text x="56" y="244" font-family="sans-serif" font-size="17" letter-spacing="2" fill="#42745f">${city?'YOUR CITY. YOUR CLASS.':'LEARNING WITHOUT BORDERS'}</text>${lines.map((line,i)=>`<text x="52" y="${310+i*56}" font-family="sans-serif" font-weight="700" font-size="46" fill="#004f36">${esc(line)}</text>`).join('')}<text x="56" y="${340+lines.length*56}" font-family="sans-serif" font-size="23" fill="#42745f">Online Quran learning</text>${city?`<text x="56" y="${374+lines.length*56}" font-family="sans-serif" font-size="19" fill="#42745f">${esc(country.name)}</text>`:''}<path d="${paths}" fill="url(#map)" stroke="#fff" stroke-width="2" stroke-linejoin="round"/>${dots}<rect x="56" y="595" width="135" height="44" rx="22" fill="#e5f2e9"/><text x="123" y="624" text-anchor="middle" font-family="sans-serif" font-size="19" font-weight="700" fill="#006847">${country.currency}</text><text x="56" y="683" font-family="sans-serif" font-size="19" fill="#42745f">${esc(tz)}</text><path d="M56 718H1144" stroke="#d0e5d8"/><text x="56" y="754" font-family="sans-serif" font-size="17" fill="#42745f">Live online lessons • Children and adults</text><text x="1144" y="754" text-anchor="end" font-family="sans-serif" font-size="14" fill="#42745f">Regional illustration • Not a branch location</text></svg>`;
  const filename=`map-${slug.replace(/^locations-/,'')}`;writeFileSync(`${source}/maps/${filename}-r2.svg`,svg);const variants=[];
  for(const width of [400,800,1200]){const url=`/images/learning/${filename}-r2-${width}.webp`;const out=await sharp(Buffer.from(svg)).resize({width}).webp({quality:85,effort:6}).toFile(`public${url}`);variants.push({url,width,bytes:out.size});}
  const alt=`Regional map for online Quran learning in ${place}${city?', '+country.name:''}, with ${country.currency} fee enquiries and local class scheduling`;
  manifest.push({name:filename,url:variants.at(-1).url,width:1200,height:800,alt,kind:'map',variants,storage_url:`https://lgbwidraztavhhbnbfhr.supabase.co/storage/v1/object/public/media/regenerated/2026-10/${filename}-r2-1200.webp`});records.push({slug,asset:filename});
 }
}
writeFileSync('artifacts/location-visual-manifest.json',JSON.stringify(manifest,null,2));writeFileSync('artifacts/location-visual-assignments.json',JSON.stringify(records,null,2));
console.log({maps:manifest.length,totalBytes:manifest.flatMap(m=>m.variants).reduce((a,v)=>a+v.bytes,0),maxBytes:Math.max(...manifest.flatMap(m=>m.variants).map(v=>v.bytes))});
