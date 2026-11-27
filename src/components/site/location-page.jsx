import { MARKET_ARTICLES, MARKET_GUIDES } from "@/lib/market-guides";
import { UK_HUB, ukHubFaqs } from "@/lib/uk-hub";
import { COUNTRY_HUBS } from "@/lib/country-hubs";
import { feeAnswer } from "@/lib/fee-answer";
import { trustpilotUrl } from "@/lib/reviews-button";
import { CountryLanding } from "./country-landing";
import { cardTone, courseVisual } from "@/lib/card-presentation";
import { SEARCH_INTENTS } from "@/lib/search-intent";
import { ContentImage } from "@/components/site/content-image";
import Link from "next/link";
import { LocationSchedule } from "./location-schedule";
import { LocationTimeFacts } from "./location-time-facts";
import { LocationRelated } from "./location-related";
import { schedulingLocations } from "@/lib/location-schedule";
import { breadcrumbSchema, safeJsonLd, faqSchema, locationServiceSchema } from "@/lib/seo";
import { SITE_URL } from "@/lib/config";
import { PageHero } from "@/components/site/chrome";
import { FaqList } from "@/components/site/sections";
import { getQuranCourses, getPage, getPlans, getSettings, getTeachers, getTestimonials } from "@/lib/site-data";
import { locationPath, locationCmsSlug, locationBreadcrumbs, locationLocale, locationSearchIntro, isCityState, locationHeading, countryInName } from "@/lib/locations";
import { locationImage } from "@/lib/location-image";
import { cleanHtml } from "@/lib/sanitize";
import { formatMoney } from "@/lib/format";
import { convertMinor, getUsdRates } from "@/lib/fx";

const US_CITY_STATES = {
  "new-york": "New York", "los-angeles": "California", chicago: "Illinois", houston: "Texas", dallas: "Texas",
};

