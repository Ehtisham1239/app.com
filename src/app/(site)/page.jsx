import { HomeContact } from "@/components/site/home-contact";
import { ContentImage } from "@/components/site/content-image";
import { HomeMotion } from "@/components/site/home-motion";
import { safeJsonLd } from "@/lib/seo";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HomeHero } from "@/components/site/hero";
import { SectionHeading } from "@/components/site/chrome";
import { Benefits, CoursesGrid, CtaBand, FaqList, PricingCards, Steps, TeacherCard, Testimonials } from "@/components/site/sections";
import { getCourses, getFaqs, getPlans, getPosts, getSettings, getTeachers, getTestimonials } from "@/lib/site-data";
import { SITE_URL } from "@/lib/config";

export const revalidate = 300;

export async function generateMetadata() {
  const settings = await getSettings();
  const seo = settings["site.seo"] ?? {};
  return {
    title: { absolute: seo.title ?? "Online Quran College" },
    description: seo.description || "Live one-to-one online Quran classes for children and adults. Explore Noorani Qaida, Tajweed, Hifz and Arabic with Online Quran College.",
    alternates: { canonical: "/" },
    openGraph: { title: seo.title || "Online Quran College", description: seo.description || "Live online Quran lessons for children and adults, with flexible class times.", url: "/", images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Online Quran College — live online Quran classes" }] },
  };
}

export default async function HomePage() {
  const [settings, courses, plans, faqs, teachers, testimonials, posts] = await Promise.all([
    getSettings(),
    getCourses(),
    getPlans(),
    getFaqs(),
    getTeachers(),
    getTestimonials(),
    getPosts(3),
  ]);
  const identity = settings["site.identity"] ?? {};
  const contact = settings["site.contact"] ?? {};
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


      <section id="about" className="bg-[#f4fbf7] py-16 sm:py-24">
        <div className="page-wrap grid items-center gap-10 lg:grid-cols-2">
          <div className="pattern-girih flex min-h-64 flex-col justify-center rounded-[2rem] border border-leaf-100 bg-[#eefaf3] p-8 text-center"><p className="arabic text-4xl text-leaf-700" lang="ar" dir="rtl">اقرأ</p><p className="mt-6 text-xl font-bold text-leaf-700">Islamic mission. Global Quran access.</p><p className="mt-3 text-ink-soft">Traditional learning, connected to your home.</p></div>
          <div><SectionHeading align="left" eyebrow="About our college" title="Welcome to Online Quran College" intro="Our mission is to make Quran learning accessible from home, connecting traditional Islamic teaching with live online classrooms for children and adults." /><p className="mt-5 text-ink-soft">Begin with Noorani Qaida, develop Quran reading and Tajweed, or explore memorisation, Arabic and translation. Discuss the learner’s starting level, goals and local schedule with our coordinator before choosing a course.</p><Link href="/about" className="btn btn-primary mt-6">About our college <ArrowRight className="size-4" aria-hidden="true" /></Link></div>
        </div>
      </section>
      <section className="page-wrap grid gap-4 py-8 sm:grid-cols-3" aria-label="Explore learning paths"><Link href="/locations/united-states" className="surface p-6"><h2 className="text-xl">Quran classes in the USA</h2><p className="mt-2 text-sm text-ink-soft">US time zones, courses and USD packages.</p></Link><Link href="/locations/australia" className="surface p-6"><h2 className="text-xl">Quran classes in Australia</h2><p className="mt-2 text-sm text-ink-soft">Plan around your city and request approved AUD fees.</p></Link><Link href="/learn" className="surface p-6"><h2 className="text-xl">Find your learning path</h2><p className="mt-2 text-sm text-ink-soft">Guides for parents, adults and recitation learners.</p></Link></section>
      <section className="bg-[#f4fbf7] py-20 sm:py-24" aria-labelledby="courses-heading">
        <div className="page-wrap"><div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            align="left"
            eyebrow="Our courses"
            title={<span id="courses-heading">Our Popular Courses</span>}
            intro="Every course is taught live, one-to-one, with a teacher who adapts the pace to the student — whether a child learning the alphabet or an adult perfecting recitation."
          />
          <Link href="/courses" className="btn btn-outline">
            All courses <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="mt-12">
          <CoursesGrid courses={courses} />
        </div></div>
      </section>

      <section className="bg-white py-16 sm:py-24"><div className="page-wrap grid items-center gap-10 lg:grid-cols-2"><ContentImage src="/images/learning/noorani-qaida-child-1200.webp" alt="Child practising Arabic letters with a parent beside a laptop" className="aspect-[3/2] w-full rounded-[2rem] object-cover" sizes="(max-width: 1024px) 100vw, 560px" /><div><h2 className="text-3xl text-leaf-700">Personal teaching, at your learner’s pace</h2><ul className="mt-6 space-y-4 text-ink-soft"><li>Live one-to-one lessons for children and adults.</li><li>A course path from first Arabic letters to recitation and memorisation.</li><li>Class times discussed around your family’s local routine.</li><li>Speak with a coordinator before confirming your course and fees.</li></ul><Link className="btn btn-primary mt-6" href="/free-trial">Book a free trial</Link></div></div></section>
      <section className="border-y border-line bg-[#f4fbf7] py-20 sm:py-24">
        <div className="page-wrap">
          <SectionHeading
            eyebrow="Why families choose us"
            title="Why Choose Online Quran College?"
            intro="Explore online learning for children and adults, with course choices and class times discussed around your family’s routine."
          />
          <div className="mt-12">
            <Benefits items={settings["site.benefits"]} />
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-white py-20 sm:py-24">
        <div className="pattern-girih pointer-events-none absolute inset-0 opacity-[0.07]" aria-hidden="true" />
        <div className="page-wrap relative">
          <SectionHeading eyebrow="Quick onboarding" title="How We Work" />
          <div className="mt-14">
            <Steps steps={settings["site.steps"]} tone="light" />
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
            intro="Compare published monthly packages. Confirm lesson length, course fees and any available family discount with the coordinator before enrolling."
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

      {(
        <section className="border-t border-line bg-white/60 py-20 sm:py-24">
          <div className="page-wrap">
            <SectionHeading eyebrow="Our faculty" title="Meet Our Tutors" intro="Discuss teacher availability and your learner’s needs with the coordinator." />
            {teachers.length === 0 && <p className="mt-8 text-center text-ink-soft">Ask the college about available tutors, teaching experience and a suitable trial lesson. <Link className="font-semibold text-leaf-700 underline" href="/contact">Speak with the coordinator</Link>.</p>}
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {teachers.slice(0, 4).map((t) => (
                <TeacherCard key={t.id} teacher={t} />
              ))}
            </div>
          </div>
        </section>
      )}


      <section id="contact" className="bg-white py-16 sm:py-24"><div className="page-wrap max-w-3xl"><SectionHeading eyebrow="Contact the college" title="Send A Message" intro="Have questions about a course or class schedule? Our coordinators can help." /><div className="mt-8"><HomeContact consentText={settings["site.forms"]?.consent_text} successText={settings["site.forms"]?.contact_success} /></div></div></section>
      {(
        <section className="page-wrap py-20 sm:py-24">
          <SectionHeading eyebrow="Testimonials" title="Our Success Stories" />
          <div className="mt-12">
            {testimonials.length ? <Testimonials items={testimonials.slice(0, 6)} /> : <p className="text-center text-ink-soft">Family feedback will appear here when available. Ask the coordinator how lessons and progress reviews work before booking.</p>}
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


      {posts.length > 0 && <section id="blog" className="bg-[#f4fbf7] py-16 sm:py-24"><div className="page-wrap"><SectionHeading eyebrow="Our blog" title="Latest Articles & Resources" intro="Practical guides for Quran learning, recitation and family study routines." /><div className="mt-10 grid gap-6 md:grid-cols-3">{posts.map(post => <Link key={post.slug} href={`/blog/${post.slug}`} className="surface overflow-hidden">{post.cover_url && <ContentImage src={post.cover_url} alt={post.cover_alt} sizes="(max-width: 768px) 100vw, 380px" className="aspect-[3/2] w-full object-cover" />}<div className="p-6"><p className="text-xs font-semibold uppercase tracking-wider text-leaf-700">{post.category}</p><h3 className="mt-2 text-xl text-leaf-700">{post.title}</h3><p className="mt-3 text-sm text-ink-soft">{post.excerpt}</p></div></Link>)}</div><div className="mt-8 text-center"><Link href="/blog" className="btn btn-outline">All articles</Link></div></div></section>}
      <CtaBand
        title="Begin your family’s Quran journey this week"
        text="Book a 7-day free trial. We will match you with a teacher, agree a time that suits your time zone and send the class link — no card needed."
      />
    </div>
  );
}
