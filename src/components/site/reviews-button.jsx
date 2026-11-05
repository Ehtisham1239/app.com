"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Loader2, MessageCircle } from "@/components/site/icons";

// The form lives in its own chunk: fetched on first intent and reused afterwards.
let formChunk = null;
const loadForm = () => (formChunk ??= import("@/components/site/review-form").then((m) => m.ReviewForm));

// Bottom-left reviews button on every page (CMS: Settings → Reviews button). It opens
// the review form centred on screen (a bottom sheet on phones) for parents and students; the chat widget sits bottom-right and,
// on phones, the button stays above the trial/WhatsApp action bar. Only this small trigger
// ships with each page; the dialog content is not in the page HTML until first opened.
export function ReviewsButton({ config, consentText }) {
  const pathname = usePathname();
  const dialogRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false);
  const [Form, setForm] = useState(null);
  const [loadError, setLoadError] = useState(false);
  useEffect(() => {
    const update = () => setShown(window.scrollY > window.innerHeight * 0.8);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
    // Keep the page behind the form still while it is open.
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => { document.documentElement.style.overflow = ""; };
  }, [open]);
  if (!config || !(config.everyPage || pathname === "/")) return null;
  if (pathname.startsWith("/admin") || pathname.startsWith("/parents") || pathname === "/reviews") return null;
  // Keep conversion forms unobstructed on small screens; those pages already expose direct support actions.
  if (pathname === "/contact" || pathname.startsWith("/contact/") || pathname === "/free-trial" || pathname.startsWith("/free-trial/")) return null;
  if (!shown) return null;

  const prefetch = () => { loadForm().catch(() => {}); };
  const openForm = () => {
    setOpen(true);
    if (Form) return;
    setLoadError(false);
    loadForm().then((component) => setForm(() => component)).catch(() => { formChunk = null; setLoadError(true); });
  };

  const trigger = (
    <>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-mushaf-900 text-gold-300" aria-hidden="true">
        <MessageCircle className="size-[1.1rem]" />
      </span>
      {/* Phones: icon only, so it does not cover content next to the action bar; the text stays for screen readers. */}
      <span className="flex min-w-0 flex-col leading-tight max-lg:sr-only">
        <span className="truncate text-sm font-semibold text-mushaf-900">{config.label}</span>
        {config.sublabel && <span className="truncate text-xs text-leaf-800">{config.sublabel}</span>}
      </span>
    </>
  );
  const triggerClass = "reviews-trigger fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom))] left-3 z-30 inline-flex min-h-11 max-w-[calc(100vw-7rem)] items-center gap-2.5 rounded-full border border-gold-100 bg-white/95 py-1.5 pl-1.5 pr-1.5 text-left lg:pr-4 shadow-[0_6px_20px_rgb(13_74_28/0.16)] backdrop-blur hover:border-gold-300 hover:bg-gold-50 lg:bottom-5 lg:left-5";

  if (!config.openForm) {
    return (
      <a href={config.href} target="_blank" rel="noopener noreferrer" data-reviews-button="" className={triggerClass}
        aria-label={`${config.label}${config.sublabel ? ` — ${config.sublabel}` : ""} (opens Trustpilot in a new tab)`}>
        {trigger}
      </a>
    );
  }

  return (
    <>
      <button type="button" data-reviews-button="" className={triggerClass} aria-haspopup="dialog" aria-expanded={open}
        onClick={openForm} onPointerEnter={prefetch} onFocus={prefetch} onTouchStart={prefetch}>
        {trigger}
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby="review-dialog-title"
        onClose={() => setOpen(false)}
        onClick={(e) => { if (e.target === dialogRef.current) setOpen(false); }}
        className="review-dialog fixed inset-x-0 bottom-0 top-auto m-0 max-h-[94dvh] w-full max-w-none overflow-hidden rounded-t-[1.75rem] bg-white p-0 text-ink shadow-[0_-12px_40px_rgb(13_74_28/0.25)] sm:inset-0 sm:m-auto sm:h-fit sm:max-h-[min(90dvh,48rem)] sm:w-[min(32rem,calc(100vw-2rem))] sm:rounded-[1.75rem] sm:shadow-[0_24px_70px_rgb(13_74_28/0.35)]"
      >
        {/* Mounted on first opening, then kept so a half-written review survives closing. */}
        {Form ? (
          <Form open={open} config={config} consentText={consentText} onClose={() => setOpen(false)} />
        ) : open ? (
          <div className="flex min-h-48 flex-col items-center justify-center gap-3 p-8 text-center" role="status">
            <h2 id="review-dialog-title" className="sr-only">Share your review</h2>
            {loadError ? (
              <>
                <p className="text-sm text-ink-soft">The review form did not load. Check your connection and try again.</p>
                <button type="button" className="btn btn-primary min-h-11" onClick={openForm}>Try again</button>
                <button type="button" className="btn btn-ghost min-h-11" onClick={() => setOpen(false)}>Close</button>
              </>
            ) : (
              <><Loader2 className="size-7 animate-spin text-leaf-700" /><span className="text-sm text-ink-soft">Opening the review form…</span></>
            )}
          </div>
        ) : null}
      </dialog>
    </>
  );
}
