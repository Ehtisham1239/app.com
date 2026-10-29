import { contentMetadata } from "@/lib/seo-metadata";
import Link from "next/link";
import { ArrowRight } from "@/components/site/icons";
import { PageHero } from "@/components/site/chrome";
import { CoursesGrid, CtaBand } from "@/components/site/sections";
import { getCourses, getSettings } from "@/lib/site-data";
import { whatsappLink } from "@/lib/format";
import { SITE_URL } from "@/lib/config";
import { courseListSchema } from "@/lib/course-schema";
import { safeJsonLd } from "@/lib/seo";

export const revalidate = 300;

export const metadata = contentMetadata({ title: "Online Quran Courses", seo_noindex: false }, { path: "/courses", description: "Noorani Qaida, Quran reading with Tajweed, Hifz, Arabic, translation & tafseer and Islamic studies \u2014 live one-to-one online classes for children and adults." });

export default async function CoursesPage() {
  const [courses, settings] = await Promise.all([getCourses(), getSettings()]);
  const wa = whatsappLink(settings["site.contact"]?.whatsapp, "Assalamu alaikum, which course would suit my child?");
  return (
    <>
      {courses.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(courseListSchema(courses, SITE_URL)) }} />}
      <PageHero immersive path="/courses"
        eyebrow="Courses"
        title="Online Quran courses for every age and level"
        arabic="تَعَلَّمِ القُرْآن"
        intro="Choose a starting point — our teachers assess every student in the free trial and recommend the right course and pace."
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/free-trial" className="btn btn-gold">
            Book a free trial <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <Link href="/pricing" className="btn btn-outline-light">
            See fees
          </Link>
        </div>
      </PageHero>
      <section className="page-wrap py-16 sm:py-20" aria-labelledby="all-courses">
        <h2 id="all-courses" className="sr-only">All online Quran courses</h2>
        <CoursesGrid courses={courses} />
      </section>
      <section className="page-wrap pb-12" aria-labelledby="choose-course">
        <div className="surface space-y-4 p-6 sm:p-8">
          <h2 id="choose-course" className="text-2xl">How to choose your starting course</h2>
          <p>If the learner is still recognising Arabic letters or joining sounds, ask about Noorani Qaida. If they can read words but need help with accuracy and recitation rules, discuss Quran reading and Tajweed. Memorisation, Arabic and translation have different aims; explain what you want to learn before choosing a course.</p>
          <p>For a child, a parent or guardian can describe what the learner already reads and where they need support. Adults can explain whether they are starting from the alphabet or returning to study. The trial gives the teacher a chance to assess the starting point and discuss a suitable pace.</p>
          <p>Before regular lessons begin, confirm the class length, days, local time zone, teacher preference and approved fee with the coordinator. Read the <Link href="/pricing" className="text-leaf-700 underline">package details</Link> and <Link href="/refund-policy" className="text-leaf-700 underline">refund policy</Link>, and use the <Link href="/contact" className="text-leaf-700 underline">contact form</Link> for questions about your circumstances.</p>
        </div>
      </section>
      <CtaBand
        title="Not sure where to start?"
        text="Tell us the learner’s age and current level. A coordinator will recommend a course and arrange a free assessment class."
        whatsappHref={wa}
      />
    </>
  );
}
