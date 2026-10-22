import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/site/chrome";
import { CoursesGrid, CtaBand } from "@/components/site/sections";
import { getCourses, getSettings } from "@/lib/site-data";
import { whatsappLink } from "@/lib/format";

export const revalidate = 300;

export const metadata = {
  title: "Online Quran Courses",
  description:
    "Noorani Qaida, Quran reading with Tajweed, Hifz, Arabic, translation & tafseer and Islamic studies — live one-to-one online classes for children and adults.",
  alternates: { canonical: "/courses" },
};

export default async function CoursesPage() {
  const [courses, settings] = await Promise.all([getCourses(), getSettings()]);
  const wa = whatsappLink(settings["site.contact"]?.whatsapp, "Assalamu alaikum, which course would suit my child?");
  return (
    <>
      <PageHero
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
      <section className="page-wrap py-16 sm:py-20">
        <CoursesGrid courses={courses} />
      </section>
      <CtaBand
        title="Not sure where to start?"
        text="Tell us the learner’s age and current level. A coordinator will recommend a course and arrange a free assessment class."
        whatsappHref={wa}
      />
    </>
  );
}
