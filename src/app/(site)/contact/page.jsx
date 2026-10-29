import { contentMetadata } from "@/lib/seo-metadata";
import { ArrowRight, BookOpen, Clock3, HelpCircle, Mail, MapPin, MessageCircle, Phone, Send } from "@/components/site/icons";
import { NavigationLink as Link } from "@/components/site/navigation-link";
import { PageHero } from "@/components/site/chrome";
import { ContactForm } from "@/components/site/contact-form";
import { getSettings } from "@/lib/site-data";
import { whatsappLink } from "@/lib/format";
import { heroArt } from "@/lib/hero-art";

export const revalidate = 300;

export const metadata = contentMetadata({
  seo_title: "Contact Online Quran College | Courses & Class Times",
  cover_url: heroArt("/contact").src,
  cover_alt: heroArt("/contact").alt,
}, { path: "/contact", description: "Contact Online Quran College about online Quran courses, fees and class times. Reach our coordinator by WhatsApp, phone, email or the enquiry form." });

export default async function ContactPage() {
  const settings = await getSettings();
  const contact = settings["site.contact"] ?? {};
  const forms = settings["site.forms"] ?? {};
  const wa = whatsappLink(contact.whatsapp, "Assalamu alaikum, I have a question.");
  const cards = [
    wa && { icon: MessageCircle, label: "WhatsApp", value: "Chat with an advisor", href: wa, external: true, highlight: true },
    contact.phone && { icon: Phone, label: "Phone", value: contact.phone, href: `tel:${contact.phone.replace(/\s/g, "")}` },
    contact.email && { icon: Mail, label: "Email", value: contact.email, href: `mailto:${contact.email}` },
    contact.location && { icon: MapPin, label: "Registered in", value: contact.location },
    contact.hours && { icon: Clock3, label: "Class scheduling", value: contact.hours },
  ].filter(Boolean);

  return (
    <>
      <PageHero immersive features={false} path="/contact" eyebrow="Here to help you get started" title="Contact Online Quran College" intro="Tell us who the classes are for and which times work for you. Our coordinator can help with courses, teacher preferences and your next step.">
        <div className="mt-7 flex flex-wrap gap-3">
          {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-gold btn-lg"><MessageCircle className="size-5" />Chat on WhatsApp<ArrowRight className="size-4" /></a>}
          <a href="#send-message" className="btn btn-outline-light btn-lg"><Send className="size-4" />Send a message</a>
        </div>
        <p className="mt-5 max-w-lg text-sm leading-relaxed text-white/85">Course guidance · Class timings · Existing student support</p>
      </PageHero>
      <section aria-label="Contact options and enquiry form" className="page-wrap grid items-start gap-8 py-12 sm:gap-12 sm:py-16 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="min-w-0 space-y-3">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-leaf-700">Let’s talk</p>
            <h2 className="mt-2 text-[1.8rem] text-mushaf-900">Choose how to reach us</h2>
            <p className="mt-3 leading-relaxed text-ink-soft">Send a quick question on WhatsApp, call or email us, or use the enquiry form.</p>
          </div>
          {cards.map(({ icon: Icon, label, value, href, external, highlight }) => {
            const inner = (
              <>
                <span className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${highlight ? "bg-gold-500 text-mushaf-950" : "bg-mushaf-900 text-gold-300"}`}>
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 break-words">
                  <span className={`block text-xs font-bold uppercase tracking-[0.16em] ${highlight ? "text-gold-300" : "text-ink-faint"}`}>{label}</span>
                  <span className={`mt-0.5 block text-[1.05rem] font-semibold ${highlight ? "text-white" : "text-mushaf-900"}`}>{value}</span>
                </span>
              </>
            );
            const cls = `flex items-center gap-4 rounded-[var(--radius-card)] p-5 transition-all ${highlight ? "bg-mushaf-900 hover:bg-mushaf-800" : "border border-line bg-white hover:border-gold-300"}`;
            return href ? (
              <a key={label} href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} className={cls}>
                {inner}
              </a>
            ) : (
              <div key={label} className={cls}>
                {inner}
              </div>
            );
          })}
          <div className="mt-6 rounded-[var(--radius-card)] border border-leaf-100 bg-leaf-50 p-5">
            <h3 className="font-semibold text-mushaf-900">Looking for your first class?</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">Explore the learning paths or send a trial request so we can discuss a suitable starting point.</p>
            <Link href="/free-trial" className="mt-3 inline-flex min-h-11 items-center gap-2 font-semibold text-leaf-700 underline underline-offset-4">Request a free trial<ArrowRight className="size-4" /></Link>
          </div>
        </div>
        <ContactForm id="send-message" consentText={forms.consent_text} successText={forms.contact_success} />
      </section>
      <section aria-labelledby="contact-help-heading" className="border-t border-line bg-paper py-10 sm:py-12">
        <div className="page-wrap">
          <h2 id="contact-help-heading" className="text-[1.6rem] text-mushaf-900">A little guidance before you enquire</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {[{ href: "/courses", icon: BookOpen, title: "Find a learning path", text: "Compare Quran reading, Tajweed, Hifz and other courses." }, { href: "/faq", icon: HelpCircle, title: "Read common questions", text: "Learn how lessons, teacher requests and scheduling work." }].map(({ href, icon: Icon, title, text }) => <Link key={href} href={href} className="group flex min-w-0 items-start gap-4 rounded-2xl border border-line bg-white p-5 transition-colors hover:border-leaf-500"><Icon className="mt-1 size-6 text-leaf-700" /><span className="min-w-0 flex-1"><span className="block font-semibold text-mushaf-900">{title}</span><span className="mt-1 block text-sm leading-relaxed text-ink-soft">{text}</span></span><ArrowRight className="mt-1 size-5 text-leaf-700" /></Link>)}
          </div>
        </div>
      </section>
    </>
  );
}
