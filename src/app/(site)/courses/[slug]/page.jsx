import { ContentImage } from "@/components/site/content-image";
import { SITE_URL } from "@/lib/config";
import { safeJsonLd, faqSchema, breadcrumbSchema } from "@/lib/seo";
import { contentMetadata } from "@/lib/seo-metadata";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarClock, CheckCircle2, GraduationCap, MessageCircle, Users } from "lucide-react";
import { ContentIcon } from "@/components/icon";
import { CourseCard, FaqList } from "@/components/site/sections";
import { getCourse, getCourses, getFaqs, getPlans, getPublishedSlugs, getSettings } from "@/lib/site-data";
import { cleanHtml } from "@/lib/sanitize";
import { formatMoney, truncate, stripHtml, whatsappLink } from "@/lib/format";

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  const { courses } = await getPublishedSlugs();
  return courses.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const course = await getCourse(slug);
  if (!course) return { title: "Course not found" };
  const description = course.seo_description || truncate(course.summary || stripHtml(course.description_html), 158);
  return contentMetadata(course, { path: `/courses/${course.slug}`, description });
}

export default async function CoursePage({ params }) {
  const { slug } = await params;
  const course = await getCourse(slug);
  if (!course) notFound();
  const [courses, faqs, plans, settings] = await Promise.all([getCourses(), getFaqs(), getPlans(), getSettings()]);
  const courseFaqs = faqs.filter((f) => f.course_id === course.id);
  const generalFaqs = faqs.filter((f) => !f.course_id && !f.category.startsWith("Market:")).slice(0, Math.max(0, 5 - courseFaqs.length));
  const others = courses.filter((c) => c.slug !== course.slug).slice(0, 3);
  const prices = plans.filter((p) => p.course_id === course.id && p.billing_period === "monthly").flatMap((p) => p.prices.filter((x) => x.currency === "USD").map((x) => x.amount_minor));
  const fromPrice = prices.length ? Math.min(...prices) : null;
  const wa = whatsappLink(settings["site.contact"]?.whatsapp, `Assalamu alaikum, I am interested in the ${course.title} course.`);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.summary,
    ...(course.cover_url ? { image: new URL(course.cover_url, SITE_URL).href } : {}),
    "@id": `${SITE_URL}/courses/${course.slug}#course`,
    url: `${SITE_URL}/courses/${course.slug}`,
    provider: { "@type": "EducationalOrganization", "@id": `${SITE_URL}/#organization`, name: settings["site.identity"]?.name ?? "Online Quran College" },
    hasCourseInstance: { "@type": "CourseInstance", courseMode: "online" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbSchema([{ name: "Courses", path: "/courses" }, { name: course.title, path: `/courses/${course.slug}` }], SITE_URL)) }} />
      {[...courseFaqs, ...generalFaqs].length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(faqSchema([...courseFaqs, ...generalFaqs])) }} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      <section className="relative overflow-hidden bg-mushaf-900 text-white">
        <div className="pattern-girih pointer-events-none absolute inset-0 opacity-[0.09]" aria-hidden="true" />
        <div className="page-wrap relative py-14 sm:py-20">
          <nav aria-label="Breadcrumb" className="text-sm text-white/60">
            <Link href="/courses" className="hover:text-white">
              Courses
            </Link>
            <span className="mx-2">/</span>
            <span className="text-white/85">{course.title}</span>
          </nav>
          <div className="mt-6 flex flex-wrap items-start justify-between gap-8">
            <div className="max-w-3xl">
              <span className="flex size-16 items-center justify-center rounded-2xl bg-white/10 text-gold-300 ring-1 ring-gold-400/40">
                <ContentIcon name={course.icon} className="size-8" />
              </span>
              <h1 className="mt-6 text-[2.5rem] text-white sm:text-[3.4rem]">{course.title}</h1>
              <p className="mt-5 text-[1.1rem] leading-relaxed text-white/75">{course.summary}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={`/free-trial?course=${course.id}`} className="btn btn-gold btn-lg">
                  Book a free trial <ArrowRight className="size-5" aria-hidden="true" />
                </Link>
                {wa && (
                  <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-outline-light btn-lg">
                    <MessageCircle className="size-5" aria-hidden="true" /> Ask a question
                  </a>
                )}
              </div>
            </div>
            {course.arabic_title && (
              <p lang="ar" dir="rtl" className="arabic text-[3rem] leading-none text-gold-300/90 sm:text-[4.2rem]">
                {course.arabic_title}
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="page-wrap grid gap-12 py-16 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0">
          {course.cover_url && <ContentImage src={course.cover_url} alt={course.cover_alt} priority className="mb-10 aspect-[3/2] w-full rounded-3xl object-cover" />}
          {course.description_html && <div className="prose-oqc" dangerouslySetInnerHTML={{ __html: cleanHtml(course.description_html) }} />}

          <section className="surface mt-10 space-y-3 p-6"><h2 className="text-2xl">Plan lessons around your family</h2><p>Explore local scheduling and fee guidance before requesting a trial.</p><div className="flex flex-wrap gap-3"><Link href="/locations/united-states" className="btn btn-outline">USA families</Link><Link href="/locations/australia" className="btn btn-outline">Australian families</Link><Link href="/learn" className="btn btn-outline">Learning guides</Link></div></section>
          {course.outcomes?.length > 0 && (
            <section className="mt-12">
              <h2 className="text-[1.9rem] text-mushaf-900">Learning goals</h2>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {course.outcomes.map((o) => (
                  <li key={o} className="flex gap-3 rounded-2xl border border-line bg-white p-4 text-[0.97rem] text-ink">
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-leaf-600" aria-hidden="true" />
                    {o}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {course.course_modules?.length > 0 && (
            <section className="mt-14">
              <h2 className="text-[1.9rem] text-mushaf-900">Course outline</h2>
              <ol className="mt-6 space-y-3">
                {course.course_modules.map((m, i) => (
                  <li key={m.id} className="rounded-2xl border border-line bg-white p-5">
                    <div className="flex gap-4">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gold-50 font-display text-lg text-gold-700 ring-1 ring-gold-100">{i + 1}</span>
                      <div>
                        <h3 className="text-[1.08rem] font-bold text-mushaf-900">{m.title}</h3>
                        {m.objectives && <p className="mt-1.5 text-[0.95rem] leading-relaxed text-ink-soft">{m.objectives}</p>}
                        {m.topics?.length > 0 && (
                          <ul className="mt-3 flex flex-wrap gap-2">
                            {m.topics.map((t) => (
                              <li key={t} className="rounded-full bg-paper px-3 py-1 text-[0.82rem] text-ink-soft ring-1 ring-line">
                                {t}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {(courseFaqs.length > 0 || generalFaqs.length > 0) && (
            <section className="mt-14">
              <h2 className="text-[1.9rem] text-mushaf-900">Questions about this course</h2>
              <div className="mt-6">
                <FaqList faqs={[...courseFaqs, ...generalFaqs]} defaultOpen={-1} />
              </div>
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="surface overflow-hidden">
            <div className="bg-mushaf-950 px-6 py-5 text-white">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-300">At a glance</p>
              {fromPrice === null && <p className="mt-2 text-sm text-white/80">Request the approved fee for this course before enrolling.</p>}
              {fromPrice !== null && (
                <p className="mt-2 text-white/80">
                  From <span className="font-display text-3xl text-white">{formatMoney(fromPrice, "USD")}</span> /month
                </p>
              )}
            </div>
            <dl className="divide-y divide-line px-6 text-[0.95rem]">
              <div className="flex items-center gap-3 py-4">
                <Users className="size-5 text-gold-600" aria-hidden="true" />
                <div>
                  <dt className="text-xs uppercase tracking-wider text-ink-faint">Who it is for</dt>
                  <dd className="font-semibold text-ink">{course.age_group}</dd>
                </div>
              </div>
              <div className="flex items-center gap-3 py-4">
                <GraduationCap className="size-5 text-gold-600" aria-hidden="true" />
                <div>
                  <dt className="text-xs uppercase tracking-wider text-ink-faint">Level</dt>
                  <dd className="font-semibold text-ink">{course.level}</dd>
                </div>
              </div>
              {course.duration_text && (
                <div className="flex items-center gap-3 py-4">
                  <CalendarClock className="size-5 text-gold-600" aria-hidden="true" />
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-ink-faint">Typical duration</dt>
                    <dd className="font-semibold text-ink">{course.duration_text}</dd>
                  </div>
                </div>
              )}
            </dl>
            <div className="space-y-2 p-6 pt-2">
              <Link href={`/free-trial?course=${course.id}`} className="btn btn-primary w-full">
                Start with a free trial
              </Link>
              <Link href="/pricing" className="btn btn-ghost w-full">
                Compare packages
              </Link>
            </div>
          </div>
        </aside>
      </div>

      {others.length > 0 && (
        <section className="border-t border-line bg-white/60 py-16">
          <div className="page-wrap">
            <h2 className="text-[1.9rem] text-mushaf-900">Other courses</h2>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {others.map((c) => (
                <CourseCard key={c.slug} course={c} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
