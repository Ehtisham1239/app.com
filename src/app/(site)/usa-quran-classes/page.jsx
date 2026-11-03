import Link from "next/link";
import { PageHero, SectionHeading } from "@/components/site/chrome";
import { FaqList } from "@/components/site/sections";
import { contentMetadata } from "@/lib/seo-metadata";
import { faqSchema, safeJsonLd } from "@/lib/seo";
import { SITE_URL } from "@/lib/config";

export const revalidate = 300;

const PAGE_TITLE = "Online Quran Classes in the USA";
const PAGE_DESCRIPTION = "Learn Quran online in the USA with live one-to-one lessons for children and adults. Explore Noorani Qaida, Quran reading, Tajweed and Hifz, with flexible scheduling across US time zones and a 3-day free trial on eligible plans.";

export const metadata = contentMetadata(
  { title: PAGE_TITLE, seo_title: "Online Quran Classes in USA", seo_noindex: false },
  { path: "/usa-quran-classes", description: PAGE_DESCRIPTION }
);

const COURSES = [
  { title: "Noorani Qaida", detail: "Build a confident foundation with Arabic letters, sounds and correct pronunciation.", level: "Beginner friendly" },
  { title: "Quran Reading", detail: "Develop fluency through guided reading, regular practice and teacher feedback.", level: "All reading levels" },
  { title: "Quran with Tajweed", detail: "Improve recitation with clear, step-by-step correction of Tajweed rules and articulation.", level: "Reading learners" },
  { title: "Hifz-ul-Quran", detail: "Follow a structured memorisation and revision routine with individual teacher guidance.", level: "Personalised pace" },
  { title: "Quran Translation", detail: "Explore the meanings of Quranic passages with a guided, age-appropriate learning plan.", level: "Learners ready for meaning" },
  { title: "Islamic Studies", detail: "Build essential Islamic knowledge and everyday learning habits through guided lessons.", level: "Children and adults" },
];

const FAQS = [
  { question: "Are the Quran classes available throughout the USA?", answer: "Yes. Lessons are delivered online, so families can enquire from anywhere in the United States. Class times and teacher availability are confirmed individually by the Admissions team." },
  { question: "Can I choose a male or female Quran teacher?", answer: "You can share your preference for a male or female teacher when you enquire. The team will confirm a suitable teacher based on availability and your learning requirements." },
  { question: "Is there a free trial?", answer: "A 3-day trial is available on eligible plans. The Weekend plan is excluded. Please review the trial details and ask Admissions to confirm the plan that suits you before booking." },
  { question: "Are lessons suitable for children and adults?", answer: "Yes. Course level and lesson approach are matched to the learner's age, current reading ability and goals. Beginners can start with Noorani Qaida." },
  { question: "How are class times arranged across US time zones?", answer: "Share your state or time zone and preferred days when you enquire. Admissions will confirm available lesson times with you before classes are scheduled." },
  { question: "Do you have a physical academy or branch in the USA?", answer: "Online Quran College provides online lessons. This page is an information guide for families in the United States and does not represent a local physical branch." },
];

const steps = [
  { number: "01", title: "Tell us what you need", detail: "Share the learner's age, current level, course interest and preferred US time zone." },
  { number: "02", title: "Confirm your trial schedule", detail: "Our Admissions team follows up to discuss teacher preference and available lesson times." },
  { number: "03", title: "Learn one-to-one online", detail: "Meet your teacher, experience the lesson and decide whether the learning plan is right for you." },
];

const benefits = [
  ["Personal one-to-one lessons", "Dedicated lesson time shaped around the learner's pace and current level."],
  ["Flexible scheduling", "Request morning, afternoon, evening or weekend options in your local US time zone."],
  ["Male and female teacher preferences", "Tell Admissions which teacher preference is most comfortable for your family."],
  ["A clear learning pathway", "Start with an appropriate level and build towards more confident recitation step by step."],
];

