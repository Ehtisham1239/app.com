import { SITE_URL } from "@/lib/config";
import { safeJsonLd } from "@/lib/seo";
import { videoSchema } from "@/lib/page-video";

export function PageVideo({ video, path, structured = false }) {
  const url = path ? new URL(path, SITE_URL).href : null;
  return (
    <section className="page-wrap py-8" aria-label={video.title}>
      {url && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd({
        "@context": "https://schema.org", "@type": "WebPage", "@id": `${url}#webpage`, url,
        name: video.title, isPartOf: { "@id": `${SITE_URL}/#website` },
        ...(structured ? { mainEntity: { "@id": `${url}#video` } } : {}),
      }) }} />}
      {structured && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd({ ...videoSchema(video), "@id": `${url}#video` }) }} />}
      <div className="mx-auto max-w-4xl space-y-3">
        {video.embedUrl ? (
          <iframe className="aspect-video w-full rounded-2xl bg-mushaf-950" width={960} height={540} src={video.embedUrl} title={video.title} loading={video.primary ? "eager" : "lazy"} allow="encrypted-media; picture-in-picture; fullscreen" allowFullScreen />
        ) : (
          <video className="aspect-video w-full rounded-2xl bg-mushaf-950" width={960} height={540} src={video.contentUrl} poster={video.thumbnailUrl} controls playsInline preload="none" aria-label={video.title} />
        )}
        {!video.primary && <h2 className="text-xl text-mushaf-900">{video.title}</h2>}
        <p className="text-ink-soft">{video.description}</p>
        {video.watchUrl && <a className="font-semibold text-leaf-700 underline underline-offset-4" href={video.watchUrl}>Watch on YouTube</a>}
      </div>
    </section>
  );
}
