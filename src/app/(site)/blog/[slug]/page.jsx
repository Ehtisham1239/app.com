import { ContentImage } from "@/components/site/content-image";
import { safeJsonLd } from "@/lib/seo";
import { contentMetadata } from "@/lib/seo-metadata";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock3 } from "lucide-react";
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
  return contentMetadata(post, { path: `/blog/${post.slug}`, description, type: "article" });
}

export default async function PostPage({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  const [posts, settings] = await Promise.all([getPosts(6), getSettings()]);
  const more = posts.filter((p) => p.slug !== post.slug).slice(0, 3);
  const wa = whatsappLink(settings["site.contact"]?.whatsapp, "Assalamu alaikum, I read your article and would like to book a free trial.");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${SITE_URL}/blog/${post.slug}#article`,
    headline: post.title,
    keywords: post.tags?.join(", "),
    inLanguage: "en",
    description: post.excerpt,
    dateModified: post.updated_at,
    ...(post.cover_url ? { image: new URL(post.cover_url, SITE_URL).href } : {}),
    datePublished: post.published_at,
    author: { "@type": "Organization", name: post.author_name },
    publisher: { "@type": "Organization", name: "Online Quran College", logo: { "@type": "ImageObject", url: `${SITE_URL}/icon` } },
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      <article>
        <header className="relative overflow-hidden bg-mushaf-900 text-white">
          <div className="pattern-girih pointer-events-none absolute inset-0 opacity-[0.08]" aria-hidden="true" />
          <div className="page-wrap relative max-w-4xl py-14 sm:py-20">
            <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white">
              <ArrowLeft className="size-4" aria-hidden="true" /> All articles
            </Link>
            <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-gold-300">{post.category}</p>
            <h1 className="mt-3 text-[2.3rem] leading-tight text-white sm:text-[3.1rem]">{post.title}</h1>
            <p className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.95rem] text-white/65">
              <span>{post.author_name}</span>
              <span aria-hidden="true">·</span>
              <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
              {post.reading_minutes ? (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock3 className="size-4" aria-hidden="true" /> {post.reading_minutes} min read
                  </span>
                </>
              ) : null}
            </p>
          </div>
        </header>
        {post.cover_url && (
          <div className="page-wrap max-w-4xl">
            <ContentImage src={post.cover_url} alt={post.cover_alt} className="-mt-0 aspect-[16/8] w-full rounded-b-[1.5rem] object-cover" />
          </div>
        )}
        <div className="page-wrap max-w-4xl py-14">
          {post.excerpt && <p className="mb-8 border-l-4 border-gold-500 pl-5 text-[1.18rem] leading-relaxed text-ink-soft">{post.excerpt}</p>}
          <div className="prose-oqc text-[1.06rem]" dangerouslySetInnerHTML={{ __html: cleanHtml(post.body_html) }} />
          {post.tags?.length > 0 && (
            <ul className="mt-10 flex flex-wrap gap-2">
              {post.tags.map((t) => (
                <li key={t} className="chip">
                  #{t}
                </li>
              ))}
            </ul>
          )}
        </div>
      </article>
      {more.length > 0 && (
        <section className="border-t border-line bg-white/60 py-14">
          <div className="page-wrap">
            <h2 className="text-[1.8rem] text-mushaf-900">Keep reading</h2>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {more.map((p) => (
                <Link key={p.slug} href={`/blog/${p.slug}`} className="group rounded-[var(--radius-card)] border border-line bg-white p-6 transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]">
                  <p className="text-xs font-bold uppercase tracking-wider text-gold-700">{p.category}</p>
                  <h3 className="mt-2 text-[1.1rem] font-bold leading-snug text-mushaf-900 group-hover:text-leaf-700">{p.title}</h3>
                  <p className="mt-2 text-[0.93rem] text-ink-soft">{truncate(p.excerpt ?? "", 110)}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
      <CtaBand title="Put it into practice with a teacher" text="Book a free trial class and get personal guidance from a qualified teacher." whatsappHref={wa} />
    </>
  );
}
