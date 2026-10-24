import Link from "next/link";
import { ArrowRight } from "@/components/site/icons";
import { SectionHeading } from "@/components/site/chrome";
import { Benefits, CoursesGrid, CtaBand, FaqList, PricingCards, Steps, TeacherCard, Testimonials } from "@/components/site/sections";
import { cleanHtml } from "@/lib/sanitize";

// Optional building blocks for CMS pages (table page_sections). Each block keeps its settings in `data`:
//   hero         { eyebrow, title, text, button_label, button_href, image_url, image_alt }
//   rich_text    { title, html }
//   features     { eyebrow, title, intro, items: [{ icon, title, text }] }
//   steps        { eyebrow, title, intro, items: [{ title, text }] }
//   stats        { items: [{ value, label }] }
//   courses      { eyebrow, title, intro, limit }
//   pricing      { eyebrow, title, intro }
//   teachers     { eyebrow, title, intro, limit }
//   testimonials { eyebrow, title, intro, limit }
//   faq          { eyebrow, title, intro, category }
//   cta          { title, text, button_label, button_href }
//   image_text   { eyebrow, title, html, image_url, image_alt, reverse, button_label, button_href }

function Heading({ d, tone, align }) {
  if (!d.title) return null;
  return <SectionHeading eyebrow={d.eyebrow} title={d.title} intro={d.intro} tone={tone} align={align} />;
}

function limit(list, n) {
  const arr = Array.isArray(list) ? list : [];
  const max = Number(n);
  return max > 0 ? arr.slice(0, max) : arr;
}

