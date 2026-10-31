import { MARKET_GUIDES } from "@/lib/market-guides";
import { cardTone, courseVisual } from "@/lib/card-presentation";
import { SEARCH_INTENTS } from "@/lib/search-intent";
import { ContentImage } from "@/components/site/content-image";
import Link from "next/link";
import { LocationSchedule } from "./location-schedule";
import { schedulingLocations } from "@/lib/location-schedule";
import { breadcrumbSchema, safeJsonLd, faqSchema, locationServiceSchema } from "@/lib/seo";
import { SITE_URL } from "@/lib/config";
import { PageHero } from "@/components/site/chrome";
import { FaqList } from "@/components/site/sections";
import { getCourses, getPage, getPlans } from "@/lib/site-data";
import { locationPath, locationCmsSlug, locationBreadcrumbs, locationLocale, locationSearchIntro, isCityState, locationHeading, countryInName } from "@/lib/locations";
import { locationImage } from "@/lib/location-image";
import { cleanHtml } from "@/lib/sanitize";
import { formatMoney } from "@/lib/format";
import { convertMinor, getUsdRates } from "@/lib/fx";

export async function LocationPage({ country, city }) {
  const guide = !city ? MARKET_GUIDES[country.slug] : null;
  const image = locationImage(country, city);
  const [courses, plans, cms, fx] = await Promise.all([getCourses(), getPlans(), getPage(locationCmsSlug(country, city)), getUsdRates()]);
  const query = new URLSearchParams({ country: country.name, currency: country.currency, ...(city ? { city: city.name } : {}) });
  const breadcrumbs = locationBreadcrumbs(country, city);
  const places = schedulingLocations(country, city);
  const zones = [...new Set(places.map(p => p.timezone))];
  const amounts = plans.filter(p => p.billing_period === "monthly").flatMap(p => (p.prices || []).filter(p => p.currency === country.currency).map(p => p.amount_minor));
  const lowest = amounts.length ? Math.min(...amounts) : null;
  // Without an approved local price, show the lowest USD package converted at today's rate, marked as approximate.
  const usd = plans.filter(p => p.billing_period === "monthly").flatMap(p => (p.prices || []).filter(x => x.currency === "USD").map(x => x.amount_minor));
  const lowestUsd = usd.length ? Math.min(...usd) : null;
  const approx = lowest === null && lowestUsd !== null && country.currency !== "USD" ? convertMinor(lowestUsd, "USD", country.currency, fx) : null;
  const faqs = [
    { question: `How do I arrange Quran lessons in ${city?.name || countryInName(country)}?`, answer: `Request an online trial with your learner’s level and preferred local time. ${city ? `Use ${places[0]?.timezone} for ${city.name}.` : `Choose your city in the time planner; ${countryInName(country)} may have more than one time zone.`} The coordinator confirms teacher availability.` },
    { question: `What are the fees in ${country.currency}?`, answer: lowest !== null ? `Published monthly options start at ${formatMoney(lowest, country.currency)}. The price depends on the package; confirm the lesson length, weekly schedule and payment terms before enrolling.` : approx !== null ? `Published monthly packages start at ${formatMoney(lowestUsd, "USD")}, about ${formatMoney(approx, country.currency)} at today’s exchange rate. That figure is a guide only; the coordinator confirms your fee and the currency you pay in before you enrol.` : `Ask the coordinator for an approved quote in ${country.currency}. We do not treat a currency label as an approved local fee.` },
    { question: `Are these classes at a teaching centre in ${city?.name || countryInName(country)}?`, answer: `Classes are live and online. Learners join from home in ${city?.name || countryInName(country)}; this page does not represent a local physical branch.` },
    // Country hubs: answer the "near me" and Tajweed/Hifz searches Search Console shows, without claiming a local branch.
    ...(!city ? [
      { question: `Can I find Quran classes near me in ${countryInName(country)}?`, answer: `There is no need to travel: lessons are live and online, so a learner anywhere in ${countryInName(country)} joins from home with a one-to-one teacher. Choose your city in the time planner so the lesson is arranged in your local time.` },
      { question: `Are Tajweed and Hifz lessons available in ${countryInName(country)}?`, answer: `Yes, online. Tajweed (the rules of correct recitation) is practised within Quran reading and Hifz lessons, and the Hifz course covers memorisation with regular revision. Tell the coordinator the learner’s current level; teacher availability and the ${country.currency} package are confirmed before enrolling.` },
    ] : []),
  ];
  const title = locationHeading(country, city, cms?.title);
  return <div lang={locationLocale(country).replace("_", "-")}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(faqSchema(faqs)) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbSchema(breadcrumbs, SITE_URL)) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(locationServiceSchema({ country, city, placeName: city ? `${city.name}, ${country.name}` : countryInName(country), url: `${SITE_URL}${locationPath(country, city)}`, siteUrl: SITE_URL })) }} />
    <PageHero path={locationPath(country, city)} eyebrow={`Learn from ${city?.name || countryInName(country)} · ${country.currency}`} title={title} intro={(!city && SEARCH_INTENTS[locationPath(country)]?.intro) || locationSearchIntro(country, city)} visual={<figure className="relative">
      <ContentImage src={image.url} alt={image.alt} priority sizes="(max-width: 639px) 90vw, (max-width: 1023px) 85vw, 600px" className="aspect-[3/2] w-full object-cover" />
      <figcaption className="flex flex-wrap items-center justify-between gap-3 bg-leaf-50 px-5 py-4 text-mushaf-900"><div className="min-w-0"><p className="text-sm font-semibold sm:text-base">Online learning for {city?.name || countryInName(country)}</p><p className="mt-1 break-words text-xs text-ink-soft">{city ? zones[0] : `${country.cities.length} city guides`} · {country.currency}</p></div><span className="rounded-full border border-leaf-200 bg-white px-3 py-1 text-xs font-semibold">Live lessons</span></figcaption>
    </figure>}><Link className="btn btn-gold mt-6" href={`/free-trial?${query}`}>Arrange your free trial</Link></PageHero>
    <section className="page-wrap space-y-10 py-10 sm:py-14">
      <nav aria-label="Breadcrumb" className="flex flex-wrap gap-2 text-sm text-leaf-700">{breadcrumbs.map((item, index) => <span key={item.path} className="inline-flex gap-2">{index > 0 && <span aria-hidden="true">/</span>}{index === breadcrumbs.length - 1 ? <span aria-current="page">{item.name}</span> : <Link href={item.path} prefetch={item.path === "/" ? false : undefined}>{item.name}</Link>}</span>)}</nav>
      <dl className="grid gap-4 sm:grid-cols-3">{[
        ["Your local clock", city ? zones[0] : `${zones.length} time ${zones.length === 1 ? "zone" : "zones"} in this planner`],
        ["Monthly fees", lowest !== null ? `From ${formatMoney(lowest, country.currency)}` : approx !== null ? `From ≈ ${formatMoney(approx, country.currency)} (approx.)` : `Request a ${country.currency} quote`],
        ["Lesson format", "Live online · One learner, one teacher"],
      ].map(([label, value]) => <div key={label} className="surface p-5"><dt className="text-sm text-ink-soft">{label}</dt><dd className="mt-2 font-semibold text-mushaf-900">{value}</dd></div>)}</dl>
      <LocationSchedule countryName={country.name} currency={country.currency} places={places} />
      {guide && <section aria-labelledby="local-guide-title" className="space-y-5">
        <h2 id="local-guide-title" className="text-2xl">{guide.title}</h2>
        <div className="grid gap-4 md:grid-cols-2">{guide.sections.map(section => <article key={section.title} className="surface p-6"><h3 className="text-lg">{section.title}</h3><p className="mt-3 text-sm leading-relaxed text-ink-soft">{section.text}</p><Link className="mt-4 inline-block py-2 font-semibold text-leaf-700 underline" href={section.path}>{section.link}</Link></article>)}</div>
        <details className="text-xs text-ink-soft"><summary className="cursor-pointer py-3">Official local-clock references</summary><ul className="space-y-2">{guide.sources.map(source => <li key={source.url}><a className="inline-block py-2 underline" href={source.url} target="_blank" rel="noopener noreferrer">{source.name}</a></li>)}</ul></details>
      </section>}

      {!city && country.slug === "united-kingdom" && <section aria-labelledby="uk-learning-paths" className="rounded-3xl border border-line bg-leaf-50/50 p-6 sm:p-8">
        <h2 id="uk-learning-paths" className="text-2xl">Online Quran classes for children and adult beginners in the UK</h2>
        <p className="mt-4 max-w-3xl text-ink-soft">Choose your starting point before choosing a timetable. If Arabic letters are new to you, discuss Noorani Qaida. If you can already read, ask about Quran reading and Tajweed feedback. Children and adults can discuss a one-to-one learning plan with the coordinator.</p>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <article className="surface p-5"><h3 className="text-xl">For parents choosing lessons for a child</h3><p className="mt-3 text-sm text-ink-soft">Share your child’s reading level and language needs. Ask how a parent can support the trial, what to practise between lessons and how progress will be discussed.</p><Link prefetch={false} className="mt-4 inline-block font-semibold text-leaf-700 underline underline-offset-4" href="/learn/quran-for-kids">Read the parent learning guide</Link></article>
          <article className="surface p-5"><h3 className="text-xl">For adults starting or returning to study</h3><p className="mt-3 text-sm text-ink-soft">Explain what you can already read and what you find difficult. Agree a manageable practice routine around work and family, then review the starting level with your teacher.</p><Link prefetch={false} className="mt-4 inline-block font-semibold text-leaf-700 underline underline-offset-4" href="/learn/quran-for-adults">Read the adult beginner guide</Link></article>
        </div>
        <p className="mt-5 text-sm text-ink-soft">Use the planner above with your actual lesson date and UK local time so seasonal clock changes are accounted for. The coordinator confirms the available morning or evening slot and the GBP package. The three-day free trial applies to eligible plans; the Weekend plan is excluded.</p>
        <Link prefetch={false} className="mt-4 inline-block font-semibold text-leaf-700 underline underline-offset-4" href="/learn#course-comparison">Compare Noorani Qaida, Quran reading and Hifz</Link>
      </section>}

      <section aria-labelledby="local-courses"><div className="flex flex-wrap items-center justify-between gap-4"><h2 id="local-courses" className="text-2xl">Choose a learning goal</h2><Link href="/courses" className="font-semibold text-leaf-700 underline">Compare all courses</Link></div><ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{courses.map(course => <li key={course.slug}><Link href={`/courses/${course.slug}`} data-card-tone={cardTone(course.slug)} className="regional-course-card card-tinted surface flex h-full items-center gap-4 overflow-hidden p-3 hover:border-leaf-500"><div className="w-24 shrink-0 overflow-hidden rounded-xl"><ContentImage src={courseVisual(course).src} alt={courseVisual(course).alt} sizes="96px" className="aspect-square w-full object-cover" /></div><div className="min-w-0"><h3 className="font-semibold">{course.title}</h3><p className="mt-2 text-sm text-ink-soft">{course.age_group || "Children and adults"}</p></div></Link></li>)}</ul></section>
      <div className="surface flex flex-wrap items-center justify-between gap-5 p-6"><div><h2 className="text-xl">Fees and lesson frequency</h2><p className="mt-2 max-w-2xl text-sm text-ink-soft">{lowest !== null ? `Monthly options in ${country.currency} start at ${formatMoney(lowest, country.currency)}; package details determine the final fee.` : approx !== null ? `Packages start at ${formatMoney(lowestUsd, "USD")} a month, about ${formatMoney(approx, country.currency)} at today’s rate; the coordinator confirms the fee in ${country.currency}.` : `Request the current approved fee in ${country.currency}.`} Confirm lesson length, weekly classes and rescheduling before enrolling.</p></div><Link className="btn btn-outline" href={`/pricing?currency=${country.currency}`}>View packages</Link></div>
      {cms?.body_html && <details className="surface p-6"><summary className="cursor-pointer font-semibold text-leaf-700">More learning guidance for {city?.name || countryInName(country)}</summary><article className="prose-oqc mt-5" dangerouslySetInnerHTML={{ __html: cleanHtml(cms.body_html) }} /></details>}
      {(city || country.cities.some(c => !isCityState(country, c))) && <section><h2 className="mb-5 text-2xl">{city ? `More cities in ${countryInName(country)}` : `City guides for ${countryInName(country)}`}</h2><div className="flex flex-wrap gap-3">{country.cities.filter(c => c.slug !== city?.slug && !isCityState(country, c)).map(c => <Link className="btn btn-outline" key={c.slug} href={locationPath(country, c)}>{c.name}</Link>)}{city && <Link className="btn btn-outline" href={locationPath(country)}>All {country.name} classes</Link>}</div></section>}
      <section><h2 className="mb-5 text-2xl">Questions about learning in {city?.name || countryInName(country)}</h2><FaqList faqs={faqs} defaultOpen={-1} /></section>
      <div className="rounded-3xl bg-mushaf-900 p-7 text-white"><h2 className="text-2xl text-white">Start from {city?.name || countryInName(country)}</h2><p className="mt-3 text-white/80">For a child, a parent or guardian should complete the request.</p><Link className="btn btn-gold mt-5" href={`/free-trial?${query}`}>Book a free trial in {city?.name || countryInName(country)}</Link></div>
      <details className="text-xs text-ink-soft"><summary className="cursor-pointer py-3">About the learning imagery</summary><p>AI-generated editorial learning scenes illustrate online study at home. They do not depict documented college students, teachers or local branches.</p></details>
    </section>
  </div>;
}
