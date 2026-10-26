import manifest from "./image-manifest.json";

export function locationImage(country, city) {
  const name = `map-${country.slug}${city ? `-${city.slug}` : ""}`;
  const asset = manifest.find(image => image.name === name);
  return asset || { url: "/images/learning/oqc-learning-united-states-v3-1200.webp", alt: "A family joining an online Quran lesson from a calm home study" };
}
