import { HomeMotion } from "@/components/site/home-motion";
import { safeJsonLd } from "@/lib/seo";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HomeHero } from "@/components/site/hero";
import { SectionHeading } from "@/components/site/chrome";
import { Benefits, CoursesGrid, CtaBand, FaqList, PricingCards, Steps, TeacherCard, Testimonials } from "@/components/site/sections";
import { getCourses, getFaqs, getPlans, getSettings, getTeachers, getTestimonials } from "@/lib/site-data";
import { whatsappLink } from "@/lib/format";
import { SITE_URL } from "@/lib/config";

export const revalidate = 300;

export async function generateMetadata() {
  const settings = await getSettings();
  const seo = settings["site.seo"] ?? {};
  return {
    title: { absolute: seo.title ?? "Online Quran College" },
    description: seo.description,
    alternates: { canonical: "/" },
    openGraph: { title: seo.title, description: seo.description, url: "/" },
  };
}

export default async function HomePage() {
  const [settings, courses, plans, faqs, teachers, testimonials] = await Promise.all([
    getSettings(),
    getCourses(),
    getPlans(),
    getFaqs(),
    getTeachers(),
    getTestimonials(),
  ]);
  const identity = settings["site.identity"] ?? {};
  const contact = settings["site.contact"] ?? {};
  const wa = whatsappLink(contact.whatsapp, "Assalamu alaikum, I would like to book a free trial class.");
  const standardPlans = plans.filter((p) => /^package/i.test(p.name)).slice(0, 4);
  const homePlans = standardPlans.length >= 3 ? standardPlans : plans.slice(0, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "@id": `${SITE_URL}/#organization`,
    name: identity.name,
    legalName: identity.legal_name,
    url: SITE_URL,
    logo: `${SITE_URL}/brand/logo.webp`,
    description: identity.description,
    ...(/^\d{4}$/.test(identity.established || "") ? { foundingDate: identity.established } : {}),
    email: contact.email,
    telephone: contact.phone,
    sameAs: Object.values(settings["site.social"] ?? {}).filter((u) => typeof u === "string" && u.startsWith("http")),
  };

  return (
    <div data-home-motion>
      <HomeMotion />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      <HomeHero hero={settings["site.hero"]} stats={settings["site.stats"]} />

      <section className="page-wrap grid gap-4 pb-8 sm:grid-cols-3" aria-label="Explore learning paths"><Link href="/locations/united-states" className="surface p-6"><h2 className="text-xl">Quran classes in the USA</h2><p className="mt-2 text-sm text-ink-soft">US time zones, courses and USD packages.</p></Link><Link href="/locations/australia" className="surface p-6"><h2 className="text-xl">Quran classes in Australia</h2><p className="mt-2 text-sm text-ink-soft">Plan around your city and request approved AUD fees.</p></Link><Link href="/learn" className="surface p-6"><h2 className="text-xl">Find your learning path</h2><p className="mt-2 text-sm text-ink-soft">Guides for parents, adults and recitation learners.</p></Link></section>
      <section className="page-wrap py-20 sm:py-24" aria-labelledby="courses-heading">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            align="left"
            eyebrow="Our courses"
            title={<span id="courses-heading">A path for every learner, from first letters to Hifz</span>}
            intro="Every course is taught live, one-to-one, with a teacher who adapts the pace to the student — whether a child learning the alphabet or an adult perfecting recitation."
          />
          <Link href="/courses" className="btn btn-outline">
            All courses <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="mt-12">
          <CoursesGrid courses={courses} />
        </div>
      </section>

      <section className="border-y border-line bg-white/60 py-20 sm:py-24">
        <div className="page-wrap">
          <SectionHeading
            eyebrow="Why families choose us"
            title="Traditional teaching, made to fit modern family life"
            intro="Explore online learning for children and adults, with course choices and class times discussed around your family’s routine."
          />
          <div className="mt-12">
            <Benefits items={settings["site.benefits"]} />
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-mushaf-950 py-20 sm:py-24">
        <div className="pattern-girih pointer-events-none absolute inset-0 opacity-[0.07]" aria-hidden="true" />
        <div className="page-wrap relative">
          <SectionHeading tone="dark" eyebrow="How it works" title="Start learning this week in three simple steps" />
          <div className="mt-14">
            <Steps steps={settings["site.steps"]} />
          </div>
          <div className="mt-14 text-center">
            <Link href="/free-trial" className="btn btn-gold btn-lg">
              Book a free trial <ArrowRight className="size-5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {homePlans.length > 0 && (
        <section className="page-wrap py-20 sm:py-24" aria-labelledby="fees-heading">
          <SectionHeading
            eyebrow="Fees"
            title={<span id="fees-heading">Simple monthly packages</span>}
            intro="Every package includes a 1-on-1 certified tutor and 30-minute live classes. Additional siblings receive a 15% family discount."
          />
          <div className="mt-12">
            <PricingCards plans={homePlans} compact />
          </div>
          <p className="mt-8 text-center">
            <Link href="/pricing" className="inline-flex items-center gap-1.5 font-semibold text-leaf-700 hover:text-leaf-800">
              See all packages and what is included <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </p>
        </section>
      )}

      {teachers.length > 0 && (
        <section className="border-t border-line bg-white/60 py-20 sm:py-24">
          <div className="page-wrap">
            <SectionHeading eyebrow="Teachers" title="Learn with qualified, caring teachers" intro="Female and male teachers, trained in Tajweed and experienced with children and adults." />
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {teachers.slice(0, 4).map((t) => (
                <TeacherCard key={t.id} teacher={t} />
              ))}
            </div>
          </div>
        </section>
      )}

      {testimonials.length > 0 && (
        <section className="page-wrap py-20 sm:py-24">
          <SectionHeading eyebrow="Families" title="What parents and students say" />
          <div className="mt-12">
            <Testimonials items={testimonials.slice(0, 6)} />
          </div>
        </section>
      )}

      {faqs.length > 0 && (
        <section className="border-t border-line py-20 sm:py-24">
          <div className="page-wrap grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <SectionHeading align="left" eyebrow="Questions" title="Answers before you begin" intro="Everything parents usually ask us before the first class. Can't find yours? We reply on WhatsApp quickly." />
              <Link href="/faq" className="btn btn-outline mt-8">
                All questions <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
            <FaqList faqs={faqs.slice(0, 6)} />
          </div>
        </section>
      )}

      <CtaBand
        title="Begin your family’s Quran journey this week"
        text="Book a 7-day free trial. We will match you with a teacher, agree a time that suits your time zone and send the class link — no card needed."
        whatsappHref={wa}
      />
    </div>
  );
}
