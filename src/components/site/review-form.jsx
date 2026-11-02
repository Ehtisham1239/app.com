"use client";
// Review form, loaded only when a visitor shows intent to open it (hover, focus,
// touch or click on the reviews button), so pages do not ship this code up front.
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowUpRight, CheckCircle2, ChevronDown, Loader2, Plus, Send, Star, Video, X } from "@/components/site/icons";
import { REVIEW_LIMITS, reviewFileError, reviewFormErrors, reviewMediaPath } from "@/lib/reviews-button";

const EMPTY = { name: "", email: "", relation: "Parent", rating: 0, comment: "", consent: false, website: "" };
const RATING_WORDS = ["Tap a star", "Poor", "Fair", "Good", "Very good", "Excellent"];
// Fields checked on each step; a step only moves on when its own fields are valid.
const STEP_FIELDS = [["rating", "comment", "media"], ["name", "email", "consent"]];

function StarRating({ value, onChange, invalid }) {
  const refs = useRef([]);
  const move = (next) => { const n = Math.min(5, Math.max(1, next)); onChange(n); refs.current[n - 1]?.focus(); };
  return (
    <div className="review-rating text-center">
      <div id="rv-rating" role="radiogroup" aria-label="Your rating" aria-describedby={`rv-rating-word${invalid ? " rv-rating-error" : ""}`} className="inline-flex gap-1"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" || e.key === "ArrowUp") { e.preventDefault(); move((value || 0) + 1); }
          if (e.key === "ArrowLeft" || e.key === "ArrowDown") { e.preventDefault(); move((value || 2) - 1); }
        }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} ref={(el) => { refs.current[n - 1] = el; }} type="button" role="radio" aria-checked={value === n} aria-label={`${n} star${n > 1 ? "s" : ""}, ${RATING_WORDS[n]}`}
            tabIndex={value ? (value === n ? 0 : -1) : (n === 1 ? 0 : -1)} onClick={() => onChange(n)}
            className="review-star flex size-12 items-center justify-center rounded-2xl" data-filled={n <= value}>
            <Star className="size-9" />
          </button>
        ))}
      </div>
      <p id="rv-rating-word" aria-live="polite" className={`mt-1 text-[0.95rem] font-semibold ${value ? "text-gold-700" : "text-ink-faint"}`}>{RATING_WORDS[value || 0]}</p>
    </div>
  );
}

