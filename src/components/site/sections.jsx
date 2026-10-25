import { cardTone, courseVisual } from "@/lib/card-presentation";
import { ContentImage } from "@/components/site/content-image";
import Link from "next/link";
import { clsx } from "clsx";
import { ArrowRight, MessageCircle, Plus, Quote, Star } from "@/components/site/icons";
import { ContentIcon } from "@/components/site/content-icon";
import { initials, truncate } from "@/lib/format";

// ---------------------------------------------------------------------------
// Benefits ("Why families choose us")
// ---------------------------------------------------------------------------
export function Benefits({ items }) {
  const list = (Array.isArray(items) ? items : []).filter((b) => b?.title);
  if (!list.length) return null;
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((b, i) => (
        <li
          key={`${b.title}-${i}`}
          data-card-tone={cardTone(b.title)}
          className="card-tinted group relative overflow-hidden rounded-[var(--radius-card)] border border-line bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-gold-300 hover:shadow-[var(--shadow-lift)]"
        >
          <span className="pointer-events-none absolute -right-10 -top-10 size-28 rounded-full bg-gold-50 transition-transform duration-500 group-hover:scale-125" aria-hidden="true" />
          <span className="relative flex size-12 items-center justify-center rounded-xl bg-mushaf-900 text-gold-300 ring-4 ring-gold-50 transition-colors duration-300 group-hover:bg-leaf-700">
            <ContentIcon name={b.icon} className="size-6" />
          </span>
          <h3 className="relative mt-5 text-[1.12rem] font-bold text-mushaf-900">{b.title}</h3>
          {b.text && <p className="relative mt-2 text-[0.97rem] leading-relaxed text-ink-soft">{b.text}</p>}
        </li>
      ))}
    </ul>
  );
}

// ---------------------------------------------------------------------------
// Courses
// ---------------------------------------------------------------------------
export function CourseCard({ course }) {
  const visual = courseVisual(course);
  return (
    <Link
      href={`/courses/${course.slug}`}
      data-card-tone={cardTone(course.slug)}
      className="course-card editorial-card card-tinted group flex h-full flex-col"
    >
      <div className="course-visual">
        <ContentImage src={visual.src} alt={visual.alt} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
        {course.level && <span className="card-label absolute left-3 top-3">{course.level}</span>}
      </div>
      <div className="course-body">
        <div className="course-caption"><span className="course-icon" aria-hidden="true"><ContentIcon name={course.icon} className="size-5" /></span>{course.arabic_title && <p lang="ar" dir="rtl" className="arabic text-xl text-leaf-700">{course.arabic_title}</p>}</div>
        <h3 className="course-title">{course.title}</h3>
        {course.summary && <p className="course-summary">{truncate(course.summary, 100)}</p>}
        {course.age_group && <p className="course-audience">{course.age_group}</p>}
      </div>
      <span className="card-action mx-6 mb-6">View course <span className="card-arrow"><ArrowRight className="size-4" aria-hidden="true" /></span></span>
    </Link>
  );
}

