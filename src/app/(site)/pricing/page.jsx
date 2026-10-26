import { contentMetadata } from "@/lib/seo-metadata";
import { CurrencyPricing } from "@/components/site/currency-pricing";
import { BadgePercent, CreditCard, ShieldCheck } from "@/components/site/icons";
import { PageHero, SectionHeading } from "@/components/site/chrome";
import { CtaBand, FaqList } from "@/components/site/sections";
import { getFaqs, getPlans, getSettings } from "@/lib/site-data";
import { whatsappLink } from "@/lib/format";

export const revalidate = 300;

export const metadata = contentMetadata({ title: "Online Quran Class Fees & Packages", seo_noindex: false }, { path: "/pricing", description: "Compare monthly packages for live one-to-one Quran classes, with a 3-day free trial on eligible plans. The Weekend plan is excluded from the trial." });

export default async function PricingPage({ searchParams }) {
  const requestedCurrency = (await searchParams)?.currency;
  const [plans, faqs, settings] = await Promise.all([getPlans(), getFaqs(), getSettings()]);
  const packages = plans.filter((p) => /^package/i.test(p.name));
  const other = plans.filter((p) => !/^package/i.test(p.name));
  const feeFaqs = faqs.filter((f) => /fee|pay|cancel|discount/i.test(`${f.category} ${f.question}`));
  const currencies = [...new Set(plans.flatMap((p) => p.prices.map((x) => x.currency)))];
  const wa = whatsappLink(settings["site.contact"]?.whatsapp, "Assalamu alaikum, I have a question about your fees.");

  return (
    <>
      <PageHero path="/pricing"
        eyebrow="Fees"
        title="Online Quran class fees and packages"
        intro="Choose how many days a week suit your family. Compare lesson frequency, duration and fees below. A 3-day free trial is available on eligible plans; the Weekend plan is excluded."
      />
      <section className="page-wrap py-16 sm:py-20" aria-labelledby="monthly-packages">
        <h2 id="monthly-packages" className="sr-only">Monthly class packages</h2>
        {packages.length > 0 && <CurrencyPricing plans={packages} defaultCurrency={requestedCurrency} />}
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            { icon: BadgePercent, title: "15% sibling discount", text: "Each additional child from the same family receives 15% off their monthly fee." },
            { icon: ShieldCheck, title: "Free trial on eligible plans", text: "Try 3 days of classes before choosing an eligible package. The Weekend plan is excluded; confirm your plan with the coordinator." },
            { icon: CreditCard, title: "Easy payment", text: `Pay monthly by card, PayPal or bank transfer${currencies.length ? ` — prices shown in ${currencies.join(", ")}` : ""}.` },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-4 rounded-[var(--radius-card)] border border-line bg-white p-5">
              <Icon className="mt-0.5 size-6 shrink-0 text-gold-600" aria-hidden="true" />
              <div>
                <h2 className="font-sans text-[1.02rem] font-bold text-mushaf-900">{title}</h2>
                <p className="mt-1 text-[0.93rem] leading-relaxed text-ink-soft">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {other.length > 0 && (
        <section className="border-y border-line bg-white/60 py-16 sm:py-20">
          <div className="page-wrap">
            <SectionHeading eyebrow="More options" title="Weekend and flexible plans" intro="For busy weekdays or adults who prefer a lighter pace." />
            <div className="mt-12">
              <CurrencyPricing plans={other} defaultCurrency={requestedCurrency} />
            </div>
          </div>
        </section>
      )}

      {feeFaqs.length > 0 && (
        <section className="page-wrap py-16 sm:py-20">
          <SectionHeading eyebrow="Questions" title="About fees and payments" />
          <div className="mx-auto mt-10 max-w-3xl">
            <FaqList faqs={feeFaqs} defaultOpen={-1} />
          </div>
        </section>
      )}

      <CtaBand title="Try 3 days of classes on an eligible plan" text="The Weekend plan is excluded from the free trial. Confirm the right plan with the coordinator before enrolling." whatsappHref={wa} />
    </>
  );
}
