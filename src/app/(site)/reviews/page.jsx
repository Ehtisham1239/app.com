import { getSettings } from "@/lib/site-data";
import { ReviewForm } from "@/components/site/review-form";
import { ArrowUpRight, HeartHandshake, MessageCircle, ShieldCheck, Users } from "@/components/site/icons";
import { REVIEWS_BUTTON_DEFAULTS, googleReviewUrl, trustpilotUrl } from "@/lib/reviews-button";

export const revalidate = 300;

// The root layout template adds "· Online Quran College".
export const metadata = {
  title: "Share your experience",
  description: "Share honest feedback about your Online Quran College classes, privately with our team or publicly on Trustpilot.",
  alternates: { canonical: "/reviews" },
  robots: { index: false, follow: true },
};

const PROMISES = [
  { Icon: Users, title: "Read by our team", text: "Admissions read every review and contact you when something needs our help." },
  { Icon: HeartHandshake, title: "Every rating is welcome", text: "Praise or criticism, both help your teacher and our whole team improve." },
  { Icon: ShieldCheck, title: "Private unless you agree", text: "Photos and videos stay private. Nothing is published without your permission." },
];

export default async function ReviewsPage() {
  const settings = await getSettings();
  const reviewSettings = settings["site.reviews_button"] || {};
  const config = {
    href: trustpilotUrl(reviewSettings.url) || REVIEWS_BUTTON_DEFAULTS.url,
    googleHref: googleReviewUrl(reviewSettings.google_url),
  };
  const profileUrl = trustpilotUrl(settings["site.social"]?.trustpilot) || "https://www.trustpilot.com/review/onlinequrancollege.com";
  return (
    <>
      <section className="relative overflow-hidden bg-mushaf-900 pb-28 pt-10 text-white sm:pb-32 sm:pt-14">
        <div className="pattern-girih pointer-events-none absolute inset-0 opacity-[0.07]" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-24 -top-28 size-[24rem] rounded-full bg-leaf-600/25 blur-3xl" aria-hidden="true" />
        <div className="page-wrap relative max-w-5xl text-center lg:text-left">
          <div className="flex flex-col items-center gap-5 lg:flex-row lg:items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/mark-v2-128.png" alt="Online Quran College" width={88} height={88} className="size-[4.5rem] shrink-0 rounded-[1.4rem] bg-white p-2 shadow-[0_10px_30px_rgb(0_0_0/0.25)] sm:size-[5.5rem]" />
            <div>
              <p className="text-sm font-semibold text-gold-300">After your parent–teacher meeting</p>
              <h1 className="mt-1 text-3xl leading-tight sm:text-[2.6rem]">How are the classes going?</h1>
              <p className="mx-auto mt-3 max-w-xl text-[0.98rem] leading-relaxed text-white/80 lg:mx-0">
                Two minutes of honest feedback helps your child’s teacher and our whole team. Tell us privately below, or post a public review on Trustpilot.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="page-wrap relative -mt-20 max-w-5xl pb-14 sm:-mt-24">
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="overflow-hidden rounded-[1.75rem] border border-leaf-100 bg-white shadow-[0_18px_60px_rgb(13_74_28/0.14)]">
            <div className="flex items-center gap-2 border-b border-leaf-100 bg-paper px-5 py-3 text-[0.82rem] font-semibold text-mushaf-900">
              <MessageCircle className="size-4 text-leaf-700" aria-hidden="true" /> Private feedback to Online Quran College
            </div>
            <ReviewForm open inline config={config} consentText={settings["site.forms"]?.consent_text} />
          </div>

          <aside className="space-y-4" aria-label="Public reviews and how we use feedback">
            <div className="rounded-[1.5rem] border border-gold-100 bg-gold-50 p-5">
              <h2 className="text-lg leading-snug text-mushaf-900">Prefer a public review?</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">Trustpilot reviews help other families choose with confidence. It is optional and separate from the form.</p>
              <a href={config.href} target="_blank" rel="noopener noreferrer" data-review-channel="trustpilot" className="btn btn-primary mt-4 min-h-11 w-full justify-center">
                Review us on Trustpilot <ArrowUpRight className="size-4" aria-hidden="true" />
              </a>
              {config.googleHref && (
                <a href={config.googleHref} target="_blank" rel="noopener noreferrer" data-review-channel="google" className="btn btn-outline mt-2 min-h-11 w-full justify-center">
                  Review us on Google <ArrowUpRight className="size-4" aria-hidden="true" />
                </a>
              )}
              <a href={profileUrl} target="_blank" rel="noopener noreferrer" className="mt-3 flex items-center justify-center gap-1 text-sm font-semibold text-leaf-700 underline-offset-2 hover:underline">
                Or read our public Trustpilot profile <ArrowUpRight className="size-3.5" aria-hidden="true" />
              </a>
            </div>
            <ul className="space-y-4 rounded-[1.5rem] border border-leaf-100 bg-white p-5">
              {PROMISES.map(({ Icon, title, text }) => (
                <li key={title} className="flex gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-leaf-50 text-leaf-700" aria-hidden="true"><Icon className="size-[1.1rem]" /></span>
                  <span>
                    <span className="block text-sm font-semibold text-mushaf-900">{title}</span>
                    <span className="mt-0.5 block text-[0.82rem] leading-relaxed text-ink-soft">{text}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="px-2 text-center text-xs leading-relaxed text-ink-faint">We never offer rewards for reviews or ask anyone to change a rating.</p>
          </aside>
        </div>
      </section>
    </>
  );
}
