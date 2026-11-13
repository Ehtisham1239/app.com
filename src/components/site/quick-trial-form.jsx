"use client";
import { requestLeadNotification } from "@/lib/request-lead-notification";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { clsx } from "clsx";
import { announceLeadSaved } from "@/lib/conversion-events";
import { isTrialEligible } from "@/lib/trial-eligibility";
import { captureAttribution } from "@/lib/attribution";
import { MARKET_TIME_ZONES } from "@/lib/market-timezones";
import { LOCATIONS, locationTimeZone } from "@/lib/locations";
import { AGE_BANDS, COUNTRIES } from "@/lib/constants";
import { Check, CheckCircle2, Loader2, MessageCircle } from "@/components/site/icons";

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function browserTimeZone() {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch { return ""; }
}

// Every zone we can name for a country, so families in multi-zone countries can pick theirs.
function zonesFor(country) {
  const location = LOCATIONS.find((c) => c.name === country);
  const zones = [location?.timezone, ...(location?.cities || []).map((c) => c.timezone), ...(MARKET_TIME_ZONES[country] || []).map((c) => c.timezone)].filter(Boolean);
  return [...new Set(zones)];
}

function detectZone(country, browserTz, cityName) {
  const location = LOCATIONS.find((c) => c.name === country);
  const city = [...(location?.cities || []), ...(MARKET_TIME_ZONES[country] || [])].find((c) => c.name.toLowerCase() === cityName?.trim().toLowerCase());
  if (city) return locationTimeZone(location, city);
  const countryTz = COUNTRIES.find(([name]) => name === country)?.[1];
  if (!countryTz) return browserTz || "UTC";
  if (browserTz && zonesFor(country).includes(browserTz)) return browserTz;
  if (browserTz && browserTz.split("/")[0] === countryTz.split("/")[0] && !COUNTRIES.some(([n, tz]) => tz === browserTz && n !== country)) return browserTz;
  return countryTz;
}

function zoneLabel(zone, hydrated) {
  // Server and browser ICU/time-zone names can differ. The initial label is
  // deterministic; friendly seasonal names are added after hydration.
  if (!hydrated) return zone.split("/").pop().replace(/_/g, " ");
  try {
    const name = new Intl.DateTimeFormat("en-GB", { timeZone: zone, timeZoneName: "long" }).formatToParts(new Date()).find((p) => p.type === "timeZoneName")?.value;
    return `${zone.split("/").pop().replace(/_/g, " ")}${name ? ` — ${name}` : ""}`;
  } catch { return zone.replace(/_/g, " "); }
}

function FieldError({ id, children }) {
  if (!children) return null;
  return <p id={id} className="mt-1.5 text-[0.82rem] font-medium text-rose-600">{children}</p>;
}

