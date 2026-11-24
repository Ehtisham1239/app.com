import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "@/components/site/icons";
import { PageHero } from "@/components/site/chrome";
import { contentMetadata } from "@/lib/seo-metadata";
import { breadcrumbSchema, safeJsonLd } from "@/lib/seo";
import { SITE_URL } from "@/lib/config";
import { whatsappLink } from "@/lib/format";
import { ACADEMIC_HERO } from "@/lib/academic";
import { getAcademicCourses, getSettings } from "@/lib/site-data";

export const revalidate = 300;
export const metadata = contentMetadata({ title: "Online Academic Tuition: Maths, English & Science | OQC", seo_noindex: false }, {
  path: "/academic-subjects",
  description: "Live one-to-one online tuition in school and college subjects such as Maths, English and Science. Choose a subject and send a request to admissions.",
});

// Academic tuition lives next to the Quran courses, not inside them. Subjects come from the CMS
// (category "academic", status published); nothing is listed until the owner publishes it.
export default async function AcademicSubjectsPage() {
  const [subjects, settings] = await Promise.all([getAcademicCourses(), getSettings()]);
  if (!subjects.length) notFound();
  const wa = whatsappLink(settings["site.contact"]?.whatsapp, "Assalamu alaikum, I would like help choosing an academic subject.");
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbSchema([{ name: "Academic subjects", path: "/academic-subjects" }], SITE_URL)) }} />
      <PageHero path="/academic-subjects" imageOverride={ACADEMIC_HERO} eyebrow="Academic tuition" title="Online tuition for school and college subjects"
        intro="Live one-to-one online lessons with a tutor, alongside our Quran and Islamic courses. Choose a subject, then send a request. Admissions confirms tutor availability, fees and whether a trial class is available before lessons begin." />
      <section className="page-wrap py-11 sm:py-16" aria-labelledby="subjects-title">
        <h2 id="subjects-title" className="mb-6 text-2xl text-mushaf-900 sm:text-3xl">Choose a subject</h2>
        <ul className="grid list-none gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((course) => (
            <li key={course.id}>
              <article className="surface flex h-full flex-col p-6">
                <h3 className="text-xl text-mushaf-900">{course.title}</h3>
                <p className="mt-2 text-sm text-ink-soft">{course.summary}</p>
                <p className="mt-3 text-xs text-ink-faint">{[course.level, course.age_group].filter(Boolean).join(" · ")}</p>
                <div className="mt-auto flex flex-wrap gap-3 pt-5">
                  <Link href={`/free-trial?course=${course.id}`} className="btn btn-primary" aria-label={`Book Now: ${course.title}`}>Book Now</Link>
                  <Link href={`/courses/${course.slug}`} className="btn btn-outline" aria-label={`View details: ${course.title}`}>View details</Link>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </section>
      <section className="page-wrap pb-12" aria-labelledby="how-academic-booking-works">
        <div className="surface space-y-4 p-6 sm:p-8">
          <h2 id="how-academic-booking-works" className="text-2xl">How booking works</h2>
          <ol className="list-decimal space-y-2 pl-5 text-ink-soft">
            <li>Press Book Now on the subject you need. The form opens with that subject selected.</li>
            <li>Tell us the learner’s level, time zone and preferred times. For a child, a parent or guardian should complete the request.</li>
            <li>Admissions contacts you to confirm the tutor, the time, the fee and whether a trial class is available for this subject. Nothing is booked until admissions confirms it.</li>
          </ol>
          <p className="text-ink-soft">Looking for Quran, Tajweed, Hifz or Arabic instead? See the <Link href="/courses" className="font-semibold text-leaf-700 underline">Quran courses</Link>.</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/free-trial" className="btn btn-gold">Send a request <ArrowRight className="size-4" aria-hidden="true" /></Link>
            {wa && <a href={wa} className="btn btn-outline" rel="noopener noreferrer">Ask on WhatsApp</a>}
          </div>
        </div>
      </section>
    </>
  );
}
