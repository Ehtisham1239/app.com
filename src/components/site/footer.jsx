import { NavigationLink as Link } from "@/components/site/navigation-link";
import { ArrowUpRight, Mail, MessageCircle, Phone } from "@/components/site/icons";
import { whatsappLink } from "@/lib/format";

const SOCIAL_LABELS = { facebook: "Facebook", instagram: "Instagram", x: "X (Twitter)", youtube: "YouTube", tiktok: "TikTok", trustpilot: "Trustpilot" };

function FooterColumn({ title, items }) {
  if (!items?.length) return null;
  return (
    <nav aria-label={`Footer ${title}`} className="footer-column">
      <h2 className="font-sans text-sm font-bold tracking-wide text-leaf-700">{title}</h2>
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
  const reviews = settings["site.reviews_button"] ?? {};
  // Internal links go straight to the canonical page; the CMS short link is for sharing.
  const reviewPage = "/reviews";
  const wa = whatsappLink(contact.whatsapp, "Assalamu alaikum, I would like to know more about your Quran classes.");
  const year = new Date().getFullYear();
  const socials = Object.entries(social).filter(([, url]) => typeof url === "string" && /^https?:\/\//.test(url));

  return (
    <footer className="site-footer relative overflow-hidden text-mushaf-900">
      <div className="pattern-girih pointer-events-none absolute inset-0 opacity-[0.05]" aria-hidden="true" />
      <div className="page-wrap relative pt-10 sm:pt-14">
        <figure className="quran-verse-panel mb-6 rounded-3xl px-5 py-6 text-center sm:px-8">
          <blockquote>
            <p lang="ar" dir="rtl" className="arabic quran-text text-3xl leading-relaxed sm:text-4xl">رَبِّ زِدْنِي عِلْمًا</p>
            <p className="mt-1 text-sm leading-relaxed">“My Lord, increase me in knowledge.”</p>
          </blockquote>
          <figcaption className="mt-2 text-sm">
            <a href="https://quran.com/20/114" className="font-semibold underline underline-offset-4">Qur’an 20:114 · excerpt</a>
          </figcaption>
        </figure>
        <div className="footer-invitation flex flex-wrap items-center justify-between gap-5 rounded-3xl border border-leaf-200 bg-white/80 p-6 sm:p-8">
          <div><h2 className="max-w-xl text-2xl text-mushaf-900 sm:text-3xl">Find a Quran class that fits your schedule</h2><p className="mt-3 max-w-xl text-sm text-ink-soft">Tell us what you’d like to learn and when you’re available.</p></div>
          <Link href="/free-trial" className="btn btn-gold">Arrange a free trial <ArrowUpRight className="size-4" aria-hidden="true" /></Link>
        </div>
      </div>
      <div className="page-wrap relative grid gap-10 py-10 sm:py-14 lg:grid-cols-12 lg:gap-14">
        <div className="min-w-0 lg:col-span-4">
          <Link href="/" prefetch={false} aria-label={`${identity.name ?? "Online Quran College"} — home`} className="footer-brand inline-flex rounded-2xl border border-leaf-100 bg-white p-3 shadow-sm"><img src="/brand/oqc-contact-logo.webp" alt={identity.name ?? "Online Quran College"} width={240} height={240} loading="lazy" decoding="async" className="size-20 object-contain" /></Link>
          <p className="mt-5 max-w-sm text-[0.95rem] leading-relaxed text-ink-soft">{identity.tagline}</p>
          <div className="footer-contact mt-5 space-y-1 text-[0.95rem]">
            {contact.email && (
              <a href={`mailto:${contact.email}`} className="footer-contact-link">
                <Mail className="size-4 shrink-0 text-leaf-700" aria-hidden="true" /> <span>{contact.email}</span>
              </a>
            )}
            {contact.phone && (
              <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="footer-contact-link">
                <Phone className="size-4 shrink-0 text-leaf-700" aria-hidden="true" /> <span>{contact.phone}</span>
              </a>
            )}
            {wa && (
              <a href={wa} target="_blank" rel="noopener noreferrer" className="footer-contact-link">
                <MessageCircle className="size-4 shrink-0 text-leaf-700" aria-hidden="true" /> WhatsApp
              </a>
            )}
            <p className="py-2 text-sm text-ink-soft">Online-only academy · no walk-in office</p>
          </div>
        </div>
        <div className="footer-navigation grid min-w-0 grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 sm:gap-8 lg:col-span-8">
          <FooterColumn title="Courses" items={menus.footer_courses} />
          <FooterColumn title="College" items={[...(menus.footer_company || []).filter((i) => i.href !== "/locations" && i.href !== reviewPage), { label: "Country guides", href: "/locations" }, ...(reviews.enabled ? [{ label: "Share your experience", href: reviewPage }] : [])]} />
          <FooterColumn title="Policies" items={menus.footer_legal} />
        </div>
      </div>
      <div className="relative border-t border-line">
        <div className="page-wrap flex flex-col gap-4 py-6 text-sm text-ink-soft lg:flex-row lg:items-center lg:justify-between">
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
                className="inline-flex min-h-11 items-center gap-1 rounded-full border border-line px-3 py-2 text-ink transition-colors hover:border-leaf-300 hover:bg-leaf-100"
              >
                {SOCIAL_LABELS[key] ?? key}
                <ArrowUpRight className="size-3.5" aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
