import { NavigationLink as Link } from "@/components/site/navigation-link";
import { ArrowRight, Clock, Globe2, Users, Video } from "@/components/site/icons";
import { ContentImage } from "./content-image";
import { heroArt } from "@/lib/hero-art";
import { safeJsonLd } from "@/lib/seo";
import { SITE_URL } from "@/lib/config";

export function TopBar({ announcement }) {
  if (!announcement?.enabled || !announcement?.text) return null;
  return (
    <div className="site-announcement relative z-50 bg-mushaf-900 text-[0.85rem] text-white">
      <div className="page-wrap flex min-h-9 items-center justify-center gap-3 py-1.5 text-center">
        <span className="hidden size-1.5 rotate-45 bg-gold-400 sm:inline-block" aria-hidden="true" />
        <span className="text-white/85">{announcement.text}</span>
        {announcement.link && (
          <Link href={announcement.link} className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap font-semibold text-leaf-200 hover:text-gold-100">
            {announcement.link_label || "Learn more"}
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        )}
      </div>
    </div>
  );
}

// Section heading with the gold diamond rule used across the site.
export function SectionHeading({ eyebrow, title, intro, align = "center", tone = "light", className = "" }) {
  const centered = align === "center";
  const dark = tone === "dark";
  return (
    <div className={`${centered ? "mx-auto text-center" : ""} max-w-2xl ${className}`}>
      {eyebrow && (
        <p className={`flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] ${centered ? "justify-center" : ""} ${dark ? "text-leaf-200" : "text-leaf-700"}`}>
          <span className={`h-px w-8 ${dark ? "bg-gold-400/60" : "bg-gold-500/60"}`} aria-hidden="true" />
          {eyebrow}
          <span className={`h-px w-8 ${dark ? "bg-gold-400/60" : "bg-gold-500/60"}`} aria-hidden="true" />
        </p>
      )}
      <h2 className={`mt-4 text-[2.1rem] sm:text-[2.6rem] ${dark ? "text-white" : "text-mushaf-900"}`}>{title}</h2>
      {intro && <p className={`mt-4 text-[1.05rem] leading-relaxed ${dark ? "text-white/75" : "text-ink-soft"}`}>{intro}</p>}
    </div>
  );
}

// Page banner for inner pages
const IMMERSIVE_FEATURES = [
  { Icon: Video, label: "Live one-to-one classes" },
  { Icon: Globe2, label: "Learn from anywhere" },
  { Icon: Clock, label: "Flexible class times" },
  { Icon: Users, label: "Children and adults" },
];

// Full-bleed banner: the scene fills the right side and fades into the brand green.
function ImmersiveHero({ eyebrow, title, titleAccent, intro, children, arabic, image, features, jsonLd }) {
  const lead = titleAccent && title.endsWith(titleAccent) ? title.slice(0, -titleAccent.length).trimEnd() : title;
  const backdrop = image.immersive;
  return (
    <section className="inner-hero hero-immersive relative overflow-hidden bg-mushaf-900 text-white">
      {jsonLd}
      {backdrop ? <picture data-hero-visual className="hero-immersive-media">
        <source type="image/avif" srcSet={backdrop.avif.map(v => `${v.url} ${v.width}w`).join(", ")} sizes="(max-width: 1024px) 100vw, 70vw" />
        <img src={backdrop.src} srcSet={backdrop.webp.map(v => `${v.url} ${v.width}w`).join(", ")} sizes="(max-width: 1024px) 100vw, 70vw" width={backdrop.width} height={backdrop.height} alt={backdrop.alt} loading="eager" fetchPriority="high" decoding="async" />
      </picture> : <div data-hero-visual className="hero-immersive-media"><ContentImage src={image.src} alt={image.alt} priority sizes="(max-width: 1024px) 100vw, 70vw" /></div>}
      <div className="hero-immersive-shade" aria-hidden="true" />
      <div className="pattern-girih pointer-events-none absolute inset-0 opacity-[0.06]" aria-hidden="true" />
      <div className="page-wrap relative py-9 sm:py-14 lg:py-20">
        <div className="hero-immersive-copy max-w-[36rem]">
          {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.24em] text-gold-300">{eyebrow}</p>}
          <h1 className="mt-3 text-[clamp(2.1rem,5vw,3.5rem)] leading-[1.08] text-white">
            {lead}{titleAccent && lead !== title && <><br /><span className="text-gold-300">{titleAccent}</span></>}
          </h1>
          {arabic && <p lang="ar" dir="rtl" className="arabic mt-4 text-[2rem] text-gold-300">{arabic}</p>}
          {intro && <p className="mt-5 max-w-xl text-[1.08rem] leading-relaxed text-white/85">{intro}</p>}
          {children}
          {features !== false && <ul className="hero-immersive-features mt-8 grid grid-cols-2 gap-x-5 gap-y-5 sm:grid-cols-4" aria-label="How classes work">
            {IMMERSIVE_FEATURES.map(({ Icon, label }) => (
              <li key={label} className="flex flex-col gap-2 text-[0.9rem] font-medium leading-snug text-white/90">
                <Icon className="size-7 text-gold-300" strokeWidth={1.6} />{label}
              </li>
            ))}
          </ul>}
        </div>
      </div>
    </section>
  );
}

