import Link from "next/link";
import { ArrowRight, BadgeCheck, HeartHandshake, Languages, ShieldCheck } from "@/components/site/icons";
import { PageHero } from "@/components/site/chrome";
import { CtaBand, TeacherCard } from "@/components/site/sections";
import { getSettings, getTeachers } from "@/lib/site-data";
import { whatsappLink } from "@/lib/format";

export const revalidate = 300;

export const metadata = {
  title: "Our Teachers",
  description: "Qualified female and male Quran teachers for children and adults — trained in Tajweed, experienced and caring.",
  alternates: { canonical: "/teachers" },
};

const STANDARDS = [
  { icon: BadgeCheck, title: "Qualified and verified", text: "Every teacher is checked for Quran and Tajweed qualifications and passes a teaching assessment before joining." },
  { icon: HeartHandshake, title: "Female and male teachers", text: "Sisters and young children can learn with a female teacher; you choose your preference when booking." },
  { icon: Languages, title: "Your language", text: "Lessons are explained in English, Urdu, Arabic and other languages, so learners understand every rule." },
  { icon: ShieldCheck, title: "Quality monitored", text: "Our quality team reviews classes regularly and parents receive progress updates." },
];

export default async function TeachersPage() {
  const [teachers, settings] = await Promise.all([getTeachers(), getSettings()]);
  const wa = whatsappLink(settings["site.contact"]?.whatsapp, "Assalamu alaikum, I would like to know about your teachers.");
  return (
    <>
      <PageHero eyebrow="Teachers" title="Taught by people who love the Quran" intro="Patient, qualified teachers who make every class personal — for beginners and for students completing Hifz." />
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
                Teacher profiles are being updated. During your free trial we introduce you to your teacher personally and you can change teacher at any time.
              </p>
              <Link href="/free-trial" className="mt-4 inline-flex items-center gap-1.5 font-semibold text-leaf-700 hover:text-leaf-800">
                Meet a teacher in a free trial <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        )}
      </section>
      <CtaBand title="Meet your teacher in a free class" text="Tell us your preference for a female or male teacher and the times that suit you." whatsappHref={wa} />
    </>
  );
}
