"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";

const HIDDEN_ON = ["/contact", "/free-trial"];

export function ContactSupportButton() {
  const pathname = usePathname();
  if (HIDDEN_ON.some((path) => pathname === path || pathname.startsWith(`${path}/`))) return null;
  return (
    <aside
      className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-[calc(1rem+env(safe-area-inset-right))] z-50"
      aria-label="Contact support"
    >
      <Link
        href="/contact"
        className="inline-flex min-h-12 max-w-[calc(100vw-2rem)] items-center gap-2 rounded-full border border-[#C5A04A] bg-[#0B4935] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#0B4935]/20 transition duration-200 hover:-translate-y-1 hover:bg-[#C5A04A] hover:text-[#192820] hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A04A] focus-visible:ring-offset-2"
      >
        <MessageCircle size={17} aria-hidden="true" />
        <span>Contact Support</span>
      </Link>
    </aside>
  );
}
