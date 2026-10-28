import { contentVisual } from "@/lib/content-visual";
import { cardTone } from "@/lib/card-presentation";
import { PageHero } from "@/components/site/chrome";
import { ContentImage } from "@/components/site/content-image";
import { safeJsonLd, breadcrumbSchema } from "@/lib/seo";
import { contentMetadata, publicImageUrl } from "@/lib/seo-metadata";
import { articleNavigation } from "@/lib/article-navigation";
import { articleResources, relatedArticles } from "@/lib/article-resources";
import { ArticleTools } from "@/components/site/article-tools";
import { articleDates, articleAuthor, blogPosting } from "@/lib/blog-seo";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Clock3 } from "@/components/site/icons";
import { CtaBand } from "@/components/site/sections";
import { getPost, getPosts, getPublishedSlugs, getSettings } from "@/lib/site-data";
import { cleanHtml } from "@/lib/sanitize";
import { formatDate, truncate, stripHtml, whatsappLink } from "@/lib/format";
import { SITE_URL } from "@/lib/config";

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  const { posts } = await getPublishedSlugs();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Article not found" };
  const description = post.seo_description || post.excerpt || truncate(stripHtml(post.body_html), 158);
  const visual = contentVisual(post), dates = articleDates(post), author = articleAuthor(post.author_name);
  return { ...contentMetadata({ ...post, cover_url: visual.src, cover_alt: visual.alt, published_at: dates.published, updated_at: dates.modified }, { path: `/blog/${post.slug}`, description, type: "article" }), authors: [{ name: author.name, ...(author["@type"] === "Organization" ? { url: `${SITE_URL}/about` } : {}) }] };
}

export default async function PostPage({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  const [posts, settings] = await Promise.all([getPosts(50), getSettings()]);
  const more = relatedArticles(post, posts);
  const resources = articleResources(post);
  const { html, headings } = articleNavigation(cleanHtml(post.body_html));
  const visual = contentVisual(post), dates = articleDates(post), author = articleAuthor(post.author_name);
  const breadcrumbs = [{ name: "Home", path: "/" }, { name: "Articles", path: "/blog" }, { name: post.title, path: `/blog/${post.slug}` }];
  const wa = whatsappLink(settings["site.contact"]?.whatsapp, "Assalamu alaikum, I read your article and would like to book a free trial.");
  const jsonLd = blogPosting(post, { siteUrl: SITE_URL, visual: { ...visual, src: publicImageUrl(visual.src) }, html, description: post.seo_description || post.excerpt || truncate(stripHtml(html), 158) });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbSchema(breadcrumbs, SITE_URL)) }} />
      <article>
        <PageHero path={`/blog/${post.slug}`} eyebrow={post.category} title={post.title} visual={<ContentImage src={visual.src} alt={visual.alt} priority sizes="(max-width: 1024px) 100vw, 600px" className="aspect-[3/2] w-full object-cover" />}>
          <nav aria-label="Breadcrumb" className="mt-5 text-sm text-white/75"><Link href="/" prefetch={false}>Home</Link> / <Link href="/blog" className="underline">Articles</Link></nav>
          <p className="mt-5 flex flex-wrap items-center gap-3 text-sm text-white/75">{author["@type"] === "Organization" ? <Link href="/about" className="underline underline-offset-4">{author.name}</Link> : <span>{author.name}</span>}{dates.published && <span>Published <time dateTime={dates.published}>{formatDate(dates.published, "UTC")}</time></span>}{dates.showModified && <span>Updated <time dateTime={dates.modified}>{formatDate(dates.modified, "UTC")}</time></span>}{post.reading_minutes ? <span className="inline-flex items-center gap-1"><Clock3 className="size-4" aria-hidden="true" />{post.reading_minutes} min read</span> : null}</p>
        </PageHero>
        <div className="page-wrap article-layout">
          <aside className="article-sidebar order-first min-w-0 lg:order-last" aria-label="Article navigation and learning resources">
            {headings.length > 1 && <details className="article-toc rounded-2xl border border-leaf-100 bg-leaf-50 px-5 py-3"><summary>In this article</summary><nav aria-label="In this article"><ol className="mt-2">{headings.map(heading => <li key={heading.id}><a href={`#${heading.id}`}>{heading.title}</a></li>)}</ol></nav></details>}
            <div className="mt-5 hidden rounded-2xl border border-line bg-white p-5 lg:block">
              <h2 className="font-sans text-lg font-semibold">Continue your learning</h2>
              <p className="mb-4 mt-2 text-sm text-ink-soft">{resources.label}</p>
              {resources.links.map(link => <Link key={link.href} href={link.href} className="article-resource">{link.label}<ArrowRight className="size-4 shrink-0" aria-hidden="true" /></Link>)}
            </div>
          </aside>
          <div className="article-body min-w-0">
          {post.excerpt && <p className="mb-8 max-w-[68ch] border-l-4 border-gold-500 pl-5 text-[1.12rem] leading-relaxed text-ink-soft">{post.excerpt}</p>}
          <div className="prose-oqc text-[1.06rem]" dangerouslySetInnerHTML={{ __html: html }} />
          {post.tags?.length > 0 && (
            <ul className="mt-10 flex flex-wrap gap-2">
              {post.tags.map((t) => (
                <li key={t} className="chip">
                  #{t}
                </li>
              ))}
            </ul>
          )}
          <section className="mt-8 max-w-[68ch] rounded-2xl border border-line bg-paper p-5 sm:p-6" aria-labelledby="article-next-step">
            <h2 id="article-next-step" className="text-xl">Put this guide into practice</h2>
            <p className="mb-4 mt-2 text-sm text-ink-soft">{resources.label}. Use these resources to choose your next step.</p>
            {resources.links.map(link => <Link key={link.href} href={link.href} className="article-resource">{link.label}<ArrowRight className="size-4 shrink-0" aria-hidden="true" /></Link>)}
            <ArticleTools url={`${SITE_URL}/blog/${post.slug}`} />
          </section>
          <p className="article-print-source hidden">Online Quran College · {SITE_URL}/blog/{post.slug}</p>
          </div>
        </div>
      </article>
      {more.length > 0 && (
        <section data-article-related className="border-t border-line bg-white/60 py-14">
          <div className="page-wrap">
            <h2 className="text-[1.8rem] text-mushaf-900">Keep reading</h2>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {more.map((p) => (
                <Link key={p.slug} data-card-tone={cardTone(p.slug)} href={`/blog/${p.slug}`} className="editorial-card card-tinted group flex flex-col">
                  {<div className="mx-2 mt-2 aspect-[3/2] overflow-hidden rounded-[1.15rem]"><ContentImage src={contentVisual(p).src} alt={contentVisual(p).alt} sizes="(max-width: 767px) 100vw, 400px" className="size-full object-cover" /></div>}
                  <div className="flex flex-1 flex-col p-6"><p className="text-xs font-bold uppercase tracking-wider text-leaf-700">{p.category}</p>
                  <h3 className="mt-2 text-[1.1rem] font-bold leading-snug text-mushaf-900 group-hover:text-leaf-700">{p.title}</h3>
                  <p className="mt-2 flex-1 text-[0.93rem] text-ink-soft">{truncate(p.excerpt ?? "", 110)}</p><span className="card-action mt-5">Read article <span className="card-arrow"><ArrowRight className="size-4" aria-hidden="true" /></span></span></div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
      <div data-article-cta><CtaBand title="Put it into practice with a teacher" text="Book a free trial to discuss your learning level, course and lesson time with the college." whatsappHref={wa} /></div>
    </>
  );
}
