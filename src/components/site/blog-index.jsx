import { contentVisual } from "@/lib/content-visual";
import { cardTone } from "@/lib/card-presentation";
import { contentMetadata } from "@/lib/seo-metadata";
import { ContentImage } from "@/components/site/content-image";
import { notFound } from "next/navigation";
import { NavigationLink as Link } from "@/components/site/navigation-link";
import { ArrowRight } from "@/components/site/icons";
import { PageHero } from "@/components/site/chrome";
import { getPostPage } from "@/lib/site-data";
import { blogUrl } from "@/lib/blog-seo";
import { safeJsonLd } from "@/lib/seo";
import { SITE_URL } from "@/lib/config";
import { formatDate, truncate } from "@/lib/format";

// Shared by /blog (static, first page) and /blog/browse (rewritten ?page= URLs).
export function blogIndexMetadata(filters) {
  if (!filters) notFound();
  const { page } = filters;
  const title = `Quran Learning Articles & Parent Guides${page > 1 ? ` · Page ${page}` : ""} | OQC`;
  const description = `Practical articles on Tajweed, Hifz, Noorani Qaida and Quranic Arabic, plus guides to help parents support children learning the Quran online.${page > 1 ? ` Page ${page}.` : ""}`;
  return contentMetadata({ seo_title: title }, { path: blogUrl(page), description });
}

function PostCard({ post, large = false }) {
  const titleId = `blog-card-${post.slug}`;
  const visual = contentVisual(post);
  return (
    <Link
      aria-labelledby={titleId}
      data-card-tone={cardTone(post.slug)}
      href={`/blog/${post.slug}`}
      className={`article-preview editorial-card card-tinted group flex h-full flex-col ${large ? "md:col-span-2 md:flex-row lg:col-span-3" : ""}`}
    >
      <div className={`relative m-2 shrink-0 overflow-hidden rounded-[1.15rem] bg-leaf-50 ${large ? "aspect-[3/2] md:aspect-[3/2] md:w-[46%] lg:w-[44%]" : "aspect-[3/2]"}`}>
        <ContentImage src={visual.src} alt={visual.alt} sizes={large ? "auto, (max-width: 767px) calc(100vw - 2rem), 520px" : "auto, (max-width: 767px) calc(100vw - 2rem), (max-width: 1023px) 50vw, 400px"} className="size-full object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-105" />
      </div>
      <div className={`flex min-w-0 flex-1 flex-col px-6 pb-6 pt-4 ${large ? "md:py-7" : ""}`}>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.7rem] font-semibold uppercase tracking-wider text-leaf-700">
          {post.category}
        </p>
        <h3 id={titleId} className={`mt-3 font-sans font-bold leading-snug text-mushaf-900 ${large ? "text-[1.6rem]" : "text-[1.2rem]"}`}>{post.title}</h3>
        <p className="mt-3 flex-1 text-[0.97rem] leading-relaxed text-ink-soft">{truncate(post.excerpt || "", large ? 165 : 120)}</p>
        {post.published_at && <time dateTime={post.published_at} className="mt-4 text-xs text-ink-faint">{formatDate(post.published_at)}</time>}
        <span className="card-action mt-5">Read article <span className="card-arrow"><ArrowRight className="size-4" aria-hidden="true" /></span></span>
      </div>
    </Link>
  );
}

export async function BlogIndex({ filters }) {
  if (!filters) notFound();
  const { page } = filters;
  const { posts, hasNext } = await getPostPage(page);
  if (page > 1 && !posts.length) notFound();
  const collection = { "@context": "https://schema.org", "@type": "Blog", "@id": `${SITE_URL}${blogUrl(page)}#blog`, url: `${SITE_URL}${blogUrl(page)}`, name: "Quran learning articles", publisher: { "@id": `${SITE_URL}/#organization` }, mainEntity: { "@type": "ItemList", itemListElement: posts.map((post, index) => ({ "@type": "ListItem", position: (page - 1) * 9 + index + 1, url: `${SITE_URL}/blog/${post.slug}`, name: post.title })) } };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(collection) }} />
      <PageHero path={blogUrl(page)} eyebrow="Blog" title={`Quran learning articles for learners and parents${page > 1 ? ` · Page ${page}` : ""}`} arabic="عِلْم" intro="Preparing for a first lesson or trying to make practice more consistent? Find advice on Quran reading, Tajweed and Hifz that you can use at home." />
      {page === 1 && <nav aria-label="Quran learning topics" className="page-wrap pt-10">
        <h2 className="text-2xl text-mushaf-900">Find a guide for your next lesson</h2>
        <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-leaf-700">
          <li><Link prefetch={false} className="underline underline-offset-4" href="/learn/quran-for-kids">Help a child learn Quran</Link></li>
          <li><Link prefetch={false} className="underline underline-offset-4" href="/blog/arabic-for-quran-readers">Start learning Quranic Arabic</Link></li>
          <li><Link prefetch={false} className="underline underline-offset-4" href="/blog/tajweed-rules-for-beginners">Practise beginner Tajweed rules</Link></li>
          <li><Link prefetch={false} className="underline underline-offset-4" href="/blog/online-quran-classes-europe-time-zones">Plan lessons across European time zones</Link></li>
        </ul>
      </nav>}
      <section className="page-wrap py-10 sm:py-14" aria-labelledby="blog-articles">
        <h2 id="blog-articles" className="sr-only">Articles</h2>
        {posts.length === 0 ? (
          <p className="surface p-10 text-center text-ink-soft">New articles are on their way. Please check back soon.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((p, i) => (
              <PostCard key={p.id} post={p} large={page === 1 && i === 0 && posts.length > 2} />
            ))}
          </div>
        )}
        {(page > 1 || hasNext) && <nav aria-label="Article pages" className="mt-10 grid grid-cols-[1fr_auto_1fr] items-center gap-3">{page > 1 ? <Link rel="prev" className="btn btn-outline whitespace-normal text-center" href={blogUrl(page-1)}>Previous articles</Link> : <span />}<span aria-current="page" className="text-sm">Page {page}</span>{hasNext ? <Link rel="next" className="btn btn-primary whitespace-normal text-center" href={blogUrl(page+1)}>Next articles</Link> : <span />}</nav>}
        <p className="mt-8 text-sm text-ink-soft"><a href="/blog/feed.xml" className="underline underline-offset-4">Subscribe to the article RSS feed</a></p>
      </section>
    </>
  );
}
