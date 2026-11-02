import { getSettings } from "@/lib/site-data";
import { ReviewPageForm } from "@/components/site/review-page-form";

export const revalidate = 300;

export const metadata = {
  title: "Share Your Experience | Online Quran College",
  description: "Share honest feedback about your Online Quran College learning experience.",
  alternates: { canonical: "https://www.onlinequrancollege.com/reviews" },
  robots: { index: false, follow: true },
};

export default async function ReviewsPage() {
  const settings = await getSettings();
  const reviewSettings = settings["site.reviews_button"] || {};
  const social = settings["site.social"] || {};
  const trustpilotUrl = reviewSettings.url || "https://www.trustpilot.com/evaluate/onlinequrancollege.com";
  const config = {
    href: trustpilotUrl,
    googleHref: "",
    label: "Review us on Trustpilot",
    sublabel: "Parents & students",
    everyPage: true,
    openForm: true,
  };
  return (
    <section className="page-wrap py-10 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <div className="overflow-hidden rounded-[2rem] border border-leaf-100 bg-white shadow-[0_18px_60px_rgb(13_74_28/0.10)]">
          <div className="bg-mushaf-900 px-6 py-8 text-center text-white sm:px-10 sm:py-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-300">Online Quran College</p>
            <h1 className="mt-3 text-3xl leading-tight sm:text-4xl">Your experience matters</h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
              Help us improve Quran learning for families around the world. Share honest feedback about your experience with our classes, teachers or support team.
            </p>
            <div className="mt-5 flex items-center justify-center gap-1 text-gold-300" aria-label="Choose your own honest star rating">
              {[1,2,3,4,5].map((n) => <span key={n} aria-hidden="true" className="text-xl">★</span>)}
            </div>
          </div>
          <div className="px-3 py-5 sm:px-8 sm:py-8">
            <ReviewPageForm config={config} consentText={settings["site.forms"]?.consent_text} />
          </div>
        </div>
        <p className="mx-auto mt-5 max-w-2xl text-center text-xs leading-relaxed text-ink-faint">
          Please share your genuine experience. Feedback is optional; all ratings are welcome. We do not offer rewards for reviews or ask anyone to change their rating.
        </p>
      </div>
    </section>
  );
}
