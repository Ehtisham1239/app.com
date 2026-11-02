"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, CheckCircle2, Loader2, Plus, Send, Star, X } from "@/components/site/icons";
import { REVIEW_LIMITS, reviewFileError, reviewFormErrors, reviewMediaPath } from "@/lib/reviews-button";

const EMPTY = { name: "", email: "", relation: "Parent", rating: 0, comment: "", consent: false, website: "" };

// Bottom-left reviews button on every page (CMS: Settings → Reviews button). It opens
// a review form for parents and students; the chat widget sits bottom-right and, on
// phones, the button stays above the trial/WhatsApp action bar.
export function ReviewsButton({ config, consentText }) {
  const pathname = usePathname();
  const dialogRef = useRef(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);
  if (!config || !(config.everyPage || pathname === "/")) return null;
  if (pathname.startsWith("/admin") || pathname.startsWith("/parents")) return null;

  const trigger = (
    <>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-leaf-700 text-white" aria-hidden="true">
        <Star className="size-[1.1rem] fill-current" />
      </span>
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="truncate text-sm font-semibold text-mushaf-900">{config.label}</span>
        {config.sublabel && <span className="truncate text-xs text-leaf-800">{config.sublabel}</span>}
      </span>
    </>
  );
  const triggerClass = "reviews-trigger fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom))] left-3 z-30 inline-flex min-h-11 max-w-[calc(100vw-7rem)] items-center gap-2.5 rounded-full border border-leaf-100 bg-white/95 py-1.5 pl-1.5 pr-4 text-left shadow-[0_6px_20px_rgb(13_74_28/0.16)] backdrop-blur hover:border-leaf-200 hover:bg-leaf-50 lg:bottom-5 lg:left-5";

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
      <button type="button" data-reviews-button="" className={triggerClass} aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)}>
        {trigger}
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby="review-dialog-title"
        onClose={() => setOpen(false)}
        onClick={(e) => { if (e.target === dialogRef.current) setOpen(false); }}
        className="review-dialog fixed inset-x-0 bottom-0 top-auto m-0 max-h-[92dvh] w-full max-w-none overflow-hidden rounded-t-3xl bg-white p-0 text-ink shadow-[0_-12px_40px_rgb(13_74_28/0.25)] backdrop:bg-mushaf-950/45 sm:inset-x-auto sm:bottom-5 sm:left-5 sm:max-h-[calc(100dvh-2.5rem)] sm:w-[27rem] sm:rounded-3xl"
      >
        {open && <ReviewForm config={config} consentText={consentText} onClose={() => setOpen(false)} />}
      </dialog>
    </>
  );
}

