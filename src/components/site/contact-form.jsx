"use client";
import { announceLeadSaved } from "@/lib/conversion-events";

import Link from "next/link";
import { captureAttribution } from "@/lib/attribution";
import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Loader2, Send } from "@/components/site/icons";
import { COUNTRIES } from "@/lib/constants";

const SUBJECTS = ["Course enquiry", "Fees and payment", "Class timings", "Teacher request", "Existing student support", "Partnership", "Other"];

export function ContactForm({ consentText, successText }) {
  const formRef = useRef(null);
  const successRef = useRef(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", country: "", subject: SUBJECTS[0], message: "", consent: false, website: "" });
  const [errors, setErrors] = useState({});
  const [state, setState] = useState({ sending: false, error: "", done: null });
  useEffect(() => {
    const first = Object.keys(errors)[0];
    if (first) formRef.current?.querySelector(`#c-${first}`)?.focus();
  }, [errors]);
  useEffect(() => { if (state.done) successRef.current?.focus(); }, [state.done]);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    if (state.sending) return;
    const errs = {};
    if (form.name.trim().length < 2) errs.name = "Please enter your name.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) errs.email = "Please enter a valid email address.";
    if (form.message.trim().length < 5) errs.message = "Please write a short message.";
    if (!form.consent) errs.consent = "Please agree so we can reply to you.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setState({ sending: true, error: "", done: null });
    const utm = captureAttribution();
    let data, error;
    try {
      ({ data, error } = await (await import("@/lib/supabase/public")).getPublicBrowserClient().rpc("submit_contact_message", { payload: { ...form, email: form.email.trim().toLowerCase(), utm, source: utm.utm_source || "website" } }));
    } catch (cause) { error = cause; }
    if (error) return setState({ sending: false, error: error.message || "Could not send. Please try WhatsApp instead.", done: null });
    announceLeadSaved({ formType: "contact", country: form.country, reference: data?.reference, honeypot: form.website });
    setState({ sending: false, error: "", done: data?.reference ?? "sent" });
  }

  if (state.done) {
    return (
      <div className="surface p-8 text-center sm:p-10" role="status">
        <CheckCircle2 className="mx-auto size-14 text-leaf-600" aria-hidden="true" />
        <h2 ref={successRef} tabIndex={-1} className="mt-4 text-[1.8rem] text-mushaf-900">Message sent</h2>
        <p className="mx-auto mt-2 max-w-md text-ink-soft">{successText || "Thank you. Our coordinator will reply using the contact details you provided."}</p>
        {state.done !== "MSG-RECEIVED" && state.done !== "sent" && (
          <p className="mt-4 inline-flex rounded-full bg-gold-50 px-4 py-1.5 font-mono text-sm font-semibold text-gold-700 ring-1 ring-gold-100">Reference: {state.done}</p>
        )}
      </div>
    );
  }

  const err = (k) =>
    errors[k] ? (
      <p id={`c-${k}-error`} className="mt-1.5 text-[0.82rem] font-medium text-rose-600" role="alert">
        {errors[k]}
      </p>
    ) : null;

  return (
    <form ref={formRef} onSubmit={submit} noValidate aria-busy={state.sending} className="surface min-w-0 space-y-5 p-6 shadow-[var(--shadow-lift)] sm:p-8">
      <p className="text-sm text-ink-soft">Your name, email and message are required. Phone and country are optional.</p>
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
      <div>
        <label htmlFor="c-subject" className="field-label">
          Subject
        </label>
        <select id="c-subject" className="select" value={form.subject} onChange={(e) => set("subject", e.target.value)}>
          {SUBJECTS.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="c-message" className="field-label">
          Message
        </label>
        <textarea id="c-message" className="textarea" rows={5} value={form.message} onChange={(e) => set("message", e.target.value)} required maxLength={5000} aria-describedby={errors.message ? "c-message-error" : undefined} aria-invalid={Boolean(errors.message)} />
        {err("message")}
      </div>
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
        </p>
      )}
      <button type="submit" className="btn btn-primary btn-lg w-full sm:w-auto" disabled={state.sending}>
        {state.sending ? <Loader2 className="size-5 animate-spin" aria-hidden="true" /> : <Send className="size-5" aria-hidden="true" />}
        {state.sending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
