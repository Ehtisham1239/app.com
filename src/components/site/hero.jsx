import { NavigationLink as Link } from "@/components/site/navigation-link";
import { preload } from "react-dom";
import { SEARCH_INTENTS } from "@/lib/search-intent";
import { ArrowRight, Check } from "@/components/site/icons";
// AVIF is half the size of the WebP fallback. React does not preload images
// inside <picture>, so the AVIF set is preloaded explicitly; browsers without
// AVIF ignore a typed preload and fetch the WebP from <img>.
const HERO_SIZES = "(max-width: 639px) 90vw, 440px"; // matches the native 440px source; never upscale a small asset on wide screens
const DEFAULT_HERO = {
  eyebrow: "Live 1-on-1 online Quran classes", title: "Empowering minds with online Quranic education",
  subtitle: "Live Quran lessons for children and adults. Choose your course and a time that suits your family.",
  primary_label: "Book a free trial", secondary_label: "Explore courses", badges: [],
};
export function HomeHero({ hero, stats }) {
  preload("/brand/hero.avif", { as: "image", type: "image/avif", imageSrcSet: "/brand/hero-320.avif 320w, /brand/hero.avif 440w", imageSizes: HERO_SIZES, fetchPriority: "high" });
  const h = { ...DEFAULT_HERO, ...(hero && typeof hero === "object" ? hero : {}) };
  const badges = (Array.isArray(h.badges) ? h.badges : []).filter(Boolean).slice(0, 4);
  const items = (Array.isArray(stats) ? stats : []).filter((s) => s?.value && s?.label).slice(0, 4);
  return <section className="home-hero relative overflow-hidden bg-[radial-gradient(ellipse_at_85%_15%,#eefaf3_0%,#fff_65%)]">
    <div className="hero-glow hero-glow-one" aria-hidden="true" /><div className="hero-glow hero-glow-two" aria-hidden="true" />
    <div className="hero-layout relative page-wrap grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14 lg:py-24"><div className="hero-copy">
      <p className="hero-eyebrow inline-flex items-center gap-2 rounded-full border border-leaf-100 bg-white/90 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-leaf-800 shadow-sm"><span className="size-2 rounded-full bg-leaf-500" aria-hidden="true" />{h.eyebrow}</p>
      <p lang="ar" dir="rtl" className="arabic mt-5 text-left text-[1.8rem] text-mushaf-900 sm:text-[2.4rem]">اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ</p>
      <p lang="en" className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">“Recite in the name of your Lord who created” <span className="font-semibold">— Qur’an 96:1</span></p>
      <h1 className="mt-4 max-w-2xl text-[2.25rem] font-bold leading-[1.15] text-mushaf-900 sm:text-[3rem]">{h.title}</h1>
      {h.subtitle && <p className="hero-intro mt-6 max-w-xl text-[1.05rem] leading-relaxed text-ink-soft">{h.subtitle.length > 150 ? SEARCH_INTENTS["/"].intro : h.subtitle}</p>}

      <div className="hero-actions mt-8 grid gap-3 sm:flex sm:flex-wrap"><Link href="/free-trial" className="btn btn-primary btn-lg" data-oqc-cta="home_hero_primary">{h.primary_label || "Book a free trial"}<ArrowRight className="size-5" aria-hidden="true" /></Link><Link href="/courses" className="btn btn-outline btn-lg">{h.secondary_label || "Explore courses"}</Link></div>
      <div className="hero-trial-note mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
        <span className="chip chip-gold">3-day free trial</span>
        <span className="text-ink-soft">No card on eligible packages</span>
      </div>
      <ul className="hero-proof mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-soft" aria-label="Class features">
        <li className="flex items-center gap-2"><Check className="size-4 shrink-0 text-leaf-600" aria-hidden="true" />One-to-one live lessons</li>
        <li className="flex items-center gap-2"><Check className="size-4 shrink-0 text-leaf-600" aria-hidden="true" />Flexible class times</li>
        <li className="flex items-center gap-2"><Check className="size-4 shrink-0 text-leaf-600" aria-hidden="true" />Teacher preference available</li>
      </ul>
      <p className="hero-areas mt-5 text-sm text-ink-soft">Live lessons worldwide · <Link href="/locations" className="font-semibold text-leaf-700 underline underline-offset-4">Find your country</Link></p>

    </div><div className="hero-portrait relative mx-auto w-full max-w-[440px] overflow-hidden rounded-[2rem] border-[8px] border-white bg-leaf-50 shadow-[var(--shadow-lift)]"><div aria-hidden="true" className="pointer-events-none absolute right-3 top-3 rounded-2xl bg-white p-1.5 shadow-sm ring-1 ring-leaf-100"><img src="/brand/mark-v2-64.png" alt="" width={64} height={64} className="size-10 sm:size-12" /></div><picture data-hero-visual className="block"><source type="image/avif" srcSet="/brand/hero-320.avif 320w, /brand/hero.avif 440w" sizes={HERO_SIZES} /><img src="/brand/hero.webp" srcSet="/brand/hero-320.webp 320w, /brand/hero.webp 440w" alt="Digital Quran learning illustration from Online Quran College" width={440} height={480} sizes={HERO_SIZES} loading="eager" fetchPriority="high" decoding="async" className="aspect-[11/12] w-full object-cover" /></picture></div></div>
    <div className="page-wrap">{badges.length > 0 && <ul className="hero-badges mb-8 justify-center flex flex-wrap gap-x-5 gap-y-3 text-sm text-ink-soft">{badges.map((badge) => <li className="flex items-center gap-2" key={badge}><Check className="size-4 shrink-0 text-leaf-500" strokeWidth={3} />{badge}</li>)}</ul>}</div>
    {items.length > 0 && <div className="page-wrap pb-12"><dl className="grid grid-cols-2 overflow-hidden rounded-2xl bg-mushaf-900 text-white sm:grid-cols-4">{items.map((item) => <div key={item.label} className="border border-white/10 px-4 py-6 text-center"><dt className="text-sm text-white/85">{item.label}</dt><dd className="mt-2 font-display text-3xl font-bold text-white">{item.value}</dd></div>)}</dl></div>}
  </section>;
}