export function PageHero({ eyebrow, title, titleAccent, intro, children, arabic, visual, path, art, imageOverride, immersive = false, features }) {
  const image = imageOverride || heroArt(art || path || title);
  if (immersive) {
    const jsonLd = path && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd({ "@context": "https://schema.org", "@type": "WebPage", "@id": `${SITE_URL}${path}#webpage`, url: `${SITE_URL}${path}`, name: title, description: intro, isPartOf: { "@id": `${SITE_URL}/#website` }, about: { "@id": `${SITE_URL}/#organization` }, inLanguage: "en-GB" }) }} />;
    return <ImmersiveHero {...{ eyebrow, title, titleAccent, intro, children, arabic, image, features, jsonLd }} />;
  }
  return (
    <section className="inner-hero relative overflow-hidden bg-mushaf-900 text-white">
      {path && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd({ "@context": "https://schema.org", "@type": "WebPage", "@id": `${SITE_URL}${path}#webpage`, url: `${SITE_URL}${path}`, name: title, description: intro, isPartOf: { "@id": `${SITE_URL}/#website` }, about: { "@id": `${SITE_URL}/#organization` }, inLanguage: "en-GB" }) }} />}
      <div className="pattern-girih pointer-events-none absolute inset-0 opacity-[0.09]" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-24 -top-24 size-[26rem] rounded-full bg-leaf-600/25 blur-3xl" aria-hidden="true" />
      <div className="page-wrap inner-hero-layout relative grid items-center gap-7 py-9 sm:py-14 lg:grid-cols-[1fr_1.05fr] lg:gap-12">
        <div className="min-w-0">
        {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.22em] text-leaf-200">{eyebrow}</p>}
        <div className="mt-3 flex flex-wrap items-end justify-between gap-6">
          <h1 className="max-w-3xl text-[clamp(2rem,5vw,3.3rem)] text-white">{title}</h1>
          {arabic && (
            <p lang="ar" dir="rtl" className="arabic text-[2.4rem] leading-none text-leaf-200/90 sm:text-[3rem]">
              {arabic}
            </p>
          )}
        </div>
        {intro && <p className="mt-5 max-w-2xl text-[1.08rem] leading-relaxed text-white/75">{intro}</p>}
        {children}
        </div>
        <div data-hero-visual className="inner-hero-visual min-w-0 overflow-hidden rounded-[1.75rem] border border-white/20 bg-white shadow-[0_20px_60px_-25px_rgb(0_0_0/.4)]">{visual || <ContentImage src={image.src} alt={image.alt} priority sizes="(max-width: 1024px) 100vw, 600px" className="aspect-[3/2] w-full object-cover" />}</div>
      </div>
    </section>
  );
}