export async function LocationPage({ country, city }) {
  const guide = !city ? MARKET_GUIDES[country.slug] : null;
  const article = !city ? MARKET_ARTICLES[country.slug] : null;
  const image = locationImage(country, city);
  // Country landing sections on the five indexed hubs; city pages keep the standard layout.
  const hub = !city ? COUNTRY_HUBS[country.slug] || null : null;
  const [courses, plans, cms, fx, teachers, settings, testimonials] = await Promise.all([getQuranCourses(), getPlans(), getPage(locationCmsSlug(country, city)), getUsdRates(), hub ? getTeachers() : [], hub ? getSettings() : {}, hub ? getTestimonials() : []]);
  const query = new URLSearchParams({ country: country.name, currency: country.currency, ...(city ? { city: city.name } : {}) });
  const breadcrumbs = locationBreadcrumbs(country, city);
  const places = schedulingLocations(country, city);
  const zones = [...new Set(places.map(p => p.timezone))];
  const amounts = plans.filter(p => p.billing_period === "monthly").flatMap(p => (p.prices || []).filter(p => p.currency === country.currency).map(p => p.amount_minor));
  const lowest = amounts.length ? Math.min(...amounts) : null;
  // Without an approved local price, show the lowest USD package converted at the latest available reference rate, marked as approximate.
  const usd = plans.filter(p => p.billing_period === "monthly").flatMap(p => (p.prices || []).filter(x => x.currency === "USD").map(x => x.amount_minor));
  const lowestUsd = usd.length ? Math.min(...usd) : null;
  const approx = lowest === null && lowestUsd !== null && country.currency !== "USD" ? convertMinor(lowestUsd, "USD", country.currency, fx) : null;
  // One live fee answer in the local currency, shown in the fee box and the FAQ.
  const localFee = hub ? feeAnswer(plans, fx, hub.currency, hub.place) : null;
  const hubFee = localFee && { question: hub.feeQuestion, answer: localFee.answer };
  const faqs = [
    { question: `How do I arrange Quran lessons in ${city?.name || countryInName(country)}?`, answer: `Request an online trial with your learner’s level and preferred local time. ${city ? `Use ${places[0]?.timezone} for ${city.name}.` : zones.length > 1 ? `Choose your city in the time planner; ${countryInName(country)} has more than one time zone.` : `${countryInName(country)[0].toUpperCase()}${countryInName(country).slice(1)} uses ${zones[0]}; choose the actual lesson date in the planner so seasonal clock changes are included.`} The coordinator confirms teacher availability.` },
    { question: !city && country.slug === "united-kingdom" ? UK_HUB.feeQuestion : hub?.feeQuestion || `What are the fees in ${country.currency}?`, answer: hubFee ? hubFee.answer : lowest !== null ? `Published monthly options start at ${formatMoney(lowest, country.currency)}. The price depends on the package; confirm the lesson length, weekly schedule and payment terms before enrolling.` : approx !== null ? `Published monthly packages start at ${formatMoney(lowestUsd, "USD")}, about ${formatMoney(approx, country.currency)} at the latest available exchange rate. That figure is a guide only; the coordinator confirms your fee and the currency you pay in before you enrol.` : `Ask the coordinator for an approved quote in ${country.currency}. We do not treat a currency label as an approved local fee.` },
    { question: `How do I join a lesson from ${city?.name || countryInName(country)}?`, answer: `Join the live video lesson from home. Ask your coordinator for the class link and confirm the time in ${city?.name || countryInName(country)} before the first lesson.` },
    { question: country.slug === "united-states" ? "Which USA packages include a 3-day free trial?" : "Is the 3-day free trial available on every plan?", answer: country.slug === "united-states" ? "A 3-day free trial is available with Package 1, Package 2, Package 3, Package 4 and Leisure. The Weekend plan does not include a free trial. No card is needed." : "A 3-day free trial is available on eligible plans; the Weekend plan is excluded. No card is needed for an eligible trial. Ask the coordinator to confirm eligibility for the package you are considering." },
    // Country hubs: answer the "near me" and Tajweed/Hifz searches Search Console shows, without claiming a local branch.
    ...(!city ? [
      { question: `Can I find Quran classes near me in ${countryInName(country)}?`, answer: `There is no need to travel: lessons are live and online, so a learner anywhere in ${countryInName(country)} joins from home with a one-to-one teacher. Choose your city in the time planner so the lesson is arranged in your local time.` },
      { question: `Are Tajweed and Hifz lessons available in ${countryInName(country)}?`, answer: `Yes, online. Tajweed (the rules of correct recitation) is practised within Quran reading and Hifz lessons, and the Hifz course covers memorisation with regular revision. Tell the coordinator the learner’s current level; teacher availability and the ${country.currency} package are confirmed before enrolling.` },
    ] : []),
    ...(!city && country.slug === "united-kingdom" ? ukHubFaqs() : []),
    ...(hub?.faqs ? hub.faqs() : []),
  ];
  const trustpilotProfile = trustpilotUrl(settings?.["site.social"]?.trustpilot) || "https://www.trustpilot.com/review/onlinequrancollege.com";
  const title = locationHeading(country, city, cms?.title);
  return <div lang={locationLocale(country).replace("_", "-")}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(faqSchema(faqs)) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbSchema(breadcrumbs, SITE_URL)) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(locationServiceSchema({ country, city, placeName: city ? `${city.name}, ${country.name}` : countryInName(country), url: `${SITE_URL}${locationPath(country, city)}`, siteUrl: SITE_URL })) }} />
    <PageHero path={locationPath(country, city)} eyebrow={`Learn from ${city?.name || countryInName(country)} · ${country.currency}`} title={title} intro={(!city && SEARCH_INTENTS[locationPath(country)]?.intro) || locationSearchIntro(country, city)} visual={<figure className="relative">
      <ContentImage src={image.url} alt={image.alt} priority sizes="(max-width: 639px) 90vw, (max-width: 1023px) 85vw, 600px" className="aspect-[3/2] w-full object-cover" />
      <figcaption className="flex flex-wrap items-center justify-between gap-3 bg-leaf-50 px-5 py-4 text-mushaf-900"><div className="min-w-0"><p className="text-sm font-semibold sm:text-base">Online learning for {city?.name || countryInName(country)}</p><p className="mt-1 break-words text-xs text-ink-soft">{city ? zones[0] : country.timezone} · {country.currency}</p></div><span className="rounded-full border border-leaf-200 bg-white px-3 py-1 text-xs font-semibold">Live lessons</span></figcaption>
    </figure>}><Link className="btn btn-gold mt-6" href={`/free-trial?${query}`}>Request a free trial</Link><p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-soft">{country.slug === "united-states" ? "3-day free trial with Package 1, Package 2, Package 3, Package 4 and Leisure. Weekend does not include a free trial; no card is needed." : "3-day free trial on eligible plans. No card is needed; the Weekend plan is excluded."}</p>{country.slug === "united-states" && <div className="mt-4 flex flex-wrap items-center gap-3"><a className="btn btn-outline-light" href="tel:+17869645678">Call our US team · +1 (786) 964-5678</a><Link className="text-sm font-semibold text-leaf-700 underline underline-offset-4" href="/contact">Unable to call? Contact us</Link></div>}</PageHero>
    <section className="page-wrap space-y-10 py-10 sm:py-14">
      <nav aria-label="Breadcrumb" className="flex flex-wrap gap-2 text-sm text-leaf-700">{breadcrumbs.map((item, index) => <span key={item.path} className="inline-flex gap-2">{index > 0 && <span aria-hidden="true">/</span>}{index === breadcrumbs.length - 1 ? <span aria-current="page">{item.name}</span> : <Link href={item.path} prefetch={item.path === "/" ? false : undefined}>{item.name}</Link>}</span>)}</nav>
      <dl className="grid gap-4 sm:grid-cols-3">{[
        ["Your local clock", city ? zones[0] : `${zones.length} time ${zones.length === 1 ? "zone" : "zones"} in this planner`],
        ["Monthly fees", lowest !== null ? `From ${formatMoney(lowest, country.currency)}` : approx !== null ? `From ≈ ${formatMoney(approx, country.currency)} (approx.)` : `Request a ${country.currency} quote`],
        ["Lesson format", "Live online · One learner, one teacher"],
      ].map(([label, value]) => <div key={label} className="surface p-5"><dt className="text-sm text-ink-soft">{label}</dt><dd className="mt-2 font-semibold text-mushaf-900">{value}</dd></div>)}</dl>
      {(hub || city) && (
        <nav aria-label="Plan your Quran lessons" className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-leaf-700">
          <a href="#schedule-title" className="underline underline-offset-4">Check lesson times</a>
          <a href={hubFee ? "#hub-fee" : "#local-fees"} className="underline underline-offset-4">{country.currency === "AUD" ? "Monthly fee estimates in AUD" : `Monthly fees in ${country.currency}`}</a>
          <a href="#local-courses" className="underline underline-offset-4">Compare Quran courses</a>
          {country.slug === "united-states" ? <Link href="/usa-quran-classes/states" prefetch={false} className="underline underline-offset-4">Find online Quran classes by US state</Link> : article && <Link href={article.path} prefetch={false} className="underline underline-offset-4">{article.label}</Link>}
        </nav>
      )}
      <LocationSchedule countryName={country.name} currency={country.currency} places={places} />
      {!hub && <LocationTimeFacts placeName={city ? `${city.name}, ${country.name}` : country.name} timeZone={city?.timezone || country.timezone} />}
      {hub && <CountryLanding hub={hub} fee={hubFee} teachers={teachers} trialHref={`/free-trial?${query}`} trustpilotProfile={trustpilotProfile} testimonials={testimonials} />}
      {guide && <section aria-labelledby="local-guide-title" className="space-y-5">
        <h2 id="local-guide-title" className="text-2xl">{guide.title}</h2>
        <div className="grid gap-4 md:grid-cols-2">{guide.sections.map(section => <article key={section.title} className="surface p-6"><h3 className="text-lg">{section.title}</h3><p className="mt-3 text-sm leading-relaxed text-ink-soft">{section.text}</p><Link className="mt-4 inline-block py-2 font-semibold text-leaf-700 underline" href={section.path}>{section.link}</Link></article>)}</div>
        {article && <p className="text-sm text-ink-soft">Read the full planning guide: <Link className="font-semibold text-leaf-700 underline underline-offset-4" href={article.path}>{article.label}</Link></p>}
        <details className="text-xs text-ink-soft"><summary className="cursor-pointer py-3">Official guidance and reference links</summary><ul className="space-y-2">{guide.sources.map(source => <li key={source.url}><a className="inline-block py-2 underline" href={source.url} target="_blank" rel="noopener noreferrer">{source.name}</a></li>)}</ul></details>
      </section>}

      {!city && country.slug === "united-kingdom" && <section aria-labelledby="uk-learning-paths" className="rounded-3xl border border-line bg-leaf-50/50 p-6 sm:p-8">
        <h2 id="uk-learning-paths" className="text-2xl">{UK_HUB.pathsHeading}</h2>
        <p className="mt-4 max-w-3xl text-ink-soft">Choose your starting point before choosing a timetable. If Arabic letters are new to you, discuss Noorani Qaida. If you can already read, ask about Quran reading and Tajweed feedback. Children and adults can discuss a one-to-one learning plan with the coordinator.</p>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <article className="surface p-5"><h3 className="text-xl">For parents choosing lessons for a child</h3><p className="mt-3 text-sm text-ink-soft">Share your child’s reading level and language needs. Ask how a parent can support the trial, what to practise between lessons and how progress will be discussed.</p><Link prefetch={false} className="mt-4 inline-block font-semibold text-leaf-700 underline underline-offset-4" href="/learn/quran-for-kids">Read the parent learning guide</Link></article>
          <article className="surface p-5"><h3 className="text-xl">{UK_HUB.adultHeading}</h3><p className="mt-3 text-sm text-ink-soft">Explain what you can already read and what you find difficult. Agree a manageable practice routine around work and family, then review the starting level with your teacher.</p><Link prefetch={false} className="mt-4 inline-block font-semibold text-leaf-700 underline underline-offset-4" href="/learn/quran-for-adults">Read the adult beginner guide</Link></article>
        </div>
        <p className="mt-5 text-sm text-ink-soft">Use the planner above with your actual lesson date and UK local time so seasonal clock changes are accounted for. The coordinator confirms the available morning or evening slot and the GBP package. The three-day free trial applies to eligible plans; the Weekend plan is excluded.</p>
        <Link prefetch={false} className="mt-4 inline-block font-semibold text-leaf-700 underline underline-offset-4" href="/learn#course-comparison">Compare Noorani Qaida, Quran reading and Hifz</Link>
      </section>}

      <section aria-labelledby="local-courses"><div className="flex flex-wrap items-center justify-between gap-4"><h2 id="local-courses" className="scroll-mt-24 text-2xl">{city ? `Online Quran courses in ${city.name}` : `Online Quran courses in ${countryInName(country)}`}</h2><Link href="/courses" className="font-semibold text-leaf-700 underline">Compare all courses</Link></div><p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-soft">Explore live one-to-one Quran classes for children and adults, from beginner Noorani Qaida and Quran reading with Tajweed to Hifz, Arabic and Quran translation. Choose the learner’s current level first; the coordinator can then discuss teacher availability and a suitable lesson time in your local time zone.</p><ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{courses.map(course => <li key={course.slug}><Link href={`/courses/${course.slug}`} prefetch={false} data-card-tone={cardTone(course.slug)} className="regional-course-card card-tinted surface flex h-full items-center gap-4 overflow-hidden p-3 hover:border-leaf-500"><div className="w-24 shrink-0 overflow-hidden rounded-xl"><ContentImage src={courseVisual(course).src} alt={courseVisual(course).alt} sizes="96px" className="aspect-square w-full object-cover" /></div><div className="min-w-0"><h3 className="font-semibold">{course.title}</h3><p className="mt-2 text-sm text-ink-soft">{course.age_group || "Children and adults"}</p></div></Link></li>)}</ul></section>
      <div className="surface flex flex-wrap items-center justify-between gap-5 p-6"><div><h2 id="local-fees" className="scroll-mt-24 text-xl">Fees and lesson frequency</h2><p className="mt-2 max-w-2xl text-sm text-ink-soft">{lowest !== null ? `Monthly options in ${country.currency} start at ${formatMoney(lowest, country.currency)}; package details determine the final fee.` : approx !== null ? `Packages start at ${formatMoney(lowestUsd, "USD")} a month, about ${formatMoney(approx, country.currency)} at the latest available exchange rate; the coordinator confirms the fee in ${country.currency}.` : `Request the current approved fee in ${country.currency}.`} Confirm lesson length, weekly classes and rescheduling before enrolling.</p></div><Link className="btn btn-outline" href={`/pricing?currency=${country.currency}`}>View packages</Link></div>
      {cms?.body_html && <details className="surface p-6" open={Boolean(city)}><summary className="cursor-pointer font-semibold text-leaf-700">More learning guidance for {city?.name || countryInName(country)}</summary><article className="prose-oqc mt-5" dangerouslySetInnerHTML={{ __html: cleanHtml(cms.body_html) }} /></details>}

      <section><h2 className="mb-5 text-2xl">Questions about learning in {city?.name || countryInName(country)}</h2><FaqList faqs={faqs} defaultOpen={-1} /></section>
      <div className="rounded-3xl border border-leaf-100 border-t-4 border-t-gold-400 bg-gradient-to-br from-leaf-50 to-gold-50 p-7 text-mushaf-900 shadow-[0_18px_40px_-28px_rgb(13_74_28/0.4)]"><h2 className="text-2xl text-mushaf-900">Start from {city?.name || countryInName(country)}</h2><p className="mt-3 text-mushaf-900/80">For a child, a parent or guardian should complete the request.</p><div className="mt-5 flex flex-wrap items-center gap-3"><Link className="btn btn-gold" href={`/free-trial?${query}`}>Register for free in {city?.name || countryInName(country)}</Link>{country.slug === "united-states" && <a className="btn btn-outline" href="tel:+17869645678">Call +1 (786) 964-5678</a>}</div></div>
      <LocationRelated country={country} city={city} />
      <details className="text-xs text-ink-soft"><summary className="cursor-pointer py-3">About the learning imagery</summary><p>AI-generated editorial learning scenes illustrate online study at home. They are illustrative scenes.</p></details>
    </section>
  </div>;
}
