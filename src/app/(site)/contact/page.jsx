import { contentMetadata } from "@/lib/seo-metadata";
import { ArrowRight, BookOpen, Clock3, HelpCircle, Mail, MessageCircle, Phone, Send } from "@/components/site/icons";
import { NavigationLink as Link } from "@/components/site/navigation-link";
import { PageHero } from "@/components/site/chrome";
import { ContactForm } from "@/components/site/contact-form";
import { getSettings } from "@/lib/site-data";
import { whatsappLink } from "@/lib/format";
import { heroArt } from "@/lib/hero-art";

export const revalidate = 300;

export const metadata = contentMetadata({
  seo_title: "Contact Online Quran College | Quran Course Advice & Class Times",
  cover_url: heroArt("/contact").src,
  cover_alt: heroArt("/contact").alt,
}, { path: "/contact", description: "Speak with Online Quran College about Quran courses, fees, teacher preferences and online class times. Contact our coordinator by WhatsApp, phone, email or the enquiry form." });

export default async function ContactPage() {
  const settings = await getSettings();
  const contact = settings["site.contact"] ?? {};
  const forms = settings["site.forms"] ?? {};
  const wa = whatsappLink(contact.whatsapp, "Assalamu alaikum, I have a question about Online Quran College.");
  const cards = [
    wa && { icon: MessageCircle, label: "WhatsApp", value: "Chat with an advisor", href: wa, external: true, highlight: true, detail: "A convenient way to ask a quick question" },
    contact.phone && { icon: Phone, label: "Call us", value: contact.phone, href: `tel:${contact.phone.replace(/\\s/g, "")}`, detail: "Speak with our college team" },
    contact.email && { icon: Mail, label: "Email", value: contact.email, href: `mailto:${contact.email}`, detail: "Send a detailed enquiry" },
    { icon: BookOpen, label: "Learning model", value: "Online-only Quran academy", detail: "No walk-in office or in-person branch" },
    contact.hours && { icon: Clock3, label: "Class scheduling", value: contact.hours, detail: "Live lesson times are agreed around availability and time zones" },
  ].filter(Boolean);

  return (
    <>
      <PageHero immersive features={false} path="/contact" eyebrow="Personal guidance, wherever you are" title="Let’s find the right way forward" intro="Whether you are choosing a first Quran course or need help with an existing class, tell us what you need. Our coordinator can guide you on learning options, teacher preferences and suitable lesson times.">
        <div className="mt-7 flex flex-wrap gap-3">
          {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-gold btn-lg"><MessageCircle className="size-5" />Chat on WhatsApp<ArrowRight className="size-4" /></a>}
          <a href="#send-message" className="btn btn-outline-light btn-lg"><Send className="size-4" />Send an enquiry</a>
        </div>
        <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/85">Course advice · Teacher preferences · Fees · Class scheduling · Existing student support</p>
      </PageHero>

      <section aria-label="Contact options and enquiry form" className="page-wrap grid items-start gap-8 py-12 sm:gap-12 sm:py-16 lg:grid-cols-[0.88fr_1.12fr]">
        <div className="min-w-0">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-leaf-700">Choose your channel</p>
            <h2 className="mt-2 text-[1.8rem] text-mushaf-900">We’re easy to reach</h2>
            <p className="mt-3 leading-relaxed text-ink-soft">Use whichever contact method is most comfortable. For a quick question, WhatsApp is a convenient place to start; for a detailed request, use the form.</p>
          </div>
          <div className="space-y-3">
            {cards.map(({ icon: Icon, label, value, href, external, highlight, detail }) => {
              const inner = (
                <>
                  <span className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${highlight ? "bg-gold-500 text-mushaf-950" : "bg-mushaf-900 text-gold-300"}`}>
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1 break-words">
                    <span className={`block text-xs font-bold uppercase tracking-[0.16em] ${highlight ? "text-gold-300" : "text-ink-faint"}`}>{label}</span>
                    <span className={`mt-0.5 block text-[1.02rem] font-semibold ${highlight ? "text-white" : "text-mushaf-900"}`}>{value}</span>
                    <span className={`mt-1 block text-sm leading-relaxed ${highlight ? "text-white/75" : "text-ink-soft"}`}>{detail}</span>
                  </span>
                  {href && <ArrowRight className={`size-4 shrink-0 ${highlight ? "text-gold-300" : "text-leaf-700"}`} aria-hidden="true" />}
                </>
              );
              const cls = `flex items-center gap-4 rounded-[var(--radius-card)] p-5 transition-all ${highlight ? "bg-mushaf-900 hover:bg-mushaf-800" : "border border-line bg-white hover:border-gold-300"}`;
              return href ? (
                <a key={label} href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} className={cls}>
                  {inner}
                </a>
              ) : (
                <div key={label} className={cls}>{inner}</div>
              );
            })}
          </div>
          <div className="mt-6 rounded-[var(--radius-card)] border border-leaf-100 bg-leaf-50 p-5">
            <h3 className="font-semibold text-mushaf-900">Enquiring about your first class?</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">A free trial is a simple way to discuss the learner’s level, course goals and teacher preference before deciding on a suitable learning plan.</p>
            <Link href="/free-trial" className="mt-3 inline-flex min-h-11 items-center gap-2 font-semibold text-leaf-700 underline underline-offset-4">Request a free trial<ArrowRight className="size-4" /></Link>
          </div>
          <div className="mt-6 rounded-2xl border border-line bg-white p-5">
            <h3 className="font-semibold text-mushaf-900">What happens next?</h3>
            <ol className="mt-4 space-y-4">
              <li className="flex gap-3"><span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-leaf-100 text-sm font-bold text-leaf-800">1</span><span><strong className="block text-sm text-mushaf-900">Tell us what you need</strong><span className="mt-1 block text-sm leading-relaxed text-ink-soft">Share your question, learner’s needs and preferred contact method.</span></span></li>
              <li className="flex gap-3"><span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-leaf-100 text-sm font-bold text-leaf-800">2</span><span><strong className="block text-sm text-mushaf-900">We review your enquiry</strong><span className="mt-1 block text-sm leading-relaxed text-ink-soft">Our coordinator considers the course, teacher and scheduling details you provide.</span></span></li>
              <li className="flex gap-3"><span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-leaf-100 text-sm font-bold text-leaf-800">3</span><span><strong className="block text-sm text-mushaf-900">Agree on the next step</strong><span className="mt-1 block text-sm leading-relaxed text-ink-soft">We’ll discuss the available options with you before any class plan is confirmed.</span></span></li>
            </ol>
          </div>
        </div>

        <div className="min-w-0">
          <ContactForm id="send-message" consentText={forms.consent_text} successText={forms.contact_success} />
          <p className="mt-4 px-1 text-xs leading-relaxed text-ink-faint">For existing student support, select “Existing student support” and include the learner’s name and registered email. Please do not send passwords or full payment-card details.</p>
        </div>
      </section>

      <section aria-labelledby="contact-help-heading" className="border-t border-line bg-paper py-10 sm:py-12">
        <div className="page-wrap">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-leaf-700">Helpful next steps</p>
            <h2 id="contact-help-heading" className="mt-2 text-[1.7rem] text-mushaf-900">Explore before you decide</h2>
            <p className="mt-2 leading-relaxed text-ink-soft">Compare course options or find answers about lessons, teacher requests and scheduling.</p>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {[{ href: "/courses", icon: BookOpen, title: "Explore Quran courses", text: "Compare Quran reading, Noorani Qaida, Tajweed, Hifz and other learning paths." }, { href: "/faq", icon: HelpCircle, title: "Read common questions", text: "Learn how online lessons, teacher preferences and class scheduling work." }].map(({ href, icon: Icon, title, text }) => <Link key={href} href={href} className="group flex min-w-0 items-start gap-4 rounded-2xl border border-line bg-white p-5 transition-colors hover:border-leaf-500"><Icon className="mt-1 size-6 shrink-0 text-leaf-700" /><span className="min-w-0 flex-1"><span className="block font-semibold text-mushaf-900">{title}</span><span className="mt-1 block text-sm leading-relaxed text-ink-soft">{text}</span></span><ArrowRight className="mt-1 size-5 shrink-0 text-leaf-700" /></Link>)}
          </div>
          <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-2xl bg-mushaf-900 p-6 text-white sm:flex-row sm:items-center sm:p-8">
            <div><h3 className="text-xl text-white">Ready to explore a first lesson?</h3><p className="mt-1 max-w-xl text-sm leading-relaxed text-white/75">Tell us about the learner and request a free trial to discuss a suitable starting point.</p></div>
            <Link href="/free-trial" className="btn btn-gold shrink-0">Arrange a free trial<ArrowRight className="size-4" /></Link>
          </div>
        </div>
      </section>
    </>
  );
}
