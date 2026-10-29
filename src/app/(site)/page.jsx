import { contentVisual } from "@/lib/content-visual";
import { cardTone } from "@/lib/card-presentation";
import { HomeContact } from "@/components/site/home-contact";
import { ContentImage } from "@/components/site/content-image";
import { HomeMotion } from "@/components/site/home-motion";
import { faqSchema, safeJsonLd } from "@/lib/seo";
import { NavigationLink as Link } from "@/components/site/navigation-link";
import { ArrowRight } from "@/components/site/icons";
import { HomeHero } from "@/components/site/hero";
import { SectionHeading } from "@/components/site/chrome";
import { Benefits, CoursesGrid, CtaBand, FaqList, PricingCards, Steps, TeacherCard, Testimonials } from "@/components/site/sections";
import { getCourses, getFaqs, getPlans, getPosts, getSettings, getTeachers, getTestimonials } from "@/lib/site-data";
import { SITE_URL } from "@/lib/config";
import { truncate } from "@/lib/format";
import { normalizeSeoSettings } from "@/lib/search-settings";

export const revalidate = 300;

export async function generateMetadata() {
  const settings = await getSettings();
  const seo = normalizeSeoSettings(settings["site.seo"]);
  return {
    title: { absolute: seo.title ?? "Online Quran College" },
    description: seo.description || "Live one-to-one online Quran classes for children and adults. Explore Noorani Qaida, Tajweed, Hifz and Arabic with Online Quran College.",
    alternates: { canonical: "/", types: { "application/rss+xml": [{ url: "/blog/feed.xml", title: "Online Quran College articles" }] } },
    twitter: { card: "summary_large_image", title: seo.title || "Online Quran College", description: seo.description || "Live online Quran lessons for children and adults, with flexible class times.", images: ["/opengraph-image"] },
    openGraph: { type: "website", siteName: "Online Quran College", locale: "en_GB", title: seo.title || "Online Quran College", description: seo.description || "Live online Quran lessons for children and adults, with flexible class times.", url: "/", images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Online Quran College — live online Quran classes" }] },
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
  const standardPlans = plans.filter((p) => /^package/i.test(p.name)).slice(0, 4);
  const homePlans = standardPlans.length >= 3 ? standardPlans : plans.slice(0, 4);

  const jsonLd = { "@context": "https://schema.org", "@type": "WebPage", "@id": `${SITE_URL}/#webpage`, url: SITE_URL, name: "Online Quran College", isPartOf: { "@id": `${SITE_URL}/#website` }, about: { "@id": `${SITE_URL}/#organization` }, inLanguage: "en-GB" };

  return (
    <div data-home-motion>
      <HomeMotion />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      <HomeHero hero={settings["site.hero"]} stats={settings["site.stats"]} />
      <nav aria-label="On this page" className="page-wrap flex flex-wrap justify-center gap-2 py-5">
        {[["#courses", "Courses"], ["#how-it-works", "How it works"], ...(homePlans.length ? [["#fees", "Fees"]] : []), ...(faqs.length ? [["#questions", "Questions"]] : [])].map(([href, label]) => <a key={href} href={href} className="home-jump rounded-full border border-leaf-100 bg-white px-5 py-3 text-sm font-semibold text-leaf-700 hover:bg-leaf-50">{label}</a>)}
      </nav>
      <nav aria-label="Priority study locations" className="page-wrap grid grid-cols-2 gap-3 pb-8 lg:grid-cols-4">
        {[["united-states", "USA"], ["united-kingdom", "UK"], ["canada", "Canada"], ["australia", "Australia"]].map(([slug, label]) => <Link key={slug} href={`/locations/${slug}`} className="surface flex items-center justify-between gap-2 px-4 py-3 text-sm font-semibold text-leaf-700">Quran classes in {label}<ArrowRight className="size-4 shrink-0" aria-hidden="true" /></Link>)}
      </nav>


      <section id="about" className="bg-[#f5faf1] py-16 sm:py-24">
        <div className="page-wrap grid items-center gap-10 lg:grid-cols-2">
          <figure className="overflow-hidden rounded-[2rem] border border-leaf-100 bg-white">
            <ContentImage src="/images/learning/home-college-welcome-r2-1200.webp" alt="Parents encouraging their daughter during a laptop lesson at a bright home desk" sizes="(max-width: 1024px) 100vw, 560px" className="aspect-[3/2] w-full object-cover" />
            <figcaption className="px-6 py-5"><p className="font-bold text-leaf-700">Islamic mission. Global Quran access.</p><p className="mt-1 text-sm text-ink-soft">Traditional learning, connected to your home.</p></figcaption>
          </figure>
          <div><SectionHeading align="left" eyebrow="About our college" title="Welcome to Online Quran College" intro="Learn the Quran from home through personal, live one-to-one Quran classes." /><p className="mt-5 text-ink-soft">From the first Arabic letters to confident recitation, choose a course around your learner’s level and goals.</p><Link href="/about" className="btn btn-primary mt-6">About our college <ArrowRight className="size-4" aria-hidden="true" /></Link></div>
        </div>
      </section>
      <section className="page-wrap grid gap-4 py-8 sm:grid-cols-3" aria-label="Explore learning paths">
        {[
          { href: "/locations/united-states", image: "usa-online-quran-learning", alt: "Child and parent reviewing an Arabic workbook beside a laptop", title: "Quran classes in the USA", text: "US time zones, courses and USD packages." },
          { href: "/locations/australia", image: "australia-online-quran-learning", alt: "Young learner studying an Arabic workbook beside a laptop", title: "Quran classes in Australia", text: "Plan around your city and request approved AUD fees." },
          { href: "/learn", image: "home-learning-paths", alt: "Young learner with headphones using a workbook and laptop beside a closed book on a stand", title: "Find your learning path", text: "Guides for parents, adults and recitation learners." },
        ].map(item => <Link key={item.href} href={item.href} data-card-tone={cardTone(item.href)} className="surface editorial-card card-tinted group flex flex-col"><div className="mx-2 mt-2 aspect-[3/2] overflow-hidden rounded-[1.15rem]"><ContentImage src={`/images/learning/${item.image}-1200.webp`} alt={item.alt} sizes="(max-width: 639px) 100vw, (max-width: 1024px) 33vw, 380px" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" /></div><div className="flex flex-1 flex-col p-6"><h2 className="text-xl">{item.title}</h2><p className="mt-3 flex-1 text-sm text-ink-soft">{item.text}</p><span className="card-action mt-5">Explore <span className="card-arrow"><ArrowRight className="size-4" aria-hidden="true" /></span></span></div></Link>)}
      </section>
      <section id="courses" className="bg-[#f5faf1] py-20 sm:py-24" aria-labelledby="courses-heading">
        <div className="page-wrap"><div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            align="left"
            eyebrow="Our courses"
            title={<span id="courses-heading">Our Popular Courses</span>}
            intro="Personal lessons, paced around your learner’s starting level."
          />
          <Link href="/courses" className="btn btn-outline">
            All courses <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="mt-12">
          <CoursesGrid courses={courses} />
        </div></div>
      </section>


      <section className="border-y border-line bg-[#f5faf1] py-20 sm:py-24">
        <div className="page-wrap">
          <SectionHeading
            eyebrow="Why families choose us"
            title="Why Choose Online Quran College?"
            intro="Explore online learning for children and adults, with course choices and class times discussed around your family’s routine."
          />
          <div className="mt-12">
            <Benefits items={settings["site.benefits"]?.slice(0, 3)} />
          </div>
        </div>
      </section>

      <section id="how-it-works" className="relative overflow-hidden bg-white py-20 sm:py-24">
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
        <section id="fees" className="page-wrap py-20 sm:py-24" aria-labelledby="fees-heading">
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

      {teachers.length > 0 && (
        <section className="border-t border-line bg-white/60 py-20 sm:py-24">
          <div className="page-wrap">
            <SectionHeading eyebrow="Our faculty" title="Meet Our Tutors" intro="Discuss teacher availability and your learner’s needs with the coordinator." />
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {teachers.slice(0, 4).map((t) => (
                <TeacherCard key={t.id} teacher={t} />
              ))}
            </div>
          </div>
        </section>
      )}


      <section id="contact" className="bg-white py-16 sm:py-24"><div className="page-wrap max-w-3xl"><SectionHeading eyebrow="Contact the college" title="Send A Message" intro="Have questions about a course or class schedule? Our coordinators can help." /><div className="mt-8"><HomeContact consentText={settings["site.forms"]?.consent_text} successText={settings["site.forms"]?.contact_success} /></div></div></section>
      {testimonials.length > 0 && (
        <section className="page-wrap py-20 sm:py-24">
          <SectionHeading eyebrow="Testimonials" title="Our Success Stories" />
          <div className="mt-12">
            <Testimonials items={testimonials.slice(0, 6)} />
          </div>
        </section>
      )}

      {faqs.length > 0 && (
        <section id="questions" className="border-t border-line py-20 sm:py-24">
          <div className="page-wrap grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <SectionHeading align="left" eyebrow="Questions" title="Answers before you begin" intro="Find answers about lessons, teachers and getting started. For help with your own situation, send the college a message." />
              <Link href="/faq" className="btn btn-outline mt-8">
                All questions <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
            <div><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(faqSchema(faqs.slice(0, 3))) }} /><FaqList faqs={faqs.slice(0, 3)} /></div>
          </div>
        </section>
      )}


      {posts.length > 0 && <section id="blog" className="bg-[#f5faf1] py-16 sm:py-24"><div className="page-wrap"><SectionHeading eyebrow="Our blog" title="Latest Articles & Resources" intro="Practical guides for Quran learning, recitation and family study routines." /><div className="mt-10 grid gap-6 md:grid-cols-3">{posts.map(post => <Link key={post.slug} href={`/blog/${post.slug}`} data-card-tone={cardTone(post.slug)} className="surface card-tinted overflow-hidden">{<ContentImage src={contentVisual(post).src} alt={contentVisual(post).alt} sizes="(max-width: 768px) 100vw, 380px" className="aspect-[3/2] w-full object-cover" />}<div className="p-6"><p className="text-xs font-semibold uppercase tracking-wider text-leaf-700">{post.category}</p><h3 className="mt-2 text-xl text-leaf-700">{post.title}</h3><p className="mt-3 text-sm text-ink-soft">{truncate(post.excerpt || "", 100)}</p></div></Link>)}</div><div className="mt-8 text-center"><Link href="/blog" className="btn btn-outline">All articles</Link></div></div></section>}
      <CtaBand
        title="Begin your family’s Quran journey this week"
        text="Book a 3-day free trial. We will match you with a teacher, agree a time that suits your time zone and send the class link — no card needed."
      />
    </div>
  );
}
