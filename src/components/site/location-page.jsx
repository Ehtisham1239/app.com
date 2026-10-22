import Link from "next/link";
import { LocationSchedule } from "./location-schedule";
import { schedulingLocations } from "@/lib/location-schedule";
import { breadcrumbSchema, safeJsonLd } from "@/lib/seo";
import { SITE_URL } from "@/lib/config";
import { Clock3, Globe2, Monitor } from "lucide-react";
import { PageHero } from "@/components/site/chrome";
import { CoursesGrid, PricingCards, FaqList } from "@/components/site/sections";
import { getCourses, getFaqs, getPage, getPlans } from "@/lib/site-data";
import { locationPath, locationCmsSlug, locationBreadcrumbs } from "@/lib/locations";
import { cleanHtml } from "@/lib/sanitize";

export async function LocationPage({ country, city }) {
  const place = city ? `${city.name}, ${country.name}` : country.name;
  const [courses, plans, faqs, cms] = await Promise.all([getCourses(), getPlans(), getFaqs(), getPage(locationCmsSlug(country, city))]);
  const query = new URLSearchParams({ country: country.name, currency: country.currency, ...(city ? { city: city.name } : {}) });
  const breadcrumbs = locationBreadcrumbs(country, city);
  const places = schedulingLocations(country, city);
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbSchema(breadcrumbs, SITE_URL)) }} /><PageHero eyebrow={`Online classes · ${country.currency}`} title={cms?.title || `Online Quran classes in ${place}`} intro={cms?.excerpt || `Learn Quran, Tajweed, Hifz and Arabic from home in ${place}. Choose live one-to-one lessons for children or adults with flexible scheduling.`} />
    <section className="page-wrap space-y-12 py-16">
      <nav aria-label="Breadcrumb" className="flex flex-wrap gap-2 text-sm text-leaf-700">{breadcrumbs.map((item, index) => <span key={item.path} className="inline-flex gap-2">{index > 0 && <span aria-hidden="true">/</span>}{index === breadcrumbs.length - 1 ? <span aria-current="page">{item.name}</span> : <Link href={item.path}>{item.name}</Link>}</span>)}</nav>
      <div className="grid gap-5 md:grid-cols-3">{[{ icon: Monitor, title: "Personal online lessons", text: "Join your teacher from home. No travel and no physical branch required." }, { icon: Clock3, title: "Timings for your family", text: `Share your city and preferred local time when booking. ${city ? city.name : country.name} families can agree a suitable schedule with the coordinator.` }, { icon: Globe2, title: `Fees in ${country.currency}`, text: `Published ${country.currency} fees appear below. Where no local price is approved, request a quote before enrolling.` }].map(({ icon: Icon, title, text }) => <div key={title} className="surface p-6"><Icon className="mb-4 size-6 text-leaf-700" /><h2 className="text-xl">{title}</h2><p className="mt-3 text-ink-soft">{text}</p></div>)}</div>
      {cms?.body_html && <article className="prose max-w-none" dangerouslySetInnerHTML={{ __html: cleanHtml(cms.body_html) }} />}
      <section className="space-y-4" aria-labelledby="local-guide"><h2 id="local-guide" className="text-2xl">Arranging online lessons from {city?.name || country.name}</h2><p className="text-ink-soft">Use {city ? city.name + "’s" : "your city’s"} local clock when sharing preferred times. {new Set(places.map((p) => p.timezone)).size > 1 ? "Cities on this page span different time zones, so choose your city in the planner below before comparing times." : `The cities listed here use ${places[0]?.timezone}.`} If your city is not listed, enter it on the trial form and confirm the correct time zone with the coordinator.</p><p className="text-ink-soft">Before enrolling, ask for a written quote in {country.currency}, the number and length of lessons, payment terms and the process for rescheduling. A currency label does not mean a local fee has been approved. No exchange-rate conversion is applied to the packages below.</p><p className="text-ink-soft">For a child’s enquiry, a parent or guardian should complete the form. Share the learner’s age group, reading level and goals so the team can discuss a suitable course. Lessons are delivered online; this page does not describe a physical teaching centre in {city?.name || country.name}.</p></section>
      <LocationSchedule countryName={country.name} currency={country.currency} places={places} />
      <div><h2 className="mb-6 text-3xl">Find your course</h2><CoursesGrid courses={courses} /></div>
      <div><h2 className="mb-6 text-3xl">Monthly packages · {country.currency}</h2>{plans.length ? <PricingCards plans={plans} currency={country.currency} /> : <p className="surface p-6 text-ink-soft">Contact the college for current packages and approved fees in {country.currency}.</p>}</div>
      <div className="rounded-3xl bg-mushaf-900 p-8 text-white"><h2 className="text-3xl text-white">Your first step starts at home</h2><p className="mt-3 text-white/80">Tell us your city, course and preferred class times. Our team will help arrange your online trial.</p><Link className="btn btn-gold mt-6" href={`/free-trial?${query}`}>Book a free trial in {city?.name || country.name}</Link></div>
      <div><h2 className="mb-6 text-2xl">{city ? `More cities in ${country.name}` : `Explore cities in ${country.name}`}</h2><div className="flex flex-wrap gap-3">{country.cities.filter((c) => c.slug !== city?.slug).map((c) => <Link className="btn btn-outline" key={c.slug} href={locationPath(country, c)}>{c.name}</Link>)}{city && <Link className="btn btn-outline" href={locationPath(country)}>All {country.name} classes</Link>}</div></div>
      {faqs.length > 0 && <div><h2 className="mb-6 text-2xl">Questions from families</h2><FaqList faqs={faqs.slice(0, 6)} /></div>}
    </section></>;
}
