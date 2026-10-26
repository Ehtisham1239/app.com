"use client";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { clsx } from "clsx";
import { announceLeadSaved } from "@/lib/conversion-events";
import { captureAttribution } from "@/lib/attribution";
import { bookingPreferenceNotes } from "@/lib/booking-preferences";
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

function zoneLabel(zone) {
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
  const topRef = useRef(null);
  const successHeading = useRef(null);
  const [errors, setErrors] = useState({});
  const [state, setState] = useState({ sending: false, error: "", reference: null });
  const [form, setForm] = useState(() => {
    const tz = browserTimeZone();
    const course = params.get("course");
    const plan = params.get("plan");
    const planName = plans.find((p) => p.id === plan)?.name;
    return {
      learner_name: "",
      age_band: "",
      country: params.get("country") || (COUNTRIES.find(([, zone]) => zone === tz)?.[0] ?? ""),
      city: params.get("city") || "",
      browser_tz: tz,
      zone_choice: "",
      phone: "",
      email: "",
      course_id: course && courses.some((c) => c.id === course) ? course : "",
      notes: [planName ? `Package of interest: ${planName}` : "", bookingPreferenceNotes(params, currencies)].filter(Boolean).join("\n"),
      consent: false,
      website: "",
    };
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const zoneOptions = useMemo(() => zonesFor(form.country), [form.country]);
  const detected = useMemo(() => detectZone(form.country, form.browser_tz, form.city), [form.country, form.browser_tz, form.city]);
  const timezone = zoneOptions.includes(form.zone_choice) ? form.zone_choice : detected;

  function validate() {
    const e = {};
    if (form.learner_name.trim().length < 2) e.learner_name = "Please enter the learner’s name.";
    if (!form.age_band) e.age_band = "Please choose an age group.";
    if (!form.country) e.country = "Please choose your country.";
    const digits = form.phone.replace(/[^0-9]/g, "");
    if (digits.length < 7 || digits.length > 15) e.phone = "Please enter your WhatsApp or phone number with the country code.";
    if (!EMAIL.test(form.email.trim())) e.email = "Please enter a valid email address.";
    if (!form.consent) e.consent = "Please agree so we can contact you about the trial.";
    setErrors(e);
    const first = ["learner_name", "age_band", "country", "phone", "email", "consent"].find((k) => e[k]);
    if (first) requestAnimationFrame(() => document.getElementById(first === "age_band" ? "q-age-0" : `q-${first}`)?.focus());
    return !first;
  }

  async function submit(event) {
    event.preventDefault();
    if (state.sending || !validate()) return;
    setState({ sending: true, error: "", reference: null });
    const utm = captureAttribution();
    const payload = {
      learner_name: form.learner_name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      phone_is_whatsapp: true,
      country: form.country,
      city: form.city.trim(),
      timezone,
      age_band: form.age_band,
      course_id: form.course_id || null,
      notes: form.notes.trim(),
      consent: form.consent,
      marketing_opt_in: false,
      source: utm.utm_source || "website",
      utm,
      website: form.website,
    };
    let data, error;
    try {
      ({ data, error } = await (await import("@/lib/supabase/public")).getPublicBrowserClient().rpc("submit_trial_application", { payload }));
    } catch (cause) { error = cause; }
    if (error) {
      setState({ sending: false, error: error.message || "We could not send your request. Please try again or message us on WhatsApp.", reference: null });
      return;
    }
    announceLeadSaved({ formType: "trial", country: form.country, reference: data?.reference, honeypot: form.website });
    setState({ sending: false, error: "", reference: data?.reference ?? "sent" });
    requestAnimationFrame(() => {
      topRef.current?.scrollIntoView({ block: "start" });
      successHeading.current?.focus({ preventScroll: true });
    });
  }

  if (state.reference) {
    const showRef = state.reference !== "sent" && state.reference !== "TR-RECEIVED";
    return (
      <div ref={topRef} className="surface scroll-mt-28 p-7 text-center shadow-[var(--shadow-lift)] sm:p-9" role="status">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-leaf-50 text-leaf-700 ring-1 ring-leaf-100"><CheckCircle2 className="size-8" aria-hidden="true" /></span>
        <h2 ref={successHeading} tabIndex={-1} className="mt-4 text-[1.8rem] text-mushaf-900">Request received</h2>
        <p className="mx-auto mt-2 max-w-md text-ink-soft">{successText || "A coordinator will contact you by WhatsApp or email, usually within 24 hours, to agree a time."}</p>
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
    <form ref={topRef} onSubmit={submit} noValidate aria-busy={state.sending} aria-label="Book a free trial" className="surface scroll-mt-28 space-y-5 p-6 shadow-[var(--shadow-lift)] sm:p-8">
      <div className="absolute -left-[9999px]" aria-hidden="true"><label>Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => set("website", e.target.value)} /></label></div>
      <div>
        <h2 className="text-[1.55rem] text-mushaf-900">Book your free 3-day trial</h2>
        <p className="mt-1 text-[0.92rem] text-ink-soft">Takes under a minute. No payment or card needed.</p>
      </div>

      <div>
        <label htmlFor="q-learner_name" className="field-label">Learner’s name</label>
        <input id="q-learner_name" className="input" value={form.learner_name} onChange={(e) => set("learner_name", e.target.value)} autoComplete="name" maxLength={120} required {...err("learner_name")} />
        <FieldError id="q-learner_name-error">{errors.learner_name}</FieldError>
      </div>

      <fieldset aria-describedby={errors.age_band ? "q-age_band-error" : undefined}>
        <legend className="field-label">Age group</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {AGE_BANDS.map((a, i) => (
            <button key={a.value} id={`q-age-${i}`} type="button" aria-pressed={form.age_band === a.value} onClick={() => set("age_band", a.value)}
              className={clsx("inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border px-2 text-[0.88rem] font-medium transition-colors", form.age_band === a.value ? "border-leaf-700 bg-leaf-700 text-white" : "border-line-strong bg-white text-ink hover:border-leaf-600")}>
              {form.age_band === a.value && <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />}{a.label}
            </button>
          ))}
        </div>
        <FieldError id="q-age_band-error">{errors.age_band}</FieldError>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="q-country" className="field-label">Country</label>
          <select id="q-country" className="select" value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value, zone_choice: "" }))} autoComplete="country-name" required {...err("country")}>
            <option value="">Choose your country</option>
            {COUNTRIES.map(([n]) => <option key={n}>{n}</option>)}
          </select>
          <FieldError id="q-country-error">{errors.country}</FieldError>
        </div>
        <div>
          <label htmlFor="q-course_id" className="field-label">Course <span className="font-normal text-ink-faint">(optional)</span></label>
          <select id="q-course_id" className="select" value={form.course_id} onChange={(e) => set("course_id", e.target.value)}>
            <option value="">Not sure yet</option>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>
      </div>
      {form.country && zoneOptions.length > 1 && (
        <div className="-mt-1">
          <label htmlFor="q-zone" className="field-label">Your time zone</label>
          <select id="q-zone" className="select" value={timezone} onChange={(e) => set("zone_choice", e.target.value)}>
            {[...new Set([timezone, ...zoneOptions])].map((zone) => <option key={zone} value={zone}>{zoneLabel(zone)}</option>)}
          </select>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="q-phone" className="field-label">WhatsApp number</label>
          <input id="q-phone" className="input" type="tel" inputMode="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} autoComplete="tel" placeholder="+44 7700 900123" maxLength={24} required {...err("phone")} />
          <FieldError id="q-phone-error">{errors.phone}</FieldError>
        </div>
        <div>
          <label htmlFor="q-email" className="field-label">Email</label>
          <input id="q-email" className="input" type="email" inputMode="email" value={form.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" maxLength={254} required {...err("email")} />
          <FieldError id="q-email-error">{errors.email}</FieldError>
        </div>
      </div>
      <p className="-mt-2 text-[0.82rem] text-ink-faint">For a child, please give a parent or guardian’s contact details.</p>

      <div>
        <label className="flex items-start gap-3 text-[0.88rem] leading-relaxed text-ink-soft">
          <input id="q-consent" type="checkbox" className="check mt-0.5 shrink-0" checked={form.consent} onChange={(e) => set("consent", e.target.checked)} required {...err("consent")} />
          <span>{consentText || "I agree that Online Quran College may contact me about this trial."} <Link href="/privacy-policy" className="font-medium text-leaf-700 underline underline-offset-2">Privacy notice</Link></span>
        </label>
        <FieldError id="q-consent-error">{errors.consent}</FieldError>
      </div>

      {state.error && <p className="rounded-xl bg-rose-600/10 px-4 py-3 text-[0.92rem] font-medium text-rose-600" role="alert">{state.error}</p>}
      <button type="submit" className="btn btn-primary btn-lg w-full" disabled={state.sending}>
        {state.sending ? <Loader2 className="size-5 animate-spin" aria-hidden="true" /> : <CheckCircle2 className="size-5" aria-hidden="true" />}
        {state.sending ? "Sending…" : "Book my free trial"}
      </button>
    </form>
  );
}
