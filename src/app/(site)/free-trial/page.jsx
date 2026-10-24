import { ContentImage } from "@/components/site/content-image";
import { contentMetadata } from "@/lib/seo-metadata";
import { Suspense } from "react";
import { CalendarCheck2, Clock3, HeartHandshake, ShieldCheck } from "lucide-react";
import { TrialForm } from "@/components/site/trial-form";
import { getCourses, getPlans, getSettings } from "@/lib/site-data";
import { whatsappLink } from "@/lib/format";

export const revalidate = 300;

export const metadata = contentMetadata({
  seo_title: "Free Online Quran Trial Classes | Online Quran College",
  cover_url: "/images/learning/trial-welcome-r2-1200.webp",
  cover_alt: "Young boy smiling at a laptop during his first lesson with his mother seated nearby",
}, { path: "/free-trial", description: "Request a 7-day free trial of one-to-one Quran classes on eligible plans. The Weekend plan is excluded. Share your course and local time zone." });

const PROMISES = [
  { icon: Clock3, title: "Reply within 24 hours", text: "A coordinator contacts you by WhatsApp or email to confirm a time." },
  { icon: HeartHandshake, title: "Teacher of your choice", text: "Female or male teacher, explained in your language." },
  { icon: CalendarCheck2, title: "7 days on eligible plans, no card", text: "Attend trial classes before choosing an eligible package. The Weekend plan is excluded." },
  { icon: ShieldCheck, title: "Your details are safe", text: "Used only to arrange your classes — never sold or shared." },
];

export default async function FreeTrialPage() {
  const [courses, plans, settings] = await Promise.all([getCourses(), getPlans(), getSettings()]);
  const forms = settings["site.forms"] ?? {};
  const wa = whatsappLink(settings["site.contact"]?.whatsapp, "Assalamu alaikum, I have just booked a free trial on your website.");
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-[26rem] bg-mushaf-950" aria-hidden="true">
        <div className="pattern-girih absolute inset-0 opacity-[0.08]" />
      </div>
      <div className="page-wrap relative grid gap-10 pb-20 pt-12 sm:pt-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
        <div className="text-white lg:pt-4">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold-300">Free trial</p>
          <h1 className="mt-3 text-[2.5rem] text-white sm:text-[3.2rem]">Book your 7-day free trial</h1>
          <p className="mt-4 max-w-md text-[1.05rem] leading-relaxed text-white/75">
            Tell us a little about the learner and when you are free. We will match a teacher and send the class link.
          </p>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-white/75">
            The 7-day free trial is available on eligible plans. The Weekend plan is excluded; confirm eligibility with the coordinator.
          </p>
          <div className="mt-8 hidden lg:block"><ContentImage src="/images/learning/trial-welcome-r2-1200.webp" alt="Young boy smiling at a laptop during his first lesson with his mother seated nearby" sizes="500px" className="aspect-[3/2] w-full rounded-[1.5rem] object-cover" /></div>
          <ul className="mt-10 hidden space-y-3 lg:block">
            {PROMISES.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4 rounded-2xl border border-line bg-white p-4 text-ink shadow-[0_10px_30px_-20px_rgb(6_38_27/0.5)]">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gold-50 text-gold-700 ring-1 ring-gold-100">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-semibold text-mushaf-900">{title}</p>
                  <p className="text-[0.93rem] text-ink-soft">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <Suspense fallback={<div className="surface h-[34rem] animate-pulse" />}>
            <TrialForm
              courses={courses.map(({ id, title }) => ({ id, title }))}
              plans={plans.map(({ id, name, classes_per_week }) => ({ id, name, classes_per_week }))}
              consentText={forms.consent_text}
              successText={forms.trial_success}
              whatsappHref={wa}
            />
          </Suspense>
          <div className="mt-8 lg:hidden"><ContentImage src="/images/learning/trial-welcome-r2-1200.webp" alt="Young boy smiling at a laptop during his first lesson with his mother seated nearby" sizes="100vw" className="aspect-[3/2] w-full rounded-[1.5rem] object-cover" /></div>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:hidden">
            {PROMISES.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-3 rounded-2xl border border-line bg-white p-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gold-50 text-gold-700 ring-1 ring-gold-100">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-semibold text-mushaf-900">{title}</p>
                  <p className="text-[0.9rem] text-ink-soft">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
