export function locationImage(country, city) {
  const name = `map-${country.slug}${city ? `-${city.slug}` : ""}`;
  return { url: `/images/learning/${name}-1200.webp`, alt: `Branded regional map for online Quran learning in ${city ? city.name + ", " : ""}${country.name}, with local class scheduling` };
}