function ReviewForm({ config, consentText, onClose }) {
  const formRef = useRef(null);
  const doneRef = useRef(null);
  const fileRef = useRef(null);
  const [form, setForm] = useState(EMPTY);
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [state, setState] = useState({ sending: false, error: "", done: null });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  useEffect(() => {
    const first = Object.keys(errors)[0];
    if (first) formRef.current?.querySelector(`#rv-${first}`)?.focus();
  }, [errors]);
  useEffect(() => { if (state.done) doneRef.current?.focus(); }, [state.done]);

  function addFiles(list) {
    const picked = [...list];
    const room = REVIEW_LIMITS.maxFiles - files.length;
    const bad = picked.map(reviewFileError).find(Boolean);
    const accepted = picked.filter((file) => !reviewFileError(file)).slice(0, Math.max(room, 0));
    setFiles((current) => [...current, ...accepted]);
    setErrors((e) => {
      const next = { ...e };
      if (bad) next.media = bad;
      else if (picked.length > room) next.media = `You can attach up to ${REVIEW_LIMITS.maxFiles} files.`;
      else delete next.media;
      return next;
    });
    if (fileRef.current) fileRef.current.value = "";
  }

  async function submit(e) {
    e.preventDefault();
    if (state.sending) return;
    const errs = reviewFormErrors(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setState({ sending: true, error: "", done: null });
    try {
      const client = (await import("@/lib/supabase/public")).getPublicBrowserClient();
      const token = crypto.randomUUID();
      const media = [];
      for (const [index, file] of files.entries()) {
        const path = reviewMediaPath(token, index, file);
        const { error } = await client.storage.from("review-media").upload(path, file, { contentType: file.type, upsert: false });
        if (error) throw new Error("A file could not be uploaded. Remove it and try again, or send your review without it.");
        media.push(path);
      }
      const { data, error } = await client.rpc("submit_review", {
        payload: { ...form, email: form.email.trim().toLowerCase(), comment: form.comment.trim(), upload_token: token, media, page_path: window.location.pathname },
      });
      if (error) throw error;
      setState({ sending: false, error: "", done: data?.reference ?? "sent" });
    } catch (cause) {
      setState({ sending: false, error: cause?.message || "Could not send your review. Please try again.", done: null });
    }
  }

  const err = (k) => errors[k] ? <p id={`rv-${k}-error`} className="mt-1.5 text-[0.82rem] font-medium text-rose-600" role="alert">{errors[k]}</p> : null;
  const header = (
    <div className="flex items-start justify-between gap-3 border-b border-leaf-100 px-5 pb-3 pt-4">
      <div>
        <h2 id="review-dialog-title" className="text-[1.35rem] leading-tight text-mushaf-900">Share your review</h2>
        <p className="mt-1 text-[0.82rem] text-ink-soft">For parents and students of Online Quran College.</p>
      </div>
      <button type="button" onClick={onClose} className="-mr-1 flex size-10 shrink-0 items-center justify-center rounded-full text-ink-soft hover:bg-leaf-50" aria-label="Close review form">
        <X className="size-5" />
      </button>
    </div>
  );

  if (state.done) {
    return (
      <div className="flex max-h-[inherit] flex-col">
        {header}
        <div className="overflow-y-auto px-5 py-8 text-center" role="status">
          <CheckCircle2 className="mx-auto size-12 text-leaf-600" />
          <h3 ref={doneRef} tabIndex={-1} className="mt-3 text-[1.4rem] text-mushaf-900">JazakAllah khair!</h3>
          <p className="mx-auto mt-2 max-w-xs text-[0.92rem] text-ink-soft">Your review has reached our team. We read every review before anything is shared.</p>
          {state.done !== "REV-RECEIVED" && state.done !== "sent" && (
            <p className="mt-4 inline-flex rounded-full bg-gold-50 px-4 py-1.5 font-mono text-sm font-semibold text-gold-700 ring-1 ring-gold-100">Reference: {state.done}</p>
          )}
          {config.href && (
            <a href={config.href} target="_blank" rel="noopener noreferrer" className="btn btn-outline mt-5 w-full justify-center">
              Also review us on Trustpilot <ArrowUpRight className="size-4" />
            </a>
          )}
          <button type="button" className="btn btn-primary mt-3 w-full justify-center" onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={submit} noValidate aria-busy={state.sending} className="flex max-h-[inherit] flex-col">
      {header}
      <div className="space-y-4 overflow-y-auto overscroll-contain px-5 py-4">
        <div className="absolute -left-[9999px]" aria-hidden="true">
          <input tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => set("website", e.target.value)} />
        </div>
        <fieldset>
          <legend className="field-label">Your rating</legend>
          <div id="rv-rating" tabIndex={-1} className="flex gap-1" role="radiogroup" aria-describedby={errors.rating ? "rv-rating-error" : undefined}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" role="radio" aria-checked={form.rating === n} aria-label={`${n} star${n > 1 ? "s" : ""}`} onClick={() => set("rating", n)}
                className="flex size-11 items-center justify-center rounded-xl hover:bg-gold-50">
                <Star className={`size-7 ${n <= form.rating ? "fill-current text-gold-500" : "text-ink-faint"}`} />
              </button>
            ))}
          </div>
          {err("rating")}
        </fieldset>
        <div>
          <label htmlFor="rv-comment" className="field-label">Your comment <span className="font-normal text-rose-600">(required)</span></label>
          <textarea id="rv-comment" className="textarea" rows={4} maxLength={REVIEW_LIMITS.maxComment} value={form.comment} onChange={(e) => set("comment", e.target.value)}
            placeholder="How are the classes going? What has your child or you learned?" required aria-invalid={Boolean(errors.comment)} aria-describedby={`rv-comment-count${errors.comment ? " rv-comment-error" : ""}`} />
          <p id="rv-comment-count" className="mt-1 text-right text-xs text-ink-faint">{form.comment.trim().length}/{REVIEW_LIMITS.maxComment}</p>
          {err("comment")}
        </div>
        <div>
          <span className="field-label">Photos or video <span className="font-normal text-ink-faint">(optional, up to {REVIEW_LIMITS.maxFiles}, 20 MB each)</span></span>
          {files.length > 0 && (
            <ul className="mb-2 space-y-1.5">
              {files.map((file, i) => (
                <li key={`${file.name}-${i}`} className="flex items-center justify-between gap-2 rounded-xl bg-leaf-50 px-3 py-2 text-sm">
                  <span className="min-w-0 truncate">{file.name}</span>
                  <button type="button" className="flex size-8 shrink-0 items-center justify-center rounded-full hover:bg-white" aria-label={`Remove ${file.name}`} onClick={() => setFiles((list) => list.filter((_, j) => j !== i))}>
                    <X className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {files.length < REVIEW_LIMITS.maxFiles && (
            <button id="rv-media" type="button" className="btn btn-outline min-h-11 w-full justify-center" onClick={() => fileRef.current?.click()} aria-describedby="rv-media-note">
              <Plus className="size-4" /> Add photo or video
            </button>
          )}
          <input ref={fileRef} type="file" className="hidden" multiple tabIndex={-1} aria-hidden="true" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,video/mp4,video/quicktime,video/webm"
            onChange={(e) => addFiles(e.target.files || [])} />
          <p id="rv-media-note" className="mt-1.5 text-xs leading-relaxed text-ink-soft">Only our team sees attached files. We never publish photos or videos without your written permission — please avoid showing children’s faces.</p>
          {err("media")}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="rv-name" className="field-label">Your name</label>
            <input id="rv-name" className="input" value={form.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" maxLength={80} required aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "rv-name-error" : undefined} />
            {err("name")}
          </div>
          <div>
            <label htmlFor="rv-relation" className="field-label">I am a</label>
            <select id="rv-relation" className="select" value={form.relation} onChange={(e) => set("relation", e.target.value)}>
              <option value="Parent">Parent</option>
              <option value="Student">Student</option>
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="rv-email" className="field-label">Email <span className="font-normal text-ink-faint">(not published)</span></label>
          <input id="rv-email" type="email" className="input" value={form.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" maxLength={254} required aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "rv-email-error" : undefined} />
          {err("email")}
        </div>
        <label className="flex gap-3 text-[0.86rem] leading-relaxed text-ink">
          <input id="rv-consent" type="checkbox" className="check mt-0.5 shrink-0" checked={form.consent} onChange={(e) => set("consent", e.target.checked)} required aria-invalid={Boolean(errors.consent)} aria-describedby={errors.consent ? "rv-consent-error" : undefined} />
          <span>{consentText || "I agree that Online Quran College may store my review and contact me about it."} <Link href="/privacy-policy" target="_blank" className="font-semibold text-leaf-700 underline underline-offset-2">Privacy policy</Link></span>
        </label>
        {err("consent")}
        {state.error && <p className="rounded-xl bg-rose-600/10 px-4 py-3 text-[0.9rem] font-medium text-rose-600" role="alert">{state.error}</p>}
      </div>
      <div className="space-y-2 border-t border-leaf-100 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
        <button type="submit" className="btn btn-primary min-h-11 w-full justify-center" disabled={state.sending}>
          {state.sending ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-5" />}
          {state.sending ? (files.length ? "Uploading and sending…" : "Sending…") : "Send review"}
        </button>
        {config.href && (
          <a href={config.href} target="_blank" rel="noopener noreferrer" className="flex min-h-10 items-center justify-center gap-1 text-sm font-semibold text-leaf-700 underline-offset-2 hover:underline">
            Prefer Trustpilot? Review us there <ArrowUpRight className="size-4" />
          </a>
        )}
      </div>
    </form>
  );
}
