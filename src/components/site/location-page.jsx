import { cardTone, courseVisual } from "@/lib/card-presentation";
import { SEARCH_INTENTS } from "@/lib/search-intent";
import { ContentImage } from "@/components/site/content-image";
import Link from "next/link";
import { LocationSchedule } from "./location-schedule";
import { schedulingLocations } from "@/lib/location-schedule";
import { breadcrumbSchema, safeJsonLd, faqSchema } from "@/lib/seo";
import { SITE_URL } from "@/lib/config";
import { PageHero } from "@/components/site/chrome";
import { FaqList } from "@/components/site/sections";
import { getCourses, getPage, getPlans } from "@/lib/site-data";
import { locationPath, locationCmsSlug, locationBreadcrumbs } from "@/lib/locations";
import { locationImage } from "@/lib/location-image";
import { cleanHtml } from "@/lib/sanitize";
import { formatMoney } from "@/lib/format";

export async function LocationPage({ country, city }) {
  const image = locationImage(country, city);
  const place = city ? `${city.name}, ${country.name}` : country.name;
  const [courses, plans, cms] = await Promise.all([getCourses(), getPlans(), getPage(locationCmsSlug(country, city))]);
  const query = new URLSearchParams({ country: country.name, currency: country.currency, ...(city ? { city: city.name } : {}) });
  const breadcrumbs = locationBreadcrumbs(country, city);
  const places = schedulingLocations(country, city);
  const zones = [...new Set(places.map(p => p.timezone))];
  const amounts = plans.filter(p => p.billing_period === "monthly").flatMap(p => (p.prices || []).filter(p => p.currency === country.currency).map(p => p.amount_minor));
  const lowest = amounts.length ? Math.min(...amounts) : null;
  const faqs = [
    { question: `How do I arrange Quran lessons in ${city?.name || country.name}?`, answer: `Request an online trial with your learner’s level and preferred local time. ${city ? `Use ${places[0]?.timezone} for ${city.name}.` : `Choose your city in the time planner; ${country.name} may have more than one time zone.`} The coordinator confirms teacher availability.` },
    { question: `What are the fees in ${country.currency}?`, answer: lowest !== null ? `Published monthly options start at ${formatMoney(lowest, country.currency)}. The price depends on the package; confirm the lesson length, weekly schedule and payment terms before enrolling.` : `Ask the coordinator for an approved quote in ${country.currency}. We do not convert a price from another currency or treat a currency label as an approved local fee.` },
    { question: `Are these classes at a teaching centre in ${city?.name || country.name}?`, answer: `Classes are live and online. Learners join from home in ${city?.name || country.name}; this page does not represent a local physical branch.` },
  ];
  const title = cms?.title || `Online Quran classes in ${place}`;
  return <div lang={country.slug === "united-states" ? "en-US" : country.slug === "australia" ? "en-AU" : "en-GB"}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(faqSchema(faqs)) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbSchema(breadcrumbs, SITE_URL)) }} />
    <PageHero path={locationPath(country, city)} eyebrow={`Learn from ${city?.name || country.name} · ${country.currency}`} title={title} intro={!city && country.slug === "united-states" ? SEARCH_INTENTS["/locations/united-states"].intro : `One-to-one Quran, Tajweed and Arabic lessons from home in ${place}. Plan your local time, choose a course and meet your teacher online.`} visual={<figure className="relative">
      <ContentImage src="/images/islamic/quran-study-v1-1200.webp" alt="A closed Quran on a wooden stand beside an arched window" priority sizes="(max-width: 1024px) 100vw, 600px" className="aspect-[3/2] w-full object-cover" />
      <figcaption className="flex items-center gap-4 bg-white p-4 text-mushaf-900"><div className="w-24 shrink-0 overflow-hidden rounded-lg border border-line sm:w-32"><ContentImage src={image.url} alt={image.alt} sizes="128px" className="aspect-[3/2] w-full object-cover" /></div><div><p className="font-semibold">Online learning for {city?.name || country.name}</p><p className="mt-1 text-xs text-ink-soft">{city ? zones[0] : `${country.cities.length} city guides`} · {country.currency}</p></div></figcaption>
    </figure>}><Link className="btn btn-gold mt-6" href={`/free-trial?${query}`}>Arrange your free trial</Link></PageHero>
    <section className="page-wrap space-y-10 py-10 sm:py-14">
      <nav aria-label="Breadcrumb" className="flex flex-wrap gap-2 text-sm text-leaf-700">{breadcrumbs.map((item, index) => <span key={item.path} className="inline-flex gap-2">{index > 0 && <span aria-hidden="true">/</span>}{index === breadcrumbs.length - 1 ? <span aria-current="page">{item.name}</span> : <Link href={item.path}>{item.name}</Link>}</span>)}</nav>
      <dl className="grid gap-4 sm:grid-cols-3">{[
        ["Your local clock", city ? zones[0] : `${zones.length} time ${zones.length === 1 ? "zone" : "zones"} in this planner`],
        ["Monthly fees", lowest !== null ? `From ${formatMoney(lowest, country.currency)}` : `Request a ${country.currency} quote`],
        ["Lesson format", "Live online · One learner, one teacher"],
      ].map(([label, value]) => <div key={label} className="surface p-5"><dt className="text-sm text-ink-soft">{label}</dt><dd className="mt-2 font-semibold text-mushaf-900">{value}</dd></div>)}</dl>
      <LocationSchedule countryName={country.name} currency={country.currency} places={places} />
      <section aria-labelledby="local-courses"><div className="flex flex-wrap items-center justify-between gap-4"><h2 id="local-courses" className="text-2xl">Choose a learning goal</h2><Link href="/courses" className="font-semibold text-leaf-700 underline">Compare all courses</Link></div><ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{courses.map(course => <li key={course.slug}><Link href={`/courses/${course.slug}`} data-card-tone={cardTone(course.slug)} className="regional-course-card card-tinted surface flex h-full items-center gap-4 overflow-hidden p-3 hover:border-leaf-500"><div className="w-24 shrink-0 overflow-hidden rounded-xl"><ContentImage src={courseVisual(course).src} alt={courseVisual(course).alt} sizes="96px" className="aspect-square w-full object-cover" /></div><div className="min-w-0"><h3 className="font-semibold">{course.title}</h3><p className="mt-2 text-sm text-ink-soft">{course.age_group || "Children and adults"}</p></div></Link></li>)}</ul></section>
      <div className="surface flex flex-wrap items-center justify-between gap-5 p-6"><div><h2 className="text-xl">Fees and lesson frequency</h2><p className="mt-2 max-w-2xl text-sm text-ink-soft">{lowest !== null ? `Monthly options in ${country.currency} start at ${formatMoney(lowest, country.currency)}; package details determine the final fee.` : `Request the current approved fee in ${country.currency}.`} Confirm lesson length, weekly classes and rescheduling before enrolling.</p></div><Link className="btn btn-outline" href={`/pricing?currency=${country.currency}`}>View packages</Link></div>
      {cms?.body_html && <details className="surface p-6"><summary className="cursor-pointer font-semibold text-leaf-700">More learning guidance for {city?.name || country.name}</summary><article className="prose-oqc mt-5" dangerouslySetInnerHTML={{ __html: cleanHtml(cms.body_html) }} /></details>}
      <section><h2 className="mb-5 text-2xl">{city ? `More cities in ${country.name}` : `City guides for ${country.name}`}</h2><div className="flex flex-wrap gap-3">{country.cities.filter(c => c.slug !== city?.slug).map(c => <Link className="btn btn-outline" key={c.slug} href={locationPath(country, c)}>{c.name}</Link>)}{city && <Link className="btn btn-outline" href={locationPath(country)}>All {country.name} classes</Link>}</div></section>
      <section><h2 className="mb-5 text-2xl">Questions about learning in {city?.name || country.name}</h2><FaqList faqs={faqs} defaultOpen={-1} /></section>
      <div className="rounded-3xl bg-mushaf-900 p-7 text-white"><h2 className="text-2xl text-white">Start from {city?.name || country.name}</h2><p className="mt-3 text-white/80">For a child, a parent or guardian should complete the request.</p><Link className="btn btn-gold mt-5" href={`/free-trial?${query}`}>Book a free trial in {city?.name || country.name}</Link></div>
      <details className="text-xs text-ink-soft"><summary className="cursor-pointer py-3">Illustration and map credits</summary><p>The study scene is an editorial AI illustration. Country outlines: <a className="underline" href="https://www.naturalearthdata.com/" rel="noopener noreferrer" target="_blank">Natural Earth</a> (public domain). City coordinates: <a className="underline" href="https://www.geonames.org/" rel="noopener noreferrer" target="_blank">GeoNames</a>, via cities.json, <a className="underline" href="https://creativecommons.org/licenses/by/4.0/" rel="noopener noreferrer" target="_blank">CC BY 4.0</a>.</p></details>
    </section>
  </div>;
}
