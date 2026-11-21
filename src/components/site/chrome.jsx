import { HeroAyah } from "@/components/site/hero-ayah";
import { NavigationLink as Link } from "@/components/site/navigation-link";
import { ArrowRight, Clock, Globe2, Users, Video } from "@/components/site/icons";
import { ContentImage } from "./content-image";
import { heroArt } from "@/lib/hero-art";
import { safeJsonLd, modifiedIso } from "@/lib/seo";
import { CmsPageSchema } from "./custom-code";
import { SITE_URL } from "@/lib/config";
import { whatsappLink } from "@/lib/format";

// Top bar shows only clickable contact numbers (owner request, 20 Nov 2026); the old
// free-trial announcement text is gone. The CMS "enabled" switch can still hide the bar.
// Prefilled message the visitor sends when they tap a WhatsApp number (owner request, 21 Nov 2026).
// It carries no name or request ID: the visitor adds their own details after it opens.
const TOP_BAR_WHATSAPP_MESSAGE =
  "Assalamu alaikum, I would like to request a 3-day free trial at Online Quran College. Please let me know which days and times are available in my time zone, and help me arrange a teacher and the class link. JazakAllah khair.";

const TOP_BAR_NUMBERS = [
  { key: "uk", label: "UK WhatsApp", display: "+44 7864 710821", href: whatsappLink("447864710821", TOP_BAR_WHATSAPP_MESSAGE), external: true },
  { key: "usa", label: "USA WhatsApp", display: "+1 786 964 5678", href: whatsappLink("17869645678", TOP_BAR_WHATSAPP_MESSAGE), external: true },
];

