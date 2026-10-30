import Link from "next/link";

// The parent portal shows children's results, so it is kept apart from the public
// site chrome: no chat widget, analytics or third-party scripts, never cached.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Parent portal",
  description: "Parents of Online Quran College students can see published results and issued certificates.",
  robots: { index: false, follow: false },
};

export default function ParentsLayout({ children }) {
  return (
    <div className="parent-portal flex min-h-dvh flex-col bg-paper">
      <header className="border-b border-line bg-white">
        <div className="page-wrap flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/brand/logo.webp" alt="" width={40} height={40} className="size-10" />
            <span className="leading-tight">
              <span className="block font-display text-[1.02rem] text-mushaf-900">Online Quran College</span>
              <span className="block text-[0.66rem] font-bold uppercase tracking-[0.2em] text-gold-600">Parent portal</span>
            </span>
          </Link>
          <Link href="/contact" className="text-sm font-semibold text-leaf-700 hover:underline">Need help?</Link>
        </div>
      </header>
      <main id="main" className="flex-1">{children}</main>
      <footer className="border-t border-line bg-white py-5 text-center text-xs text-ink-faint">
        © Online Quran College · Results are shown for the parent’s information only. · <Link href="/privacy-policy" className="hover:text-leaf-700">Privacy</Link>
      </footer>
    </div>
  );
}