function MediaPicker({ files, setFiles, error, setError }) {
  const inputRef = useRef(null);
  const [previews, setPreviews] = useState([]);
  const [dragging, setDragging] = useState(false);
  useEffect(() => {
    const urls = files.map((file) => (file.type.startsWith("image/") ? URL.createObjectURL(file) : null));
    setPreviews(urls);
    return () => urls.forEach((url) => url && URL.revokeObjectURL(url));
  }, [files]);

  function add(list) {
    const picked = [...list];
    const room = REVIEW_LIMITS.maxFiles - files.length;
    const bad = picked.map(reviewFileError).find(Boolean);
    const accepted = picked.filter((file) => !reviewFileError(file)).slice(0, Math.max(room, 0));
    if (accepted.length) setFiles((current) => [...current, ...accepted]);
    setError(bad || (picked.length > room ? `You can attach up to ${REVIEW_LIMITS.maxFiles} files.` : ""));
    if (inputRef.current) inputRef.current.value = "";
  }
  const size = (bytes) => (bytes >= 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);

  return (
    <div>
      <p className="field-label">Photos or a short video <span className="font-normal text-ink-faint">(optional)</span></p>
      {files.length > 0 && (
        <ul className="mb-2 grid grid-cols-3 gap-2" aria-label="Attached files">
          {files.map((file, i) => (
            <li key={`${file.name}-${file.size}-${i}`} className="relative overflow-hidden rounded-2xl border border-leaf-100 bg-leaf-50">
              <div className="aspect-square">
                {previews[i]
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={previews[i]} alt="" className="size-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                  : <span className="flex size-full items-center justify-center text-leaf-700"><Video className="size-7" /></span>}
              </div>
              <p className="truncate px-2 py-1 text-[0.7rem] text-ink-soft">{size(file.size)}</p>
              <button type="button" onClick={() => { setFiles((list) => list.filter((_, j) => j !== i)); setError(""); }} aria-label={`Remove ${file.name}`}
                className="absolute right-1 top-1 flex size-8 items-center justify-center rounded-full bg-white/90 text-ink shadow-sm hover:bg-white">
                <X className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {files.length < REVIEW_LIMITS.maxFiles && (
        <button id="rv-media" type="button" onClick={() => inputRef.current?.click()} aria-describedby="rv-media-note"
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); add(e.dataTransfer?.files || []); }}
          className={`flex min-h-[4.5rem] w-full flex-col items-center justify-center gap-0.5 rounded-2xl border-2 border-dashed px-4 py-3 text-center ${dragging ? "border-leaf-600 bg-leaf-50" : "border-leaf-200 hover:border-leaf-500 hover:bg-leaf-50"}`}>
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-leaf-700"><Plus className="size-4" /> Add photo or video</span>
          <span className="text-xs text-ink-faint">Up to {REVIEW_LIMITS.maxFiles - files.length} more, 20 MB each</span>
        </button>
      )}
      <input ref={inputRef} type="file" className="hidden" multiple tabIndex={-1} aria-hidden="true" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,video/mp4,video/quicktime,video/webm" onChange={(e) => add(e.target.files || [])} />
      <p id="rv-media-note" className="mt-1.5 text-xs leading-relaxed text-ink-soft">Only our team sees attachments. We never publish photos or videos without your written permission — please avoid showing children’s faces.</p>
      {error && <p id="rv-media-error" className="mt-1.5 text-[0.82rem] font-medium text-rose-600" role="alert">{error}</p>}
    </div>
  );
}

export function ReviewForm({ open, config, consentText, onClose }) {
  const formRef = useRef(null);
  const doneRef = useRef(null);
  const [form, setForm] = useState(EMPTY);
  const [files, setFiles] = useState([]);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [mediaError, setMediaError] = useState("");
  const [state, setState] = useState({ sending: false, progress: "", error: "", done: null });
  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => { if (!e[k]) return e; const next = { ...e }; delete next[k]; return next; }); };

  useEffect(() => {
    const first = Object.keys(errors)[0];
    if (first) formRef.current?.querySelector(first === "rating" ? "#rv-rating [tabindex='0']" : `#rv-${first}`)?.focus();
  }, [errors]);
  useEffect(() => { if (state.done) doneRef.current?.focus(); }, [state.done]);
  // After a review has been sent, the next opening starts a fresh form.
  useEffect(() => {
    if (!open && state.done) { setForm(EMPTY); setFiles([]); setStep(0); setErrors({}); setState({ sending: false, progress: "", error: "", done: null }); }
  }, [open, state.done]);

  const stepErrors = (n) => Object.fromEntries(Object.entries(reviewFormErrors(form)).filter(([k]) => STEP_FIELDS[n].includes(k)));
  function next() {
    const errs = stepErrors(0);
    setErrors(errs);
    if (!Object.keys(errs).length) setStep(1);
  }

  async function submit(e) {
    e.preventDefault();
    if (state.sending) return;
    if (step === 0) return next();
    const first = stepErrors(0);
    if (Object.keys(first).length) { setStep(0); setErrors(first); return; }
    const errs = stepErrors(1);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setState({ sending: true, progress: files.length ? `Uploading 1 of ${files.length}…` : "Sending…", error: "", done: null });
    try {
      const client = (await import("@/lib/supabase/public")).getPublicBrowserClient();
      const token = crypto.randomUUID();
      const media = [];
      for (const [index, file] of files.entries()) {
        setState((s) => ({ ...s, progress: `Uploading ${index + 1} of ${files.length}…` }));
        const path = reviewMediaPath(token, index, file);
        const { error } = await client.storage.from("review-media").upload(path, file, { contentType: file.type, upsert: false });
        if (error) throw new Error(`“${file.name}” could not be uploaded. Remove it and send again, or send your review without it.`);
        media.push(path);
      }
      setState((s) => ({ ...s, progress: "Sending…" }));
      const { data, error } = await client.rpc("submit_review", {
        payload: { ...form, email: form.email.trim().toLowerCase(), comment: form.comment.trim(), upload_token: token, media, page_path: window.location.pathname },
      });
      if (error) throw error;
      setState({ sending: false, progress: "", error: "", done: data?.reference ?? "sent" });
    } catch (cause) {
      setState({ sending: false, progress: "", error: cause?.message || "Your review was not sent. Check your connection and send again.", done: null });
    }
  }

  const err = (k) => errors[k] ? <p id={`rv-${k}-error`} className="mt-1.5 text-[0.82rem] font-medium text-rose-600" role="alert">{errors[k]}</p> : null;
  const firstName = form.name.trim().split(/\s+/)[0];
  const trustpilot = config.href && (
    <a href={config.href} target="_blank" rel="noopener noreferrer" className="flex min-h-10 items-center justify-center gap-1 text-sm font-semibold text-leaf-700 underline-offset-2 hover:underline">
      Prefer Trustpilot? Review us there <ArrowUpRight className="size-4" />
    </a>
  );
  const header = (
    <div className="border-b border-leaf-100 px-5 pb-3 pt-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id="review-dialog-title" className="text-[1.4rem] leading-tight text-mushaf-900">{state.done ? "Review received" : "Share your review"}</h2>
          {!state.done && <p className="mt-1 text-[0.82rem] text-ink-soft">{step === 0 ? "Step 1 of 2: about the classes" : "Step 2 of 2: about you"}</p>}
        </div>
        <button type="button" onClick={onClose} className="-mr-1 flex size-10 shrink-0 items-center justify-center rounded-full text-ink-soft hover:bg-leaf-50" aria-label="Close review form">
          <X className="size-5" />
        </button>
      </div>
      {!state.done && <div className="mt-3 h-1 overflow-hidden rounded-full bg-leaf-100" aria-hidden="true"><div className="h-full rounded-full bg-leaf-700 transition-[width] duration-300" style={{ width: step === 0 ? "50%" : "100%" }} /></div>}
    </div>
  );

  if (state.done) {
    return (
      <div className="flex max-h-[inherit] flex-col">
        {header}
        <div className="overflow-y-auto px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-7 text-center" role="status">
          <CheckCircle2 className="mx-auto size-14 text-leaf-600" />
          <h3 ref={doneRef} tabIndex={-1} className="mt-3 text-[1.5rem] text-mushaf-900">JazakAllah khair{firstName ? `, ${firstName}` : ""}</h3>
          <p className="mt-2 flex justify-center gap-0.5 text-gold-500" aria-label={`You rated ${form.rating} out of 5`}>
            {[1, 2, 3, 4, 5].map((n) => <Star key={n} className={`size-5 ${n <= form.rating ? "fill-current" : "opacity-30"}`} />)}
          </p>
          <p className="mx-auto mt-3 max-w-xs text-[0.92rem] leading-relaxed text-ink-soft">Our team reads every review. Nothing is published without your permission.</p>
          {state.done !== "REV-RECEIVED" && state.done !== "sent" && (
            <p className="mt-4 inline-flex rounded-full bg-gold-50 px-4 py-1.5 font-mono text-sm font-semibold text-gold-700 ring-1 ring-gold-100">Reference {state.done}</p>
          )}
          {/* Offered to every reviewer whatever their rating: inviting only happy reviewers
              ("review gating") breaks Google and Trustpilot rules. */}
          {(config.googleHref || config.href) && (
            <div className="mt-6 rounded-2xl bg-paper p-4 text-left">
              <p className="text-[0.92rem] font-semibold text-mushaf-900">Help other families find us</p>
              <p className="mt-1 text-[0.82rem] leading-relaxed text-ink-soft">If you have a minute, you can also post the same review publicly. It is optional and independent of this form.</p>
              <div className="mt-3 grid gap-2">
                {config.googleHref && (
                  <a href={config.googleHref} target="_blank" rel="noopener noreferrer" className="btn btn-outline min-h-11 w-full justify-center" data-review-channel="google">
                    Review us on Google <ArrowUpRight className="size-4" />
                  </a>
                )}
                {config.href && (
                  <a href={config.href} target="_blank" rel="noopener noreferrer" className="btn btn-outline min-h-11 w-full justify-center" data-review-channel="trustpilot">
                    Review us on Trustpilot <ArrowUpRight className="size-4" />
                  </a>
                )}
              </div>
            </div>
          )}
          <button type="button" className="btn btn-primary mt-4 min-h-11 w-full justify-center" onClick={onClose}>Done</button>
        </div>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={submit} noValidate aria-busy={state.sending} className="flex max-h-[inherit] flex-col">
      {header}
      <div className="space-y-5 overflow-y-auto overscroll-contain px-5 py-5">
        <div className="absolute -left-[9999px]" aria-hidden="true">
          <input tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => set("website", e.target.value)} />
        </div>
        {step === 0 ? (
          <>
            <div>
              <p className="mb-2 text-center text-[1.05rem] font-semibold text-mushaf-900">How are the classes going?</p>
              <StarRating value={form.rating} onChange={(n) => set("rating", n)} invalid={Boolean(errors.rating)} />
              <div className="text-center">{err("rating")}</div>
            </div>
            <div>
              <label htmlFor="rv-comment" className="field-label">Your comment</label>
              <textarea id="rv-comment" className="textarea" rows={4} maxLength={REVIEW_LIMITS.maxComment} value={form.comment} onChange={(e) => set("comment", e.target.value)}
                placeholder="For example: the course, your teacher, or progress you have noticed." required aria-invalid={Boolean(errors.comment)} aria-describedby={`rv-comment-count${errors.comment ? " rv-comment-error" : ""}`} />
              <p id="rv-comment-count" className={`mt-1 text-right text-xs ${form.comment.trim().length && form.comment.trim().length < REVIEW_LIMITS.minComment ? "text-gold-700" : "text-ink-faint"}`}>
                {form.comment.trim().length < REVIEW_LIMITS.minComment ? `At least ${REVIEW_LIMITS.minComment} characters` : `${form.comment.trim().length}/${REVIEW_LIMITS.maxComment}`}
              </p>
              {err("comment")}
            </div>
            <MediaPicker files={files} setFiles={setFiles} error={mediaError} setError={setMediaError} />
            <details className="review-help group rounded-2xl border border-leaf-100 px-4 py-3 text-[0.84rem] text-ink-soft">
              <summary className="flex min-h-8 cursor-pointer list-none items-center justify-between gap-2 font-semibold text-mushaf-900">
                How reviews work <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
              </summary>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 leading-relaxed">
                <li>Our team reads every review, including critical ones, and may email you if something needs our help.</li>
                <li>Nothing is shown on our website unless you give permission. If you do, we show your first name, rating and comment only.</li>
                <li>Your email and any photos or videos stay private to our team.</li>
                <li>Google and Trustpilot reviews are separate and independent; you are welcome to post there too.</li>
              </ul>
            </details>
          </>
        ) : (
          <>
            <fieldset>
              <legend className="field-label">I am a</legend>
              <div className="grid grid-cols-2 gap-1 rounded-2xl bg-leaf-50 p-1" role="radiogroup" aria-label="I am a">
                {["Parent", "Student"].map((value) => (
                  <button key={value} type="button" role="radio" aria-checked={form.relation === value} onClick={() => set("relation", value)}
                    className={`min-h-11 rounded-xl text-sm font-semibold ${form.relation === value ? "bg-white text-mushaf-900 shadow-sm ring-1 ring-leaf-100" : "text-ink-soft hover:text-mushaf-900"}`}>
                    {value}
                  </button>
                ))}
              </div>
            </fieldset>
            <div>
              <label htmlFor="rv-name" className="field-label">Your name</label>
              <input id="rv-name" className="input" value={form.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" maxLength={80} required aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "rv-name-error" : undefined} />
              {err("name")}
            </div>
            <div>
              <label htmlFor="rv-email" className="field-label">Email <span className="font-normal text-ink-faint">(never published)</span></label>
              <input id="rv-email" type="email" inputMode="email" className="input" value={form.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" maxLength={254} required aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "rv-email-error" : undefined} />
              {err("email")}
            </div>
            <label className="flex gap-3 rounded-2xl bg-paper p-3 text-[0.84rem] leading-relaxed text-ink">
              <input id="rv-consent" type="checkbox" className="check mt-0.5 shrink-0" checked={form.consent} onChange={(e) => set("consent", e.target.checked)} required aria-invalid={Boolean(errors.consent)} aria-describedby={errors.consent ? "rv-consent-error" : undefined} />
              <span>{consentText || "I agree that Online Quran College may store my review and contact me about it."} <Link href="/privacy-policy" target="_blank" className="font-semibold text-leaf-700 underline underline-offset-2">Privacy policy</Link></span>
            </label>
            {err("consent")}
          </>
        )}
        {state.error && <p className="rounded-xl bg-rose-600/10 px-4 py-3 text-[0.9rem] font-medium text-rose-600" role="alert">{state.error}</p>}
      </div>
      <div className="space-y-1 border-t border-leaf-100 px-5 pb-[max(0.9rem,env(safe-area-inset-bottom))] pt-3">
        {step === 0 ? (
          <button type="submit" className="btn btn-primary min-h-11 w-full justify-center">Continue</button>
        ) : (
          <div className="flex gap-2">
            <button type="button" className="btn btn-outline min-h-11 shrink-0 px-4" onClick={() => { setStep(0); setErrors({}); }} disabled={state.sending} aria-label="Back to step 1">
              <ArrowLeft className="size-4" /> Back
            </button>
            <button type="submit" className="btn btn-primary min-h-11 flex-1 justify-center" disabled={state.sending}>
              {state.sending ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-5" />}
              {state.sending ? state.progress : "Send review"}
            </button>
          </div>
        )}
        {trustpilot}
      </div>
    </form>
  );
}
