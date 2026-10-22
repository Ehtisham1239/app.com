import { PGlite } from '@electric-sql/pglite';
import { pgcrypto } from '@electric-sql/pglite/contrib/pgcrypto';
import { readFileSync,readdirSync,writeFileSync } from 'node:fs';
const root=new URL("../", import.meta.url).pathname; const db=new PGlite({extensions:{pgcrypto}});
await db.exec(readFileSync(root+'supabase/tests/local_shim.sql','utf8'));
for(const f of readdirSync(root+'supabase/migrations').sort()) {if(/20261013000800|20261013001400/.test(f))continue;await db.exec(readFileSync(root+'supabase/migrations/'+f,'utf8'));}
const rows=async(q)=>(await db.query(q)).rows;
const content={
 settings:await rows('select key,value from settings where is_public'),
 menus:await rows('select id,menu,label,href,parent_id,sort_order,opens_new_tab from menu_items where is_visible order by sort_order'),
 courses:await rows("select c.*, coalesce((select jsonb_agg(m order by m.sort_order) from course_modules m where m.course_id=c.id),'[]') as course_modules from courses c where c.status='published' and c.deleted_at is null order by sort_order"),
 plans:await rows("select p.*, coalesce((select jsonb_agg(jsonb_build_object('currency',currency,'amount_minor',amount_minor)) from pricing_plan_prices where plan_id=p.id),'[]') as prices from pricing_plans p where status='published' and is_public and deleted_at is null order by sort_order"),
 faqs:await rows("select id,question,answer,category,course_id,sort_order from faqs where status='published' order by sort_order"),
 testimonials:await rows("select id,name,relation,country,quote,rating,avatar_url,sort_order from testimonials where status='published' order by sort_order"),
 teachers:await rows("select id,slug,display_name,headline,gender,bio,qualifications,languages,specialties,years_experience,photo_url,sort_order from teachers where is_public and is_active and deleted_at is null order by sort_order"),
 posts:await rows("select id,slug,title,excerpt,cover_url,category,tags,author_name,reading_minutes,published_at,body_html,seo_title,seo_description,updated_at from blog_posts where status='published' and deleted_at is null order by published_at desc"),
 pages:await rows("select p.*, coalesce((select jsonb_agg(s order by s.sort_order) from page_sections s where s.page_id=p.id),'[]') as page_sections from pages p where p.status='published' and p.deleted_at is null")
};
writeFileSync(root+'src/lib/seed-content.json',JSON.stringify(content)); await db.close();console.log('Exported public seed content only');
