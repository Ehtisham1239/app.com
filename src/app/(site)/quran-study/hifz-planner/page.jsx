import { PageHero } from "@/components/site/chrome";
import { HifzPlanner } from "@/components/site/hifz-planner";
import { contentMetadata } from "@/lib/seo-metadata";
import { breadcrumbSchema, safeJsonLd } from "@/lib/seo";
import { SITE_URL } from "@/lib/config";
import Link from "next/link";

export const metadata = contentMetadata(
  { title: "Hifz Memorisation & Revision Planner", seo_noindex: false },
  { path: "/quran-study/hifz-planner", description: "Calculate a simple weekly Quran memorisation and revision target using your own page counts and available study days. Teacher guidance remains essential." }
);

export default function HifzPlannerPage() {
  const crumbs = breadcrumbSchema([
    { name: "Quran practice tools", path: "/quran-study" },
    { name: "Hifz planner", path: "/quran-study/hifz-planner" },
  ], SITE_URL);
  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${SITE_URL}/quran-study/hifz-planner#webpage`,
    url: `${SITE_URL}/quran-study/hifz-planner`,
    name: "Hifz memorisation and revision planner",
    description: "An arithmetic planning aid for user-entered memorisation and revision page counts.",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "en-GB",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(crumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(pageSchema) }} />
      <PageHero path="/quran-study/hifz-planner" eyebrow="Quran practice tool" title="Plan your Hifz and revision routine" intro="Use your own Mushaf page counts and available study days to calculate a simple weekly target. Your teacher should decide whether the workload is suitable." >
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/quran-study" className="btn btn-outline border-white/40 text-white hover:bg-white/10">All Quran practice tools</Link>
          <Link href="/courses/hifz-quran" className="btn btn-gold">Explore Hifz classes</Link>
        </div>
      </PageHero>
      <section className="page-wrap py-12 sm:py-16" aria-labelledby="planner-intro">
        <div className="mx-auto mb-8 max-w-3xl">
          <h2 id="planner-intro" className="text-2xl text-mushaf-900">Set your own numbers</h2>
          <p className="mt-3 leading-relaxed text-ink-soft">Enter how many pages remain, how many days you can study, and the pages you are currently revising. The planner calculates the arithmetic only; it does not judge memorisation quality, Tajweed, retention or readiness to move forward.</p>
        </div>
        <HifzPlanner />
      </section>
      <section className="border-t border-line bg-leaf-50/40 py-10">
        <div className="page-wrap mx-auto max-w-3xl">
          <h2 className="text-xl text-mushaf-900">Use the plan with your teacher</h2>
          <p className="mt-3 leading-relaxed text-ink-soft">Discuss the amount of new memorisation, daily revision, missed-day recovery and regular listening with your teacher. If the target feels difficult to retain accurately, reduce it together. Do not rush a schedule simply to meet a date.</p>
          <p className="mt-4 text-sm text-ink-soft">For a teacher-guided course, see <Link className="font-semibold text-leaf-700 underline" href="/courses/hifz-quran">Hifz ul Quran classes</Link> or <Link className="font-semibold text-leaf-700 underline" href="/free-trial">request a trial</Link>.</p>
        </div>
      </section>
    </>
  );
}
