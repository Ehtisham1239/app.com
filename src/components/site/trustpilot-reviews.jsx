// Featured Trustpilot reviews (server component — no client JavaScript).
// Data and honesty rules live in src/lib/trustpilot.js.
import { ArrowUpRight, Star } from "@/components/site/icons";

const TP_GREEN = "#00B67A";
const DATE = new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric", timeZone: "UTC" });

function TrustStars({ rating, size = "size-5", label }) {
  return (
    <span className="inline-flex gap-[3px]" role="img" aria-label={label ?? `Rated ${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const fill = Math.max(0, Math.min(1, rating - (n - 1)));
        return (
          <span key={n} aria-hidden="true" className={`relative inline-flex ${size} items-center justify-center overflow-hidden rounded-[3px] bg-[#dcdce6]`}>
            {fill > 0 && <span className="absolute inset-y-0 left-0" style={{ width: `${fill * 100}%`, background: TP_GREEN }} />}
            <Star className="relative size-[70%] fill-white text-white" strokeWidth={0} />
          </span>
        );
      })}
    </span>
  );
}

function scoreWord(score) {
  if (score >= 4.3) return "Excellent";
  if (score >= 3.8) return "Great";
  if (score >= 2.8) return "Average";
  return null;
}

export function TrustpilotSummary({ data, className = "" }) {
  if (!data) return null;
  const word = data.trustScore ? scoreWord(data.trustScore) : null;
  return (
    <a href={data.profileUrl} target="_blank" rel="noopener noreferrer" data-review-channel="trustpilot-profile"
      className={`group inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-full border border-leaf-100 bg-white px-5 py-2.5 text-sm shadow-[0_4px_16px_rgb(13_74_28/0.06)] hover:border-leaf-300 ${className}`}>
      {word && <span className="font-bold text-mushaf-900">{word}</span>}
      {data.trustScore && <TrustStars rating={data.trustScore} size="size-5" label={`TrustScore ${data.trustScore} out of 5`} />}
      <span className="text-ink-soft">
        {data.trustScore && <><strong className="text-mushaf-900">{data.trustScore.toFixed(1)}</strong> TrustScore</>}
        {data.trustScore && data.reviewCount && " · "}
        {data.reviewCount && <><strong className="text-mushaf-900">{data.reviewCount}</strong> {data.reviewCount === 1 ? "review" : "reviews"}</>}
        {" on "}
        <span className="inline-flex items-center gap-1 font-bold text-mushaf-900"><Star className="size-4 fill-current" style={{ color: TP_GREEN }} strokeWidth={0} aria-hidden="true" />Trustpilot</span>
      </span>
      <ArrowUpRight className="size-4 text-leaf-700 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
      <span className="sr-only">(opens Trustpilot in a new tab)</span>
    </a>
  );
}

function ReviewCard({ review }) {
  const date = review.date ? DATE.format(new Date(`${review.date}T00:00:00Z`)) : "";
  const body = review.text && review.text !== review.title ? review.text : "";
  return (
    <figure className="flex h-full flex-col rounded-[var(--radius-card)] border border-line bg-white p-6 shadow-[0_8px_30px_rgb(13_74_28/0.05)]">
      <div className="flex items-center justify-between gap-3">
        <TrustStars rating={review.rating} />
        {date && <time dateTime={review.date} className="text-xs text-ink-faint">{date}</time>}
      </div>
      <blockquote className="mt-4 flex-1">
        {review.title && <p className="text-[1.02rem] font-semibold leading-snug text-mushaf-900">{review.title}</p>}
        {body && <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-soft">{body}{review.excerpt && "…"}</p>}
      </blockquote>
      <figcaption className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4">
        <span className="min-w-0">
          <span className="block truncate font-semibold text-mushaf-900">{review.name}</span>
          {review.country && <span className="block truncate text-xs text-ink-faint">{review.country}</span>}
        </span>
        <a href={review.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 shrink-0 items-center gap-1 text-sm font-semibold text-leaf-700 hover:text-leaf-800"
          aria-label={`Read ${review.name}’s full review on Trustpilot (opens in a new tab)`}>
          {review.excerpt ? "Read more" : "View"} <ArrowUpRight className="size-4" aria-hidden="true" />
        </a>
      </figcaption>
    </figure>
  );
}

// Full section: summary badge, featured cards and links to every review / writing one.
export function TrustpilotReviews({ data, eyebrow = "Trustpilot reviews", compact = false }) {
  if (!data) return null;
  const reviews = compact ? data.reviews.slice(0, 3) : data.reviews;
  return (
    <div>
      <div className="mx-auto max-w-2xl text-center">
        {!compact && (
          <p className="flex items-center justify-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-leaf-700">
            <span className="h-px w-8 bg-gold-500/60" aria-hidden="true" />{eyebrow}<span className="h-px w-8 bg-gold-500/60" aria-hidden="true" />
          </p>
        )}
        <h2 id="trustpilot-heading" className={compact ? "text-2xl text-mushaf-900" : "mt-4 text-[2.1rem] text-mushaf-900 sm:text-[2.6rem]"}>{data.heading}</h2>
        <TrustpilotSummary data={data} className="mt-5" />
      </div>
      <div className={`swipe-row mt-10 sm:grid sm:gap-5 ${reviews.length > 2 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2"}`} tabIndex={0} aria-label="Featured Trustpilot reviews — swipe for more">
        {reviews.map((review) => <ReviewCard key={review.url} review={review} />)}
      </div>
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <a href={data.profileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline min-h-11 justify-center" data-review-channel="trustpilot-profile">
          See all{data.reviewCount ? ` ${data.reviewCount}` : ""} reviews on Trustpilot <ArrowUpRight className="size-4" aria-hidden="true" />
        </a>
        <a href={data.reviewUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary min-h-11 justify-center" data-review-channel="trustpilot">
          Write a review <ArrowUpRight className="size-4" aria-hidden="true" />
        </a>
      </div>
      <p className="mx-auto mt-4 max-w-xl text-center text-xs leading-relaxed text-ink-faint">
        Featured reviews are copied from our public Trustpilot profile and link to the originals. Every review, whatever its rating, is visible on Trustpilot.
      </p>
    </div>
  );
}
