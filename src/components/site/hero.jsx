import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
const DEFAULT_HERO = {
  eyebrow: "Live 1-on-1 online Quran classes", title: "Empowering minds with online Quranic education",
  subtitle: "Professional one-to-one classes for children and adults in Noorani Qaida, Tajweed, Hifz, Arabic and Islamic studies — taught live by male and female teachers at times that suit your family.",
  primary_label: "Book a free trial", secondary_label: "Explore courses", badges: [],
};
export function HomeHero({ hero, stats }) {
  const h = { ...DEFAULT_HERO, ...(hero && typeof hero === "object" ? hero : {}) };
  const badges = (Array.isArray(h.badges) ? h.badges : []).filter(Boolean).slice(0, 4);
  const items = (Array.isArray(stats) ? stats : []).filter((s) => s?.value && s?.label).slice(0, 4);
  return <section className="home-hero relative overflow-hidden bg-[radial-gradient(ellipse_at_85%_15%,#eefaf3_0%,#fff_65%)]">
    <div className="hero-glow hero-glow-one" aria-hidden="true" /><div className="hero-glow hero-glow-two" aria-hidden="true" />
    <div className="hero-layout relative page-wrap grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14 lg:py-24"><div className="hero-copy">
      <p lang="ar" dir="rtl" className="arabic text-left text-[1.8rem] text-mushaf-900 sm:text-[2.4rem]">اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ</p>
      <h1 className="mt-4 max-w-2xl text-[2.25rem] font-bold leading-[1.15] text-mushaf-900 sm:text-[3rem]">{h.title}</h1>
      {h.subtitle && <p className="hero-intro mt-6 max-w-xl text-[1.05rem] leading-relaxed text-ink-soft">{h.subtitle}</p>}

      <div className="hero-actions mt-8 flex flex-wrap gap-3"><Link href="/free-trial" className="btn btn-primary btn-lg">{h.primary_label || "Book a free trial"}<ArrowRight className="size-5" /></Link><Link href="/courses" className="btn btn-outline btn-lg">{h.secondary_label || "Explore courses"}</Link></div>
      <p className="hero-areas mt-5 text-sm text-ink-soft"><strong className="text-leaf-700">Global service areas:</strong>{" "}{[["UK", "united-kingdom"], ["USA", "united-states"], ["Australia", "australia"], ["Canada", "canada"], ["France", "france"], ["Germany", "germany"], ["Ireland", "ireland"], ["Norway", "norway"]].map(([label, slug], i) => <span key={slug}>{i > 0 && ", "}<Link className="underline underline-offset-2" href={`/locations/${slug}`}>{label}</Link></span>)}</p>
      {badges.length > 0 && <ul className="hero-badges mt-7 flex flex-wrap gap-x-5 gap-y-3 text-sm text-ink-soft">{badges.map((badge) => <li className="flex items-center gap-2" key={badge}><Check className="size-4 shrink-0 text-leaf-500" strokeWidth={3} />{badge}</li>)}</ul>}
    </div><div className="hero-portrait mx-auto w-full max-w-[27.5rem] overflow-hidden rounded-t-[14rem] rounded-b-[1.875rem] border-[10px] border-white bg-leaf-50 shadow-[var(--shadow-lift)]"><img src="/brand/hero.webp" alt="A teacher helping a child learn Quran online" srcSet="/brand/hero-320.webp 320w, /brand/hero.webp 440w" sizes="(max-width: 639px) 64vw, 440px" width={440} height={480} decoding="async" className="aspect-[11/12] w-full object-cover object-top" fetchPriority="high" /></div></div>
    {items.length > 0 && <div className="page-wrap pb-12"><dl className="grid grid-cols-2 overflow-hidden rounded-2xl bg-mushaf-900 text-white sm:grid-cols-4">{items.map((item) => <div key={item.label} className="border border-white/10 px-4 py-6 text-center"><dt className="text-sm text-white/85">{item.label}</dt><dd className="mt-2 font-display text-3xl font-bold text-white">{item.value}</dd></div>)}</dl></div>}
  </section>;
}
