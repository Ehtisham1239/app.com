import { ContentImage } from "@/components/site/content-image";
import Link from "next/link";
import { ArrowRight, BookOpen, Heart, Compass, Users } from "@/components/site/icons";
import { PageHero } from "@/components/site/chrome";
import { CtaBand } from "@/components/site/sections";
import { PageSections } from "@/components/site/page-sections";
import { cleanHtml } from "@/lib/sanitize";
import { formatDate, slugify, whatsappLink } from "@/lib/format";
import { getCourses, getFaqs, getPlans, getSettings, getTeachers, getTestimonials } from "@/lib/site-data";
import { analyticsConfig, cookielessAnalyticsConfig } from "@/lib/analytics";

// Adds ids to <h2> headings so policies get a table of contents.
function withHeadingIds(html) {
  const toc = [];
  const out = html.replace(/<h2>([\s\S]*?)<\/h2>/g, (_, inner) => {
    const text = inner.replace(/<[^>]+>/g, "").trim();
    const id = slugify(text) || `section-${toc.length + 1}`;
    toc.push({ id, text });
    return `<h2 id="${id}">${inner}</h2>`;
  });
  return { html: out, toc };
}

export async function CmsPage({ page }) {
  const sections = page.page_sections ?? [];
  const needs = new Set(sections.map((s) => s.type));
  const [settings, courses, plans, faqs, teachers, testimonials] = await Promise.all([
    getSettings(),
    needs.has("courses") ? getCourses() : [],
    needs.has("pricing") ? getPlans() : [],
    needs.has("faq") ? getFaqs() : [],
    needs.has("teachers") ? getTeachers() : [],
    needs.has("testimonials") ? getTestimonials() : [],
  ]);
  const wa = whatsappLink(settings["site.contact"]?.whatsapp, "Assalamu alaikum, I have a question.");
  const { html, toc } = withHeadingIds(cleanHtml(page.body_html ?? ""));
  const isPolicy = page.template === "policy";
  const isAbout = page.slug === "about";
  const aboutParts = isAbout ? html.split(/(?=<h2\b)/) : [];
  const aboutLead = aboutParts[0]?.startsWith("<h2") ? "" : aboutParts.shift();
  const aboutIcons = [Compass, BookOpen, Heart, Users];

  return (
    <>
      {page.template !== "landing" && <PageHero path={`/${page.slug}`} eyebrow={isPolicy ? "Policy" : isAbout ? "Our college" : undefined} title={page.title} intro={page.excerpt} visual={page.cover_url ? <ContentImage src={page.cover_url} alt={page.cover_alt} priority sizes="(max-width: 1024px) 100vw, 600px" className="aspect-[3/2] w-full object-cover" /> : undefined}>{isAbout && <Link className="btn btn-gold mt-7" href="/courses">Explore our courses <ArrowRight className="size-4" aria-hidden="true" /></Link>}</PageHero>}
      {isAbout && html && <section className="page-wrap py-14 sm:py-20">{aboutLead && <div className="prose-oqc mb-10 max-w-3xl text-lg" dangerouslySetInnerHTML={{ __html: aboutLead }} />}<div className="grid items-start gap-6 md:grid-cols-2">{aboutParts.map((part, index) => { const Icon = aboutIcons[index % aboutIcons.length]; return <article className="editorial-card p-7 sm:p-8" key={index}><span className="mb-5 inline-flex size-12 items-center justify-center rounded-2xl bg-leaf-50 text-leaf-700"><Icon className="size-6" aria-hidden="true" /></span><div className="prose-oqc [&_h2]:mt-0 [&_h2]:text-2xl" dangerouslySetInnerHTML={{ __html: part }} /></article>; })}</div></section>}
      {html && !isAbout && (
        <div className={`page-wrap py-14 sm:py-16 ${isPolicy && toc.length > 2 ? "grid gap-12 lg:grid-cols-[15rem_1fr]" : ""}`}>
          {isPolicy && toc.length > 2 && (
            <nav className="hidden lg:sticky lg:top-24 lg:block lg:self-start" aria-label="On this page">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-700">On this page</p>
              <ul className="mt-4 space-y-1 border-l border-line">
                {toc.map((t) => (
                  <li key={t.id}>
                    <a href={`#${t.id}`} className="-ml-px block border-l-2 border-transparent py-1.5 pl-4 text-[0.92rem] text-ink-soft hover:border-gold-500 hover:text-mushaf-900">
                      {t.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
          <div className={isPolicy ? "" : "mx-auto max-w-3xl"}>
            {page.template === "landing" && page.cover_url && <ContentImage src={page.cover_url} alt={page.cover_alt} sizes="(max-width: 768px) 100vw, 768px" className={`mb-10 ${page.slug === "about" ? "aspect-[3/2]" : "aspect-[16/7]"} w-full rounded-[1.5rem] object-cover`} />}
            <div className="prose-oqc text-[1.04rem] [&_h2]:scroll-mt-28" dangerouslySetInnerHTML={{ __html: html }} />
            {page.slug === "privacy-policy" && <section id="optional-analytics" className="prose-oqc mt-10 scroll-mt-28 text-[1.04rem]"><h2>Website analytics</h2><p>{cookielessAnalyticsConfig(analyticsConfig(settings["site.analytics"])).enabled ? "This website uses Google Analytics 4 in a cookieless set-up: it does not place analytics cookies or store an identifier on your device, so there is no analytics banner to accept. Google Tag Manager may load alongside it to manage these tags under the same settings." : "Google Analytics is currently switched off on this website."}</p><p>When analytics is on, our integration sends public page paths, the page title, the referring page, the type of enquiry saved and a broad market label. It does not send names, email addresses, phone numbers, lesson notes, certificate numbers or URL query strings. Contact clicks (phone, email, WhatsApp) are counted separately from enquiries that were actually saved. Google signals, advertising storage and advertising personalisation are switched off. Google processes the data as described in its own privacy terms; IP addresses are not stored in Google Analytics 4.</p></section>}
            {isPolicy && page.updated_at && <p className="mt-10 text-sm text-ink-faint">Page updated {formatDate(page.updated_at)}</p>}
          </div>
        </div>
      )}
      <PageSections sections={sections} data={{ courses, plans, faqs, teachers, testimonials, whatsappHref: wa }} />
      {!isPolicy && !needs.has("cta") && (
        <CtaBand title="Learn the Quran with a teacher who cares" text="Book a free 3-day trial and meet your teacher this week." whatsappHref={wa} />
      )}
    </>
  );
}