// One short step: only what the coordinator needs to call back and book a slot.
export function QuickTrialForm({ courses = [], plans = [], currencies = [], consentText, successText, whatsappHref }) {
  const params = useSearchParams();
  const router = useRouter();
  // Booking preferences chosen on a country page (currency, lesson date/time) arrive in the
  // URL; they are summarised here in the browser so the page itself can stay cached.
  const [preferences, setPreferences] = useState(null);
  const preferenceKey = ["currency", "lesson_date", "lesson_time", "lesson_timezone"].map((key) => params.get(key) || "").join("|");
  useEffect(() => {
    if (!preferenceKey.replace(/\|/g, "")) return undefined;
    let live = true;
    import("@/lib/booking-preferences").then((m) => { if (live) setPreferences({ key: preferenceKey, notes: m.bookingPreferenceNotes(params, currencies) }); }).catch(() => {});
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preferenceKey]);
  const selectedPlan = plans.find(p => p.id === params.get("plan"));
  const eligible = isTrialEligible(selectedPlan);
  const topRef = useRef(null);
  const successHeading = useRef(null);
  const submitting = useRef(false);
  const [errors, setErrors] = useState({});
  const [state, setState] = useState({ sending: false, error: "", reference: null });
  const [form, setForm] = useState(() => {
    const course = params.get("course");
    const plan = params.get("plan");
    const planName = plans.find((p) => p.id === plan)?.name;
    return {
      learner_name: "",
      guardian_name: "",
      age_band: "",
      country: COUNTRIES.some(([name]) => name === params.get("country")) ? params.get("country") : "",
      city: params.get("city") || "",
      browser_tz: "",
      zone_choice: "",
      phone: "",
      phone_is_whatsapp: false,
      email: "",
      course_id: course && courses.some((c) => c.id === course) ? course : "",
      teacher_preference: "",
      notes: planName ? `Package of interest: ${planName}` : "",
      consent: false,
      website: "",
    };
  });
  useEffect(() => {
    // Keep the first browser render identical to SSR. Detect only after mount,
    // preserving a query-selected or already chosen country.
    const frame = requestAnimationFrame(() => {
      const tz = browserTimeZone();
      setForm((current) => ({ ...current, browser_tz: tz, country: current.country || (COUNTRIES.find(([, zone]) => zone === tz)?.[0] ?? "") }));
    });
    return () => cancelAnimationFrame(frame);
  }, []);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const requestedCountry = params.get("country");
  const matchingCountry = !requestedCountry || requestedCountry === form.country;
  const initialPreferenceNotes = matchingCountry && preferences?.key === preferenceKey ? preferences.notes : "";
  const zoneOptions = useMemo(() => zonesFor(form.country), [form.country]);
  const detected = useMemo(() => detectZone(form.country, form.browser_tz, form.city), [form.country, form.browser_tz, form.city]);
  const timezone = zoneOptions.includes(form.zone_choice) ? form.zone_choice : detected;

  const isChild = Boolean(form.age_band && form.age_band !== "adult");

  function validate() {
    const e = {};
    if (form.learner_name.trim().length < 2) e.learner_name = "Please enter the learner’s name.";
    if (isChild && form.guardian_name.trim().length < 2) e.guardian_name = "Please enter the parent or guardian’s name.";
    if (!form.age_band) e.age_band = "Please choose an age group.";
    if (!form.country) e.country = "Please choose your country.";
    const digits = form.phone.replace(/[^0-9]/g, "");
    if (digits.length < 7 || digits.length > 15) e.phone = "Please enter your WhatsApp or phone number with the country code.";
    if (!EMAIL.test(form.email.trim())) e.email = "Please enter a valid email address.";
    if (!form.consent) e.consent = "Please agree so we can contact you about your enquiry.";
    setErrors(e);
    const first = ["age_band", "learner_name", "guardian_name", "country", "phone", "email", "consent"].find((k) => e[k]);
    if (first) requestAnimationFrame(() => document.getElementById(first === "age_band" ? "q-age-0" : `q-${first}`)?.focus());
    return !first;
  }

  async function submit(event) {
    event.preventDefault();
    if (submitting.current || !validate()) return;
    submitting.current = true;
    setState({ sending: true, error: "", reference: null });
    const utm = captureAttribution();
    const teacherGender = { "Female teacher": "female", "Male teacher": "male", "No preference": "any" }[form.teacher_preference];
    const trialQuery = new URLSearchParams();
    for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content"]) {
      const value = params.get(key)?.trim().slice(0, 120);
      if (value) trialQuery.set(key, value);
    }
    // The time-zone library is only needed when a visitor arrives with a
    // preferred lesson time or quote currency, so it loads on submit instead
    // of with the form (and every page that prefetches /free-trial).
    let preferenceNotes = "";
    if (matchingCountry && ["currency", "lesson_date", "lesson_time", "lesson_timezone"].some((key) => params.get(key))) {
      try { preferenceNotes = (await import("@/lib/booking-preferences")).bookingPreferenceNotes(params, currencies); } catch { preferenceNotes = ""; }
    }
    const payload = {
      learner_name: form.learner_name.trim(),
      guardian_name: isChild ? form.guardian_name.trim() : "",
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      phone_is_whatsapp: form.phone_is_whatsapp,
      country: form.country,
      city: form.city.trim(),
      timezone,
      age_band: form.age_band,
      course_id: form.course_id || null,
      teacher_gender_pref: teacherGender,
      notes: [form.notes.trim(), preferenceNotes, ["Female teacher", "Male teacher", "No preference"].includes(form.teacher_preference) ? `Teacher preference: ${form.teacher_preference}. Availability to be confirmed.` : ""].filter(Boolean).join("\n"),
      consent: form.consent,
      marketing_opt_in: false,
      source: utm.utm_source || "website",
      utm: { ...utm, ghl_trial_query: trialQuery.toString(), ghl_teacher_selected: Boolean(teacherGender) },
      website: form.website,
    };
    let data, error;
    try {
      ({ data, error } = await (await import("@/lib/supabase/public")).getPublicBrowserClient().rpc("submit_trial_application", { payload }));
    } catch (cause) { error = cause; }
    if (error || data?.ok !== true) {
      submitting.current = false;
      setState({ sending: false, error: error?.message || "We could not send your request. Please try again or message us on WhatsApp.", reference: null });
      return;
    }
    requestLeadNotification(data, form.email.trim().toLowerCase());
    announceLeadSaved({ formType: "trial", country: form.country, reference: data?.reference, honeypot: form.website });
    const reference = typeof data?.reference === "string" && /^TR-[A-Z0-9-]{4,32}$/.test(data.reference) && data.reference !== "TR-RECEIVED" ? data.reference : "";
    router.push("/free-trial/thank-you" + (reference ? "?ref=" + encodeURIComponent(reference) : ""));
  }

  if (state.reference) {
    const showRef = state.reference !== "sent" && state.reference !== "TR-RECEIVED";
    return (
      <div ref={topRef} className="surface scroll-mt-28 p-7 text-center shadow-[var(--shadow-lift)] sm:p-9" role="status">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-leaf-50 text-leaf-700 ring-1 ring-leaf-100"><CheckCircle2 className="size-8" aria-hidden="true" /></span>
        <h2 ref={successHeading} tabIndex={-1} className="mt-4 text-[1.8rem] text-mushaf-900">Request received</h2>
        <p className="mx-auto mt-2 max-w-md text-ink-soft">{(eligible && successText) || "A coordinator will contact you by WhatsApp or email, usually within 24 hours, to discuss your request."}</p>
        {showRef && <p className="mt-4 inline-flex rounded-full bg-gold-50 px-4 py-1.5 font-mono text-sm font-semibold text-gold-700 ring-1 ring-gold-100">Reference: {state.reference}</p>}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {whatsappHref && <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn btn-primary"><MessageCircle className="size-5" aria-hidden="true" /> Message us on WhatsApp</a>}
          <Link href="/courses" className="btn btn-outline">Browse courses</Link>
        </div>
      </div>
    );
  }

  const err = (k) => (errors[k] ? { "aria-invalid": true, "aria-describedby": `q-${k}-error` } : {});
  return (
    <form ref={topRef} onSubmit={submit} noValidate aria-busy={state.sending} aria-label={eligible ? "Book a free trial" : "Package enquiry"} className="surface @container min-w-0 scroll-mt-28 space-y-5 bg-white p-5 shadow-[var(--shadow-lift)] sm:space-y-6 sm:p-8">
      <div className="absolute -left-[9999px]" aria-hidden="true"><label>Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => set("website", e.target.value)} /></label></div>
      <div className="border-b border-line pb-5">
        <h2 className="text-2xl leading-tight text-mushaf-900">{eligible ? "Request a 3-day free trial" : `Ask about ${selectedPlan.name}`}</h2>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-soft">
          {eligible ? "Tell us who’ll be learning and how to reach you. A coordinator will be in touch to find a time that suits you. No payment card needed." : "A coordinator will be in touch to discuss lesson times and fees. The Weekend plan is excluded from the free trial."}
        </p>
      </div>
      {(selectedPlan || initialPreferenceNotes) && <div className="rounded-xl border border-leaf-100 bg-leaf-50 p-4 text-sm text-ink-soft" role="group" aria-label="Your enquiry preferences">{selectedPlan && <p>Selected package: <strong>{selectedPlan.name}</strong></p>}{initialPreferenceNotes && <p className="mt-1 whitespace-pre-line">{initialPreferenceNotes}</p>}</div>}

      <fieldset className="min-w-0" aria-describedby={errors.age_band ? "q-age_band-error" : undefined}>
        <legend className="field-label">How old is the learner?</legend>
        <div className="grid grid-cols-2 gap-2 @min-[30rem]:grid-cols-4">
          {AGE_BANDS.map((a, i) => (
            <button key={a.value} id={`q-age-${i}`} type="button" aria-pressed={form.age_band === a.value} onClick={() => set("age_band", a.value)}
              className={clsx("inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border px-2 text-[0.88rem] font-medium transition-colors", form.age_band === a.value ? "border-leaf-700 bg-leaf-700 text-white" : "border-line-strong bg-white text-ink hover:border-leaf-600")}>
              {form.age_band === a.value && <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />}{a.label}
            </button>
          ))}
        </div>
        <FieldError id="q-age_band-error">{errors.age_band}</FieldError>
      </fieldset>

      <div className={clsx("grid gap-5", isChild && "@min-[26rem]:grid-cols-2")}>
        <div>
          <label htmlFor="q-learner_name" className="field-label">{isChild ? "Student’s name" : "Your name"}</label>
          <input id="q-learner_name" className="input" value={form.learner_name} onChange={(e) => set("learner_name", e.target.value)} autoComplete={isChild ? "section-student name" : "name"} maxLength={120} required {...err("learner_name")} />
          <FieldError id="q-learner_name-error">{errors.learner_name}</FieldError>
        </div>
        {isChild && <div>
          <label htmlFor="q-guardian_name" className="field-label">Parent or guardian’s name</label>
          <input id="q-guardian_name" className="input" value={form.guardian_name} onChange={(e) => set("guardian_name", e.target.value)} autoComplete="section-guardian name" maxLength={120} required {...err("guardian_name")} />
          <FieldError id="q-guardian_name-error">{errors.guardian_name}</FieldError>
        </div>}
      </div>

      <div>
        <label htmlFor="q-country" className="field-label">Country</label>
        <select id="q-country" className="select" value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value, city: "", zone_choice: "" }))} autoComplete="country-name" required {...err("country")}>
          <option value="">Choose your country</option>
          {COUNTRIES.map(([n]) => <option key={n}>{n}</option>)}
        </select>
        <FieldError id="q-country-error">{errors.country}</FieldError>
      </div>

      <div className="grid gap-5 @min-[26rem]:grid-cols-2">
        <div>
          <label htmlFor="q-phone" className="field-label">Phone or WhatsApp number</label>
          <input id="q-phone" className="input" type="tel" inputMode="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} autoComplete="tel" placeholder="Start with country code: +1, +44, +61…" maxLength={24} required {...err("phone")} aria-describedby={errors.phone ? "q-phone-hint q-phone-error" : "q-phone-hint"} />
          <p id="q-phone-hint" className="mt-1 text-xs text-ink-faint">Include the country code. {isChild ? "Use the parent or guardian’s number." : "Use the number you check most often."}</p>
          <FieldError id="q-phone-error">{errors.phone}</FieldError>
          <label className="mt-2 flex min-h-11 items-center gap-2 text-sm text-ink-soft">
            <input type="checkbox" className="check shrink-0" checked={form.phone_is_whatsapp} onChange={(e) => set("phone_is_whatsapp", e.target.checked)} />
            This number is on WhatsApp
          </label>
        </div>
        <div>
          <label htmlFor="q-email" className="field-label">{isChild ? "Parent or guardian’s email" : "Your email"}</label>
          <input id="q-email" className="input" type="email" inputMode="email" value={form.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" maxLength={254} required {...err("email")} />
          <FieldError id="q-email-error">{errors.email}</FieldError>
        </div>
      </div>

      <details className="rounded-xl border border-leaf-100 bg-leaf-50 px-4">
        <summary className="min-h-11 cursor-pointer rounded-lg py-3 font-semibold text-leaf-800">{form.course_id ? courses.find((course) => course.id === form.course_id)?.title || "Class preferences" : "Add class preferences"} <span className="text-sm font-normal">(optional)</span></summary>
        <div className="space-y-4 pb-4">
          <div>
            <label htmlFor="q-course_id" className="field-label">Course <span className="font-normal text-ink-faint">(optional)</span></label>
            <select id="q-course_id" className="select" value={form.course_id} onChange={(e) => set("course_id", e.target.value)}>
              <option value="">Not sure yet</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
          {form.country && zoneOptions.length > 1 && (
            <div className="-mt-1">
              <label htmlFor="q-zone" className="field-label">Your time zone</label>
              <select id="q-zone" className="select" value={timezone} onChange={(e) => set("zone_choice", e.target.value)}>
                {[...new Set([timezone, ...zoneOptions])].map((zone) => <option key={zone} value={zone}>{zoneLabel(zone, Boolean(form.browser_tz))}</option>)}
              </select>
            </div>
          )}
          <div>
            <label htmlFor="q-teacher_preference" className="field-label">Teacher preference <span className="font-normal text-ink-faint">(optional)</span></label>
            <select id="q-teacher_preference" className="select" value={form.teacher_preference} onChange={e => set("teacher_preference", e.target.value)}><option value="">Choose a preference</option>{["Female teacher", "Male teacher", "No preference"].map(value => <option key={value}>{value}</option>)}</select>
            <p className="mt-1 text-xs text-ink-faint">The coordinator confirms availability and teaching language.</p>
          </div>
        </div>
      </details>

      <div>
        <label className="flex items-start gap-3 text-[0.88rem] leading-relaxed text-ink-soft">
          <input id="q-consent" type="checkbox" className="check mt-0.5 shrink-0" checked={form.consent} onChange={(e) => set("consent", e.target.checked)} required {...err("consent")} />
          <span>{(eligible && consentText) || "I agree that Online Quran College may contact me about this enquiry."} We may use our admissions CRM to manage the learner’s details and this enquiry. <Link href="/privacy-policy" className="font-medium text-leaf-700 underline underline-offset-2">Privacy notice</Link></span>
        </label>
        <FieldError id="q-consent-error">{errors.consent}</FieldError>
      </div>

      {state.error && <p className="rounded-xl bg-rose-600/10 px-4 py-3 text-[0.92rem] font-medium text-rose-600" role="alert">{state.error}</p>}
      <button type="submit" className="btn btn-primary btn-lg w-full whitespace-normal text-center" disabled={state.sending}>
        {state.sending ? <Loader2 className="size-5 animate-spin" aria-hidden="true" /> : <CheckCircle2 className="size-5" aria-hidden="true" />}
        {state.sending ? "Sending…" : eligible ? "Request my free trial" : "Send package enquiry"}
      </button>
    </form>
  );
}
