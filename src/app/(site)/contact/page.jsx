import { Clock3, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { PageHero } from "@/components/site/chrome";
import { ContactForm } from "@/components/site/contact-form";
import { getSettings } from "@/lib/site-data";
import { whatsappLink } from "@/lib/format";

export const revalidate = 300;

export const metadata = {
  title: "Contact Us",
  description: "Contact Online Quran College by WhatsApp, phone or email. We reply quickly about courses, fees and class timings.",
  alternates: { canonical: "/contact" },
};

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
    contact.hours && { icon: Clock3, label: "Hours", value: contact.hours },
  ].filter(Boolean);

  return (
    <>
      <PageHero eyebrow="Contact" title="We are here to help" intro="Questions about courses, fees or timings? Message us — our admissions team replies quickly, in English, Urdu or Arabic." />
      <section className="page-wrap grid gap-10 py-16 sm:py-20 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-3">
          {cards.map(({ icon: Icon, label, value, href, external, highlight }) => {
            const inner = (
              <>
                <span className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${highlight ? "bg-gold-500 text-mushaf-950" : "bg-mushaf-900 text-gold-300"}`}>
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span>
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
        </div>
        <ContactForm consentText={forms.consent_text} successText={forms.contact_success} />
      </section>
    </>
  );
}
