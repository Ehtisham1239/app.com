import { getSettings } from "@/lib/site-data";
import { ReviewForm } from "@/components/site/review-form";
import { TrustpilotReviews, TrustpilotSummary } from "@/components/site/trustpilot-reviews";
import { REVIEWS_BUTTON_DEFAULTS, googleReviewUrl, trustpilotUrl } from "@/lib/reviews-button";
import { trustpilotSection } from "@/lib/trustpilot";

export const revalidate = 300;

export const metadata = {
  title: "Reviews — Share Your Experience | Online Quran College",
  description: "Read what families say about Online Quran College on Trustpilot and share honest feedback about your own learning experience.",
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
  const trustpilot = trustpilotSection(settings["site.trustpilot"], settings["site.trustpilot_reviews"], settings["site.social"]);
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
        {trustpilot && <div className="mt-6 text-center"><TrustpilotSummary data={trustpilot} /></div>}
        <p className="mx-auto mt-4 max-w-xl text-center text-xs leading-relaxed text-ink-faint">
          All ratings are welcome. We never offer rewards for reviews or ask anyone to change their rating.
        </p>
      </section>
      {trustpilot && (
        <section className="border-t border-line bg-[#f5faf1] py-16 sm:py-20" aria-labelledby="trustpilot-heading">
          <div className="page-wrap"><TrustpilotReviews data={trustpilot} /></div>
        </section>
      )}
    </>
  );
}
