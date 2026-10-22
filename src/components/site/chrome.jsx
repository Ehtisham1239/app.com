import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";

export function TopBar({ announcement }) {
  if (!announcement?.enabled || !announcement?.text) return null;
  return (
    <div className="relative z-50 bg-mushaf-900 text-[0.85rem] text-white">
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

export function WhatsAppFloat({ href, chatEnabled = false }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed bottom-5 ${chatEnabled ? "left-5" : "right-5"} z-30 flex items-center gap-2 rounded-full bg-leaf-700 py-3 pl-3.5 pr-4 text-sm font-semibold text-white shadow-[var(--shadow-float)] transition-transform hover:-translate-y-0.5 hover:bg-leaf-800`}
      aria-label="Chat with Online Quran College on WhatsApp"
    >
      <span className="relative flex size-6 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-white/30 [animation-duration:2.4s]" aria-hidden="true" />
        <MessageCircle className="relative size-5" aria-hidden="true" />
      </span>
      <span className="hidden sm:inline">Chat on WhatsApp</span>
    </a>
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
export function PageHero({ eyebrow, title, intro, children, arabic }) {
  return (
    <section className="relative overflow-hidden bg-mushaf-900 text-white">
      <div className="pattern-girih pointer-events-none absolute inset-0 opacity-[0.09]" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-24 -top-24 size-[26rem] rounded-full bg-leaf-600/25 blur-3xl" aria-hidden="true" />
      <div className="page-wrap relative py-14 sm:py-20">
        {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.22em] text-leaf-200">{eyebrow}</p>}
        <div className="mt-3 flex flex-wrap items-end justify-between gap-6">
          <h1 className="max-w-3xl text-[2.4rem] text-white sm:text-[3.3rem]">{title}</h1>
          {arabic && (
            <p lang="ar" dir="rtl" className="arabic text-[2.4rem] leading-none text-leaf-200/90 sm:text-[3rem]">
              {arabic}
            </p>
          )}
        </div>
        {intro && <p className="mt-5 max-w-2xl text-[1.08rem] leading-relaxed text-white/75">{intro}</p>}
        {children}
      </div>
    </section>
  );
}