function Block({ section, data }) {
  const d = section.data && typeof section.data === "object" ? section.data : {};
  switch (section.type) {
    case "hero":
      return (
        <section className="relative overflow-hidden bg-mushaf-950 text-white">
          <div className="pattern-girih pointer-events-none absolute inset-0 opacity-[0.08]" aria-hidden="true" />
          <div className="page-wrap relative grid items-center gap-10 py-16 sm:py-24 lg:grid-cols-2">
            <div>
              {d.eyebrow && <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold-300">{d.eyebrow}</p>}
              {d.title && <h1 className="mt-3 text-[2.5rem] text-white sm:text-[3.4rem]">{d.title}</h1>}
              {d.text && <p className="mt-5 max-w-xl text-[1.08rem] leading-relaxed text-white/75">{d.text}</p>}
              <div className="mt-8">
                <Link href={d.button_href || "/free-trial"} className="btn btn-gold btn-lg">
                  {d.button_label || "Book a free trial"} <ArrowRight className="size-5" aria-hidden="true" />
                </Link>
              </div>
            </div>
            {d.image_url && <img src={d.image_url} alt={d.image_alt || ""} className="aspect-[4/3] w-full rounded-[1.5rem] object-cover ring-4 ring-gold-400/30" />}
          </div>
        </section>
      );

    case "rich_text": {
      const html = cleanHtml(d.html ?? "");
      if (!html && !d.title) return null;
      return (
        <section className="page-wrap py-14 sm:py-16">
          <div className="mx-auto max-w-3xl">
            {d.title && <h2 className="mb-6 text-[2rem] text-mushaf-900">{d.title}</h2>}
            <div className="prose-oqc text-[1.04rem]" dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        </section>
      );
    }

    case "features":
      return (
        <section className="border-y border-line bg-white/60 py-16 sm:py-20">
          <div className="page-wrap">
            <Heading d={d} />
            <div className={d.title ? "mt-12" : ""}>
              <Benefits items={d.items} />
            </div>
          </div>
        </section>
      );

    case "steps":
      return (
        <section className="relative overflow-hidden bg-mushaf-950 py-16 sm:py-20">
          <div className="pattern-girih pointer-events-none absolute inset-0 opacity-[0.07]" aria-hidden="true" />
          <div className="page-wrap relative">
            <Heading d={d} tone="dark" />
            <div className={d.title ? "mt-14" : ""}>
              <Steps steps={d.items} />
            </div>
          </div>
        </section>
      );

    case "stats": {
      const items = (Array.isArray(d.items) ? d.items : []).filter((s) => s?.value);
      if (!items.length) return null;
      return (
        <section className="page-wrap py-12">
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {items.slice(0, 8).map((s, i) => (
              <div key={`${s.label}-${i}`} className="rounded-[var(--radius-card)] border border-line bg-white px-5 py-6 text-center">
                <dt className="sr-only">{s.label}</dt>
                <dd>
                  <span className="block font-display text-[2.2rem] leading-none text-mushaf-900">{s.value}</span>
                  <span className="mt-2 block text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-ink-faint">{s.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </section>
      );
    }

    case "courses":
      return (
        <section className="page-wrap py-16 sm:py-20">
          <Heading d={d} />
          <div className={d.title ? "mt-12" : ""}>
            <CoursesGrid courses={limit(data.courses, d.limit)} />
          </div>
        </section>
      );

    case "pricing":
      if (!data.plans?.length) return null;
      return (
        <section className="page-wrap py-16 sm:py-20">
          <Heading d={d} />
          <div className={d.title ? "mt-12" : ""}>
            <PricingCards plans={data.plans} />
          </div>
        </section>
      );

    case "teachers": {
      const teachers = limit(data.teachers, d.limit);
      if (!teachers.length) return null;
      return (
        <section className="border-t border-line bg-white/60 py-16 sm:py-20">
          <div className="page-wrap">
            <Heading d={d} />
            <div className={`grid gap-5 sm:grid-cols-2 lg:grid-cols-4 ${d.title ? "mt-12" : ""}`}>
              {teachers.map((t) => (
                <TeacherCard key={t.id} teacher={t} />
              ))}
            </div>
          </div>
        </section>
      );
    }

    case "testimonials": {
      const items = limit(data.testimonials, d.limit || 6);
      if (!items.length) return null;
      return (
        <section className="page-wrap py-16 sm:py-20">
          <Heading d={d} />
          <div className={d.title ? "mt-12" : ""}>
            <Testimonials items={items} />
          </div>
        </section>
      );
    }

    case "faq": {
      const all = Array.isArray(data.faqs) ? data.faqs : [];
      const faqs = d.category ? all.filter((f) => (f.category || "").toLowerCase() === String(d.category).toLowerCase()) : all;
      if (!faqs.length) return null;
      return (
        <section className="page-wrap py-16 sm:py-20">
          <Heading d={d} />
          <div className={`mx-auto max-w-3xl ${d.title ? "mt-10" : ""}`}>
            <FaqList faqs={faqs} defaultOpen={-1} />
          </div>
        </section>
      );
    }

    case "cta":
      return (
        <CtaBand
          title={d.title || "Begin your Quran journey this week"}
          text={d.text}
          whatsappHref={data.whatsappHref}
          primaryHref={d.button_href || "/free-trial"}
          primaryLabel={d.button_label || "Book a free trial"}
        />
      );

    case "image_text": {
      const html = cleanHtml(d.html ?? "");
      return (
        <section className="page-wrap py-16 sm:py-20">
          <div className={`grid items-center gap-10 lg:grid-cols-2 ${d.reverse ? "lg:[&>*:first-child]:order-2" : ""}`}>
            {d.image_url ? (
              <img src={d.image_url} alt={d.image_alt || ""} className="aspect-[4/3] w-full rounded-[1.5rem] object-cover" loading="lazy" />
            ) : (
              <div className="pattern-girih flex aspect-[4/3] items-center justify-center rounded-[1.5rem] bg-mushaf-900">
                <span className="brand-mark block size-28 text-gold-400 opacity-80" aria-hidden="true" />
              </div>
            )}
            <div>
              {d.eyebrow && <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold-700">{d.eyebrow}</p>}
              {d.title && <h2 className="mt-3 text-[2rem] text-mushaf-900 sm:text-[2.4rem]">{d.title}</h2>}
              {html && <div className="prose-oqc mt-5 text-[1.02rem]" dangerouslySetInnerHTML={{ __html: html }} />}
              {d.button_href && (
                <Link href={d.button_href} className="btn btn-primary mt-6">
                  {d.button_label || "Learn more"} <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              )}
            </div>
          </div>
        </section>
      );
    }

    default:
      return null;
  }
}

export function PageSections({ sections, data = {} }) {
  const list = (Array.isArray(sections) ? sections : [])
    .filter((s) => s && s.is_visible !== false)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  if (!list.length) return null;
  return (
    <>
      {list.map((s, i) => (
        <Block key={s.id ?? i} section={s} data={data} />
      ))}
    </>
  );
}
