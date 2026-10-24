import { contentMetadata } from "@/lib/seo-metadata";
import Link from "next/link";
import { ArrowRight } from "@/components/site/icons";
import { PageHero } from "@/components/site/chrome";
import { ContentImage } from "@/components/site/content-image";
import { LEARNING_GUIDES } from "@/lib/learning-guides";
import { getPage } from "@/lib/site-data";

export const revalidate = 300;
export const metadata = contentMetadata({ title: "Quran Learning Guides for Families & Adults", seo_noindex: false }, { path: "/learn", description: "Choose a Quran learning path: first letters, children's lessons, adult beginner study and Tajweed. Find practical guides and relevant courses." });

export default async function Page() {
  const guides = await Promise.all(LEARNING_GUIDES.map(async guide => ({ ...guide, content: await getPage(guide.slug) })));
  return <>
    <PageHero path="/learn" eyebrow="Learning centre" title="Find a learning path that fits" intro="Start with your learner’s current reading level and goals, then explore a course and discuss a trial." />
    <section className="page-wrap py-16">
      <div className="grid gap-6 sm:grid-cols-2">
        {guides.filter(g => g.content).map(g => <Link className="editorial-card group flex flex-col" key={g.slug} href={g.path}>
          {g.content.cover_url && <div className="relative mx-2 mt-2 aspect-[16/9] overflow-hidden rounded-[1.15rem]"><ContentImage src={g.content.cover_url} alt={g.content.cover_alt} sizes="(max-width: 639px) 100vw, 600px" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" /></div>}
          <div className="flex flex-1 flex-col p-6"><p className="text-xs font-bold uppercase tracking-wider text-leaf-700">{g.audience}</p><h2 className="mt-3 text-2xl">{g.title}</h2>{g.content.excerpt && <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">{g.content.excerpt}</p>}<span className="card-action mt-6">Read the guide <span className="card-arrow"><ArrowRight className="size-4" aria-hidden="true" /></span></span></div>
        </Link>)}
      </div>
      <Link href="/blog" className="btn btn-outline mt-10">Explore all practical articles <ArrowRight className="size-4" aria-hidden="true" /></Link>
    </section>
  </>;
}
