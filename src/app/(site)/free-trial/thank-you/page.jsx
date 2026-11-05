import Link from "next/link";

export const metadata = {
  title: "Trial request received | Online Quran College",
  description: "Your online Quran trial request has been received.",
  robots: { index: false, follow: false },
};

export default async function TrialThankYouPage({ searchParams }) {
  const params = await searchParams;
  const raw = typeof params?.ref === "string" ? params.ref : "";
  const reference = /^TR-[A-Z0-9-]{4,32}$/.test(raw) && raw !== "TR-RECEIVED" ? raw : "";
  return (
    <main className="page-wrap flex min-h-[65vh] max-w-2xl items-center justify-center py-16">
      <section className="surface w-full p-8 text-center shadow-[var(--shadow-lift)] sm:p-10" role="status" aria-live="polite">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-leaf-50 text-leaf-700 ring-1 ring-leaf-100" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" className="size-8" stroke="currentColor" strokeWidth="2"><path d="m5 12 4 4L19 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-leaf-700">JazakAllahu khayran</p>
        <h1 className="mt-2 text-3xl text-mushaf-900">Your trial request has been received</h1>
        <p className="mx-auto mt-4 max-w-lg leading-relaxed text-ink-soft">Our admissions coordinator will contact you by WhatsApp or email to confirm your learning needs, teacher preference and a suitable class time. Your lessons begin only after the schedule is agreed.</p>
        {reference && <p className="mt-5 inline-flex rounded-full bg-gold-50 px-4 py-2 font-mono text-sm font-semibold text-gold-700 ring-1 ring-gold-100">Reference: {reference}</p>}
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/courses" className="btn btn-primary">Explore courses</Link>
          <Link href="/" className="btn btn-outline">Return to homepage</Link>
        </div>
      </section>
    </main>
  );
}
