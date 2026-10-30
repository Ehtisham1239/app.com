"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccess } from "@/lib/admin/access";
const LINKS = [
  { href: "/admin/parent-portal", label: "Portal overview", perms: ["guardians:read", "progress:read", "results:read", "certificates:read"] },
  { href: "/admin/results/parents", label: "Parent accounts", perms: ["guardians:read"] },
  { href: "/admin/progress", label: "Results & lesson plans", perms: ["progress:read"] },
  { href: "/admin/certificates", label: "Certificates", perms: ["certificates:read"] },
];
export function ParentPortalNav() {
  const path = usePathname();
  const { can } = useAccess();
  return <nav aria-label="Parent portal management" className="scrollbar-thin mb-6 flex gap-2 overflow-x-auto pb-1">
    {LINKS.filter(link => link.perms.some(can)).map(link => <Link key={link.href} href={link.href} aria-current={path === link.href ? "page" : undefined} className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${path === link.href ? "bg-mushaf-900 text-white" : "border border-line bg-white text-ink-soft hover:bg-paper"}`}>{link.label}</Link>)}
  </nav>;
}
