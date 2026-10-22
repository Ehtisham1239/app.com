import Link from "next/link";
import { Clock3, Globe2, Monitor } from "lucide-react";
import { PageHero } from "@/components/site/chrome";
import { CoursesGrid, PricingCards, FaqList } from "@/components/site/sections";
import { getCourses, getFaqs, getPage, getPlans } from "@/lib/site-data";
import { locationPath, locationCmsSlug } from "@/lib/locations";
import { cleanHtml } from "@/lib/sanitize";

export async function LocationPage({ country, city }) {
  const place = city ? `${city.name}, ${country.name}` : country.name;
  const [courses, plans, faqs, cms] = await Promise.all([getCourses(), getPlans(), getFaqs(), getPage(locationCmsSlug(country, city))]);
  const query = new URLSearchParams({ country: country.name, currency: country.currency, ...(city ? { city: city.name } : {}) });
  return <><PageHero eyebrow={`Online classes · ${country.currency}`} title={cms?.title || `Online Quran classes in ${place}`} intro={cms?.excerpt || `Learn Quran, Tajweed, Hifz and Arabic from home in ${place}. Choose live one-to-one lessons for children or adults with flexible scheduling.`} />
    <section className="page-wrap space-y-12 py-16">
      <nav aria-label="Breadcrumb" className="flex flex-wrap gap-2 text-sm text-leaf-700"><Link href="/locations">Countries & cities</Link><span>/</span>{city ? <><Link href={locationPath(country)}>{country.name}</Link><span>/</span><span>{city.name}</span></> : <span>{country.name}</span>}</nav>
      <div className="grid gap-5 md:grid-cols-3">{[{ icon: Monitor, title: "Personal online lessons", text: "Join your teacher from home. No travel and no physical branch required." }, { icon: Clock3, title: "Timings for your family", text: `Share your city and preferred local time when booking. ${city ? city.name : country.name} families can agree a suitable schedule with the coordinator.` }, { icon: Globe2, title: `Fees in ${country.currency}`, text: `Published ${country.currency} fees appear below. Where no local price is approved, request a quote before enrolling.` }].map(({ icon: Icon, title, text }) => <div key={title} className="surface p-6"><Icon className="mb-4 size-6 text-leaf-700" /><h2 className="text-xl">{title}</h2><p className="mt-3 text-ink-soft">{text}</p></div>)}</div>
      {cms?.body_html && <article className="prose max-w-none" dangerouslySetInnerHTML={{ __html: cleanHtml(cms.body_html) }} />}
      <div><h2 className="mb-6 text-3xl">Find your course</h2><CoursesGrid courses={courses} /></div>
      <div><h2 className="mb-6 text-3xl">Monthly packages · {country.currency}</h2>{plans.length ? <PricingCards plans={plans} currency={country.currency} /> : <p className="surface p-6 text-ink-soft">Contact the college for current packages and approved fees in {country.currency}.</p>}</div>
      <div className="rounded-3xl bg-mushaf-900 p-8 text-white"><h2 className="text-3xl text-white">Your first step starts at home</h2><p className="mt-3 text-white/80">Tell us your city, course and preferred class times. Our team will help arrange your online trial.</p><Link className="btn btn-gold mt-6" href={`/free-trial?${query}`}>Book a free trial in {city?.name || country.name}</Link></div>
      <div><h2 className="mb-6 text-2xl">{city ? `More cities in ${country.name}` : `Explore cities in ${country.name}`}</h2><div className="flex flex-wrap gap-3">{country.cities.filter((c) => c.slug !== city?.slug).map((c) => <Link className="btn btn-outline" key={c.slug} href={locationPath(country, c)}>{c.name}</Link>)}{city && <Link className="btn btn-outline" href={locationPath(country)}>All {country.name} classes</Link>}</div></div>
      {faqs.length > 0 && <div><h2 className="mb-6 text-2xl">Questions from families</h2><FaqList faqs={faqs.slice(0, 6)} /></div>}
    </section></>;
}
