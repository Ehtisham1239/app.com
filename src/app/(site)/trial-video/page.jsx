import Link from "next/link";
import { PageVideo } from "@/components/site/page-video";
import { contentMetadata } from "@/lib/seo-metadata";
import { pageVideo } from "@/lib/page-video";
import { TRIAL_GUIDE_VIDEO } from "@/lib/trial-guide-video";

export const metadata = contentMetadata({
  seo_title: "How to Request a Free Online Quran Trial | Online Quran College",
  cover_url: TRIAL_GUIDE_VIDEO.thumbnail,
  cover_alt: "Online Quran College video guide to requesting a free trial",
}, { path: "/trial-video", description: TRIAL_GUIDE_VIDEO.description });

export default function TrialVideoPage() {
  return (
    <>
      <div className="page-wrap pt-10">
        <h1 className="text-3xl text-mushaf-900 sm:text-4xl">{TRIAL_GUIDE_VIDEO.title}</h1>
      </div>
      <PageVideo video={pageVideo(TRIAL_GUIDE_VIDEO)} path="/trial-video" structured />
      <section className="page-wrap pb-12">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl">Video transcript</h2>
          <ol className="my-4 list-decimal space-y-2 pl-6 text-ink-soft">
            <li>Request a free 3-day trial of live one-to-one Quran lessons on eligible plans.</li>
            <li>Tell Admissions your time zone and preferred course.</li>
            <li>Agree a lesson time with Admissions. No card is needed. The Weekend plan is excluded.</li>
          </ol>
          <Link className="btn btn-primary" href="/free-trial#trial-form">Request my free trial</Link>
        </div>
      </section>
    </>
  );
}
