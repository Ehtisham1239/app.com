import Link from "next/link";
import { clsx } from "clsx";
import { ArrowRight, Check, MessageCircle, Plus, Quote, Star } from "lucide-react";
import { ContentIcon } from "@/components/icon";
import { formatMoney, initials, truncate } from "@/lib/format";

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
          className="group relative overflow-hidden rounded-[var(--radius-card)] border border-line bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-gold-300 hover:shadow-[var(--shadow-lift)]"
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
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-white transition-all duration-300 hover:-translate-y-1 hover:border-gold-300 hover:shadow-[var(--shadow-lift)]"
    >
      <div className="relative h-36 overflow-hidden bg-mushaf-900">
        {course.cover_url ? (
          <img src={course.cover_url} alt="" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
        ) : (
          <>
            <div className="pattern-girih absolute inset-0 opacity-[0.13]" aria-hidden="true" />
            <div className="absolute -bottom-12 -left-10 size-44 rounded-full bg-leaf-600/35 blur-2xl transition-transform duration-500 group-hover:scale-110" aria-hidden="true" />
          </>
        )}
        <span className="absolute left-5 top-5 flex size-12 items-center justify-center rounded-xl bg-white/10 text-gold-300 ring-1 ring-gold-400/40 backdrop-blur-sm">
          <ContentIcon name={course.icon} className="size-6" />
        </span>
        {course.is_featured && (
          <span className="absolute right-4 top-4 rounded-full bg-gold-500 px-2.5 py-0.5 text-[0.68rem] font-bold uppercase tracking-wider text-mushaf-950">Popular</span>
        )}
        {course.arabic_title && (
          <p lang="ar" dir="rtl" className="arabic absolute bottom-2 right-5 text-[1.9rem] leading-none text-gold-300/90">
            {course.arabic_title}
          </p>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-[1.18rem] font-bold leading-snug text-mushaf-900 transition-colors group-hover:text-leaf-700">{course.title}</h3>
        {course.summary && <p className="mt-2 flex-1 text-[0.95rem] leading-relaxed text-ink-soft">{truncate(course.summary, 150)}</p>}
        <div className="mt-5 flex flex-wrap gap-2">
          {course.age_group && <span className="chip">{course.age_group}</span>}
          {course.level && <span className="chip chip-gold">{course.level}</span>}
        </div>
        <span className="mt-5 inline-flex items-center gap-1.5 text-[0.93rem] font-semibold text-leaf-700">
          View course <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </span>
      </div>
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
    <div className="divide-y divide-line overflow-hidden rounded-[var(--radius-card)] border border-line bg-white">
      {list.map((f, i) => (
        <details key={f.id ?? i} className="group" open={i === defaultOpen}>
          <summary className="flex cursor-pointer list-none items-start justify-between gap-6 px-6 py-5 text-left transition-colors hover:bg-paper/70 [&::-webkit-details-marker]:hidden">
            <span className="text-[1.02rem] font-semibold leading-snug text-mushaf-900">{f.question}</span>
            <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-gold-50 text-gold-700 ring-1 ring-gold-100 transition-transform duration-200 group-open:rotate-45">
              <Plus className="size-4" aria-hidden="true" />
            </span>
          </summary>
          <div className="-mt-1 whitespace-pre-line px-6 pb-6 text-[0.98rem] leading-relaxed text-ink-soft">{f.answer}</div>
        </details>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Fees / packages
// ---------------------------------------------------------------------------
const PERIOD = { monthly: "/ month", quarterly: "/ quarter", yearly: "/ year", one_time: "one-time" };

function mainPrice(prices, currency) {
  const list = Array.isArray(prices) ? prices : [];
  if (currency) return list.find((p) => p.currency === currency) ?? null;
  return list.find((p) => p.currency === "USD") ?? list[0] ?? null;
}

export function PricingCards({ plans, compact = false, currency }) {
  const list = Array.isArray(plans) ? plans : [];
  if (!list.length) return null;
  const cols = list.length >= 4 ? "lg:grid-cols-4" : list.length === 3 ? "lg:grid-cols-3" : "lg:mx-auto lg:max-w-4xl lg:grid-cols-2";
  return (
    <div className={clsx("grid gap-5 pt-3 sm:grid-cols-2", cols)}>
      {list.map((p) => {
        const price = mainPrice(p.prices, currency);
        const others = currency ? [] : (p.prices ?? []).filter((x) => x !== price);
        const features = (Array.isArray(p.features) ? p.features : []).slice(0, compact ? 4 : 12);
        const featured = Boolean(p.is_featured);
        return (
          <div
            key={p.id}
            className={clsx(
              "relative flex flex-col rounded-[var(--radius-card)] border bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]",
              featured ? "border-gold-400 shadow-[var(--shadow-lift)] ring-1 ring-gold-300" : "border-line",
            )}
          >
            {featured && (
              <span className="absolute -top-3 left-6 rounded-full bg-gold-500 px-3 py-1 text-[0.7rem] font-bold uppercase tracking-wider text-mushaf-950">Most popular</span>
            )}
            <h3 className="text-[1.15rem] font-bold text-mushaf-900">{p.name}</h3>
            {p.tagline && <p className="mt-1 text-[0.9rem] leading-snug text-ink-soft">{p.tagline}</p>}
            <p className="mt-5 flex flex-wrap items-baseline gap-x-1.5">
              {price ? (
                <>
                  <span className="font-display text-[2.6rem] leading-none text-mushaf-900">{formatMoney(price.amount_minor, price.currency)}</span>
                  <span className="text-[0.9rem] text-ink-faint">{PERIOD[p.billing_period] ?? ""}</span>
                </>
              ) : (
                <span className="font-display text-[1.6rem] text-mushaf-900">{currency ? `Ask for the fee in ${currency}` : "Ask for the fee"}</span>
              )}
            </p>
            {others.length > 0 && <p className="mt-1.5 text-[0.8rem] text-ink-faint">or {others.map((o) => formatMoney(o.amount_minor, o.currency)).join(" · ")}</p>}
            <p className="mt-4 flex flex-wrap gap-2">
              {p.classes_per_week ? (
                <span className="chip">
                  {p.classes_per_week} {p.classes_per_week === 1 ? "day" : "days"} a week
                </span>
              ) : null}
              {p.duration_min ? <span className="chip chip-gold">{p.duration_min}-minute classes</span> : null}
            </p>
            {features.length > 0 ? (
              <ul className="mt-5 flex-1 space-y-2.5 text-[0.93rem] text-ink">
                {features.map((f) => (
                  <li key={f} className="flex gap-2.5">
                    <Check className="mt-0.5 size-4 shrink-0 text-leaf-600" strokeWidth={3} aria-hidden="true" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex-1" />
            )}
            <Link href={`/free-trial?plan=${p.id}`} className={clsx("btn mt-6 w-full", featured ? "btn-gold" : "btn-primary")}>
              Start with a free trial
            </Link>
          </div>
        );
      })}
    </div>
  );
}

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
