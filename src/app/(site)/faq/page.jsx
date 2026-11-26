import { contentMetadata } from "@/lib/seo-metadata";
import { PageHero } from "@/components/site/chrome";
import { CtaBand, FaqList } from "@/components/site/sections";
import { getFaqs, getSettings } from "@/lib/site-data";
import { whatsappLink } from "@/lib/format";
import { safeJsonLd, STATIC_PAGES_REVIEWED } from "@/lib/seo";
import { LOCATIONS } from "@/lib/locations";
import { cardTone } from "@/lib/card-presentation";
import { HelpCircle } from "@/components/site/icons";

export const revalidate = 3600;

export const metadata = contentMetadata({ title: "Questions About Online Quran Classes", seo_noindex: false }, { path: "/faq", description: "Answers about free trials, female teachers, class timings, fees, rescheduling and certificates at Online Quran College, plus what you need for online classes." });

export default async function FaqPage() {
  const [faqs, settings] = await Promise.all([getFaqs(), getSettings()]);
  const groups = faqs.reduce((acc, f) => {
    const key = f.category?.startsWith("Market:") ? (LOCATIONS.find(country => country.slug === f.category.slice(7))?.name || "International classes") : f.category || "General";
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
      {faqs.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />}
      <PageHero immersive path="/faq" modified={STATIC_PAGES_REVIEWED} eyebrow="FAQ" title="Questions about online Quran classes" intro="Find answers about trial lessons, teacher preferences, class times and fees. Choose a topic to jump straight to its questions.">
        <div className="mt-6 flex flex-wrap gap-3">
          <a href="#faq-topics" className="btn btn-primary">Browse questions</a>
          <a href="/contact" className="btn btn-outline">Ask admissions</a>
        </div>
      </PageHero>
      <section id="faq-topics" aria-label="Frequently asked questions by topic" className="page-wrap grid scroll-mt-28 gap-10 py-16 sm:py-20 lg:grid-cols-[14rem_1fr]">
        {entries.length > 1 && (
          <nav className="lg:sticky lg:top-24 lg:self-start" aria-label="FAQ topics">
            <p className="mb-4 text-xs font-bold uppercase tracking-wider text-leaf-700">Browse a topic</p><ul className="grid grid-cols-2 gap-3 lg:grid-cols-1">
              {entries.map(([cat, items]) => (
                <li key={cat}>
                  <a href={`#${cat.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} data-card-tone={cardTone(cat)} className="editorial-card card-tinted flex h-full items-center justify-between gap-3 px-4 py-4 text-sm font-semibold text-mushaf-900">
                    {cat} <span className="rounded-full bg-white px-2 py-1 text-xs">{items.length}</span>
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
              <h2 className="flex items-center gap-3 text-[1.6rem] text-mushaf-900"><HelpCircle className="size-6 shrink-0 text-leaf-700" aria-hidden="true" />{cat}</h2>
              <div className="mt-5">
                <FaqList faqs={items} defaultOpen={-1} />
              </div>
            </section>
          ))}
        </div>
      </section>
      <CtaBand title="Still have a question?" text="Tell our admissions team what you would like to know about lessons, teachers or enrolment." whatsappHref={wa} />
    </>
  );
}
