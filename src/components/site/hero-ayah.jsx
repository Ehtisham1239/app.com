import { heroAyahFor } from "@/lib/hero-ayat";

// A short verse in each page hero (19 Nov 2026). Server-rendered, no script; the colour layer
// is aria-hidden and the hover/loop effects are opacity and transform only.
export function HeroAyah({ path }) {
  const ayah = heroAyahFor(path);
  return (
    <figure className="hero-ayah">
      <blockquote>
        <p lang="ar" dir="rtl" className="hero-ayah-ar">
          <span className="hero-ayah-ink">{ayah.ar}</span>
          <span className="hero-ayah-glow" aria-hidden="true">{ayah.ar}</span>
        </p>
      </blockquote>
      <figcaption className="hero-ayah-meaning">“{ayah.en}” <cite>Qur’an {ayah.ref}{ayah.part ? " (part)" : ""}</cite></figcaption>
    </figure>
  );
}