export function TopBar({ announcement }) {
  if (announcement?.enabled === false) return null;
  return (
    <div className="site-announcement relative z-50 bg-leaf-50 text-[0.85rem] text-mushaf-900">
      <nav aria-label="Contact numbers" className="page-wrap flex min-h-9 flex-wrap items-center justify-center gap-x-5 gap-y-1 py-1.5 text-center">
        {TOP_BAR_NUMBERS.map((n) => (
          <a
            key={n.key}
            href={n.href}
            {...(n.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="inline-flex items-center gap-2 font-semibold hover:underline focus-visible:underline"
          >
            <span className="size-1.5 rotate-45 bg-gold-400" aria-hidden="true" />
            <span>{n.label}: {n.display}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}

// Shared headings keep the page hierarchy consistent across the public site.
export function SectionHeading({ eyebrow, title, intro, align = "center", tone = "light", className = "" }) {
  const centered = align === "center";
  const dark = tone === "dark";
  return (
    <div className={`${centered ? "mx-auto text-center" : ""} max-w-2xl ${className}`}>
      {eyebrow && (
        <p className={`flex items-center gap-2.5 text-xs font-bold uppercase tracking-[0.16em] ${centered ? "justify-center" : ""} ${dark ? "text-leaf-200" : "text-leaf-700"}`}>
          <span className={`h-px w-8 ${dark ? "bg-gold-400/60" : "bg-gold-500/60"}`} aria-hidden="true" />
          {eyebrow}
          {centered && <span className={`h-px w-8 ${dark ? "bg-gold-400/60" : "bg-gold-500/60"}`} aria-hidden="true" />}
        </p>
      )}
      <h2 className={`mt-3 text-balance text-[1.85rem] sm:text-[2.5rem] ${dark ? "text-white" : "text-mushaf-900"}`}>{title}</h2>
      {intro && <p className={`mt-3 text-[1.03rem] leading-relaxed ${dark ? "text-white/75" : "text-ink-soft"}`}>{intro}</p>}
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
function ImmersiveHero({ eyebrow, title, titleAccent, intro, children, arabic, image, features, jsonLd, path }) {
  const lead = titleAccent && title.endsWith(titleAccent) ? title.slice(0, -titleAccent.length).trimEnd() : title;
  const backdrop = image.immersive;
  return (
    <section className="inner-hero hero-immersive relative overflow-hidden text-mushaf-900">
      {jsonLd}
      {backdrop ? <picture data-hero-visual className="hero-immersive-media">
        <source type="image/avif" srcSet={backdrop.avif.map(v => `${v.url} ${v.width}w`).join(", ")} sizes="(max-width: 1024px) 100vw, 70vw" />
        <img src={backdrop.src} srcSet={backdrop.webp.map(v => `${v.url} ${v.width}w`).join(", ")} sizes="(max-width: 1024px) 100vw, 70vw" width={backdrop.width} height={backdrop.height} alt={backdrop.alt} loading="eager" fetchPriority="high" decoding="async" />
      </picture> : <div data-hero-visual className="hero-immersive-media"><ContentImage src={image.src} alt={image.alt} priority sizes="(max-width: 1024px) 100vw, 70vw" /></div>}
      <div className="hero-immersive-shade" aria-hidden="true" />
      <div className="pattern-girih pointer-events-none absolute inset-0 opacity-[0.06]" aria-hidden="true" />
      <div className="page-wrap relative py-9 sm:py-14 lg:py-20">
        <div className="hero-immersive-copy max-w-[36rem]">
          {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.24em] text-leaf-700">{eyebrow}</p>}
          <h1 className="mt-3 text-[clamp(2.1rem,5vw,3.5rem)] leading-[1.08] text-mushaf-900">
            {lead}{titleAccent && lead !== title && <>{" "}<br /><span className="text-leaf-700">{titleAccent}</span></>}
          </h1>
          {arabic && <p lang="ar" dir="rtl" className="arabic mt-4 text-[2rem] text-leaf-700">{arabic}</p>}
          {intro && <p className="mt-5 max-w-xl text-[1.08rem] leading-relaxed text-ink-soft">{intro}</p>}
          {children}
          {features !== false && <ul className="hero-immersive-features mt-8 grid grid-cols-2 gap-x-5 gap-y-5 sm:grid-cols-4" aria-label="How classes work">
            {IMMERSIVE_FEATURES.map(({ Icon, label }) => (
              <li key={label} className="flex flex-col gap-2 text-[0.9rem] font-medium leading-snug text-ink">
                <Icon className="size-7 text-leaf-700" strokeWidth={1.6} />{label}
              </li>
            ))}
          </ul>}
          <HeroAyah path={path || title} />
        </div>
      </div>
    </section>
  );
}

export function PageHero({ eyebrow, title, titleAccent, intro, children, arabic, visual, path, art, imageOverride, immersive = false, features, modified, published }) {
  const dateModified = modifiedIso(modified);
  const datePublished = modifiedIso(published);
  const image = imageOverride || heroArt(art || path || title);
  if (immersive) {
    const jsonLd = path && <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd({ "@context": "https://schema.org", "@type": "WebPage", "@id": `${SITE_URL}${path}#webpage`, url: `${SITE_URL}${path}`, name: title, description: intro, isPartOf: { "@id": `${SITE_URL}/#website` }, about: { "@id": `${SITE_URL}/#organization` }, inLanguage: "en-GB", ...(datePublished ? { datePublished } : {}), ...(dateModified ? { dateModified } : {}) }) }} /><CmsPageSchema path={path} /></>;
    return <ImmersiveHero {...{ eyebrow, title, titleAccent, intro, children, arabic, image, features, jsonLd, path }} />;
  }
  return (
    <section className="inner-hero relative overflow-hidden text-mushaf-900">
      {path && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd({ "@context": "https://schema.org", "@type": "WebPage", "@id": `${SITE_URL}${path}#webpage`, url: `${SITE_URL}${path}`, name: title, description: intro, isPartOf: { "@id": `${SITE_URL}/#website` }, about: { "@id": `${SITE_URL}/#organization` }, inLanguage: "en-GB", ...(datePublished ? { datePublished } : {}), ...(dateModified ? { dateModified } : {}) }) }} />}
      {path && <CmsPageSchema path={path} />}
      <div className="pattern-girih pointer-events-none absolute inset-0 opacity-[0.09]" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-24 -top-24 size-[26rem] rounded-full bg-leaf-200/40 blur-3xl" aria-hidden="true" />
      <div className="page-wrap inner-hero-layout relative grid items-center gap-7 py-9 sm:py-14 lg:grid-cols-[1fr_1.05fr] lg:gap-12">
        <div className="min-w-0">
        {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.22em] text-leaf-700">{eyebrow}</p>}
        <div className="mt-3 flex flex-wrap items-end justify-between gap-6">
          <h1 className="max-w-3xl text-[clamp(2rem,5vw,3.3rem)] text-mushaf-900">{title}</h1>
          {arabic && (
            <p lang="ar" dir="rtl" className="arabic text-[2.4rem] leading-none text-leaf-700 sm:text-[3rem]">
              {arabic}
            </p>
          )}
        </div>
        {intro && <p className="mt-5 max-w-2xl text-[1.08rem] leading-relaxed text-ink-soft">{intro}</p>}
        {children}
        <HeroAyah path={path || title} />
        </div>
        <div data-hero-visual className="inner-hero-visual min-w-0 overflow-hidden rounded-[1.75rem] border border-white bg-white shadow-[0_20px_60px_-25px_rgb(0_0_0/.4)]">{visual || <ContentImage src={image.src} alt={image.alt} priority sizes="(max-width: 1024px) 100vw, 600px" className="aspect-[3/2] w-full object-cover" />}</div>
      </div>
    </section>
  );
}
