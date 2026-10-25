import { quoteCurrencies } from "@/lib/booking-preferences";
import { PageHero } from "@/components/site/chrome";
import Link from "next/link";
import { contentMetadata } from "@/lib/seo-metadata";
import { Suspense } from "react";
import { CalendarCheck2, Clock3, HeartHandshake, ShieldCheck } from "@/components/site/icons";
import { TrialForm } from "@/components/site/trial-form";
import { getCourses, getPlans, getSettings } from "@/lib/site-data";
import { whatsappLink } from "@/lib/format";

export const revalidate = 300;

export const metadata = contentMetadata({
  seo_title: "Free Online Quran Trial Classes | Online Quran College",
  cover_url: "/images/islamic/mosque-courtyard-v1-1200.webp",
  cover_alt: "An illustrated mosque courtyard with arches and a reflecting pool",
}, { path: "/free-trial", description: "Book a 7-day trial of one-to-one online Quran classes for children or adults. Share your course, local time zone and teacher preferences with our coordinator." });

const PROMISES = [
  { icon: Clock3, title: "Reply within 24 hours", text: "A coordinator contacts you by WhatsApp or email to confirm a time." },
  { icon: HeartHandshake, title: "Teacher of your choice", text: "Female or male teacher, explained in your language." },
  { icon: CalendarCheck2, title: "7 days, no card", text: "Attend the trial classes before choosing any package." },
  { icon: ShieldCheck, title: "Your details are safe", text: "Used only to arrange your classes — never sold or shared." },
];

export default async function FreeTrialPage() {
  const [courses, plans, settings] = await Promise.all([getCourses(), getPlans(), getSettings()]);
  const forms = settings["site.forms"] ?? {};
  const wa = whatsappLink(settings["site.contact"]?.whatsapp, "Assalamu alaikum, I have just booked a free trial on your website.");
  return <>
    <PageHero path="/free-trial" eyebrow="Free trial" title="Request a free online Quran trial" intro="Request a 7-day trial. Share the learner’s level and preferred time; our coordinator confirms the details.">
      <Link href="#trial-form" className="btn btn-gold mt-6">Start your trial request</Link>
    </PageHero>
    <section id="trial-form" aria-label="Trial request" className="page-wrap grid scroll-mt-28 items-start gap-8 py-12 lg:grid-cols-[0.65fr_1fr]">
      <div><h2 className="text-2xl">A simple start</h2><ul className="mt-6 space-y-4">{PROMISES.slice(0, 3).map(({icon: Icon, title, text}) => <li key={title} className="surface flex gap-3 p-5"><Icon className="mt-1 size-5 shrink-0 text-leaf-700" aria-hidden="true" /><div><h3 className="font-semibold">{title}</h3><p className="mt-1 text-sm text-ink-soft">{text}</p></div></li>)}</ul></div>
      <Suspense fallback={<div className="surface h-[34rem] animate-pulse" aria-label="Loading trial form" />}>
        <TrialForm currencies={quoteCurrencies(plans)} courses={courses.map(({ id, title }) => ({ id, title }))} plans={plans.map(({ id, name, classes_per_week }) => ({ id, name, classes_per_week }))} consentText={forms.consent_text} successText={forms.trial_success} whatsappHref={wa} />
      </Suspense>
    </section>
  </>;
}
