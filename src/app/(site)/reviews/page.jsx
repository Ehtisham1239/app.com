import { getSettings } from "@/lib/site-data";
import { ReviewForm } from "@/components/site/review-form";
import { REVIEWS_BUTTON_DEFAULTS, googleReviewUrl, trustpilotUrl } from "@/lib/reviews-button";

export const revalidate = 300;

export const metadata = {
  title: "Reviews — Share Your Experience | Online Quran College",
  description: "Share honest feedback about your learning experience. You can also visit the public Trustpilot profile for independent reviews.",
  alternates: { canonical: "/reviews" },
  robots: { index: false, follow: true },
};

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
      <section className="bg-mushaf-900 pb-28 pt-10 text-center text-white sm:pb-32 sm:pt-14">
        <div className="page-wrap max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-300">Online Quran College</p>
          <h1 className="mt-3 text-3xl leading-tight sm:text-4xl">Your experience matters</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
            Tell us how the classes are going. It takes under a minute, and every honest rating helps us teach better.
          </p>
        </div>
      </section>
      <section className="page-wrap -mt-20 pb-12 sm:-mt-24">
        <div className="mx-auto max-w-xl overflow-hidden rounded-[1.75rem] border border-leaf-100 bg-white shadow-[0_18px_60px_rgb(13_74_28/0.12)]">
          <ReviewForm open inline config={config} consentText={settings["site.forms"]?.consent_text} />
        </div>
        <p className="mx-auto mt-6 max-w-xl text-center text-sm text-ink-soft">
          You can also <a href={profileUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-leaf-700 underline">read our public Trustpilot profile</a>. All ratings are welcome; we never offer rewards for reviews or ask anyone to change a rating.
        </p>
      </section>
    </>
  );
}
