import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { whatsappLink } from "@/lib/format";

const SOCIAL_LABELS = { facebook: "Facebook", instagram: "Instagram", x: "X (Twitter)", youtube: "YouTube", tiktok: "TikTok" };

function FooterColumn({ title, items }) {
  if (!items?.length) return null;
  return (
    <div>
      <h2 className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-gold-400">{title}</h2>
      <ul className="mt-4 space-y-2.5">
        {items.map((item) => (
          <li key={item.href + item.label}>
            <Link href={item.href} className="text-[0.95rem] text-white/75 transition-colors hover:text-white">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
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
    <footer className="relative overflow-hidden bg-mushaf-950 text-white">
      <div className="pattern-girih pointer-events-none absolute inset-0 opacity-[0.07]" aria-hidden="true" />
      <div className="page-wrap relative grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-4">
          <img src="/brand/logo-160.webp" alt={identity.name ?? "Online Quran College"} width={160} height={160} loading="lazy" decoding="async" className="h-20 w-auto rounded-lg bg-white p-2" />
          <p className="mt-6 max-w-sm text-[0.95rem] leading-relaxed text-white/70">{identity.tagline}</p>
          <div className="mt-6 space-y-2.5 text-[0.95rem]">
            {contact.email && (
              <a href={`mailto:${contact.email}`} className="flex items-center gap-3 text-white/80 hover:text-white">
                <Mail className="size-4 text-gold-400" aria-hidden="true" /> {contact.email}
              </a>
            )}
            {contact.phone && (
              <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="flex items-center gap-3 text-white/80 hover:text-white">
                <Phone className="size-4 text-gold-400" aria-hidden="true" /> {contact.phone}
              </a>
            )}
            {wa && (
              <a href={wa} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-white/80 hover:text-white">
                <MessageCircle className="size-4 text-gold-400" aria-hidden="true" /> WhatsApp
              </a>
            )}
            {contact.location && (
              <p className="flex items-center gap-3 text-white/60">
                <MapPin className="size-4 text-gold-400" aria-hidden="true" /> {contact.location}
              </p>
            )}
          </div>
        </div>
        <div className="grid gap-10 sm:grid-cols-3 md:col-span-8">
          <FooterColumn title="Courses" items={menus.footer_courses} />
          <FooterColumn title="College" items={[...(menus.footer_company || []).filter((i) => i.href !== "/locations"), { label: "Countries & cities", href: "/locations" }]} />
          <FooterColumn title="Policies" items={menus.footer_legal} />
        </div>
      </div>
      <div className="relative border-t border-white/10">
        <div className="page-wrap flex flex-col gap-4 py-6 text-sm text-white/55 md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {identity.legal_name ?? identity.name}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {socials.map(([key, url]) => (
              <a
                key={key}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-full border border-white/15 px-3 py-1 text-white/70 transition-colors hover:border-gold-400 hover:text-gold-300"
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
