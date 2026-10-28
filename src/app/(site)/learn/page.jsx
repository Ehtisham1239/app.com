import { contentVisual } from "@/lib/content-visual";
import { cardTone } from "@/lib/card-presentation";
import { contentMetadata } from "@/lib/seo-metadata";
import Link from "next/link";
import { ArrowRight } from "@/components/site/icons";
import { PageHero } from "@/components/site/chrome";
import { ContentImage } from "@/components/site/content-image";
import { LEARNING_GUIDES } from "@/lib/learning-guides";
import { COURSE_STARTING_POINTS, LEARNING_ARTICLE_PATHS } from "@/lib/learning-decisions";
import { getCourses, getPage, getPosts, getPublishedSlugs } from "@/lib/site-data";
import { breadcrumbSchema, safeJsonLd, shouldIncludeInSitemap } from "@/lib/seo";
import { SITE_URL } from "@/lib/config";

export const revalidate = 300;
export const metadata = contentMetadata({ title: "Quran Learning Guides for Families & Adults", seo_noindex: false }, { path: "/learn", description: "Compare Noorani Qaida, Quran reading, Tajweed and Hifz. Find a starting point, practical parent and adult guides, and questions to ask before a trial." });

export default async function Page() {
  const [guideRecords, courses, posts, published] = await Promise.all([
    Promise.all(LEARNING_GUIDES.map(async guide => ({ ...guide, content: await getPage(guide.slug) }))),
    getCourses(), getPosts(50), getPublishedSlugs(),
  ]);
  const guides = guideRecords.filter(guide => guide.content && shouldIncludeInSitemap(guide.content, guide.path, SITE_URL));
  const courseChoices = COURSE_STARTING_POINTS.flatMap(choice => {
    const course = courses.find(course => course.slug === choice.slug);
    const record = published.courses.find(course => course.slug === choice.slug);
    return course && record && shouldIncludeInSitemap(record, `/courses/${course.slug}`, SITE_URL) ? [{ ...choice, course }] : [];
  });
  const articles = LEARNING_ARTICLE_PATHS.flatMap(slug => {
    const post = posts.find(post => post.slug === slug);
    const record = published.posts.find(post => post.slug === slug);
    return post && record && shouldIncludeInSitemap(record, `/blog/${slug}`, SITE_URL) ? [post] : [];
  });
  const resources = [...guides.map(guide => ({ name: guide.title, path: guide.path })), ...articles.map(post => ({ name: post.title, path: `/blog/${post.slug}` }))];
  const resourceList = {
    "@context": "https://schema.org", "@type": "ItemList", "@id": `${SITE_URL}/learn#resources`,
    name: "Quran learning guides and practical articles", numberOfItems: resources.length,
    itemListElement: resources.map((resource, index) => ({ "@type": "ListItem", position: index + 1, name: resource.name, url: `${SITE_URL}${resource.path}` })),
  };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbSchema([{ name: "Learning guides", path: "/learn" }], SITE_URL)) }} />
    {resources.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(resourceList) }} />}
    <PageHero path="/learn" eyebrow="Learning centre" title="Quran learning guides for families and adults" intro="Start with your learner’s current reading level and goals, then explore a course and discuss a trial." />
    <div className="page-wrap py-12">
      <nav aria-label="On this learning guide" className="flex flex-wrap gap-3 text-sm font-semibold text-leaf-700">
        <a className="rounded-full border border-line px-4 py-2 hover:bg-leaf-50" href="#course-comparison">Compare courses</a>
        <a className="rounded-full border border-line px-4 py-2 hover:bg-leaf-50" href="#learning-guides">Choose a guide</a>
        <a className="rounded-full border border-line px-4 py-2 hover:bg-leaf-50" href="#before-enrolling">Before enrolling</a>
        {articles.length > 0 && <a className="rounded-full border border-line px-4 py-2 hover:bg-leaf-50" href="#practical-articles">Practical articles</a>}
      </nav>
      <section id="course-comparison" aria-labelledby="course-comparison-heading" className="scroll-mt-28 py-10">
        <h2 id="course-comparison-heading" className="text-3xl">Which Quran course should I start with?</h2>
        <p className="mt-4 max-w-3xl text-ink-soft">Start with Noorani Qaida if Arabic letters and joined words are new to you. If you already recognise them, discuss Quran reading and Tajweed feedback. Hifz focuses on memorisation and revision. Arabic language and Quran translation address different learning goals. A trial helps you and the teacher discuss a suitable starting point.</p>
        {courseChoices.length > 0 && <div role="region" aria-label="Quran course comparison" tabIndex={0} className="mt-7 overflow-x-auto rounded-2xl border border-line focus-visible:outline-2 focus-visible:outline-leaf-700">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <caption className="sr-only">Compare your starting point with the focus of each available Quran course</caption>
            <thead className="bg-leaf-50"><tr><th scope="col" className="p-4">Your starting point or goal</th><th scope="col" className="p-4">Course to discuss</th><th scope="col" className="p-4">Main focus</th></tr></thead>
            <tbody>{courseChoices.map(choice => <tr key={choice.slug} className="border-t border-line"><td className="p-4 align-top">{choice.startingPoint}</td><th scope="row" className="p-4 align-top font-semibold"><Link prefetch={false} className="text-leaf-700 underline underline-offset-4" href={`/courses/${choice.slug}`}>{choice.course.title}</Link></th><td className="p-4 align-top text-ink-soft">{choice.focus}</td></tr>)}</tbody>
          </table>
        </div>}
        <p className="mt-4 max-w-3xl text-sm text-ink-soft">Tajweed is pronunciation and recitation practice; it can be part of Quran reading and Hifz. Read the <Link prefetch={false} className="font-semibold text-leaf-700 underline" href="/courses/tajweed">Tajweed learning guide</Link> before discussing your goals. Course choice and progress depend on the learner; no fixed completion time is promised.</p>
      </section>
    </div>
    <section id="learning-guides" aria-labelledby="learning-guides-heading" className="page-wrap scroll-mt-28 pb-14">
      <h2 id="learning-guides-heading" className="mb-7 text-3xl">Choose a guide for your learner</h2>
      <div className="grid gap-6 sm:grid-cols-2">
        {guides.map(g => <Link prefetch={false} data-card-tone={cardTone(g.slug)} className="editorial-card card-tinted group flex flex-col" key={g.slug} href={g.path}>
          {<div className="relative mx-2 mt-2 aspect-[16/9] overflow-hidden rounded-[1.15rem]"><ContentImage src={contentVisual(g.content).src} alt={contentVisual(g.content).alt} sizes="(max-width: 639px) 100vw, 600px" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" /></div>}
          <div className="flex flex-1 flex-col p-6"><p className="text-xs font-bold uppercase tracking-wider text-leaf-700">{g.audience}</p><h2 className="mt-3 text-2xl">{g.title}</h2>{g.content.excerpt && <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">{g.content.excerpt}</p>}<span className="card-action mt-6">Read the guide <span className="card-arrow"><ArrowRight className="size-4" aria-hidden="true" /></span></span></div>
        </Link>)}
      </div>
    </section>
    <section id="before-enrolling" aria-labelledby="before-enrolling-heading" className="scroll-mt-28 border-y border-line bg-leaf-50/40 py-14">
      <div className="page-wrap"><h2 id="before-enrolling-heading" className="text-3xl">What should I check before enrolling?</h2>
        <div className="mt-7 grid gap-7 md:grid-cols-3">
          <div><h3 className="text-xl">Teacher and lesson fit</h3><p className="mt-3 text-ink-soft">Ask about teaching language, experience with your learner’s level, lesson materials and how progress is reviewed. You can request a female or male teacher; the coordinator confirms availability. For children, discuss parent supervision and how to raise a concern.</p><Link prefetch={false} className="mt-4 inline-block font-semibold text-leaf-700 underline" href="/teachers">Meet the teachers</Link></div>
          <div><h3 className="text-xl">Local time and fees</h3><p className="mt-3 text-ink-soft">Confirm the date, local time zone, lesson length, weekly frequency and fee currency. Check rescheduling and refund terms before choosing a package. Country pages describe online class coverage, rather than local teaching offices.</p><p className="mt-4"><Link prefetch={false} className="font-semibold text-leaf-700 underline" href="/locations">Check your country and time zone</Link></p><p className="mt-2"><Link prefetch={false} className="font-semibold text-leaf-700 underline" href="/pricing">Compare published packages</Link></p></div>
          <div><h3 className="text-xl">The three-day free trial</h3><p className="mt-3 text-ink-soft">Tell us the learner’s age group, reading level, course interest and preferred times. The team contacts you to arrange suitable lessons. The three-day free trial applies to eligible plans; the Weekend plan is excluded. Review the teacher’s feedback before deciding on regular classes.</p><Link prefetch={false} className="btn btn-primary mt-5" href="/free-trial">Request a three-day trial <ArrowRight className="size-4" aria-hidden="true" /></Link></div>
        </div>
      </div>
    </section>
    {articles.length > 0 && <section id="practical-articles" aria-labelledby="practical-articles-heading" className="page-wrap scroll-mt-28 py-14">
      <h2 id="practical-articles-heading" className="text-3xl">Practical answers for lessons at home</h2>
      <p className="mt-4 max-w-3xl text-ink-soft">Use these guides to prepare for a trial, turn feedback into practice and discuss progress with your teacher.</p>
      <ul className="mt-7 grid gap-4 sm:grid-cols-2">{articles.map(post => <li key={post.slug} className="surface p-5"><h3 className="text-xl"><Link prefetch={false} className="text-leaf-700 underline decoration-leaf-700/30 underline-offset-4 hover:decoration-leaf-700" href={`/blog/${post.slug}`}>{post.title}</Link></h3>{post.excerpt && <p className="mt-3 text-sm text-ink-soft">{post.excerpt}</p>}</li>)}</ul>
      <Link prefetch={false} href="/blog" className="btn btn-outline mt-8">Explore all practical articles <ArrowRight className="size-4" aria-hidden="true" /></Link>
    </section>}
  </>;
}