export function CoursesGrid({ courses }) {
  const list = Array.isArray(courses) ? courses : [];
  if (!list.length) {
    return <p className="surface p-10 text-center text-ink-soft">Our course list is being updated. Message us on WhatsApp to hear about current classes.</p>;
  }
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((c) => (
        <CourseCard key={c.id ?? c.slug} course={c} />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Call to action band
// ---------------------------------------------------------------------------
export function CtaBand({ title, text, whatsappHref, primaryHref = "/free-trial", primaryLabel = "Book a free trial" }) {
  return (
    <section className="page-wrap py-16 sm:py-20">
      <div className="relative overflow-hidden rounded-[2rem] bg-mushaf-900 px-7 py-14 text-white sm:px-14 sm:py-16">
        <div className="pattern-girih pointer-events-none absolute inset-0 opacity-[0.1]" aria-hidden="true" />
        <div className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-leaf-600/30 blur-3xl" aria-hidden="true" />
        <span className="brand-mark pointer-events-none absolute -bottom-10 -right-6 size-64 text-gold-400 opacity-[0.16] sm:size-80" aria-hidden="true" />
        <div className="relative max-w-2xl">
          <h2 className="text-[2.1rem] text-white sm:text-[2.7rem]">{title}</h2>
          {text && <p className="mt-4 text-[1.06rem] leading-relaxed text-white/75">{text}</p>}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={primaryHref} className="btn btn-gold btn-lg">
              {primaryLabel} <ArrowRight className="size-5" aria-hidden="true" />
            </Link>
            {whatsappHref && (
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn btn-outline-light btn-lg">
                <MessageCircle className="size-5" aria-hidden="true" /> WhatsApp us
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// FAQ accordion (native <details>, works without JavaScript)
// ---------------------------------------------------------------------------
export function FaqList({ faqs, defaultOpen = 0 }) {
  const list = Array.isArray(faqs) ? faqs : [];
  if (!list.length) return null;
  return (
    <div className="space-y-3">
      {list.map((f, i) => (
        <details key={f.id ?? i} className="faq-card group rounded-2xl border border-line bg-white open:border-leaf-200 open:bg-leaf-50/40" open={i === defaultOpen}>
          <summary className="faq-toggle">
            <span className="text-[1.02rem] font-semibold leading-snug text-mushaf-900">{f.question}</span>
            <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-leaf-50 text-leaf-700 ring-1 ring-leaf-100 transition-transform duration-200 group-open:rotate-45">
              <Plus className="size-4" aria-hidden="true" />
            </span>
          </summary>
          <div className="faq-answer">{f.answer}</div>
        </details>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Fees / packages
// ---------------------------------------------------------------------------
export { PricingCards } from "./pricing-cards";

// ---------------------------------------------------------------------------
// How it works
// ---------------------------------------------------------------------------
export function Steps({ steps, tone = "dark" }) {
  const list = (Array.isArray(steps) ? steps : []).filter((s) => s?.title);
  if (!list.length) return null;
  const dark = tone === "dark";
  return (
    <div className="relative">
      <div
        className={clsx(
          "pointer-events-none absolute left-[16%] right-[16%] top-7 hidden h-px bg-gradient-to-r from-transparent to-transparent md:block",
          dark ? "via-gold-400/50" : "via-gold-500/50",
        )}
        aria-hidden="true"
      />
      <ol className={clsx("relative grid gap-10 md:gap-8", list.length === 2 ? "md:grid-cols-2" : list.length >= 4 ? "md:grid-cols-4" : "md:grid-cols-3")}>
        {list.map((s, i) => (
          <li key={`${s.title}-${i}`} className="text-center">
            <span className="relative mx-auto flex size-14 items-center justify-center">
              <span className={clsx("absolute inset-1.5 rotate-45 rounded-lg border", dark ? "border-gold-400/70 bg-mushaf-900" : "border-gold-500/60 bg-white")} aria-hidden="true" />
              <span className={clsx("relative font-display text-[1.35rem]", dark ? "text-gold-300" : "text-gold-700")}>{i + 1}</span>
            </span>
            <h3 className={clsx("mt-6 text-[1.2rem] font-bold", dark ? "text-white" : "text-mushaf-900")}>{s.title}</h3>
            {s.text && <p className={clsx("mx-auto mt-2 max-w-xs text-[0.97rem] leading-relaxed", dark ? "text-white/70" : "text-ink-soft")}>{s.text}</p>}
          </li>
        ))}
      </ol>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Teachers
// ---------------------------------------------------------------------------
export function TeacherCard({ teacher: t }) {
  return (
    <Link
      href={`/teachers/${t.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-white transition-all duration-300 hover:-translate-y-1 hover:border-gold-300 hover:shadow-[var(--shadow-lift)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-mushaf-900">
        {t.photo_url ? (
          <img src={t.photo_url} alt={t.display_name} className="size-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
        ) : (
          <div className="pattern-girih flex size-full items-center justify-center">
            <span className="brand-mark block size-20 text-gold-400 opacity-80" aria-hidden="true" />
          </div>
        )}
        {t.gender && (
          <span className="absolute left-4 top-4 rounded-full bg-mushaf-950/80 px-2.5 py-0.5 text-[0.72rem] font-semibold text-gold-300 backdrop-blur">
            {t.gender === "female" ? "Female teacher" : "Male teacher"}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-[1.08rem] font-bold text-mushaf-900 transition-colors group-hover:text-leaf-700">{t.display_name}</h3>
        {t.headline && <p className="mt-1 text-[0.9rem] leading-snug text-ink-soft">{t.headline}</p>}
        <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
          {t.years_experience ? <span className="chip chip-gold">{t.years_experience}+ years</span> : null}
          {(t.languages ?? []).slice(0, 3).map((l) => (
            <span key={l} className="chip">
              {l}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Testimonials
// ---------------------------------------------------------------------------
export function Testimonials({ items }) {
  const list = Array.isArray(items) ? items : [];
  if (!list.length) return null;
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {list.map((t) => (
        <figure key={t.id ?? t.name} className="flex h-full flex-col rounded-[var(--radius-card)] border border-line bg-white p-7">
          <Quote className="size-8 text-gold-400" aria-hidden="true" />
          {t.rating ? (
            <p className="mt-4 flex gap-0.5 text-gold-500" aria-label={`Rated ${t.rating} out of 5`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={clsx("size-4", i < t.rating ? "fill-current" : "opacity-30")} aria-hidden="true" />
              ))}
            </p>
          ) : null}
          <blockquote className="mt-4 flex-1 text-[1rem] leading-relaxed text-ink">“{t.quote}”</blockquote>
          <figcaption className="mt-6 flex items-center gap-3 border-t border-line pt-5">
            {t.avatar_url ? (
              <img src={t.avatar_url} alt="" className="size-11 rounded-full object-cover" loading="lazy" />
            ) : (
              <span className="flex size-11 items-center justify-center rounded-full bg-mushaf-900 font-display text-gold-300">{initials(t.name)}</span>
            )}
            <span>
              <span className="block font-semibold text-mushaf-900">{t.name}</span>
              <span className="block text-[0.85rem] text-ink-faint">{[t.relation, t.country].filter(Boolean).join(" · ")}</span>
            </span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
