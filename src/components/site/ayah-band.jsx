import { ayahForDate } from "@/lib/ayat";

// Eight-point star (khatam) used as a floating ornament; decorative only.
function Khatam({ className }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M24 3 30 18 45 24 30 30 24 45 18 30 3 24 18 18Z" />
        <rect x="10.5" y="10.5" width="27" height="27" transform="rotate(45 24 24)" />
        <circle cx="24" cy="24" r="4.5" />
      </g>
    </svg>
  );
}

// Site-wide verse band above the footer. Server-rendered, no client script: the colour change
// is two stacked copies of the text cross-fading (opacity only), the ornaments float with
// transform only, and every animation stops for prefers-reduced-motion.
export function AyahBand({ date }) {
  const ayah = ayahForDate(date);
  return (
    <section className="ayah-band" aria-labelledby="ayah-band-title">
      <div className="ayah-frame page-wrap">
        <Khatam className="ayah-star ayah-star-start" />
        <Khatam className="ayah-star ayah-star-end" />
        <h2 id="ayah-band-title" className="ayah-kicker">From the Qur’an</h2>
        <figure className="ayah-figure">
          <blockquote>
            <p lang="ar" dir="rtl" className="ayah-ar">
              <span className="ayah-ink">{ayah.ar}</span>
              <span className="ayah-glow" aria-hidden="true">{ayah.ar}</span>
            </p>
          </blockquote>
          <figcaption className="ayah-meaning">
            <span>“{ayah.en}”</span>{" "}
            <cite className="ayah-ref">Qur’an {ayah.ref}{ayah.part ? " (part)" : ""}</cite>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
