import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, MessageCircle, Phone } from "@/components/site/icons";
import { whatsappLink } from "@/lib/format";

const SOCIAL_LABELS = { facebook: "Facebook", instagram: "Instagram", x: "X (Twitter)", youtube: "YouTube", tiktok: "TikTok" };

function FooterColumn({ title, items }) {
  if (!items?.length) return null;
  return (
    <nav aria-label={`Footer ${title}`} className="footer-column">
      <h2 className="font-sans text-sm font-bold tracking-wide text-leaf-200">{title}</h2>
      <ul className="mt-3 space-y-0.5">
        {items.map((item) => (
          <li key={item.href + item.label}>
            <Link href={item.href} className="footer-link">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function SiteFooter({ settings, menus }) {
  const identity = settings["site.identity"] ?? {};
  const contact = settings["site.contact"] ?? {};
  const social = settings["site.social"] ?? {};
  const wa = whatsappLink(contact.whatsapp, "Assalamu alaikum, I would like to know more about your Quran classes.");
  const year = new Date().getFullYear();
  const socials = Object.entries(social).filter(([, url]) => typeof url === "string" && /^https?:\/\//.test(url));

  return (
    <footer className="site-footer relative overflow-hidden text-white">
      <div className="pattern-girih pointer-events-none absolute inset-0 opacity-[0.05]" aria-hidden="true" />
      <div className="page-wrap relative pt-10 sm:pt-14">
        <div className="footer-invitation flex flex-wrap items-center justify-between gap-5 rounded-3xl border border-white/20 bg-white/5 p-6 sm:p-8">
          <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-leaf-200">Learn from the comfort of home</p><h2 className="mt-3 max-w-xl text-2xl text-white sm:text-3xl">A little learning, every day.</h2><p className="mt-3 max-w-xl text-sm text-white/80">Find the right Quran course and a lesson time that fits your family.</p></div>
          <Link href="/free-trial" className="btn bg-white text-leaf-700 hover:bg-leaf-100">Arrange a free trial <ArrowUpRight className="size-4" aria-hidden="true" /></Link>
        </div>
      </div>
      <div className="page-wrap relative grid gap-10 py-10 sm:py-14 lg:grid-cols-12 lg:gap-14">
        <div className="min-w-0 lg:col-span-4">
          <Link href="/" aria-label={`${identity.name ?? "Online Quran College"} — home`} className="inline-flex rounded-2xl bg-white p-3 shadow-sm"><img src="/brand/logo-160.webp" alt={identity.name ?? "Online Quran College"} width={160} height={160} loading="lazy" decoding="async" className="size-20 object-contain" /></Link>
          <p className="mt-5 max-w-sm text-[0.95rem] leading-relaxed text-white/85">{identity.tagline}</p>
          <div className="footer-contact mt-5 space-y-1 text-[0.95rem]">
            {contact.email && (
              <a href={`mailto:${contact.email}`} className="footer-contact-link">
                <Mail className="size-4 shrink-0 text-leaf-200" aria-hidden="true" /> <span>{contact.email}</span>
              </a>
            )}
            {contact.phone && (
              <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="footer-contact-link">
                <Phone className="size-4 shrink-0 text-leaf-200" aria-hidden="true" /> <span>{contact.phone}</span>
              </a>
            )}
            {wa && (
              <a href={wa} target="_blank" rel="noopener noreferrer" className="footer-contact-link">
                <MessageCircle className="size-4 shrink-0 text-leaf-200" aria-hidden="true" /> WhatsApp
              </a>
            )}
            {contact.location && (
              <p className="flex items-start gap-3 py-2 text-white/80">
                <MapPin className="mt-1 size-4 shrink-0 text-leaf-200" aria-hidden="true" /> {contact.location}
              </p>
            )}
          </div>
        </div>
        <div className="footer-navigation grid min-w-0 grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 sm:gap-8 lg:col-span-8">
          <FooterColumn title="Courses" items={menus.footer_courses} />
          <FooterColumn title="College" items={[...(menus.footer_company || []).filter((i) => i.href !== "/locations"), { label: "Countries & cities", href: "/locations" }]} />
          <FooterColumn title="Policies" items={menus.footer_legal} />
        </div>
      </div>
      <div className="relative border-t border-white/10">
        <div className="page-wrap flex flex-col gap-4 py-6 text-sm text-white/80 lg:flex-row lg:items-center lg:justify-between">
          <p className="min-w-0">
            © {year} {identity.legal_name ?? identity.name}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {socials.map(([key, url]) => (
              <a
                key={key}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-1 rounded-full border border-white/25 px-3 py-2 text-white/90 transition-colors hover:border-leaf-200 hover:bg-white/10"
              >
                {SOCIAL_LABELS[key] ?? key}
                <ArrowUpRight className="size-3.5" aria-hidden="true" />
              </a>
            ))}
            {/* Full document navigation clears the public chat runtime before staff sign-in. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/admin" className="inline-flex min-h-11 items-center rounded-full px-3 py-1 text-white/75 hover:text-white">
              Portal
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
