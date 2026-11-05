import { PageHero, SectionHeading } from "@/components/site/chrome";
import { NavigationLink as Link } from "@/components/site/navigation-link";
import { ArrowRight, ArrowUpRight, BookOpen, Compass, Headset } from "@/components/site/icons";
import { SITE_URL } from "@/lib/config";
import { contentMetadata } from "@/lib/seo-metadata";

export const revalidate = 3600;
export const metadata = contentMetadata(
  { title: "Quran Reading & Recitation Practice Tools", seo_noindex: false },
  { path: "/quran-study", description: "Explore Quran reading, listening and recitation practice resources, including the Tarteel app and Quran.com. Use them alongside guidance from your Quran teacher." }
);

const resources = [
  {
    name: "Tarteel",
    eyebrow: "AI-assisted recitation practice",
    description: "Use the official Tarteel app for Quran recitation practice and its in-app learning features. Tarteel is a separate third-party service; availability, features, subscriptions and account terms are set by Tarteel.",
    href: "https://download.tarteel.ai/",
    action: "Open official Tarteel app page",
    Icon: Headset,
  },
  {
    name: "Quran.com",
    eyebrow: "Quran reading and listening",
    description: "Read Quran text and explore available translations and recitations on Quran.com. Choose the reading and listening options that support your personal study routine.",
    href: "https://quran.com/",
    action: "Open Quran.com",
    Icon: BookOpen,
  },
];

export default function QuranStudyPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${SITE_URL}/quran-study#webpage`,
    url: `${SITE_URL}/quran-study`,
    name: "Quran Reading and Recitation Practice Tools",
    description: "A curated starting point for independent Quran reading, listening and recitation practice.",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "en-GB",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHero
        path="/quran-study"
        eyebrow="Quran practice centre"
        title="Build a steady Quran reading and recitation routine"
        intro="Explore trusted digital study tools and use them to support—not replace—your learning plan, teacher feedback and regular revision."
      >
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/free-trial" className="btn btn-gold">Discuss a Quran learning plan <ArrowRight className="size-4" aria-hidden="true" /></Link>
          <Link href="/courses/tajweed" className="btn btn-outline border-white/40 text-white hover:bg-white/10">Explore Tajweed classes</Link>
        </div>
      </PageHero>

      <section className="page-wrap py-14 sm:py-20" aria-labelledby="practice-tools-heading">
        <SectionHeading
          eyebrow="Digital study resources"
          title={<span id="practice-tools-heading">Choose a tool for your practice</span>}
          intro="These independent services offer different ways to read, listen and practise. Open each service directly to review its current features and terms."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {resources.map(({ name, eyebrow, description, href, action, Icon }) => (
            <article key={name} className="surface flex h-full flex-col p-7 sm:p-9">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-leaf-50 text-leaf-700"><Icon className="size-7" aria-hidden="true" /></div>
              <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-leaf-700">{eyebrow}</p>
              <h2 className="mt-2 text-3xl text-mushaf-900">{name}</h2>
              <p className="mt-4 flex-1 leading-relaxed text-ink-soft">{description}</p>
              <a href={href} target="_blank" rel="noopener noreferrer" className="btn btn-primary mt-7 w-fit">
                {action} <ArrowUpRight className="size-4" aria-hidden="true" />
              </a>
            </article>
          ))}
        </div>
        <p className="mx-auto mt-8 max-w-3xl text-center text-sm leading-relaxed text-ink-soft">
          OQC does not own or operate Tarteel or Quran.com. This page links to their official services; it does not embed their apps, share your OQC account with them or imply an endorsement or technical partnership.
        </p>
      </section>

      <section className="border-y border-line bg-leaf-50/50 py-14 sm:py-20">
        <div className="page-wrap grid gap-8 lg:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-leaf-700">A simple practice cycle</p>
            <h2 className="mt-3 text-3xl text-mushaf-900">Listen, recite, review and repeat</h2>
            <p className="mt-4 leading-relaxed text-ink-soft">Choose a manageable passage, listen to a reliable recitation, practise at a comfortable pace and note questions for your teacher. Use a teacher to check pronunciation and Tajweed; an app’s feedback should not be treated as a scholarly ruling or a substitute for qualified instruction.</p>
          </div>
          <ol className="grid gap-4 sm:grid-cols-2">
            {[
              ["01", "Set a realistic goal", "Choose a short passage or revision target."],
              ["02", "Listen carefully", "Follow a recitation and notice the sounds and pauses."],
              ["03", "Practise aloud", "Repeat slowly and use a practice tool if helpful."],
              ["04", "Ask and review", "Take uncertain words and pronunciation questions to your teacher."],
            ].map(([number, title, text]) => (
              <li key={number} className="rounded-2xl border border-line bg-white p-5">
                <span className="text-sm font-bold text-gold-600">{number}</span>
                <h3 className="mt-2 text-lg font-semibold text-mushaf-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="page-wrap py-14 text-center sm:py-20">
        <Compass className="mx-auto size-9 text-leaf-700" aria-hidden="true" />
        <h2 className="mt-4 text-3xl text-mushaf-900">Want a teacher-guided practice plan?</h2>
        <p className="mx-auto mt-4 max-w-2xl text-ink-soft">Tell our admissions team whether you are beginning Quran reading, improving Tajweed, memorising or revising. The team can discuss suitable course options and teacher availability.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/free-trial" className="btn btn-primary">Request a free trial <ArrowRight className="size-4" aria-hidden="true" /></Link>
          <Link href="/learn" className="btn btn-outline">Browse learning guides</Link>
        </div>
      </section>
      <section className="page-wrap py-12" aria-labelledby="hifz-planner-link">
        <div className="surface flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-leaf-700">Free planning tool</p>
            <h2 id="hifz-planner-link" className="mt-2 text-2xl text-mushaf-900">Make a simple Hifz and revision plan</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">Calculate weekly page targets from your own Mushaf and available study days. Use the result with your Quran teacher, who should set a suitable workload.</p>
          </div>
          <Link href="/quran-study/hifz-planner" className="btn btn-primary shrink-0">Open Hifz planner <ArrowRight className="size-4" aria-hidden="true" /></Link>
        </div>
      </section>
    </>
  );
}
