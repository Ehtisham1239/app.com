import { quoteCurrencies, bookingPreferenceNotes } from "@/lib/booking-preferences";
import { isTrialEligible } from "@/lib/trial-eligibility";
import { contentMetadata } from "@/lib/seo-metadata";
import { Suspense } from "react";
import { CalendarCheck2, Clock3, HeartHandshake, ShieldCheck } from "@/components/site/icons";
import { QuickTrialForm } from "@/components/site/quick-trial-form";
import { ContentImage } from "@/components/site/content-image";
import { getCourses, getPlans, getSettings } from "@/lib/site-data";
import { whatsappLink } from "@/lib/format";
import { safeJsonLd } from "@/lib/seo";
import { SITE_URL } from "@/lib/config";

export const revalidate = 300;

const COVER = { src: "/images/islamic/online-lesson-adult-v1-1200.webp", alt: "A woman studies the Quran at home while a female teacher guides her over a live video lesson" };

export const metadata = contentMetadata({
  seo_title: "Free Online Quran Trial Classes | Online Quran College",
  cover_url: COVER.src,
  cover_alt: COVER.alt,
}, { path: "/free-trial", description: "Book a free 3-day trial of live one-to-one Quran classes on eligible plans. The Weekend plan is excluded. A coordinator replies within 24 hours." });

const PROMISES = [
  { icon: Clock3, title: "Reply within 24 hours", text: "A coordinator contacts you by WhatsApp or email to confirm a time." },
  { icon: HeartHandshake, title: "Share your teacher preference", text: "Request a female or male teacher; the coordinator confirms availability and language." },
  { icon: CalendarCheck2, title: "3 days free on eligible plans", text: "No card needed. The Weekend plan is excluded." },
  { icon: ShieldCheck, title: "Your details are safe", text: "Used only to arrange your classes — never sold or shared." },
];

export default async function FreeTrialPage({ searchParams }) {
  const [courses, plans, settings] = await Promise.all([getCourses(), getPlans(), getSettings()]);
  const query = await searchParams || {};
  const selectedPlan = plans.find(p => p.id === query.plan);
  const eligible = isTrialEligible(selectedPlan);
  const preferenceNotes = bookingPreferenceNotes(new URLSearchParams(Object.entries(query).filter(([, value]) => typeof value === "string")), quoteCurrencies(plans));
  const promises = eligible ? PROMISES : PROMISES.filter(p => p.title !== "3 days free on eligible plans");
  const forms = settings["site.forms"] ?? {};
  const wa = whatsappLink(settings["site.contact"]?.whatsapp, "Assalamu alaikum, I have sent a lesson enquiry on your website.");
  const jsonLd = { "@context": "https://schema.org", "@type": "WebPage", "@id": `${SITE_URL}/free-trial#webpage`, url: `${SITE_URL}/free-trial`, name: eligible ? "Book a free 3-day trial" : "Package enquiry", isPartOf: { "@id": `${SITE_URL}/#website` }, about: { "@id": `${SITE_URL}/#organization` }, inLanguage: "en-GB" };
  return (
    <section id="trial-form" aria-labelledby="trial-title" className="relative overflow-hidden bg-mushaf-900 pb-12 pt-7 sm:pt-10 lg:pb-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      <div className="pattern-girih pointer-events-none absolute inset-0 opacity-[0.07]" aria-hidden="true" />
      <div className="page-wrap relative grid items-start gap-7 lg:grid-cols-[1fr_1.1fr] lg:gap-12">
        <div className="text-white">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-gold-300">{eligible ? "Free trial" : "Package enquiry"}</p>
          <h1 id="trial-title" className="mt-2 text-[clamp(1.9rem,4.6vw,3rem)] leading-[1.1] text-white">{eligible ? <>Book a free <span className="text-gold-300">3-day</span> trial</> : `Enquire about ${selectedPlan.name}`}</h1>
          <p className="mt-3 max-w-xl text-[1.02rem] leading-relaxed text-white/85">{eligible ? "Request a free online Quran trial with 3 days of live one-to-one classes. A coordinator will arrange a time that suits your family." : "This package is not eligible for a free trial. Ask the coordinator about its schedule and terms before enrolling."}</p>
          <div data-hero-visual className="mt-6 hidden overflow-hidden rounded-[1.5rem] border border-white/15 lg:block">
            <ContentImage src={COVER.src} alt={COVER.alt} priority sizes="(max-width: 1024px) 0px, 560px" className="aspect-[16/9] w-full object-cover" />
          </div>
          <ul className="mt-6 hidden gap-4 sm:grid sm:grid-cols-2">
            {promises.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-3">
                <Icon className="mt-0.5 size-5 shrink-0 text-gold-300" aria-hidden="true" />
                <div><h2 className="text-[0.98rem] font-semibold text-white">{title}</h2><p className="mt-0.5 text-[0.86rem] text-white/75">{text}</p></div>
              </li>
            ))}
          </ul>
        </div>
        <Suspense fallback={<div className="surface h-[36rem] animate-pulse" aria-label="Loading trial form" />}>
          <QuickTrialForm initialPreferenceNotes={preferenceNotes} currencies={quoteCurrencies(plans)} courses={courses.map(({ id, title }) => ({ id, title }))} plans={plans.map(({ id, name, trial_days }) => ({ id, name, trial_days }))} consentText={forms.consent_text} successText={forms.trial_success} whatsappHref={wa} />
        </Suspense>
        <ul className="grid gap-4 text-white sm:hidden">
          {promises.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex gap-3">
              <Icon className="mt-0.5 size-5 shrink-0 text-gold-300" aria-hidden="true" />
              <div><h2 className="text-[0.98rem] font-semibold text-white">{title}</h2><p className="mt-0.5 text-[0.86rem] text-white/75">{text}</p></div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
