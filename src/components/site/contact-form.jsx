"use client";
import { requestLeadNotification } from "@/lib/request-lead-notification";
import { announceLeadSaved } from "@/lib/conversion-events";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { captureAttribution } from "@/lib/attribution";
import { useEffect, useRef, useState } from "react";
import { Loader2, Send } from "@/components/site/icons";
import { COUNTRIES } from "@/lib/constants";

const SUBJECTS = ["Course enquiry", "Fees and payment", "Class timings", "Teacher request", "Existing student support", "Partnership", "Other"];

export function ContactForm({ id, consentText, alternateContact, careerSubject }) {
  const router = useRouter();
  const formRef = useRef(null);
  const submitting = useRef(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", country: "", subject: careerSubject || SUBJECTS[0], message: "", consent: false, website: "" });
  const [errors, setErrors] = useState({});
  const [state, setState] = useState({ sending: false, error: "" });
  useEffect(() => {
    const first = Object.keys(errors)[0];
    if (first) formRef.current?.querySelector(`#c-${first}`)?.focus();
  }, [errors]);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    if (submitting.current) return;
    const errs = {};
    if (form.name.trim().length < 2) errs.name = "Please enter your name.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) errs.email = "Please enter a valid email address.";
    if (form.message.trim().length < 5) errs.message = "Please write a short message.";
    if (!form.consent) errs.consent = "Please agree so we can reply to you.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    submitting.current = true;
    setState({ sending: true, error: "" });
    let data, error;
    try {
      const utm = captureAttribution();
      ({ data, error } = await (await import("@/lib/supabase/public")).getPublicBrowserClient().rpc("submit_contact_message_with_notification", { payload: { ...form, email: form.email.trim().toLowerCase(), utm, source: utm.utm_source || "website" } }));
    } catch (cause) { error = cause; }
    if (error) {
      submitting.current = false;
      setState({ sending: false, error: "We couldn’t send your message. Your details are still here. Please try again." });
      return;
    }
    requestLeadNotification(data, form.email.trim().toLowerCase());
    announceLeadSaved({ formType: "contact", country: form.country, reference: data?.reference, honeypot: form.website });
    const reference = typeof data?.reference === "string" && /^MSG-[A-Z0-9-]{4,32}$/.test(data.reference) && data.reference !== "MSG-RECEIVED" ? data.reference : "";
    const confirmation = new URLSearchParams();
    if (careerSubject) confirmation.set("type", "careers");
    if (reference) confirmation.set("ref", reference);
    router.push("/contact/thank-you" + (confirmation.size ? "?" + confirmation.toString() : ""));
  }

  const err = (k) =>
    errors[k] ? (
      <p id={`c-${k}-error`} className="mt-1.5 text-[0.82rem] font-medium text-rose-600" role="alert">
        {errors[k]}
      </p>
    ) : null;

  return (
    <form id={id} tabIndex={id ? -1 : undefined} aria-labelledby={id ? `${id}-heading` : undefined} ref={formRef} onSubmit={submit} noValidate aria-busy={state.sending} className="surface min-w-0 scroll-mt-28 space-y-5 p-6 shadow-[var(--shadow-lift)] sm:p-8">
      <div className="flex items-center gap-4 rounded-2xl border border-leaf-100 bg-leaf-50 p-4 sm:gap-5">
        <img src="/brand/oqc-contact-logo.webp" alt="Online Quran College Ltd" width={240} height={240} className="size-16 shrink-0 rounded-xl bg-white ring-1 ring-leaf-100 sm:size-20" />
        <div>
          <h2 id={id ? `${id}-heading` : undefined} className="text-[1.8rem] text-mushaf-900">{careerSubject ? "Register your interest" : "Send us a message"}</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">{careerSubject ? "Share your experience and availability. We’ll reply by email if there is a suitable opportunity." : "Tell us how we can help. We’ll reply by email."}</p>
        </div>
      </div>
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <input tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => set("website", e.target.value)} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="c-name" className="field-label">
            Your name
          </label>
          <input id="c-name" className="input" value={form.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" required maxLength={120} aria-describedby={errors.name ? "c-name-error" : undefined} aria-invalid={Boolean(errors.name)} />
          {err("name")}
        </div>
        <div>
          <label htmlFor="c-email" className="field-label">
            Email
          </label>
          <input id="c-email" type="email" className="input" value={form.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" required maxLength={254} aria-describedby={errors.email ? "c-email-error" : undefined} aria-invalid={Boolean(errors.email)} />
          {err("email")}
        </div>
      </div>
      {!careerSubject && <div>
        <label htmlFor="c-subject" className="field-label">
          Topic
        </label>
        <select id="c-subject" className="select" value={form.subject} onChange={(e) => set("subject", e.target.value)}>
          {SUBJECTS.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>}
      <div>
        <label htmlFor="c-message" className="field-label">
          {careerSubject ? "Experience and availability" : "Message"}
        </label>
        <textarea id="c-message" className="textarea" rows={3} placeholder={careerSubject ? "Tell us your subject or area of interest, languages and time zone." : "How can we help?"} value={form.message} onChange={(e) => set("message", e.target.value)} required maxLength={5000} aria-describedby={errors.message ? "c-message-error" : undefined} aria-invalid={Boolean(errors.message)} />
        {err("message")}
      </div>
      <details className="rounded-xl border border-leaf-100 bg-leaf-50 px-4">
        <summary className="min-h-11 cursor-pointer rounded-lg py-3 font-semibold text-leaf-800">Add contact details <span className="text-sm font-normal">(optional)</span></summary>
        <div className="space-y-4 pb-4">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="c-phone" className="field-label">
                Phone / WhatsApp <span className="font-normal text-ink-faint">(optional)</span>
              </label>
              <input id="c-phone" type="tel" className="input" value={form.phone} onChange={(e) => set("phone", e.target.value)} autoComplete="tel" />
            </div>
            <div>
              <label htmlFor="c-country" className="field-label">
                Country <span className="font-normal text-ink-faint">(optional)</span>
              </label>
              <select id="c-country" className="select" value={form.country} onChange={(e) => set("country", e.target.value)}>
                <option value="">Choose…</option>
                {COUNTRIES.map(([n]) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </details>
      <label className="flex gap-3 text-[0.9rem] leading-relaxed text-ink">
        <input id="c-consent" type="checkbox" className="check mt-0.5 shrink-0" checked={form.consent} onChange={(e) => set("consent", e.target.checked)} required aria-invalid={Boolean(errors.consent)} aria-describedby={errors.consent ? "c-consent-error" : undefined} />
        <span>
          {consentText || "I agree that the college may contact me about this enquiry."}{" "}
          <Link href="/privacy-policy" className="font-semibold text-leaf-700 underline underline-offset-2" target="_blank">
            Privacy policy
          </Link>
        </span>
      </label>
      {err("consent")}
      {state.error && (
        <p className="rounded-xl bg-rose-600/10 px-4 py-3 text-[0.92rem] font-medium text-rose-600" role="alert">
          {state.error}
          {alternateContact && <>{" "}<a href={alternateContact.href} className="font-semibold underline">{alternateContact.label}</a></>}
        </p>
      )}
      <button type="submit" className="btn btn-primary btn-lg w-full sm:w-auto" disabled={state.sending}>
        {state.sending ? <Loader2 className="size-5 animate-spin" aria-hidden="true" /> : <Send className="size-5" aria-hidden="true" />}
        {state.sending ? "Sending…" : careerSubject ? "Submit interest" : "Send message"}
      </button>
    </form>
  );
}
