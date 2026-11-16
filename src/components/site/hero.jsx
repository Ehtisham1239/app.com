import { preload } from "react-dom";
import { NavigationLink as Link } from "@/components/site/navigation-link";
import { SEARCH_INTENTS } from "@/lib/search-intent";
import { ArrowRight, Check } from "@/components/site/icons";
// The portrait is beside the copy on desktop and follows it on narrow screens.
const HERO_SIZES = "(max-width: 471px) calc(100vw - 48px), (min-width: 768px) and (max-width: 1023px) calc(45vw - 61px), 424px";
const HERO_AVIF = "/brand/hero-320.avif 320w, /brand/hero.avif 440w";
const DEFAULT_HERO = {
  eyebrow: "Live 1-on-1 online Quran classes", title: "Empowering minds with online Quranic education",
  subtitle: "Live Quran lessons for children and adults. Choose your course and a time that suits your family.",
  primary_label: "Book a free trial", secondary_label: "Explore courses", badges: [],
};
export function HomeHero({ hero, stats }) {
  preload("/brand/hero.avif", {
    as: "image",
    type: "image/avif",
    imageSrcSet: HERO_AVIF,
    imageSizes: HERO_SIZES,
    media: "(min-width: 1024px)",
    fetchPriority: "high",
  });
  const h = { ...DEFAULT_HERO, ...(hero && typeof hero === "object" ? hero : {}) };
  const title = typeof h.title === "string" && h.title.trim() ? h.title : DEFAULT_HERO.title;
  const badges = (Array.isArray(h.badges) ? h.badges : []).filter(Boolean).slice(0, 4);
  const items = (Array.isArray(stats) ? stats : []).filter((s) => s?.value && s?.label).slice(0, 4);
  return (
    <section className="home-hero relative overflow-hidden" aria-labelledby="home-title">
      <div className="hero-glow hero-glow-one" aria-hidden="true" />
      <div className="hero-glow hero-glow-two" aria-hidden="true" />
      <div className="hero-layout page-wrap relative grid items-center gap-9 py-10 sm:py-14 md:grid-cols-[1.1fr_0.9fr] lg:gap-14 lg:py-16">
        <div className="hero-copy">
          <p className="hero-eyebrow inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-leaf-800">
            <span className="size-1.5 shrink-0 rotate-45 bg-gold-500" aria-hidden="true" />
            {h.eyebrow}
          </p>
          <h1 id="home-title" className="mt-3 max-w-2xl font-bold text-mushaf-900">{title.split(/(one-to-one)/i).map((part, i) => (
            i % 2 ? <span key={i} className="whitespace-nowrap">{part}</span> : part
          ))}</h1>
          {h.subtitle && <p className="hero-intro mt-5 max-w-xl text-[1.05rem] leading-relaxed text-ink-soft">{h.subtitle.length > 150 ? SEARCH_INTENTS["/"].intro : h.subtitle}</p>}
          <div className="hero-actions mt-6 grid gap-3 sm:flex sm:flex-wrap">
            <Link href="/free-trial" className="btn btn-primary btn-lg" data-oqc-cta="home_hero_primary">{h.primary_label || "Book a free trial"}<ArrowRight className="size-5" aria-hidden="true" /></Link>
            <Link href="/courses" className="btn btn-outline btn-lg">{h.secondary_label || "Explore courses"}</Link>
          </div>
          <ul className="hero-proof mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-soft" aria-label="Class features">
            <li className="flex items-center gap-2"><Check className="size-4 text-leaf-700" aria-hidden="true" />Flexible class times</li>
            <li className="flex items-center gap-2"><Check className="size-4 text-leaf-700" aria-hidden="true" />Teacher preference available</li>
          </ul>
          <p className="hero-areas mt-3 text-sm text-ink-soft"><Link href="/locations" className="inline-flex min-h-11 items-center gap-2 font-semibold text-leaf-800 underline underline-offset-4">Find classes in your time zone <ArrowRight className="size-4" aria-hidden="true" /></Link></p>
          <blockquote className="hero-verse mt-3 w-fit max-w-full border-s-2 border-gold-400 ps-4">
            <p lang="ar" dir="rtl" className="arabic text-left text-[1.7rem] text-mushaf-900 sm:text-[2rem]">اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ</p>
            <p className="text-sm leading-relaxed text-ink-soft">“Recite in the name of your Lord who created” <span className="font-semibold">— Qur’an 96:1</span></p>
          </blockquote>
        </div>

        <div className="hero-portrait relative mx-auto w-full max-w-[440px]">
          <picture data-hero-visual className="block overflow-hidden">
            <source type="image/avif" srcSet={HERO_AVIF} sizes={HERO_SIZES} />
            <img src="/brand/hero.webp" srcSet="/brand/hero-320.webp 320w, /brand/hero.webp 440w" alt="An adult and child learning Quran together during an online lesson" width={440} height={480} sizes={HERO_SIZES} loading="eager" decoding="async" className="aspect-[11/12] w-full object-cover" />
          </picture>
        </div>
      </div>

      {(badges.length > 0 || items.length > 0) && <div className="page-wrap relative pb-7 sm:pb-10">
        {badges.length > 0 && <ul className="hero-badges mb-5 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-ink-soft">
          {badges.map((badge) => <li className="flex items-center gap-2" key={badge}><Check className="size-4 text-leaf-700" strokeWidth={3} aria-hidden="true" />{badge}</li>)}
        </ul>}
        {items.length > 0 && <dl className="hero-stats grid grid-cols-2 sm:grid-cols-4">
          {items.map((item) => <div key={item.label} className="flex flex-col-reverse gap-1 px-3 py-4 text-center sm:py-5">
            <dt className="text-sm text-white/85">{item.label}</dt>
            <dd className="font-display text-[1.4rem] leading-tight text-white sm:text-2xl">{item.value}</dd>
          </div>)}
        </dl>}
      </div>}
    </section>
  );
}
