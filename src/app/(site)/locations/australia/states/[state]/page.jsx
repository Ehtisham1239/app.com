import Link from "next/link";
import { notFound } from "next/navigation";
import { AustraliaWhatsApp } from "@/components/site/australia-contact";
import { PageHero } from "@/components/site/chrome";
import { LocationSchedule } from "@/components/site/location-schedule";
import { OfficialProfileLinks } from "@/components/site/social-links";
import { AUSTRALIA_REGIONS, australiaRegionPath } from "@/lib/australia-regions";
import { contentMetadata } from "@/lib/seo-metadata";
import { getSettings } from "@/lib/site-data";

export const revalidate = 3600;

export function generateStaticParams() {
  return AUSTRALIA_REGIONS.map(({ slug }) => ({ state: slug }));
}

async function getRegion(params) {
  const { state } = await params;
  const region = AUSTRALIA_REGIONS.find(({ slug }) => slug === state);
  if (!region) notFound();
  return region;
}

export async function generateMetadata({ params }) {
  const region = await getRegion(params);
  return contentMetadata(
    { title: `Online Quran lessons in ${region.name}`, seo_noindex: true },
    { path: australiaRegionPath(region.slug), locale: "en_AU", description: `Plan live online Quran lessons in ${region.name}. Check a time in ${region.city}, compare estimated fees in AUD and contact Australian admissions.` },
  );
}

export default async function AustraliaRegionPage({ params }) {
  const [region, settings] = await Promise.all([getRegion(params), getSettings()]);
  const path = australiaRegionPath(region.slug);
  const query = new URLSearchParams({ country: "Australia", currency: "AUD", city: region.city });
  const places = [{ slug: region.citySlug || region.slug, name: region.city, timezone: region.timezone }];

  return (
    <div lang="en-AU">
      <PageHero path={path} eyebrow="Australia · Live online lessons" title={`Online Quran lessons in ${region.name}`} intro={`Find a time for one-to-one Quran lessons around school, work or family. Use the ${region.city} planner and ask Admissions to confirm availability and the AUD fee.`}>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link className="btn btn-gold" href={`/free-trial?${query}`}>Request a free trial</Link>
          <AustraliaWhatsApp />
        </div>
        <p className="mt-3 text-sm text-ink-soft">Eligible plans include a 3-day free trial. The Weekend plan is excluded.</p>
      </PageHero>
      <div className="page-wrap space-y-8 py-10 sm:py-14">
        <nav aria-label="Breadcrumb" className="text-sm"><Link href="/locations/australia" className="text-leaf-700 underline underline-offset-4">Australia lesson guides</Link> / <span aria-current="page">{region.name}</span></nav>
        <section className="surface space-y-3 p-6 sm:p-8">
          <h2 className="text-2xl">Choose a time that works each week</h2>
          <p className="text-ink-soft">{region.zone}</p>
          <p className="text-ink-soft">{region.tip}</p>
        </section>
        <LocationSchedule countryName="Australia" currency="AUD" places={places} />
        <section className="surface space-y-4 p-6 sm:p-8">
          <h2 className="text-2xl">Before enrolling</h2>
          <p className="text-ink-soft">Tell the teacher what the learner can read now. Ask whether Noorani Qaida, Tajweed or Hifz is a suitable starting point, and check the lesson length, monthly AUD total, and rescheduling terms.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/courses" className="font-semibold text-leaf-700 underline underline-offset-4">Compare courses</Link>
            <Link href="/pricing?currency=AUD" className="font-semibold text-leaf-700 underline underline-offset-4">Compare estimated AUD fees</Link>
            {region.citySlug && <Link href={`/locations/australia/${region.citySlug}`} className="font-semibold text-leaf-700 underline underline-offset-4">{region.city} classes and fees</Link>}
          </div>
          <OfficialProfileLinks social={settings["site.social"]} />
        </section>
      </div>
    </div>
  );
}
