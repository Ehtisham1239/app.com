import Link from "next/link";

// Overrides the root layout's index/follow robots so a 404 sends one consistent signal.
export const metadata = { title: "Page not found", robots: { index: false, follow: true, googleBot: { index: false, follow: true } } };

export default function NotFound() {
  return (
    <main className="relative flex min-h-[80vh] items-center overflow-hidden bg-mushaf-950 text-white">
      <div className="pattern-girih pointer-events-none absolute inset-0 opacity-[0.08]" aria-hidden="true" />
      <div className="page-wrap relative max-w-2xl py-20 text-center">
        <span className="brand-mark mx-auto block size-28 text-gold-400 opacity-90" aria-hidden="true" />
        <p className="mt-8 text-xs font-bold uppercase tracking-[0.22em] text-gold-300">404</p>
        <h1 className="mt-3 text-[2.6rem] text-white">This page could not be found</h1>
        <p className="mt-4 text-white/70">The link may be old or the page may have moved. Let us take you somewhere useful.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn btn-gold">Go to the home page</Link>
          <Link href="/courses" className="btn btn-outline-light">Browse courses</Link>
        </div>
      </div>
    </main>
  );
}