export default function UsaQuranClassesPage() {
  const pageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${SITE_URL}/usa-quran-classes#webpage`,
    url: `${SITE_URL}/usa-quran-classes`,
    name: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "en-US",
    audience: { "@type": "Audience", audienceType: "Muslim families and Quran learners in the United States" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(pageJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(faqSchema(FAQS)) }} />

      <PageHero
        immersive
        path="/usa-quran-classes"
        eyebrow="Online Quran College · United States"
        title="Online Quran Classes for Families in the USA"
        titleAccent="in the USA"
        intro="Learn the Quran from home with live, one-to-one lessons for children and adults. Choose a learning level that suits you, share your preferred class times and take the next step with a supportive teacher."
        arabic="وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا"
        art="/usa-quran-classes"
      >
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link href="/free-trial" className="btn btn-gold btn-lg">Book your free trial <span aria-hidden="true">→</span></Link>
          <Link href="/courses" className="btn btn-outline-light btn-lg">Explore all courses</Link>
        </div>
        <p className="mt-3 text-sm text-white/70">3-day trial on eligible plans · Online lessons · Teacher availability confirmed by Admissions</p>
      </PageHero>

      <section className="page-wrap py-14 sm:py-20" aria-labelledby="usa-intro">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-leaf-700">A learning plan that fits your family</p>
            <h2 id="usa-intro" className="mt-3 text-3xl leading-tight text-mushaf-900 sm:text-4xl">Make Quran learning part of your everyday routine</h2>
            <p className="mt-5 text-ink-soft">Busy school, work and family schedules can make it difficult to keep a regular learning routine. Online one-to-one lessons give each learner dedicated teacher time without travelling to a classroom.</p>
            <p className="mt-4 text-ink-soft">Whether your child is opening the Qaida for the first time or you want to improve your own recitation, start with your current level. The teaching plan can then be discussed around your goals and availability.</p>
            <Link href="/free-trial" className="mt-6 inline-flex min-h-11 items-center gap-2 font-semibold text-leaf-700 underline decoration-gold-500 underline-offset-4 hover:text-mushaf-900">Discuss a suitable starting point <span aria-hidden="true">→</span></Link>
          </div>
          <div className="rounded-[1.5rem] border border-leaf-100 bg-paper p-6 sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[.16em] text-gold-700">Learning, made personal</p>
            <ul className="mt-5 space-y-4">
              {benefits.map(([title, detail]) => (
                <li key={title} className="flex gap-3">
                  <span className="mt-1 grid size-7 shrink-0 place-items-center rounded-full bg-mushaf-900 text-sm font-bold text-gold-300" aria-hidden="true">✓</span>
                  <span><strong className="block text-mushaf-900">{title}</strong><span className="mt-1 block text-sm leading-relaxed text-ink-soft">{detail}</span></span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-paper py-14 sm:py-20" aria-labelledby="usa-courses">
        <div className="page-wrap">
          <SectionHeading eyebrow="Choose your learning path" title="Quran and Islamic courses" intro="Start with the course that matches your experience. If you are unsure, tell our team what the learner can already read and we can help you discuss a suitable starting level." />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {COURSES.map((course, index) => (
              <article key={course.title} className="surface flex h-full flex-col p-6 shadow-sm">
                <span className="grid size-10 place-items-center rounded-xl bg-leaf-50 font-display text-lg font-bold text-leaf-700">{String(index + 1).padStart(2, "0")}</span>
                <p className="mt-5 text-xs font-bold uppercase tracking-wider text-gold-700">{course.level}</p>
                <h3 className="mt-2 text-xl font-bold text-mushaf-900">{course.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">{course.detail}</p>
                <Link href="/free-trial" className="mt-5 inline-flex min-h-11 items-center gap-2 font-semibold text-leaf-700 hover:text-mushaf-900">Ask about this course <span aria-hidden="true">→</span></Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="page-wrap py-14 sm:py-20" aria-labelledby="usa-process">
        <SectionHeading eyebrow="Simple next steps" title="How online Quran lessons begin" intro="A clear enquiry process helps your family understand the next step before a regular timetable is agreed." />
        <ol id="usa-process" className="mt-10 grid gap-5 md:grid-cols-3">
          {steps.map((step) => (
            <li key={step.number} className="relative rounded-2xl border border-line bg-white p-6">
              <span className="font-display text-4xl font-bold text-gold-500">{step.number}</span>
              <h3 className="mt-4 text-xl font-bold text-mushaf-900">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{step.detail}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-mushaf-900 py-14 text-white sm:py-16">
        <div className="page-wrap grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-gold-300">Take the first step</p>
            <h2 className="mt-3 max-w-2xl text-3xl text-white sm:text-4xl">Find a Quran learning routine that works for your family</h2>
            <p className="mt-4 max-w-2xl text-white/75">Send an enquiry to discuss your course, teacher preference and suitable class times. Admissions will confirm availability and trial eligibility.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Link href="/free-trial" className="btn btn-gold btn-lg">Request a free trial <span aria-hidden="true">→</span></Link>
            <Link href="/contact" className="btn btn-outline-light btn-lg">Contact our team</Link>
          </div>
        </div>
      </section>

      <section className="page-wrap max-w-4xl py-14 sm:py-20" aria-labelledby="usa-faq">
        <SectionHeading eyebrow="Helpful answers" title="Frequently asked questions" intro="A few practical details to help you decide whether online Quran lessons are right for your household." />
        <h2 id="usa-faq" className="sr-only">Frequently asked questions about online Quran classes in the USA</h2>
        <div className="mt-8"><FaqList faqs={FAQS.map((item, index) => ({ id: `usa-faq-${index}`, ...item }))} defaultOpen={0} /></div>
        <p className="mt-8 text-sm text-ink-soft">For course details and general information, visit <Link href="/courses" className="font-semibold text-leaf-700 underline underline-offset-4">our Quran courses</Link>, <Link href="/pricing" className="font-semibold text-leaf-700 underline underline-offset-4">fees and packages</Link> or <Link href="/contact" className="font-semibold text-leaf-700 underline underline-offset-4">contact Online Quran College</Link>.</p>
      </section>
    </>
  );
}
