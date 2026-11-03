import { SEARCH_INTENTS } from "@/lib/search-intent";
import { contentMetadata } from "@/lib/seo-metadata";
import Link from "next/link";
import { ArrowRight, BadgeCheck, HeartHandshake, Languages, ShieldCheck } from "@/components/site/icons";
import { PageHero } from "@/components/site/chrome";
import { CtaBand, FaqList, TeacherCard } from "@/components/site/sections";
import { faqSchema, safeJsonLd } from "@/lib/seo";
import { getSettings, getTeachers } from "@/lib/site-data";
import { whatsappLink } from "@/lib/format";
import { teacherListSchema } from "@/lib/teacher-schema";
import { SITE_URL } from "@/lib/config";

export const revalidate = 300;

export const metadata = contentMetadata({ title: "Our Teachers", seo_noindex: false }, { path: "/teachers", description: "Request a female or male Quran teacher for live one-to-one online lessons. Admissions confirms the teacher\u2019s qualifications, language and availability before enrolment." });

const STANDARDS = [
  { icon: BadgeCheck, title: "Discuss teacher qualifications", text: "Before enrolment, ask Admissions to confirm the proposed teacher’s relevant qualifications, experience and suitability for your learner." },
  { icon: HeartHandshake, title: "Female and male teachers", text: "Request a female or male teacher on the trial form. Admissions confirms which teacher is available for your time slot and teaching language." },
  { icon: Languages, title: "Teaching language", text: "Tell Admissions which language helps the learner understand explanations. The team confirms the proposed teacher’s language availability before enrolment." },
  { icon: ShieldCheck, title: "Progress and feedback", text: "Ask how lesson feedback, progress updates and academic concerns are handled before regular classes begin." },
];

// Answers restate only what this page and the trial form already say: a preference
// is requested, Admissions confirms availability, and nothing is guaranteed.
const TEACHER_FAQS = [
  { question: "Can I choose a female Quran teacher?", answer: "Yes, you can request one. Choose \u201cFemale teacher\u201d on the trial form and Admissions confirms which female teacher is available for your time slot and teaching language before lessons are arranged." },
  { question: "Can a parent sit in on a child\u2019s lesson?", answer: "Ask Admissions how a parent can join or observe your child\u2019s online lesson and how the lesson link is shared before regular classes begin." },
  { question: "How do I check a teacher\u2019s qualifications?", answer: "Each profile on this page lists the teacher\u2019s qualifications, languages and years of teaching. Before enrolment, Admissions can confirm the proposed teacher\u2019s experience for your course and teaching language." },
  { question: "Can I change teacher later?", answer: "Discuss any concern with Admissions. They will explain what alternatives are available for your schedule; a specific replacement teacher cannot be guaranteed." },
];

export default async function TeachersPage() {
  const [teachers, settings] = await Promise.all([getTeachers(), getSettings()]);
  const wa = whatsappLink(settings["site.contact"]?.whatsapp, "Assalamu alaikum, I would like to know about your teachers.");
  const people = teacherListSchema(teachers, SITE_URL);
  return (
    <>
      {people && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(people) }} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(faqSchema(TEACHER_FAQS)) }} />
      <PageHero immersive path="/teachers" eyebrow="Teachers" title={SEARCH_INTENTS["/teachers"].heading} intro={SEARCH_INTENTS["/teachers"].intro} />
      <section className="page-wrap py-16 sm:py-20">
        {teachers.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {teachers.map((t) => (
              <TeacherCard key={t.id} teacher={t} />
            ))}
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {STANDARDS.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex gap-5 rounded-[var(--radius-card)] border border-line bg-white p-7">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-mushaf-900 text-gold-300">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="font-sans text-[1.12rem] font-bold text-mushaf-900">{title}</h2>
                  <p className="mt-1.5 text-[0.97rem] leading-relaxed text-ink-soft">{text}</p>
                </div>
              </div>
            ))}
            <div className="rounded-[var(--radius-card)] border border-gold-300 bg-gold-50 p-7 md:col-span-2">
              <p className="text-[1.02rem] text-ink">
                Public teacher profiles are not currently displayed. Before enrolment, ask Admissions to confirm the proposed teacher’s qualifications, experience, teaching language and availability.
              </p>
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                <Link href="/free-trial" className="inline-flex items-center gap-1.5 font-semibold text-leaf-700 hover:text-leaf-800">
                  Meet a teacher in a free trial <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
                <Link href="/learn/female-quran-teacher" className="inline-flex items-center gap-1.5 font-semibold text-leaf-700 hover:text-leaf-800">
                  Learning with a female teacher <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>
      <section aria-labelledby="teacher-questions" className="page-wrap max-w-3xl pb-16">
        <h2 id="teacher-questions" className="text-2xl">Questions about teachers</h2>
        <div className="mt-6"><FaqList faqs={TEACHER_FAQS} defaultOpen={0} /></div>
      </section>
      <CtaBand title="Meet your teacher in a free class" text="Tell us your preference for a female or male teacher and the times that suit you." whatsappHref={wa} />
    </>
  );
}
