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
      {/* One compact jump row, in the same order as the sections below. Scrolls sideways on phones instead of wrapping into several rows. */}
      <nav aria-label="On this page" className="page-wrap py-5">
        <ul className="home-jump-row flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:justify-center sm:overflow-visible">
          {[["#courses", "Courses"], ["#how-it-works", "How it works"], ...(homePlans.length ? [["#fees", "Fees"]] : []), ...(testimonials.length ? [["#reviews", "Reviews"]] : []), ["#countries", "Your country"], ...(faqs.length ? [["#questions", "Questions"]] : []), ["#contact", "Contact"]].map(([href, label]) => <li key={href} className="shrink-0"><a href={href} className="home-jump inline-flex min-h-11 items-center rounded-full border border-leaf-100 bg-white px-5 text-sm font-semibold text-leaf-700 hover:bg-leaf-50">{label}</a></li>)}
        </ul>
      </nav>

      <section id="courses" className="scroll-mt-24 bg-[#f5faf1] py-16 sm:py-24" aria-labelledby="courses-heading">
        <div className="page-wrap"><div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            align="left"
            eyebrow="Our courses"
            title={<span id="courses-heading">Our popular courses</span>}
            intro="Personal lessons, paced around your learner’s starting level."
          />
          <Link href="/courses" className="btn btn-outline">
            All courses <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="mt-12">
          <CoursesGrid courses={courses} swipe />
        </div></div>
      </section>

      <section id="how-it-works" className="relative scroll-mt-24 overflow-hidden bg-white py-16 sm:py-24">
        <div className="pattern-girih pointer-events-none absolute inset-0 opacity-[0.07]" aria-hidden="true" />
        <div className="page-wrap relative">
          <SectionHeading eyebrow="Quick onboarding" title="How it works" intro="Three simple steps from your first message to regular classes." />
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

      <section aria-labelledby="oqc-learning-framework" className="border-y border-line bg-[#f5faf1] py-16 sm:py-20">
        <div className="page-wrap">
          <SectionHeading
            eyebrow="The OQC learning approach"
            title={<span id="oqc-learning-framework">A clear path from first lesson to steady progress</span>}
            intro="A simple learning cycle helps students and families understand what happens before, during and after a lesson."
          />
          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              ["01", "Learn", "Understand the lesson goal and introduce the skill at the learner’s current level."],
              ["02", "Practice", "Work through guided recitation, reading or memorisation with the teacher."],
              ["03", "Assessment", "Check understanding and identify what the learner can do confidently."],
              ["04", "Feedback", "Discuss strengths and the next area to practise with the learner."],
              ["05", "Improve", "Use the next lesson and home practice to build on the previous step."],
            ].map(([number, title, description]) => (
              <li key={number} className="surface flex flex-col p-5">
                <span className="font-display text-2xl text-gold-600">{number}</span>
                <h3 className="mt-3 text-lg font-bold text-mushaf-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {homePlans.length > 0 && (
        <section id="fees" className="page-wrap scroll-mt-24 py-16 sm:py-24" aria-labelledby="fees-heading">
          <SectionHeading
            eyebrow="Fees"
            title={<span id="fees-heading">Simple monthly packages</span>}
            intro="Compare published monthly packages. Confirm lesson length, course fees and any available family discount with the coordinator before enrolling."
          />
          <div className="mt-12">
            <PricingCards plans={homePlans} compact />
          </div>
          <p className="mx-auto mt-4 max-w-2xl text-center text-sm text-ink-soft">
            Homepage package prices are shown in US dollars. See the pricing page or your country guide for local fee guidance; Admissions confirms the final fee and payment currency before enrolment.
          </p>
          <p className="mt-8 text-center">
            <Link href="/pricing" className="inline-flex items-center gap-1.5 font-semibold text-leaf-700 hover:text-leaf-800">
              See all packages and fees in your currency <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </p>
        </section>
      )}

      {testimonials.length > 0 && (
        <section id="reviews" className="scroll-mt-24 border-t border-line bg-white/60 py-16 sm:py-24">
          <div className="page-wrap">
            <SectionHeading eyebrow="Reviews" title="What families say" intro="Real reviews sent through our website, shown with each reviewer’s permission (first name only)." />
            <div className="mt-12">
              <Testimonials items={testimonials.slice(0, 6)} />
            </div>
            <p className="mt-8 text-center text-sm">Already learning with us? <Link className="font-semibold text-leaf-700 underline underline-offset-4" href="/reviews">Share your experience</Link></p>
          </div>
        </section>
      )}

      <section className="border-y border-line bg-[#f5faf1] py-16 sm:py-24">
        <div className="page-wrap">
          <SectionHeading
            eyebrow="Why families choose us"
            title="Why choose Online Quran College?"
            intro="Explore online learning for children and adults, with course choices and class times discussed around your family’s routine."
          />
          <div className="mt-12">
            <Benefits items={settings["site.benefits"]?.slice(0, 3)} />
          </div>
        </div>
      </section>

      {teachers.length > 0 && (
        <section className="bg-white py-16 sm:py-24">
          <div className="page-wrap">
            <SectionHeading eyebrow="Our faculty" title="Meet our tutors" intro="Discuss teacher availability and your learner’s needs with the coordinator." />
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {teachers.slice(0, 4).map((t) => (
                <TeacherCard key={t.id} teacher={t} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="countries" className="page-wrap scroll-mt-24 py-16 sm:py-20" aria-labelledby="countries-heading">
        <SectionHeading eyebrow="Your country" title={<span id="countries-heading">Classes planned around your time zone</span>} intro="Pick your country to see local class times, courses and fees in your currency." />
        <div className="swipe-row mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { href: "/locations/united-kingdom", image: "oqc-learning-united-kingdom-v3", alt: "A teenage boy wearing headphones, with a parent nearby, following a teacher on a laptop in a calm home study with Quran learning materials", title: "Quran classes in the UK", text: "UK local times, courses and GBP quotes." },
          { href: "/locations/united-states", image: "usa-online-quran-learning", alt: "Child and parent reviewing an Arabic workbook beside a laptop", title: "Quran classes in the USA", text: "US time zones, courses and USD packages." },
          { href: "/locations/canada", image: "oqc-learning-canada-v3", alt: "A father and daughter calmly reviewing their online Quran lesson at a small study table in a calm home study with Quran learning materials", title: "Quran classes in Canada", text: "Canadian time zones, courses and USD fee guide." },
          { href: "/locations/australia", image: "australia-online-quran-learning", alt: "Young learner studying an Arabic workbook beside a laptop", title: "Quran classes in Australia", text: "City-aware lesson times and approximate AUD fee guidance." },
          { href: "/locations/united-arab-emirates", image: "family-online-quran-study-r2", alt: "Mother and son looking towards a laptop teacher with an open beginner workbook between them", title: "Quran classes in the UAE", text: "Gulf Standard Time, courses and AED quotes." },
          { href: "/learn", image: "home-learning-paths", alt: "Young learner with headphones using a workbook and laptop beside a closed book on a stand", title: "Find your learning path", text: "Guides for parents, adults and recitation learners." },
        ].map(item => <Link key={item.href} href={item.href} data-card-tone={cardTone(item.href)} className="surface editorial-card card-tinted group flex flex-col"><div className="mx-2 mt-2 aspect-[3/2] overflow-hidden rounded-[1.15rem]"><ContentImage src={`/images/learning/${item.image}-1200.webp`} alt={item.alt} sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 300px" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" /></div><div className="flex flex-1 flex-col p-6"><h3 className="text-xl">{item.title}</h3><p className="mt-3 flex-1 text-sm text-ink-soft">{item.text}</p><span className="card-action mt-5">Explore <span className="card-arrow"><ArrowRight className="size-4" aria-hidden="true" /></span></span></div></Link>)}
        </div>
        <p className="mt-6 text-center text-sm text-ink-soft">Somewhere else? <Link href="/locations" className="font-semibold text-leaf-700 underline underline-offset-4">See every country we plan classes for</Link></p>
      </section>

      <section id="about" aria-labelledby="about-heading" className="scroll-mt-24 bg-[#f5faf1] py-14 sm:py-20">
        <div className="page-wrap grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="min-w-0">
            <SectionHeading
              align="left"
              title={<span id="about-heading">About Online Quran College</span>}
              intro="We teach live, one-to-one Quran classes online for children and adults."
            />
            <p className="mt-5 leading-relaxed text-ink-soft">Start with Arabic letters, improve your recitation with Tajweed, or work on memorisation. Our coordinator can help you choose a course that fits your level, goals and schedule.</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href="/about" className="btn btn-primary">How the college works <ArrowRight className="size-4" aria-hidden="true" /></Link>
              <Link href="/careers" className="btn btn-outline">Careers &amp; Opportunities</Link>
            </div>
          </div>
          <div className="min-w-0 overflow-hidden rounded-[2rem] border border-leaf-100 bg-white">
            <ContentImage
              src="/images/learning/home-college-welcome-r2-1200.webp"
              alt="Parents sitting with their daughter during an online Quran lesson"
              sizes="(max-width: 767px) calc(100vw - 2rem), (max-width: 1023px) calc(100vw - 4rem), calc(min(100vw, 112rem) / 2 - 3.5rem)"
              className="block aspect-[3/2] h-auto w-full object-cover"
            />
          </div>
        </div>
      </section>

      {faqs.length > 0 && (
        <section id="questions" className="scroll-mt-24 py-16 sm:py-24">
          <div className="page-wrap grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <SectionHeading align="left" eyebrow="Questions" title="Answers before you begin" intro="Find answers about lessons, teachers and getting started. Still unsure? Send the college a message below." />
              <Link href="/faq" className="btn btn-outline mt-8">
                All questions <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
            <div><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(faqSchema(faqs.slice(0, 5))) }} /><FaqList faqs={faqs.slice(0, 5)} /></div>
          </div>
        </section>
      )}

      <section id="contact" className="scroll-mt-24 border-t border-line bg-white py-16 sm:py-24"><div className="page-wrap max-w-3xl"><SectionHeading eyebrow="Contact the college" title="Send a message" intro="Have a question about a course, fees or class times? A coordinator can reply by email or WhatsApp." /><div className="mt-8"><HomeContact consentText={settings["site.forms"]?.consent_text} successText={settings["site.forms"]?.contact_success} /></div></div></section>

      <section className="page-wrap py-12 sm:py-16" aria-labelledby="quran-practice-heading">
        <div className="surface grid items-center gap-7 p-7 sm:p-10 lg:grid-cols-[1.3fr_auto]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-leaf-700">Quran practice centre</p>
            <h2 id="quran-practice-heading" className="mt-3 text-3xl text-mushaf-900">Reading, listening and recitation practice</h2>
            <p className="mt-3 max-w-2xl leading-relaxed text-ink-soft">Explore independent digital resources, including the Tarteel app, and build a steady practice routine alongside teacher-guided learning.</p>
          </div>
          <Link href="/quran-study" className="btn btn-primary w-fit">Explore Quran practice tools <ArrowRight className="size-4" aria-hidden="true" /></Link>
        </div>
      </section>

      {posts.length > 0 && <section id="blog" className="bg-[#f5faf1] py-16 sm:py-24"><div className="page-wrap"><SectionHeading eyebrow="Our blog" title="Latest articles and resources" intro="Practical guides for Quran learning, recitation and family study routines." /><div className="mt-10 grid gap-6 md:grid-cols-3">{posts.map(post => <Link key={post.slug} href={`/blog/${post.slug}`} data-card-tone={cardTone(post.slug)} className="surface card-tinted overflow-hidden">{<ContentImage src={contentVisual(post).src} alt={contentVisual(post).alt} sizes="(max-width: 768px) 100vw, 380px" className="aspect-[3/2] w-full object-cover" />}<div className="p-6"><p className="text-xs font-semibold uppercase tracking-wider text-leaf-700">{post.category}</p><h3 className="mt-2 text-xl text-leaf-700">{post.title}</h3><p className="mt-3 text-sm text-ink-soft">{truncate(post.excerpt || "", 100)}</p></div></Link>)}</div><div className="mt-8 text-center"><Link href="/blog" className="btn btn-outline">All articles</Link></div></div></section>}
      <CtaBand
        title="Take the next step in your family’s Quran learning"
        text="Request a 3-day free trial. Admissions will discuss your course and teacher preferences, confirm availability and agree a suitable time — no card needed on eligible packages."
      />
    </div>
  );
}
