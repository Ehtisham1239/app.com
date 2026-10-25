import { contentVisual } from "@/lib/content-visual";
import { cardTone } from "@/lib/card-presentation";
import { contentMetadata } from "@/lib/seo-metadata";
import { ContentImage } from "@/components/site/content-image";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Clock3 } from "@/components/site/icons";
import { PageHero } from "@/components/site/chrome";
import { getPostPage } from "@/lib/site-data";
import { formatDate, truncate } from "@/lib/format";

export const revalidate = 300;

function feedParams(params = {}) { const page = Number(params.page || 1); return { page: Number.isInteger(page) && page > 0 && page < 10000 ? page : 1, category: typeof params.category === "string" ? params.category.slice(0, 100) : "" }; }
function feedUrl(page, category) { const p = new URLSearchParams(); if (category) p.set("category", category); if (page > 1) p.set("page", String(page)); return `/blog${p.size ? `?${p}` : ""}`; }
export async function generateMetadata({ searchParams }) {
  const { page, category } = feedParams(await searchParams);
  const title = category ? `${category} Quran Learning Articles | OQC` : page > 1 ? `Quran Learning Articles · Page ${page} | OQC` : "Quran Learning Articles & Parent Guides | OQC";
  return contentMetadata({ seo_title: title, seo_noindex: Boolean(category) }, { path: feedUrl(page, category), description: "Practical articles on Tajweed, Hifz, Noorani Qaida and helping children learn the Quran online." });
}

function PostCard({ post, large = false }) {
  return (
    <Link
      data-card-tone={cardTone(post.slug)}
      href={`/blog/${post.slug}`}
      className={`editorial-card card-tinted group flex h-full flex-col ${large ? "md:col-span-2 md:flex-row" : ""}`}
    >
      <div className={`relative m-2 shrink-0 overflow-hidden rounded-[1.15rem] bg-leaf-50 ${large ? "aspect-[3/2] md:aspect-auto md:w-[46%]" : "aspect-[3/2]"}`}>
        <ContentImage src={contentVisual(post).src} alt={contentVisual(post).alt} sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 400px" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
      </div>
      <div className={`flex min-w-0 flex-1 flex-col px-6 pb-6 pt-4 ${large ? "md:py-7" : ""}`}>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.7rem] font-semibold uppercase tracking-wider text-leaf-700">
          {post.category}
          {post.reading_minutes ? (
            <span className="flex items-center gap-1 font-medium normal-case tracking-normal text-ink-faint">
              <Clock3 className="size-3.5" aria-hidden="true" /> {post.reading_minutes} min read
            </span>
          ) : null}
        </p>
        <h2 className={`mt-3 font-sans font-bold leading-snug text-mushaf-900 ${large ? "text-[1.6rem]" : "text-[1.2rem]"}`}>{post.title}</h2>
        <p className="mt-3 flex-1 text-[0.97rem] leading-relaxed text-ink-soft">{truncate(post.excerpt || "", large ? 140 : 100)}</p>
        <p className="mt-4 text-xs text-ink-faint">{formatDate(post.published_at)}</p>
        <span className="card-action mt-5">Read article <span className="card-arrow"><ArrowRight className="size-4" aria-hidden="true" /></span></span>
      </div>
    </Link>
  );
}

export default async function BlogPage({ searchParams }) {
  const { page, category } = feedParams(await searchParams);
  const { posts, hasNext } = await getPostPage(page, category);
  if (page > 1 && !posts.length) notFound();
  return (
    <>
      <PageHero path="/blog" eyebrow="Blog" title="Quran learning articles for learners and parents" arabic="عِلْم" intro="Short, practical reading on recitation, memorisation and building a Quran routine at home." />
      <section className="page-wrap py-16 sm:py-20">
        <nav aria-label="Article topics" className="mb-8 flex flex-wrap gap-3">{["", "USA & Australia", "First steps", "Parents & children", "Adult learning", "Recitation & revision"].map(c => <Link key={c} className={`btn btn-sm ${c === category ? "btn-primary" : "btn-outline"}`} href={feedUrl(1,c)}>{c || "All articles"}</Link>)}</nav>
        {posts.length === 0 ? (
          <p className="surface p-10 text-center text-ink-soft">New articles are on their way. Please check back soon.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((p, i) => (
              <PostCard key={p.id} post={p} large={i === 0 && posts.length > 2} />
            ))}
          </div>
        )}
        {(page > 1 || hasNext) && <nav aria-label="Article pages" className="mt-10 flex items-center justify-between gap-4">{page > 1 ? <Link className="btn btn-outline" href={feedUrl(page-1,category)}>Previous articles</Link> : <span />}<span className="text-sm">Page {page}</span>{hasNext && <Link className="btn btn-primary" href={feedUrl(page+1,category)}>Next articles</Link>}</nav>}
      </section>
    </>
  );
}
