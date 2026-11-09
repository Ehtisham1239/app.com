import Link from "next/link";
import { quoteCurrencies } from "@/lib/booking-preferences";
import { TrialHeading, TrialHeadingView, TrialPromises, TrialPromisesView } from "@/components/site/trial-intro";
import { FaqList } from "@/components/site/sections";
import { contentMetadata } from "@/lib/seo-metadata";
import { Suspense } from "react";
import { QuickTrialForm } from "@/components/site/quick-trial-form";
import { ContentImage } from "@/components/site/content-image";
import { getCourses, getPlans, getSettings } from "@/lib/site-data";
import { whatsappLink } from "@/lib/format";
import { faqSchema, safeJsonLd } from "@/lib/seo";
import { SITE_URL } from "@/lib/config";
import { heroArt } from "@/lib/hero-art";

export const revalidate = 300;

const COVER = heroArt("/free-trial");

export const metadata = contentMetadata({
  seo_title: "Free Online Quran Trial Classes | Online Quran College",
  cover_url: COVER.src,
  cover_alt: COVER.alt,
}, { path: "/free-trial", description: "Request a 3-day free trial of one-to-one online Quran lessons for children or adults. No card needed on eligible plans. The Weekend plan is excluded." });

// What families ask before booking; every answer restates what the page and the
// steps already promise (no new claims). Shown below the form and as FAQPage data.
const TRIAL_FAQS = [
  { question: "Is the free trial really free?", answer: "Yes. The trial gives 3 days of live one-to-one classes on eligible plans and no card is needed. The Weekend plan is excluded from the free trial." },
  { question: "What happens after I send the form?", answer: "A coordinator contacts you by WhatsApp or email to agree a class time, your course and your teacher preference before the trial lessons begin online." },
  { question: "Can I ask for a female teacher?", answer: "Yes. You can request a female teacher on the form. Admissions confirms whether a suitable female teacher is available for your course, teaching language and requested time before lessons are arranged." },
  { question: "What happens after the 3 days?", answer: "If you would like to continue, the coordinator agrees timings, teacher preference and a monthly package with you." },
];


// No searchParams on the server: the page is cached; ?plan=, ?course= and booking
// preferences are read in the browser (TrialHeading, TrialPromises, QuickTrialForm).
export default async function FreeTrialPage() {
  const [courses, plans, settings] = await Promise.all([getCourses(), getPlans(), getSettings()]);
  const planList = plans.map(({ id, name, trial_days }) => ({ id, name, trial_days }));
  const forms = settings["site.forms"] ?? {};
  const wa = whatsappLink(settings["site.contact"]?.whatsapp, "Assalamu alaikum, I have sent a lesson enquiry on your website.");
  const jsonLd = { "@context": "https://schema.org", "@type": "WebPage", "@id": `${SITE_URL}/free-trial#webpage`, url: `${SITE_URL}/free-trial`, name: "Book a free 3-day trial", isPartOf: { "@id": `${SITE_URL}/#website` }, about: { "@id": `${SITE_URL}/#organization` }, inLanguage: "en-GB" };
  return (
    <>
    <section id="trial-form" aria-labelledby="trial-title" className="relative overflow-hidden bg-mushaf-900 pb-12 pt-7 sm:pt-10 lg:pb-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      <div className="pattern-girih pointer-events-none absolute inset-0 opacity-[0.07]" aria-hidden="true" />
      <div className="page-wrap relative grid items-start gap-7 lg:grid-cols-[1fr_1.1fr] lg:grid-rows-[auto_1fr] lg:gap-x-12">
        <div className="text-white">
          <Suspense fallback={<TrialHeadingView />}><TrialHeading plans={planList} /></Suspense>
          <div data-hero-visual className="mt-6 hidden overflow-hidden rounded-[1.5rem] border border-white/15 lg:block">
            <ContentImage src={COVER.src} alt={COVER.alt} sizes="560px" className="aspect-[16/9] w-full object-cover" />
          </div>
        </div>
        <div className="min-w-0 lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <Suspense fallback={<div className="surface h-[36rem] animate-pulse" aria-label="Loading trial form" />}>
            <QuickTrialForm currencies={quoteCurrencies(plans)} courses={courses.map(({ id, title }) => ({ id, title }))} plans={planList} consentText={forms.consent_text} successText={forms.trial_success} whatsappHref={wa} />
          </Suspense>
        </div>
        <div className="space-y-4 lg:col-start-1 lg:row-start-2">
          <Link className="inline-flex min-h-11 items-center rounded-xl border border-white/25 px-4 font-semibold text-white hover:bg-white/10" href="/trial-video">Watch the 15-second trial guide</Link>
          <Suspense fallback={<TrialPromisesView className="grid gap-4 sm:grid-cols-2" />}><TrialPromises plans={planList} className="grid gap-4 sm:grid-cols-2" /></Suspense>
        </div>
      </div>
    </section>
    <section className="page-wrap max-w-3xl py-14" aria-labelledby="trial-faq">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(faqSchema(TRIAL_FAQS)) }} />
      <h2 id="trial-faq" className="text-2xl text-mushaf-900 sm:text-3xl">Questions about the free trial</h2>
      <p className="mt-3 text-ink-soft">Before booking, you can <Link href="/courses" className="font-semibold text-leaf-700 underline underline-offset-4">compare Quran courses</Link>, <Link href="/pricing" className="font-semibold text-leaf-700 underline underline-offset-4">check class fees and packages</Link> or <Link href="/locations" className="font-semibold text-leaf-700 underline underline-offset-4">plan a lesson in your local time</Link>.</p>
      <div className="mt-6"><FaqList faqs={TRIAL_FAQS.map((f, i) => ({ id: `trial-${i}`, ...f }))} defaultOpen={-1} /></div>
    </section>
    </>
  );
}
