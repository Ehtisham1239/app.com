import seed from "@/lib/seed-content.json";
// Read-only content from the uploaded SQL seeds. Used before the new schema is installed.
// Successful live queries always take priority, including unpublished/deleted content.
export function seedFallback(label, fallback) {
  if (label.startsWith("slugs ")) return (seed[label.slice(6)] || []).map(({ slug, updated_at, seo_noindex, canonical_url, cover_url }) => ({ slug, updated_at, seo_noindex, canonical_url, cover_url }));
  for (const [prefix, collection] of [["course ", "courses"], ["teacher ", "teachers"], ["post ", "posts"], ["page ", "pages"]]) {
    if (label.startsWith(prefix)) return seed[collection].find((row) => row.slug === label.slice(prefix.length)) || fallback;
  }
  if (label === "plans") return seed.plans.map((p) => ({ ...p, pricing_plan_prices: p.prices }));
  return seed[label] ?? fallback;
}
