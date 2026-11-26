"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

// One consistent "keep exploring" strip so every public page links to the other key pages
// (26 Nov 2026). It leaves out the page you are already on and the thank-you pages.
const LINKS = [
  { href: "/courses", title: "Quran courses", text: "Qaida, Tajweed, Hifz and more." },
  { href: "/pricing", title: "Fees and plans", text: "Clear monthly prices." },
  { href: "/free-trial", title: "Free 3-day trial", text: "Live one-to-one, no card needed." },
  { href: "/faq", title: "Questions answered", text: "How online lessons work." },
  { href: "/locations", title: "Areas we teach", text: "Classes online for every country." },
  { href: "/locations/united-states", title: "Online Quran classes in the USA", text: "US time zones, state guides and admissions." },
  { href: "/blog", title: "Learning guides", text: "Articles for parents and learners." },
  { href: "/about", title: "About the college", text: "Our teachers and approach." },
  { href: "/contact", title: "Contact admissions", text: "Talk to a coordinator." },
];

export function ExploreLinks() {
  const path = (usePathname() || "/").replace(/\/$/, "") || "/";
  if (/thank-you|\/trial-video|\/verify-certificate/.test(path)) return null;
  const items = LINKS.filter(({ href }) => path !== href).slice(0, 8);
  return (
    <nav aria-labelledby="explore-links-title" className="page-wrap explore-links">
      <h2 id="explore-links-title" className="text-2xl">Keep exploring</h2>
      <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ href, title, text }, i) => (
          <li key={href}>
            <Link href={href} prefetch={false} className="card-tinted explore-card block h-full rounded-2xl border p-5" data-card-tone={(i % 5) + 1}>
              <span className="block text-lg font-semibold" style={{ color: "var(--card-ink)" }}>{title}</span>
              <span className="mt-1 block text-sm text-ink-soft">{text}</span>
              <span aria-hidden="true" className="explore-arrow mt-3 inline-block font-semibold" style={{ color: "var(--card-edge)" }}>→</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
