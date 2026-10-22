import { writeFileSync } from "node:fs";
import { LOCATIONS, locationPath, locationCmsSlug } from "../src/lib/locations.js";
const sql = (value) => `'${value.replaceAll("'", "''")}'`;
const rows = LOCATIONS.flatMap((country) => [null, ...country.cities].map((city) => {
  const place = city ? `${city.name}, ${country.name}` : country.name;
  const title = `Online Quran classes in ${place}`;
  const excerpt = `Learn Quran, Tajweed, Hifz and Arabic online in ${place}. Choose one-to-one classes for children and adults with flexible timings.`;
  const body = `<h2>Quran learning from home in ${place}</h2><p>Tell our coordinator your city and preferred local class time. We will help arrange a teacher and an online trial suitable for your family.</p><p>Request approved fees in ${country.currency} before enrolling. Classes take place online; this location page does not represent a physical branch.</p>`;
  return `(${[locationCmsSlug(country, city), title, excerpt, body, locationPath(country, city)].map(sql).join(", ")}, 'published', now())`;
}));
writeFileSync(new URL("../supabase/migrations/20261022000200_location_content.sql", import.meta.url), `-- Editable in CMS Portal > Pages. Existing content is preserved.\ninsert into public.pages (slug, title, excerpt, body_html, canonical_url, status, published_at) values\n${rows.join(",\n")}\non conflict (slug, locale) do nothing;\n`);
