import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Clock3 } from "lucide-react";
import { PageHero } from "@/components/site/chrome";
import { getPostPage } from "@/lib/site-data";
import { formatDate } from "@/lib/format";

export const revalidate = 300;

const blogMetadata = {
  title: "Blog — Guidance for Quran Learners and Parents",
  description: "Practical articles on Tajweed, Hifz, Noorani Qaida and helping children learn the Quran online.",
  alternates: { canonical: "/blog" },
};

function feedParams(params = {}) { const page = Number(params.page || 1); return { page: Number.isInteger(page) && page > 0 && page < 10000 ? page : 1, category: typeof params.category === "string" ? params.category.slice(0, 100) : "" }; }
function feedUrl(page, category) { const p = new URLSearchParams(); if (category) p.set("category", category); if (page > 1) p.set("page", String(page)); return `/blog${p.size ? `?${p}` : ""}`; }
export async function generateMetadata({ searchParams }) { const { page, category } = feedParams(await searchParams); return { ...blogMetadata, title: { absolute: category ? `${category} Quran Learning Articles | OQC` : page > 1 ? `Quran Learning Articles · Page ${page} | OQC` : "Quran Learning Articles & Parent Guides | OQC" }, alternates: { canonical: feedUrl(page, category) }, ...(category ? { robots: { index: false, follow: true } } : {}) }; }

function PostCard({ post, large = false }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`group flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-white transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-lift)] ${large ? "md:col-span-2 md:flex-row" : ""}`}
    >
      <div className={`relative overflow-hidden bg-mushaf-900 ${large ? "aspect-[16/10] md:aspect-auto md:w-1/2" : "aspect-[16/9]"}`}>
        {post.cover_url ? (
          <img src={post.cover_url} alt="" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
        ) : (
          <div className="pattern-girih flex size-full items-center justify-center">
            <span className="rounded-full bg-mushaf-950/80 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-gold-300 ring-1 ring-gold-400/40">{post.category}</span>
          </div>
        )}
      </div>
      <div className={`flex flex-1 flex-col p-6 ${large ? "md:p-9" : ""}`}>
        <p className="flex items-center gap-3 text-[0.8rem] font-semibold uppercase tracking-wider text-gold-700">
          {post.category}
          {post.reading_minutes ? (
            <span className="flex items-center gap-1 font-medium normal-case tracking-normal text-ink-faint">
              <Clock3 className="size-3.5" aria-hidden="true" /> {post.reading_minutes} min read
            </span>
          ) : null}
        </p>
        <h2 className={`mt-3 font-sans font-bold leading-snug text-mushaf-900 ${large ? "text-[1.6rem]" : "text-[1.2rem]"}`}>{post.title}</h2>
        <p className="mt-3 flex-1 text-[0.97rem] leading-relaxed text-ink-soft">{post.excerpt}</p>
        <p className="mt-5 flex items-center justify-between text-[0.88rem] text-ink-faint">
          {formatDate(post.published_at)}
          <span className="inline-flex items-center gap-1 font-semibold text-leaf-700">
            Read <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </span>
        </p>
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
      <PageHero eyebrow="Blog" title="Guidance for learners and parents" arabic="عِلْم" intro="Short, practical reading on recitation, memorisation and building a Quran routine at home." />
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
