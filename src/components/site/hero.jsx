import Link from "next/link";
import { ArrowRight, Check, HeartHandshake, Sparkles } from "lucide-react";

const DEFAULT_HERO = {
  eyebrow: "Live 1-on-1 online Quran classes",
  title: "Empowering minds with online Quranic education",
  subtitle:
    "Professional one-to-one classes for children and adults in Noorani Qaida, Tajweed, Hifz, Arabic and Islamic studies — taught live by male and female teachers at times that suit your family.",
  primary_label: "Book a 7-day free trial",
  secondary_label: "Explore courses",
  badges: [],
};

export function HomeHero({ hero, stats }) {
  const h = { ...DEFAULT_HERO, ...(hero && typeof hero === "object" ? hero : {}) };
  const badges = (Array.isArray(h.badges) ? h.badges : []).filter(Boolean).slice(0, 4);
  const items = (Array.isArray(stats) ? stats : []).filter((s) => s?.value && s?.label).slice(0, 4);

  return (
    <section className="relative overflow-hidden bg-mushaf-950 text-white">
      <div className="pattern-girih pointer-events-none absolute inset-0 opacity-[0.07]" aria-hidden="true" />
      <div className="pointer-events-none absolute -left-48 top-24 size-[36rem] rounded-full bg-leaf-600/20 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-24 -top-40 size-[32rem] rounded-full bg-gold-500/10 blur-3xl" aria-hidden="true" />

      <div className="page-wrap relative grid items-center gap-12 pb-14 pt-14 sm:pt-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8 lg:pb-16 lg:pt-20">
        <div>
          {h.eyebrow && (
            <p className="inline-flex items-center gap-2.5 rounded-full border border-gold-400/30 bg-white/5 px-4 py-1.5 text-[0.8rem] font-semibold tracking-wide text-gold-300">
              <span className="size-1.5 rotate-45 bg-gold-400" aria-hidden="true" />
              {h.eyebrow}
            </p>
          )}
          <h1 className="mt-6 text-[2.6rem] leading-[1.05] text-white sm:text-[3.5rem] xl:text-[4rem]">{h.title}</h1>
          {h.subtitle && <p className="mt-6 max-w-xl text-[1.08rem] leading-relaxed text-white/75 sm:text-[1.15rem]">{h.subtitle}</p>}
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/free-trial" className="btn btn-gold btn-lg">
              {h.primary_label || "Book a free trial"} <ArrowRight className="size-5" aria-hidden="true" />
            </Link>
            <Link href="/courses" className="btn btn-outline-light btn-lg">
              {h.secondary_label || "Explore courses"}
            </Link>
          </div>
          {badges.length > 0 && (
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-[0.93rem] text-white/80">
              {badges.map((b) => (
                <li key={b} className="flex items-center gap-2">
                  <span className="flex size-5 items-center justify-center rounded-full bg-leaf-500/25 text-gold-300">
                    <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
                  </span>
                  {b}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="relative mx-auto w-full max-w-[27rem] overflow-hidden rounded-t-[14rem] rounded-b-3xl border-8 border-white shadow-xl"><img src="/brand/hero.webp" alt="Online Quran learning" width={440} height={480} className="aspect-[11/12] w-full object-cover" /></div>
      </div>

      {items.length > 0 && (
        <div className="page-wrap relative pb-14 sm:pb-16">
          <dl className="grid grid-cols-2 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm sm:grid-cols-4">
            {items.map((s, i) => (
              <div key={`${s.label}-${i}`} className={`px-5 py-5 text-center sm:py-6 ${i % 2 === 1 ? "border-l border-white/10" : ""} ${i >= 2 ? "border-t border-white/10 sm:border-t-0" : ""} ${i === 2 ? "sm:border-l" : ""}`}>
                <dt className="sr-only">{s.label}</dt>
                <dd>
                  <span className="block font-display text-[2rem] leading-none text-gold-300 sm:text-[2.3rem]">{s.value}</span>
                  <span className="mt-2 block text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-white/60">{s.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </section>
  );
}
