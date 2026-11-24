import { contentMetadata } from "@/lib/seo-metadata";
import Link from "next/link";
import { ArrowRight, BookA, BookMarked, BookOpen } from "@/components/site/icons";
import { PageHero } from "@/components/site/chrome";
import CourseFinder from "@/components/site/course-finder";
import { CourseCard, CoursesGrid, CtaBand } from "@/components/site/sections";
import { getAcademicCourses, getQuranCourses, getSettings } from "@/lib/site-data";
import { whatsappLink } from "@/lib/format";
import { SITE_URL } from "@/lib/config";
import { courseListSchema } from "@/lib/course-schema";
import { safeJsonLd, STATIC_PAGES_REVIEWED } from "@/lib/seo";

export const revalidate = 3600;

export const metadata = contentMetadata({ title: "Online Quran Courses", seo_noindex: false }, { path: "/courses", description: "Live one-to-one online Quran courses for children and adults: Noorani Qaida, Tajweed, Hifz, Arabic and Islamic studies. Compare courses and request a trial." });

const internationalGuides = [
  ["/blog/online-quran-class-fees-uk-comparison", "the UK", "Compare online Quran lesson fees and what packages cover."],
  ["/blog/online-quran-lessons-usa-time-zones", "the USA", "Plan a lesson around your time zone and weekly routine."],
  ["/blog/online-quran-lessons-canada-time-zones", "Canada", "Check the proposed lesson date and time against your local school schedule."],
  ["/blog/quran-lessons-australia-time-zones", "Australia", "Plan around local school hours and daylight-saving differences."],
  ["/blog/online-quran-lessons-uae-families", "the UAE", "Prepare your course, language and scheduling questions for Admissions."],
];

const learningGoals = [
  { id: "reading", label: "Reading & Tajweed", slugs: ["noorani-qaida", "quran-nazara", "tajweed"] },
  { id: "memorisation", label: "Memorisation", slugs: ["hifz-quran"] },
  { id: "understanding", label: "Arabic & Islamic studies", slugs: ["arabic-language", "quran-translation", "hadith-translation"] },
];

const startingPoints = [
  { slug: "noorani-qaida", label: "Start with Arabic letters", detail: "For learners who are recognising letters or joining sounds.", Icon: BookA, tone: 1 },
  { slug: "quran-nazara", label: "Read with confidence", detail: "For readers working on pronunciation, fluency and Tajweed.", Icon: BookOpen, tone: 2 },
  { slug: "hifz-quran", label: "Work on memorisation", detail: "For learners building their Hifz and revision routine.", Icon: BookMarked, tone: 3 },
];

export default async function CoursesPage() {
  const [courses, academic, settings] = await Promise.all([getQuranCourses(), getAcademicCourses(), getSettings()]);
  const courseSlugs = new Set(courses.map(({ slug }) => slug));
  const availableStartingPoints = startingPoints.filter(({ slug }) => courseSlugs.has(slug));
  const goals = learningGoals.filter(({ slugs }) => slugs.some((slug) => courseSlugs.has(slug)))
    .map(({ id, label }) => ({ id, label }));
  const entries = courses.map((course) => ({
    slug: course.slug,
    goal: learningGoals.find(({ slugs }) => slugs.includes(course.slug))?.id ?? "",
    card: <CourseCard course={course} />,
  }));
  const wa = whatsappLink(settings["site.contact"]?.whatsapp, "Assalamu alaikum, could you help me choose a Quran course?");
  return (
    <>
      {courses.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(courseListSchema(courses, SITE_URL)) }} />}
      <PageHero path="/courses" modified={STATIC_PAGES_REVIEWED}
        eyebrow="Courses"
        imageOverride={{
          src: "/images/quran-courses-family.webp",
          alt: "A parent sits with her daughter during an online Quran lesson.",
        }}
        title="Online Quran courses for every age and level"
        arabic="تَعَلَّمِ القُرْآن"
        intro="Compare live one-to-one Quran lessons by learning goal. During a trial, discuss the learner’s starting level and a suitable pace."
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#all-courses" className="btn btn-gold">
            Browse courses <ArrowRight className="size-4" aria-hidden="true" />
          </a>
          <Link href="/free-trial" className="btn btn-outline-light">
            Book a free trial <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <Link href="/pricing" className="btn btn-outline-light">
            See fees
          </Link>
        </div>
      </PageHero>
      {availableStartingPoints.length > 0 && <section className="border-b border-line bg-paper" aria-labelledby="starting-point">
        <div className="page-wrap py-9 sm:py-12">
          <h2 id="starting-point" className="text-2xl text-mushaf-900 sm:text-3xl">Find your starting point</h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {availableStartingPoints.map(({ slug, label, detail, Icon, tone }) => (
              <li key={slug}>
                <Link href={`/courses/${slug}`} data-card-tone={tone} className="editorial-card card-tinted flex h-full items-start gap-3 p-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-leaf-800"><Icon className="size-5" aria-hidden="true" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold leading-tight text-mushaf-900">{label}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-ink-soft">{detail}</span>
                  </span>
                  <ArrowRight className="mt-1 size-4 text-leaf-800" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>}
      <section id="all-courses" className="page-wrap scroll-mt-24 py-11 sm:py-16" aria-labelledby="all-courses-title">
        <h2 id="all-courses-title" className="mb-6 text-2xl text-mushaf-900 sm:text-3xl">All online Quran courses</h2>
        {goals.length ? <CourseFinder goals={goals} entries={entries} /> : <CoursesGrid courses={courses} />}
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
          <p>Country lesson guides: <Link href="/locations/united-kingdom" className="text-leaf-700 underline">UK</Link>, <Link href="/locations/united-states" className="text-leaf-700 underline">USA</Link>, <Link href="/locations/canada" className="text-leaf-700 underline">Canada</Link>, <Link href="/locations/australia" className="text-leaf-700 underline">Australia</Link> and <Link href="/locations/united-arab-emirates" className="text-leaf-700 underline">UAE</Link>.</p>
          <p>Compare <Link href="/pricing" className="text-leaf-700 underline">fees and packages</Link> or <Link href="/free-trial" className="text-leaf-700 underline">request a trial in your time zone</Link>. Admissions confirms teacher availability, lesson language, currency and fees before enrolment.</p>
        </div>
      </section>
      {academic.length > 0 && (
        <section className="page-wrap pb-12" aria-labelledby="academic-subjects-teaser">
          <div className="surface flex flex-wrap items-center justify-between gap-5 p-6 sm:p-8">
            <div>
              <h2 id="academic-subjects-teaser" className="text-2xl">Academic tuition for school and college subjects</h2>
              <p className="mt-2 max-w-2xl text-ink-soft">Live one-to-one online tutoring in {academic.length} school and college subjects. Admissions confirms tutor availability, fees and trial eligibility before lessons begin.</p>
            </div>
            <Link href="/academic-subjects" className="btn btn-outline">View academic subjects <ArrowRight className="size-4" aria-hidden="true" /></Link>
          </div>
        </section>
      )}
      <CtaBand
        title="Not sure where to start?"
        text="Tell us the learner’s age and current level. A coordinator will recommend a course and arrange a free assessment class."
        whatsappHref={wa}
      />
    </>
  );
}
