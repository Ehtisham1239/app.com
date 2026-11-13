import { contentVisual } from "@/lib/content-visual";
import { cardTone } from "@/lib/card-presentation";
import { PageHero } from "@/components/site/chrome";
import { ContentImage } from "@/components/site/content-image";
import { safeJsonLd, breadcrumbSchema, faqSchema } from "@/lib/seo";
import { articleAnswer, articleNeedsAnswer } from "@/lib/article-answers";
import { getUsdRates } from "@/lib/fx";
import { contentMetadata, publicImageUrl } from "@/lib/seo-metadata";
import { articleNavigation } from "@/lib/article-navigation";
import { articleResources, relatedArticles } from "@/lib/article-resources";
import { ArticleTools } from "@/components/site/article-tools";
import { articleDates, articleAuthor, blogPosting } from "@/lib/blog-seo";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Clock3 } from "@/components/site/icons";
import { CtaBand } from "@/components/site/sections";
import { getPlans, getPost, getPosts, getPublishedSlugs, getSettings } from "@/lib/site-data";
import { cleanHtml } from "@/lib/sanitize";
import { formatDate, truncate, stripHtml, whatsappLink } from "@/lib/format";
import { SITE_URL } from "@/lib/config";

const supportingImages = {
  "blog-australia-schedule": [
    "/images/learning/blog-australia-schedule-r2-1200.webp",
    "Sunlit study desk with a clock, weekly planner and laptop for scheduling online lessons"
  ],
  "blog-enrolment-questions": [
    "/images/learning/blog-enrolment-questions-r2-1200.webp",
    "Parent preparing an enrolment checklist beside a laptop, calendar and notebook"
  ],
  "oqc-course-noorani-qaida": [
    "/images/learning/oqc-course-noorani-qaida-v3-1200.webp",
    "A parent supporting a child during an online beginner Arabic letter lesson"
  ],
  "oqc-course-hifz-quran": [
    "/images/learning/oqc-course-hifz-quran-v3-1200.webp",
    "A teenage learner reviewing memorisation with a revision notebook and an online teacher"
  ],
  "guide-tajweed": [
    "/images/learning/guide-tajweed-r2-1200.webp",
    "Adult learner listening carefully during a recitation lesson with a book stand and microphone"
  ],
  "oqc-course-quran-translation": [
    "/images/learning/oqc-course-quran-translation-v3-1200.webp",
    "An adult learner comparing study books and notes during an online Quran translation lesson"
  ],
  "oqc-course-arabic-language": [
    "/images/learning/oqc-course-arabic-language-v3-1200.webp",
    "An adult woman practising Arabic vocabulary with a notebook during a live online lesson"
  ],
  "blog-first-trial": [
    "/images/learning/blog-first-trial-r2-1200.webp",
    "Mother and child greeting an online teacher on a laptop at the start of a lesson"
  ],
  "guide-adults": [
    "/images/learning/guide-adults-r2-1200.webp",
    "Mature learner wearing reading glasses studying a beginner workbook beside a laptop"
  ],
  "blog-parent-progress": [
    "/images/learning/blog-parent-progress-r2-1200.webp",
    "Mother discussing a lesson on a laptop while taking progress notes beside her child"
  ],
  "blog-accessible-setup": [
    "/images/learning/blog-accessible-setup-r2-1200.webp",
    "Learner wearing headphones at a bright organised desk with a raised laptop, notebook and reading lamp"
  ],
  "blog-kids-learning": [
    "/images/learning/blog-kids-learning-r2-1200.webp",
    "Father helping his daughter adjust her headset before an online lesson"
  ]
};

function supportingImage(slug, cover, html) {
  if (/<img\b/i.test(html)) return null;
  const topics = [
    [/fees|enrolment|choose-online/, ["blog-enrolment-questions", "blog-parent-progress"]],
    [/time-zones|weekly-routine|ramadan|uae-families/, ["blog-australia-schedule", "blog-accessible-setup"]],
    [/qaida/, ["oqc-course-noorani-qaida", "blog-kids-learning"]],
    [/hifz|memori[sz]ation|sabaq/, ["oqc-course-hifz-quran"]],
    [/tajweed|makharij/, ["guide-tajweed"]],
    [/arabic|tafseer|translation/, ["oqc-course-quran-translation", "oqc-course-arabic-language"]],
    [/adults?|returning-to-quran/, ["guide-adults"]],
    [/setup-accessibility/, ["blog-first-trial"]],
    [/trial|kids|child|parent|famil/, ["blog-first-trial", "blog-kids-learning"]],
  ];
  const candidates = topics.find(([pattern]) => pattern.test(slug))?.[1] || [];
  const coverUrl = new URL(publicImageUrl(cover), SITE_URL).href;
  return candidates.map(key => supportingImages[key]).find(([src]) => publicImageUrl(src) !== coverUrl) || null;
}

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
  const metadata = contentMetadata({ ...post, cover_url: visual.src, cover_alt: visual.alt, published_at: dates.published, updated_at: dates.modified }, { path: `/blog/${post.slug}`, description, type: "article" });
  return {
    ...metadata,
    authors: [{ name: author.name, ...(author["@type"] === "Organization" ? { url: `${SITE_URL}/about` } : {}) }],
    twitter: { ...metadata.twitter, images: metadata.openGraph.images },
  };
}

