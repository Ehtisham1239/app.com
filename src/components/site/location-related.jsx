import Link from "next/link";
import { relatedLocationLinks } from "@/lib/locations";

export function LocationRelated({ country, city }) {
  const links = relatedLocationLinks(country, city);
  if (!links.length) return null;
  return <nav aria-labelledby="related-places" className="surface p-6">
    <h2 id="related-places" className="text-xl">Other places with online Quran lesson guides</h2>
    <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">{links.map((l) => <li key={l.path}><Link className="inline-flex min-h-11 items-center text-leaf-700 underline underline-offset-4" href={l.path}>{l.name}</Link></li>)}</ul>
  </nav>;
}
