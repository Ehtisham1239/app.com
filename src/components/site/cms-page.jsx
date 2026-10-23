import { ContentImage } from "@/components/site/content-image";
import { PageHero } from "@/components/site/chrome";
import { CtaBand } from "@/components/site/sections";
import { PageSections } from "@/components/site/page-sections";
import { cleanHtml } from "@/lib/sanitize";
import { formatDate, slugify, whatsappLink } from "@/lib/format";
import { getCourses, getFaqs, getPlans, getSettings, getTeachers, getTestimonials } from "@/lib/site-data";

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

  return (
    <>
      {page.template !== "landing" && <PageHero eyebrow={isPolicy ? "Policy" : undefined} title={page.title} intro={page.excerpt} />}
      {html && (
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
            {page.cover_url && <ContentImage src={page.cover_url} alt={page.cover_alt} sizes="(max-width: 768px) 100vw, 768px" className={`mb-10 ${page.slug === "about" ? "aspect-[3/2]" : "aspect-[16/7]"} w-full rounded-[1.5rem] object-cover`} />}
            <div className="prose-oqc text-[1.04rem] [&_h2]:scroll-mt-28" dangerouslySetInnerHTML={{ __html: html }} />
            {isPolicy && page.updated_at && <p className="mt-10 text-sm text-ink-faint">Page updated {formatDate(page.updated_at)}</p>}
          </div>
        </div>
      )}
      <PageSections sections={sections} data={{ courses, plans, faqs, teachers, testimonials, whatsappHref: wa }} />
      {!isPolicy && !needs.has("cta") && (
        <CtaBand title="Learn the Quran with a teacher who cares" text="Book a free 7-day trial and meet your teacher this week." whatsappHref={wa} />
      )}
    </>
  );
}
