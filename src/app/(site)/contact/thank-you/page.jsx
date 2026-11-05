import Link from "next/link";

export const metadata = {
  title: "Message received | Online Quran College",
  description: "Your message to Online Quran College has been received.",
  robots: { index: false, follow: false },
};

export default async function ContactThankYouPage({ searchParams }) {
  const params = await searchParams;
  const raw = typeof params?.ref === "string" ? params.ref : "";
  const reference = /^MSG-[A-Z0-9-]{4,32}$/.test(raw) && raw !== "MSG-RECEIVED" ? raw : "";
  return (
    <main className="page-wrap flex min-h-[65vh] max-w-2xl items-center justify-center py-16">
      <section className="surface w-full p-8 text-center shadow-[var(--shadow-lift)] sm:p-10" role="status" aria-live="polite">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-leaf-50 text-leaf-700 ring-1 ring-leaf-100" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" className="size-8" stroke="currentColor" strokeWidth="2"><path d="m5 12 4 4L19 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-leaf-700">Thank you for contacting us</p>
        <h1 className="mt-2 text-3xl text-mushaf-900">Your message has been received</h1>
        <p className="mx-auto mt-4 max-w-lg leading-relaxed text-ink-soft">A member of our team will review your enquiry and reply using the contact details you provided. If your question is about starting classes, you can also explore our learning paths.</p>
        {reference && <p className="mt-5 inline-flex rounded-full bg-gold-50 px-4 py-2 font-mono text-sm font-semibold text-gold-700 ring-1 ring-gold-100">Reference: {reference}</p>}
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/courses" className="btn btn-primary">Explore courses</Link>
          <Link href="/" className="btn btn-outline">Return to homepage</Link>
        </div>
      </section>
    </main>
  );
}
