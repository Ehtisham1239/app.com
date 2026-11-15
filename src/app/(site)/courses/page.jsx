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

export const metadata = contentMetadata({ title: "Online Quran Courses", seo_noindex: false }, { path: "/courses", description: "Live one-to-one online Quran courses for children and adults: Noorani Qaida, Tajweed, Hifz, Arabic and Islamic studies. Compare courses and request a trial." });

const internationalGuides = [
  ["/blog/online-quran-class-fees-uk-comparison", "the UK", "Compare online Quran lesson fees and what packages cover."],
  ["/blog/online-quran-lessons-usa-time-zones", "the USA", "Plan a lesson around your time zone and weekly routine."],
  ["/blog/online-quran-lessons-canada-time-zones", "Canada", "Check the proposed lesson date and time against your local school schedule."],
  ["/blog/quran-lessons-australia-time-zones", "Australia", "Plan around local school hours and daylight-saving differences."],
  ["/blog/online-quran-lessons-uae-families", "the UAE", "Prepare your course, language and scheduling questions for Admissions."],
];

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
        intro="Compare live one-to-one Quran lessons by learning goal. During a trial, discuss the learner’s starting level and a suitable pace."
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
          <p>Use the <Link href="/learn/quran-for-kids" className="text-leaf-700 underline">guide to Quran classes for kids</Link> to prepare for a child’s first lesson, or read the <Link href="/learn/quran-for-adults" className="text-leaf-700 underline">Quran guide for adult beginners</Link> if you are starting from the alphabet or returning to study. If you have a teacher preference, see how to <Link href="/learn/female-quran-teacher" className="text-leaf-700 underline">request a female Quran teacher</Link>.</p>
          <p>Before regular lessons begin, confirm the class length, days, local time zone, teacher preference and approved fee with the coordinator. Read the <Link href="/pricing" className="text-leaf-700 underline">package details</Link> and <Link href="/refund-policy" className="text-leaf-700 underline">refund policy</Link>, and use the <Link href="/contact" className="text-leaf-700 underline">contact form</Link> for questions about your circumstances.</p>
        </div>
      </section>
      <section className="page-wrap pb-12" aria-labelledby="international-quran-classes">
        <div className="surface space-y-4 p-6 sm:p-8">
          <h2 id="international-quran-classes" className="text-2xl">Online Quran classes for families abroad</h2>
          <p>Children and adults can join live one-to-one Quran lessons online. When you request a trial, share your local time zone, a preferred date and time, and what the learner can already read. Admissions checks teacher availability and confirms the lesson time before you enrol.</p>
          <ul aria-label="Planning guides by market" className="grid list-none gap-3 sm:grid-cols-2">
            {internationalGuides.map(([href, market, detail]) => (
              <li key={href} className="rounded-xl border border-line px-4 py-3">
                <Link href={href} className="font-semibold text-leaf-700 underline">Quran lesson planning in {market}</Link>
                <p className="mt-1 text-sm text-ink-soft">{detail}</p>
              </li>
            ))}
          </ul>
          <p>Compare <Link href="/pricing" className="text-leaf-700 underline">fees and packages</Link> or <Link href="/free-trial" className="text-leaf-700 underline">request a trial in your time zone</Link>. Admissions confirms teacher availability, lesson language, currency and fees before enrolment.</p>
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
