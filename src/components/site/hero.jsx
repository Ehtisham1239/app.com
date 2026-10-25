import Link from "next/link";
import { SEARCH_INTENTS } from "@/lib/search-intent";
import { ArrowRight, Check } from "@/components/site/icons";
const DEFAULT_HERO = {
  eyebrow: "Live 1-on-1 online Quran classes", title: "Empowering minds with online Quranic education",
  subtitle: "Live Quran lessons for children and adults. Choose your course and a time that suits your family.",
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
      {h.subtitle && <p className="hero-intro mt-6 max-w-xl text-[1.05rem] leading-relaxed text-ink-soft">{h.subtitle.length > 150 ? SEARCH_INTENTS["/"].intro : h.subtitle}</p>}

      <div className="hero-actions mt-8 flex flex-wrap gap-3"><Link href="/free-trial" className="btn btn-primary btn-lg">{h.primary_label || "Book a free trial"}<ArrowRight className="size-5" /></Link><Link href="/courses" className="btn btn-outline btn-lg">{h.secondary_label || "Explore courses"}</Link></div>
      <p className="hero-areas mt-5 text-sm text-ink-soft">Live lessons worldwide · <Link href="/locations" className="font-semibold text-leaf-700 underline">Find your country</Link></p>

    </div><div data-hero-visual className="hero-portrait mx-auto w-full overflow-hidden rounded-[2rem] border-[8px] border-white bg-leaf-50 shadow-[var(--shadow-lift)]"><img src="/brand/hero.webp" srcSet="/brand/hero-320.webp 320w, /brand/hero.webp 440w" alt="Digital Quran learning illustration from Online Quran College" width={440} height={480} sizes="(max-width: 639px) 90vw, 440px" loading="eager" fetchPriority="high" decoding="async" className="aspect-[11/12] w-full object-cover" /></div></div>
    <div className="page-wrap">{badges.length > 0 && <ul className="hero-badges mb-8 justify-center flex flex-wrap gap-x-5 gap-y-3 text-sm text-ink-soft">{badges.map((badge) => <li className="flex items-center gap-2" key={badge}><Check className="size-4 shrink-0 text-leaf-500" strokeWidth={3} />{badge}</li>)}</ul>}</div>
    {items.length > 0 && <div className="page-wrap pb-12"><dl className="grid grid-cols-2 overflow-hidden rounded-2xl bg-mushaf-900 text-white sm:grid-cols-4">{items.map((item) => <div key={item.label} className="border border-white/10 px-4 py-6 text-center"><dt className="text-sm text-white/85">{item.label}</dt><dd className="mt-2 font-display text-3xl font-bold text-white">{item.value}</dd></div>)}</dl></div>}
  </section>;
}