export default async function PostPage({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  const [posts, settings, quick] = await Promise.all([getPosts(50), getSettings(), articleNeedsAnswer(post.slug) ? Promise.all([getPlans(), getUsdRates()]).then(([plans, fx]) => articleAnswer(post.slug, { plans, fx })) : null]);
  const more = relatedArticles(post, posts);
  const resources = articleResources(post);
  const { html, headings } = articleNavigation(cleanHtml(post.body_html));
  const visual = contentVisual(post), dates = articleDates(post), author = articleAuthor(post.author_name);
  const supporting = supportingImage(post.slug, visual.src, html);
  const breadcrumbs = [{ name: "Home", path: "/" }, { name: "Articles", path: "/blog" }, { name: post.title, path: `/blog/${post.slug}` }];
  const wa = whatsappLink(settings["site.contact"]?.whatsapp, "Assalamu alaikum, I read your article and would like to book a free trial.");
  const jsonLd = blogPosting(post, { siteUrl: SITE_URL, visual: { ...visual, src: publicImageUrl(visual.src) }, html, description: post.seo_description || post.excerpt || truncate(stripHtml(html), 158) });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbSchema(breadcrumbs, SITE_URL)) }} />
      {quick && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(faqSchema([quick])) }} />}
      <article className="bg-white">
        <PageHero path={`/blog/${post.slug}`} eyebrow={post.category} title={post.title} visual={<ContentImage src={visual.src} alt={visual.alt} priority sizes="(max-width: 767px) calc(100vw - 2rem), (max-width: 1023px) calc(100vw - 4rem), 48vw" className="block aspect-[3/2] w-full object-cover object-center" />}>
          <nav aria-label="Breadcrumb" className="mt-5 text-sm text-white/75"><Link href="/" prefetch={false}>Home</Link> / <Link href="/blog" className="underline">Articles</Link></nav>
          <p className="mt-5 flex flex-wrap items-center gap-3 text-sm text-white/75">{author["@type"] === "Organization" ? <Link href="/about" className="underline underline-offset-4">{author.name}</Link> : <span>{author.name}</span>}{dates.published && <span>Published <time dateTime={dates.published}>{formatDate(dates.published, "UTC")}</time></span>}{dates.showModified && <span>Updated <time dateTime={dates.modified}>{formatDate(dates.modified, "UTC")}</time></span>}{post.reading_minutes ? <span className="inline-flex items-center gap-1"><Clock3 className="size-4" aria-hidden="true" />{post.reading_minutes} min read</span> : null}<Link href="/editorial-standards" className="underline underline-offset-4">How we write</Link></p>
        </PageHero>
        <div className="page-wrap article-layout">
          <aside className="article-sidebar order-first min-w-0 lg:order-last" aria-label="Article navigation and learning resources">
            {headings.length > 1 && <details className="article-toc rounded-2xl border border-leaf-100 bg-[#f5faf1] px-5 py-3"><summary>In this article</summary><nav aria-label="In this article"><ol className="mt-2">{headings.map(heading => <li key={heading.id}><a href={`#${heading.id}`}>{heading.title}</a></li>)}</ol></nav></details>}
            <div className="mt-5 hidden rounded-2xl border border-line bg-white p-5 lg:block">
              <h2 className="font-sans text-lg font-semibold">Continue your learning</h2>
              <p className="mb-4 mt-2 text-sm text-ink-soft">{resources.label}</p>
              {resources.links.map(link => <Link key={link.href} href={link.href} className="article-resource">{link.label}<ArrowRight className="size-4 shrink-0" aria-hidden="true" /></Link>)}
            </div>
          </aside>
          <div className="article-body min-w-0">
          {quick && (
            <section aria-labelledby="quick-answer" className="mb-8 max-w-[68ch] rounded-2xl border border-gold-100 bg-gold-50 p-5 sm:p-6">
              <h2 id="quick-answer" className="font-sans text-[1.15rem] font-bold text-mushaf-900">{quick.question}</h2>
              <p className="mt-2 text-[1rem] leading-relaxed text-ink">{quick.answer}</p>
              <Link href={quick.link.href} className="mt-3 inline-flex items-center gap-1.5 font-semibold text-leaf-700 hover:text-leaf-800">{quick.link.label} <ArrowRight className="size-4" aria-hidden="true" /></Link>
            </section>
          )}
          {post.excerpt && <p className="mb-8 max-w-[68ch] border-l-4 border-gold-500 pl-5 text-[1.12rem] leading-relaxed text-ink-soft">{post.excerpt}</p>}
          {supporting && (
            <figure className="mb-8 max-w-[68ch] overflow-hidden rounded-2xl">
              <ContentImage src={supporting[0]} alt={supporting[1]} sizes="(max-width: 767px) calc(100vw - 2rem), 680px" className="block h-auto w-full" />
            </figure>
          )}
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
