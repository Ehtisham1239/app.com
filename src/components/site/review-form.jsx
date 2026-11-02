"use client";
// Short review form (one screen): stars → comment → name, email, consent → send.
// Loaded on demand by the reviews button, and inline on /reviews.
// Every reviewer, whatever their rating, is offered the public Trustpilot/Google links:
// inviting only happy reviewers ("review gating") breaks Google and Trustpilot rules.
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, CheckCircle2, Loader2, Plus, Send, Star, Video, X } from "@/components/site/icons";
import { REVIEW_LIMITS, reviewFileError, reviewFormErrors, reviewMediaPath } from "@/lib/reviews-button";

const EMPTY = { name: "", email: "", relation: "Parent", rating: 0, comment: "", consent: false, website: "" };
const RATING_WORDS = ["Tap a star to rate", "Poor", "Fair", "Good", "Very good", "Excellent"];
// One-tap starters; visitors can edit the text afterwards. Neutral wording for every rating.
const STARTERS = ["Our teacher", "Progress", "Class timings", "Communication", "Tajweed", "Hifz"];
const COMMENT_PROMPTS = ["Tell us about your experience", "What went wrong?", "What could we do better?", "What could we do better?", "What did you like most?", "What did you like most?"];

function StarRating({ value, onChange, invalid }) {
  const refs = useRef([]);
  const move = (next) => { const n = Math.min(5, Math.max(1, next)); onChange(n); refs.current[n - 1]?.focus(); };
  return (
    <div className="text-center">
      <div id="rv-rating" role="radiogroup" aria-label="Your rating" aria-describedby={`rv-rating-word${invalid ? " rv-rating-error" : ""}`} className="inline-flex gap-1.5"
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
      <p id="rv-rating-word" aria-live="polite" className={`mt-1 text-sm font-semibold ${value ? "text-gold-700" : "text-ink-faint"}`}>{RATING_WORDS[value || 0]}</p>
    </div>
  );
}

