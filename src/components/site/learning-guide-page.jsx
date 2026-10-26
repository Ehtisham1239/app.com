import { SEARCH_INTENTS } from "@/lib/search-intent";
import { ContentImage } from "@/components/site/content-image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "./chrome";
import { getCourse, getPage } from "@/lib/site-data";
import { cleanHtml } from "@/lib/sanitize";
import { breadcrumbSchema, safeJsonLd } from "@/lib/seo";
import { SITE_URL } from "@/lib/config";
import { LEARNING_GUIDES } from "@/lib/learning-guides";
export async function LearningGuidePage({ guide }) {
  const [page, course] = await Promise.all([getPage(guide.slug), getCourse(guide.course)]);
  if (!page) notFound();
  const intent = SEARCH_INTENTS[guide.path];
  const breadcrumbs = [{ name: "Learning guides", path: "/learn" }, { name: page.title, path: guide.path }];
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbSchema(breadcrumbs, SITE_URL)) }} /><PageHero path={guide.path} eyebrow={guide.audience} title={page.title} intro={page.excerpt} visual={page.cover_url ? <ContentImage src={page.cover_url} alt={page.cover_alt} priority sizes="(max-width: 1024px) 100vw, 600px" className="aspect-[3/2] w-full object-cover" /> : undefined} />
    <section className="page-wrap max-w-4xl space-y-8 py-14"><nav aria-label="Breadcrumb" className="text-sm text-leaf-700"><Link href="/learn">Learning guides</Link> / <span aria-current="page">{page.title}</span></nav>{intent && <section className="border-l-4 border-gold-400 pl-5"><h2 className="text-2xl">{intent.heading}</h2><p className="mt-3 text-ink-soft">{intent.intro}</p></section>}<article className="prose-oqc" dangerouslySetInnerHTML={{ __html: cleanHtml(page.body_html) }} />
      <div className="surface space-y-4 p-6"><h2 className="text-2xl">Discuss the right course for your learner</h2><p>This guide explains a learning topic. The coordinator confirms the available course, teacher, timetable and fees before enrolment.</p>{course && <Link className="font-semibold text-leaf-700 underline" href={`/courses/${course.slug}`}>Explore {course.title}</Link>}<div><Link className="btn btn-primary" href={`/free-trial${course ? `?course=${course.id}` : ""}`}>Request a free trial</Link></div></div>
          <nav aria-labelledby="more-guides" className="surface p-6"><h2 id="more-guides" className="text-2xl">More learning guides</h2><ul className="mt-4 grid gap-3 sm:grid-cols-2">{LEARNING_GUIDES.filter(g => g.path !== guide.path).map(g => <li key={g.path}><Link className="font-semibold text-leaf-700 underline underline-offset-2" href={g.path}>{g.title}</Link><span className="block text-sm text-ink-soft">{g.audience}</span></li>)}</ul></nav>
    </section></>;
}
