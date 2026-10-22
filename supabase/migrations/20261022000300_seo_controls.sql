-- SEO settings reuse existing content RLS and audit triggers; no new anonymous write access.
alter table public.pages add column if not exists seo_noindex boolean not null default false;
alter table public.pages add column if not exists seo_focus_keyword text not null default '';
alter table public.courses add column if not exists seo_noindex boolean not null default false;
alter table public.courses add column if not exists seo_focus_keyword text not null default '';
alter table public.courses add column if not exists canonical_url text;
alter table public.blog_posts add column if not exists seo_noindex boolean not null default false;
alter table public.blog_posts add column if not exists seo_focus_keyword text not null default '';
alter table public.blog_posts add column if not exists canonical_url text;
