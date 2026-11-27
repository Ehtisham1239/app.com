import { ArrowUpRight } from "@/components/site/icons";
import { organizationIdentityProfiles } from "@/lib/seo";

const OFFICIAL_LABELS = {
  "www.facebook.com": "Facebook",
  "www.instagram.com": "Instagram",
  "x.com": "X (Twitter)",
  "www.trustpilot.com": "Trustpilot",
};

export function OfficialProfileLinks({ social }) {
  const profiles = organizationIdentityProfiles(social);
  if (!profiles.length) return null;

  return (
    <nav aria-label="Official Online Quran College profiles" className="flex flex-wrap gap-2">
      {profiles.map((url) => (
        <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-line bg-white px-3 py-2 text-sm font-semibold text-mushaf-900 transition-colors hover:border-leaf-300 hover:bg-leaf-100">
          {OFFICIAL_LABELS[new URL(url).hostname]}
          <ArrowUpRight className="size-3.5" aria-hidden="true" />
        </a>
      ))}
    </nav>
  );
}