function MediaPicker({ files, setFiles, error, setError }) {
  const inputRef = useRef(null);
  const [previews, setPreviews] = useState([]);
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

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {files.map((file, i) => (
          <span key={`${file.name}-${file.size}-${i}`} className="relative size-14 overflow-hidden rounded-xl border border-leaf-100 bg-leaf-50">
            {previews[i]
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={previews[i]} alt="" className="size-full object-cover" />
              : <span className="flex size-full items-center justify-center text-leaf-700"><Video className="size-5" /></span>}
            <button type="button" onClick={() => { setFiles((list) => list.filter((_, j) => j !== i)); setError(""); }} aria-label={`Remove ${file.name}`}
              className="absolute right-0.5 top-0.5 flex size-6 items-center justify-center rounded-full bg-white/90 text-ink shadow-sm">
              <X className="size-3.5" />
            </button>
          </span>
        ))}
        {files.length < REVIEW_LIMITS.maxFiles && (
          <button id="rv-media" type="button" onClick={() => inputRef.current?.click()} aria-describedby="rv-media-note"
            className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-dashed border-leaf-300 px-3.5 text-[0.82rem] font-semibold text-leaf-700 hover:bg-leaf-50">
            <Plus className="size-4" /> {files.length ? "Add another" : "Add a photo or video"}
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" className="hidden" multiple tabIndex={-1} aria-hidden="true" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,video/mp4,video/quicktime,video/webm" onChange={(e) => add(e.target.files || [])} />
      <p id="rv-media-note" className="mt-1 text-xs text-ink-faint">Optional · up to {REVIEW_LIMITS.maxFiles} files, 20 MB each · private to our team</p>
      {error && <p className="mt-1 text-[0.82rem] font-medium text-rose-600" role="alert">{error}</p>}
    </div>
  );
}

export function ReviewForm({ open, config, consentText, onClose, inline = false }) {
  const formRef = useRef(null);
  const doneRef = useRef(null);
  const [form, setForm] = useState(EMPTY);
  const [files, setFiles] = useState([]);
  const [showMedia, setShowMedia] = useState(false);
  const [errors, setErrors] = useState({});
  const [mediaError, setMediaError] = useState("");
  const [state, setState] = useState({ sending: false, progress: "", error: "", done: null });
  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => { if (!e[k]) return e; const next = { ...e }; delete next[k]; return next; }); };
  const reset = () => { setForm(EMPTY); setFiles([]); setShowMedia(false); setErrors({}); setMediaError(""); setState({ sending: false, progress: "", error: "", done: null }); };

  useEffect(() => {
    const first = Object.keys(errors)[0];
    if (first) formRef.current?.querySelector(first === "rating" ? "#rv-rating [tabindex='0']" : `#rv-${first}`)?.focus();
  }, [errors]);
  useEffect(() => { if (state.done) doneRef.current?.focus(); }, [state.done]);
  // After a review has been sent, the next opening starts a fresh form.
  useEffect(() => {
    if (!open && state.done) { setForm(EMPTY); setFiles([]); setShowMedia(false); setErrors({}); setMediaError(""); setState({ sending: false, progress: "", error: "", done: null }); }
  }, [open, state.done]);

  function addStarter(word) {
    const current = form.comment.trim();
    if (current.toLowerCase().includes(word.toLowerCase())) return;
    set("comment", current ? `${current}${/[.!?]$/.test(current) ? "" : ","} ${word.toLowerCase()} ` : `${word} `);
    formRef.current?.querySelector("#rv-comment")?.focus();
  }

  async function submit(e) {
    e.preventDefault();
    if (state.sending) return;
    const errs = reviewFormErrors(form);
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
        payload: { ...form, name: form.name.trim(), email: form.email.trim().toLowerCase(), comment: form.comment.trim(), upload_token: token, media, page_path: window.location.pathname },
      });
      if (error) throw error;
      setState({ sending: false, progress: "", error: "", done: data?.reference ?? "sent" });
    } catch (cause) {
      setState({ sending: false, progress: "", error: cause?.message || "Your review was not sent. Check your connection and send again.", done: null });
    }
  }

  const err = (k) => errors[k] ? <p id={`rv-${k}-error`} className="mt-1 text-[0.82rem] font-medium text-rose-600" role="alert">{errors[k]}</p> : null;
  const firstName = form.name.trim().split(/\s+/)[0];
  const commentLength = form.comment.trim().length;

  const title = state.done ? "Review received" : "Rate your experience";
  const subtitle = "Takes under a minute · every rating is welcome";
  // In the pop-up the header carries the OQC mark so the form is clearly ours; on /reviews
  // the page hero already does, so the inline header stays light.
  const header = inline ? (
    <div className="px-5 pb-1 pt-5">
      <h2 id="review-dialog-title" className="text-[1.35rem] leading-tight text-mushaf-900">{title}</h2>
      {!state.done && <p className="mt-0.5 text-[0.82rem] text-ink-soft">{subtitle}</p>}
    </div>
  ) : (
    <div className="review-dialog-head relative flex shrink-0 items-center gap-3 overflow-hidden bg-mushaf-900 px-5 py-4 text-white">
      <div className="pattern-girih pointer-events-none absolute inset-0 opacity-[0.08]" aria-hidden="true" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/mark-v2-64.png" alt="" width={44} height={44} className="relative size-11 shrink-0 rounded-xl bg-white p-1 shadow-sm" />
      <div className="relative min-w-0 flex-1">
        <p className="text-[0.72rem] font-semibold text-gold-300">Online Quran College</p>
        <h2 id="review-dialog-title" className="text-[1.25rem] leading-tight text-white">{title}</h2>
        {!state.done && <p className="mt-0.5 truncate text-[0.78rem] text-white/75">{subtitle}</p>}
      </div>
      <button type="button" onClick={onClose} className="relative -mr-1 flex size-10 shrink-0 items-center justify-center rounded-full text-white/85 hover:bg-white/10 hover:text-white" aria-label="Close review form">
        <X className="size-5" />
      </button>
    </div>
  );

  if (state.done) {
    return (
      <div className="flex max-h-[inherit] flex-col">
        {header}
        <div className="overflow-y-auto px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5 text-center" role="status">
          <CheckCircle2 className="mx-auto size-14 text-leaf-600" />
          <h3 ref={doneRef} tabIndex={-1} className="mt-3 text-[1.5rem] text-mushaf-900">JazakAllah khair{firstName ? `, ${firstName}` : ""}</h3>
          <p className="mt-2 flex justify-center gap-0.5 text-gold-500" aria-label={`You rated ${form.rating} out of 5`}>
            {[1, 2, 3, 4, 5].map((n) => <Star key={n} className={`size-5 ${n <= form.rating ? "fill-current" : "opacity-30"}`} />)}
          </p>
          <p className="mx-auto mt-3 max-w-xs text-[0.92rem] leading-relaxed text-ink-soft">Our team reads every review and will contact you if anything needs our help.</p>
          {state.done !== "REV-RECEIVED" && state.done !== "sent" && (
            <p className="mt-4 inline-flex rounded-full bg-gold-50 px-4 py-1.5 font-mono text-sm font-semibold text-gold-700 ring-1 ring-gold-100">Reference {state.done}</p>
          )}
          {(config.googleHref || config.href) && (
            <div className="mt-6 rounded-2xl bg-paper p-4 text-left">
              <p className="text-[0.92rem] font-semibold text-mushaf-900">Help other families find us</p>
              <p className="mt-1 text-[0.82rem] leading-relaxed text-ink-soft">You can also post your honest review publicly. It is optional and separate from this form.</p>
              <div className="mt-3 grid gap-2">
                {config.href && (
                  <a href={config.href} target="_blank" rel="noopener noreferrer" className="btn btn-primary min-h-11 w-full justify-center" data-review-channel="trustpilot">
                    Review us on Trustpilot <ArrowUpRight className="size-4" />
                  </a>
                )}
                {config.googleHref && (
                  <a href={config.googleHref} target="_blank" rel="noopener noreferrer" className="btn btn-outline min-h-11 w-full justify-center" data-review-channel="google">
                    Review us on Google <ArrowUpRight className="size-4" />
                  </a>
                )}
              </div>
            </div>
          )}
          <button type="button" className="btn btn-outline mt-4 min-h-11 w-full justify-center" onClick={inline ? reset : onClose}>{inline ? "Write another review" : "Done"}</button>
        </div>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={submit} noValidate aria-busy={state.sending} className="flex max-h-[inherit] flex-col">
      {header}
      <div className="space-y-4 overflow-y-auto overscroll-contain px-5 pb-4 pt-3">
        <div className="absolute -left-[9999px]" aria-hidden="true">
          <input tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => set("website", e.target.value)} />
        </div>
        <div>
          <StarRating value={form.rating} onChange={(n) => set("rating", n)} invalid={Boolean(errors.rating)} />
          <div className="text-center">{err("rating")}</div>
        </div>
        <div>
          <label htmlFor="rv-comment" className="field-label">{COMMENT_PROMPTS[form.rating] ?? COMMENT_PROMPTS[0]}</label>
          <div className="mb-2 flex flex-wrap gap-1.5" aria-label="Quick topics">
            {STARTERS.map((word) => (
              <button key={word} type="button" onClick={() => addStarter(word)} className="min-h-8 rounded-full bg-leaf-50 px-3 text-xs font-semibold text-leaf-800 ring-1 ring-leaf-100 hover:bg-leaf-100">
                + {word}
              </button>
            ))}
          </div>
          <textarea id="rv-comment" className="textarea" rows={3} maxLength={REVIEW_LIMITS.maxComment} value={form.comment} onChange={(e) => set("comment", e.target.value)}
            placeholder="A few words about the classes, your teacher or your progress" required aria-invalid={Boolean(errors.comment)} aria-describedby={`rv-comment-count${errors.comment ? " rv-comment-error" : ""}`} />
          <p id="rv-comment-count" className={`mt-0.5 text-right text-xs ${commentLength && commentLength < REVIEW_LIMITS.minComment ? "text-gold-700" : "text-ink-faint"}`}>
            {commentLength < REVIEW_LIMITS.minComment ? `${REVIEW_LIMITS.minComment - commentLength} more characters` : `${commentLength}/${REVIEW_LIMITS.maxComment}`}
          </p>
          {err("comment")}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="rv-name" className="field-label">Your name</label>
            <input id="rv-name" className="input" value={form.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" maxLength={80} required aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "rv-name-error" : undefined} />
            {err("name")}
          </div>
          <div>
            <label htmlFor="rv-email" className="field-label">Email <span className="font-normal text-ink-faint">(private)</span></label>
            <input id="rv-email" type="email" inputMode="email" className="input" value={form.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" maxLength={254} required aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "rv-email-error" : undefined} />
            {err("email")}
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex rounded-full bg-leaf-50 p-1" role="radiogroup" aria-label="I am a">
            {["Parent", "Student"].map((value) => (
              <button key={value} type="button" role="radio" aria-checked={form.relation === value} onClick={() => set("relation", value)}
                className={`min-h-9 rounded-full px-4 text-[0.82rem] font-semibold ${form.relation === value ? "bg-white text-mushaf-900 shadow-sm ring-1 ring-leaf-100" : "text-ink-soft hover:text-mushaf-900"}`}>
                {value}
              </button>
            ))}
          </div>
          {!showMedia && !files.length && (
            <button type="button" onClick={() => setShowMedia(true)} className="inline-flex min-h-9 items-center gap-1 text-[0.82rem] font-semibold text-leaf-700 hover:underline">
              <Plus className="size-4" /> Photo or video
            </button>
          )}
        </div>
        {(showMedia || files.length > 0) && <MediaPicker files={files} setFiles={setFiles} error={mediaError} setError={setMediaError} />}
        <label className="flex gap-3 rounded-2xl bg-paper p-3 text-[0.8rem] leading-relaxed text-ink">
          <input id="rv-consent" type="checkbox" className="check mt-0.5 shrink-0" checked={form.consent} onChange={(e) => set("consent", e.target.checked)} required aria-invalid={Boolean(errors.consent)} aria-describedby={errors.consent ? "rv-consent-error" : undefined} />
          <span>{consentText || "I agree that Online Quran College may store my review and contact me about it."} <Link href="/privacy-policy" target="_blank" className="font-semibold text-leaf-700 underline underline-offset-2">Privacy policy</Link></span>
        </label>
        {err("consent")}
        <p className="text-center text-xs text-ink-faint">Shown on our website only with your permission: first name, rating and comment only.</p>
        {state.error && <p className="rounded-xl bg-rose-600/10 px-4 py-3 text-[0.9rem] font-medium text-rose-600" role="alert">{state.error}</p>}
      </div>
      <div className="space-y-1 border-t border-leaf-100 px-5 pb-[max(0.9rem,env(safe-area-inset-bottom))] pt-3">
        <button type="submit" className="btn btn-primary min-h-12 w-full justify-center text-base" disabled={state.sending}>
          {state.sending ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-5" />}
          {state.sending ? state.progress : "Send review"}
        </button>
        {config.href && (
          <a href={config.href} target="_blank" rel="noopener noreferrer" className="flex min-h-10 items-center justify-center gap-1 text-sm font-semibold text-leaf-700 underline-offset-2 hover:underline" data-review-channel="trustpilot">
            Or review us directly on Trustpilot <ArrowUpRight className="size-4" />
          </a>
        )}
      </div>
    </form>
  );
}
