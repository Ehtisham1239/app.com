import { PageHero } from "@/components/site/chrome";
import { CtaBand, FaqList } from "@/components/site/sections";
import { getFaqs, getSettings } from "@/lib/site-data";
import { whatsappLink } from "@/lib/format";

export const revalidate = 300;

export const metadata = {
  title: "Frequently Asked Questions",
  description: "Answers about free trials, female teachers, class timings, fees, rescheduling and certificates at Online Quran College.",
  alternates: { canonical: "/faq" },
};

export default async function FaqPage() {
  const [faqs, settings] = await Promise.all([getFaqs(), getSettings()]);
  const groups = faqs.reduce((acc, f) => {
    const key = f.category || "General";
    (acc[key] ||= []).push(f);
    return acc;
  }, {});
  const wa = whatsappLink(settings["site.contact"]?.whatsapp, "Assalamu alaikum, I have a question that is not in your FAQ.");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
  };
  const entries = Object.entries(groups);

  return (
    <>
      {faqs.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
      <PageHero eyebrow="FAQ" title="Frequently asked questions" intro="Quick answers about trials, teachers, timings and fees." />
      <section className="page-wrap grid gap-10 py-16 sm:py-20 lg:grid-cols-[14rem_1fr]">
        {entries.length > 1 && (
          <nav className="lg:sticky lg:top-24 lg:self-start" aria-label="FAQ topics">
            <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
              {entries.map(([cat, items]) => (
                <li key={cat}>
                  <a href={`#${cat.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} className="flex items-center justify-between gap-3 rounded-xl px-4 py-2.5 text-[0.95rem] font-medium text-ink-soft ring-1 ring-line hover:bg-white hover:text-leaf-700 lg:ring-0">
                    {cat} <span className="text-xs text-ink-faint">{items.length}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
        <div className="space-y-12">
          {entries.length === 0 && <p className="surface p-10 text-center text-ink-soft">Questions are being updated. Please contact us on WhatsApp.</p>}
          {entries.map(([cat, items]) => (
            <section key={cat} id={cat.toLowerCase().replace(/[^a-z0-9]+/g, "-")} className="scroll-mt-28">
              <h2 className="text-[1.8rem] text-mushaf-900">{cat}</h2>
              <div className="mt-5">
                <FaqList faqs={items} defaultOpen={-1} />
              </div>
            </section>
          ))}
        </div>
      </section>
      <CtaBand title="Still have a question?" text="Message our admissions team — we usually reply within minutes during the day." whatsappHref={wa} />
    </>
  );
}
