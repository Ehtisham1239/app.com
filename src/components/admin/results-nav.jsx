"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { useAccess } from "@/lib/admin/access";

const LINKS = [
  { href: "/admin/progress", label: "Monthly reports", perm: "progress:read" },
  { href: "/admin/progress/form", label: "Teacher form", perm: ["progress:submit", "progress:review"] },
  { href: "/admin/results", label: "Assessments", perm: ["results:read", "certificates:read"] },
  { href: "/admin/results/import", label: "Upload results", perm: ["results:create", "certificates:create"] },
  { href: "/admin/results/published", label: "Published results", perm: ["results:read", "certificates:read"] },
  { href: "/admin/parent-portal", label: "Parent portal", perm: ["guardians:read", "progress:read", "results:read", "certificates:read"] },
];

// Sub-navigation shared by every Results screen.
export function ResultsNav() {
  const path = usePathname();
  const { can } = useAccess();
  return (
    <nav className="scrollbar-thin -mx-1 mb-6 flex gap-1 overflow-x-auto px-1 pb-1" aria-label="Results">
      {LINKS.filter((l) => [].concat(l.perm).some(can)).map((l) => {
        const active = l.href === "/admin/results" ? path === l.href || path.startsWith("/admin/results/batches") : path.startsWith(l.href);
        return (
          <Link key={l.href} href={l.href} aria-current={active ? "page" : undefined}
            className={clsx("inline-flex shrink-0 items-center rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors", active ? "bg-mushaf-900 text-white" : "text-ink-soft hover:bg-white hover:text-ink")}>
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
