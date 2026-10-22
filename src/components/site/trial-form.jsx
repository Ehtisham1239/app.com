"use client";
import { announceLeadSaved } from "@/lib/conversion-events";
import { MARKET_TIME_ZONES } from "@/lib/market-timezones";
import { LOCATIONS, locationTimeZone } from "@/lib/locations";

import Link from "next/link";
import { captureAttribution } from "@/lib/attribution";
import { useSearchParams } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { clsx } from "clsx";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Loader2, MessageCircle } from "lucide-react";
import { getPublicBrowserClient } from "@/lib/supabase/public";
import { AGE_BANDS, COUNTRIES, LANGUAGES, LEVELS, TEACHER_PREFS, TIME_SLOTS, WEEKDAYS } from "@/lib/constants";

const STEPS = [
  { title: "The learner", hint: "Who will take the classes?" },
  { title: "Days & times", hint: "When suits you best?" },
  { title: "Your details", hint: "How can we reach you?" },
];

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const ADULT = "adult";

function browserTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  } catch {
    return "";
  }
}

// Picks the most specific time zone we know for the chosen country.
function zoneFor(country, browserTz, cityName) {
  const location = LOCATIONS.find((c) => c.name === country);
  const city = [...(location?.cities || []), ...(MARKET_TIME_ZONES[country] || [])].find((c) => c.name.toLowerCase() === cityName?.trim().toLowerCase());
  if (city) return locationTimeZone(location, city);
  const entry = COUNTRIES.find(([name]) => name === country);
  if (!entry) return browserTz || "UTC";
  const countryTz = entry[1];
  if (browserTz && browserTz.split("/")[0] === countryTz.split("/")[0] && country !== "Other") {
    // Same region (e.g. America/Chicago for the United States): the browser knows better.
    const sameCountry = COUNTRIES.filter(([, tz]) => tz === browserTz).map(([n]) => n);
    if (sameCountry.length === 0 || sameCountry.includes(country)) return browserTz;
  }
  return countryTz;
}

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[0.9rem] font-medium transition-colors",
        active ? "border-leaf-700 bg-leaf-700 text-white" : "border-line-strong bg-white text-ink hover:border-leaf-600 hover:text-leaf-700",
      )}
    >
      {active && <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />}
      {children}
    </button>
  );
}

function FieldError({ children }) {
  if (!children) return null;
  return (
    <p className="mt-1.5 text-[0.82rem] font-medium text-rose-600" role="alert">
      {children}
    </p>
  );
}

export function TrialForm({ courses = [], plans = [], consentText, successText, whatsappHref }) {
  const params = useSearchParams();
  const topRef = useRef(null);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [state, setState] = useState({ sending: false, error: "", reference: null });
  const [form, setForm] = useState(() => {
    // Pre-fill from links such as /free-trial?course=<id>&plan=<id>, and guess the country from the time zone.
    const tz = browserTimeZone();
    const course = params.get("course");
    const plan = params.get("plan");
    return {
      learner_name: "",
      age_band: "",
      learner_gender: "",
      guardian_name: "",
      course_id: course && courses.some((c) => c.id === course) ? course : "",
      level: "beginner",
      country: params.get("country") || (COUNTRIES.find(([, zone]) => zone === tz)?.[0] ?? ""),
      city: params.get("city") || "",
      timezone: tz,
      preferred_days: [],
      preferred_times: [],
      teacher_gender_pref: "any",
      teaching_language: "English",
      plan_id: plan && plans.some((p) => p.id === plan) ? plan : "",
      email: "",
      phone: "",
      phone_is_whatsapp: true,
      notes: "",
      consent: false,
      marketing_opt_in: false,
      website: "",
    };
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggle = (k, v) => setForm((f) => ({ ...f, [k]: f[k].includes(v) ? f[k].filter((x) => x !== v) : [...f[k], v] }));

  const isChild = form.age_band && form.age_band !== ADULT;
  const timezone = useMemo(() => zoneFor(form.country, form.timezone || browserTimeZone(), form.city), [form.country, form.timezone, form.city]);

  function validate(which) {
    const e = {};
    if (which === 0) {
      if (form.learner_name.trim().length < 2) e.learner_name = "Please enter the learner’s name.";
      if (!form.age_band) e.age_band = "Please choose an age group.";
      if (isChild && form.guardian_name.trim().length < 2) e.guardian_name = "Please enter the parent or guardian’s name.";
    }
    if (which === 1) {
      if (!form.country) e.country = "Please choose your country.";
    }
    if (which === 2) {
      if (!EMAIL.test(form.email.trim())) e.email = "Please enter a valid email address.";
      const digits = form.phone.replace(/[^0-9]/g, "");
      if (digits.length < 7 || digits.length > 15) e.phone = "Please enter your phone or WhatsApp number with the country code.";
      if (!form.consent) e.consent = "Please agree so we can contact you about the trial.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function goTo(next) {
    setStep(next);
    setState((s) => ({ ...s, error: "" }));
    requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function next() {
    if (validate(step)) goTo(step + 1);
  }

  async function submit(e) {
    e.preventDefault();
    if (step < STEPS.length - 1) return next();
    if (!validate(2)) return;
    setState({ sending: true, error: "", reference: null });
    const utm = captureAttribution();
    const plan = plans.find((p) => p.id === form.plan_id);
    const notes = [plan ? `Package of interest: ${plan.name}` : "", form.notes.trim()].filter(Boolean).join("\n");
    const payload = {
      learner_name: form.learner_name.trim(),
      guardian_name: isChild ? form.guardian_name.trim() : form.guardian_name.trim() || null,
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      phone_is_whatsapp: form.phone_is_whatsapp,
      country: form.country,
      city: form.city.trim(),
      timezone,
      age_band: form.age_band,
      learner_gender: form.learner_gender || null,
      course_id: form.course_id || null,
      level: form.level,
      teacher_gender_pref: form.teacher_gender_pref,
      teaching_language: form.teaching_language,
      preferred_days: form.preferred_days,
      preferred_times: form.preferred_times,
      notes,
      consent: form.consent,
      marketing_opt_in: form.marketing_opt_in,
      source: utm.utm_source || "website",
      utm,
      website: form.website,
    };
    let data, error;
    try {
      ({ data, error } = await getPublicBrowserClient().rpc("submit_trial_application", { payload }));
    } catch (cause) { error = cause; }
    if (error) {
      setState({ sending: false, error: error.message || "We could not send your request. Please try again or message us on WhatsApp.", reference: null });
      return;
    }
    announceLeadSaved({ formType: "trial", country: form.country, reference: data?.reference, honeypot: form.website });
    setState({ sending: false, error: "", reference: data?.reference ?? "sent" });
    requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  if (state.reference) {
    const showRef = state.reference !== "sent" && state.reference !== "TR-RECEIVED";
    return (
      <div ref={topRef} className="surface scroll-mt-28 overflow-hidden shadow-[var(--shadow-lift)]" role="status">
        <div className="bg-leaf-50 px-6 py-10 text-center sm:px-10">
          <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-white text-leaf-600 shadow-sm ring-1 ring-leaf-100">
            <CheckCircle2 className="size-9" aria-hidden="true" />
          </span>
          <h2 className="mt-5 text-[2rem] text-mushaf-900">Request received</h2>
          <p className="mx-auto mt-3 max-w-md text-[1.02rem] leading-relaxed text-ink-soft">{successText}</p>
          {showRef && (
            <p className="mt-5 inline-flex rounded-full bg-white px-4 py-1.5 font-mono text-sm font-semibold text-gold-700 ring-1 ring-gold-100">Reference: {state.reference}</p>
          )}
        </div>
        <div className="px-6 py-8 sm:px-10">
          <h3 className="text-[0.8rem] font-bold uppercase tracking-[0.18em] text-gold-700">What happens next</h3>
          <ol className="mt-4 space-y-3 text-[0.97rem] text-ink">
            {["A coordinator contacts you by WhatsApp or email, usually within 24 hours.", "Together you agree a time in your time zone and a teacher you are comfortable with.", "You receive the class link and meet your teacher for the free trial."].map((t, i) => (
              <li key={t} className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-mushaf-900 text-[0.8rem] font-bold text-gold-300">{i + 1}</span>
                {t}
              </li>
            ))}
          </ol>
          <div className="mt-8 flex flex-wrap gap-3">
            {whatsappHref && (
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                <MessageCircle className="size-5" aria-hidden="true" /> Message us on WhatsApp
              </a>
            )}
            <Link href="/courses" className="btn btn-outline">
              Browse courses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const inputCls = (k) => clsx(k === "select" ? "select" : "input");

  return (
    <form ref={topRef} onSubmit={submit} noValidate className="surface scroll-mt-28 overflow-hidden shadow-[var(--shadow-lift)]">
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label>
          Website
          <input tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => set("website", e.target.value)} />
        </label>
      </div>

      {/* progress */}
      <div className="border-b border-line bg-paper/60 px-6 py-5 sm:px-8">
        <ol className="flex items-center gap-2" aria-label="Form progress">
          {STEPS.map((s, i) => (
            <li key={s.title} className="flex flex-1 items-center gap-2">
              <span
                className={clsx(
                  "flex size-8 shrink-0 items-center justify-center rounded-full text-[0.85rem] font-bold transition-colors",
                  i < step ? "bg-leaf-700 text-white" : i === step ? "bg-mushaf-900 text-gold-300" : "bg-white text-ink-faint ring-1 ring-line-strong",
                )}
                aria-current={i === step ? "step" : undefined}
              >
                {i < step ? <Check className="size-4" strokeWidth={3} aria-hidden="true" /> : i + 1}
              </span>
              <span className={clsx("hidden text-[0.85rem] font-semibold sm:block", i === step ? "text-mushaf-900" : "text-ink-faint")}>{s.title}</span>
              {i < STEPS.length - 1 && <span className={clsx("h-px flex-1", i < step ? "bg-leaf-600" : "bg-line-strong")} aria-hidden="true" />}
            </li>
          ))}
        </ol>
      </div>

      <div className="space-y-6 px-6 py-7 sm:px-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-700">
            Step {step + 1} of {STEPS.length}
          </p>
          <h2 className="mt-1 text-[1.7rem] text-mushaf-900">{STEPS[step].hint}</h2>
        </div>

        {step === 0 && (
          <>
            <div>
              <label htmlFor="t-name" className="field-label">
                Learner’s full name
              </label>
              <input id="t-name" className="input" value={form.learner_name} onChange={(e) => set("learner_name", e.target.value)} autoComplete="name" maxLength={120} aria-invalid={Boolean(errors.learner_name)} />
              <FieldError>{errors.learner_name}</FieldError>
            </div>

            <fieldset>
              <legend className="field-label">Age group</legend>
              <div className="flex flex-wrap gap-2">
                {AGE_BANDS.map((a) => (
                  <Chip key={a.value} active={form.age_band === a.value} onClick={() => set("age_band", a.value)}>
                    {a.label}
                  </Chip>
                ))}
              </div>
              <FieldError>{errors.age_band}</FieldError>
            </fieldset>

            {isChild && (
              <div>
                <label htmlFor="t-guardian" className="field-label">
                  Parent or guardian’s name
                </label>
                <input id="t-guardian" className="input" value={form.guardian_name} onChange={(e) => set("guardian_name", e.target.value)} maxLength={120} aria-invalid={Boolean(errors.guardian_name)} />
                <FieldError>{errors.guardian_name}</FieldError>
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="t-course" className="field-label">
                  Course <span className="font-normal text-ink-faint">(optional)</span>
                </label>
                <select id="t-course" className={inputCls("select")} value={form.course_id} onChange={(e) => set("course_id", e.target.value)}>
                  <option value="">Not sure yet — please advise</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="t-level" className="field-label">
                  Current level
                </label>
                <select id="t-level" className={inputCls("select")} value={form.level} onChange={(e) => set("level", e.target.value)}>
                  {LEVELS.map((l) => (
                    <option key={l.value} value={l.value}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <fieldset>
              <legend className="field-label">
                Learner is <span className="font-normal text-ink-faint">(optional)</span>
              </legend>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "female", label: "Female" },
                  { value: "male", label: "Male" },
                ].map((g) => (
                  <Chip key={g.value} active={form.learner_gender === g.value} onClick={() => set("learner_gender", form.learner_gender === g.value ? "" : g.value)}>
                    {g.label}
                  </Chip>
                ))}
              </div>
            </fieldset>
          </>
        )}

        {step === 1 && (
          <>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="t-country" className="field-label">
                  Country
                </label>
                <select id="t-country" className={inputCls("select")} value={form.country} onChange={(e) => set("country", e.target.value)} aria-invalid={Boolean(errors.country)}>
                  <option value="">Choose…</option>
                  {COUNTRIES.map(([n]) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
                <FieldError>{errors.country}</FieldError>
              </div>
              <div>
                <label htmlFor="t-city" className="field-label">
                  City <span className="font-normal text-ink-faint">(optional)</span>
                </label>
                <input id="t-city" className="input" value={form.city} onChange={(e) => set("city", e.target.value)} autoComplete="address-level2" maxLength={80} />
              </div>
            </div>
            {form.country && <p className="-mt-3 text-[0.85rem] text-ink-faint">We will arrange classes in your time zone ({timezone.replace(/_/g, " ")}).</p>}

            <fieldset>
              <legend className="field-label">
                Preferred days <span className="font-normal text-ink-faint">(choose all that suit you)</span>
              </legend>
              <div className="flex flex-wrap gap-2">
                {WEEKDAYS.map((d) => (
                  <Chip key={d.value} active={form.preferred_days.includes(d.short)} onClick={() => toggle("preferred_days", d.short)}>
                    {d.short}
                  </Chip>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="field-label">Preferred times</legend>
              <div className="flex flex-wrap gap-2">
                {TIME_SLOTS.map((t) => (
                  <Chip key={t.value} active={form.preferred_times.includes(t.value)} onClick={() => toggle("preferred_times", t.value)}>
                    {t.label}
                  </Chip>
                ))}
              </div>
            </fieldset>

            <div className="grid gap-5 sm:grid-cols-2">
              <fieldset>
                <legend className="field-label">Teacher</legend>
                <div className="flex flex-wrap gap-2">
                  {TEACHER_PREFS.map((t) => (
                    <Chip key={t.value} active={form.teacher_gender_pref === t.value} onClick={() => set("teacher_gender_pref", t.value)}>
                      {t.label}
                    </Chip>
                  ))}
                </div>
              </fieldset>
              <div>
                <label htmlFor="t-lang" className="field-label">
                  Explained in
                </label>
                <select id="t-lang" className={inputCls("select")} value={form.teaching_language} onChange={(e) => set("teaching_language", e.target.value)}>
                  {LANGUAGES.map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </select>
              </div>
            </div>

            {plans.length > 0 && (
              <div>
                <label htmlFor="t-plan" className="field-label">
                  Package you are considering <span className="font-normal text-ink-faint">(optional)</span>
                </label>
                <select id="t-plan" className={inputCls("select")} value={form.plan_id} onChange={(e) => set("plan_id", e.target.value)}>
                  <option value="">Decide after the trial</option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                      {p.classes_per_week ? ` — ${p.classes_per_week} ${p.classes_per_week === 1 ? "day" : "days"} a week` : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </>
        )}

        {step === 2 && (
          <>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="t-email" className="field-label">
                  Email
                </label>
                <input id="t-email" type="email" className="input" value={form.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" maxLength={254} aria-invalid={Boolean(errors.email)} />
                <FieldError>{errors.email}</FieldError>
              </div>
              <div>
                <label htmlFor="t-phone" className="field-label">
                  Phone / WhatsApp
                </label>
                <input id="t-phone" type="tel" className="input" placeholder="+44 7700 900123" value={form.phone} onChange={(e) => set("phone", e.target.value)} autoComplete="tel" maxLength={24} aria-invalid={Boolean(errors.phone)} />
                <FieldError>{errors.phone}</FieldError>
                <label className="mt-2 flex items-center gap-2 text-[0.88rem] text-ink-soft">
                  <input type="checkbox" className="check" checked={form.phone_is_whatsapp} onChange={(e) => set("phone_is_whatsapp", e.target.checked)} />
                  This number is on WhatsApp
                </label>
              </div>
            </div>
            <div>
              <label htmlFor="t-notes" className="field-label">
                Anything we should know? <span className="font-normal text-ink-faint">(optional)</span>
              </label>
              <textarea
                id="t-notes"
                className="textarea"
                rows={3}
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                maxLength={1800}
                placeholder="For example: current surah, a teacher you would like, or the best time to call you."
              />
            </div>
            <div className="space-y-3 rounded-xl bg-paper/70 p-4">
              <label className="flex gap-3 text-[0.9rem] leading-relaxed text-ink">
                <input type="checkbox" className="check mt-0.5 shrink-0" checked={form.consent} onChange={(e) => set("consent", e.target.checked)} aria-invalid={Boolean(errors.consent)} />
                <span>
                  {consentText}{" "}
                  <Link href="/privacy-policy" className="font-semibold text-leaf-700 underline underline-offset-2" target="_blank">
                    Privacy policy
                  </Link>
                </span>
              </label>
              <FieldError>{errors.consent}</FieldError>
              <label className="flex gap-3 text-[0.88rem] leading-relaxed text-ink-soft">
                <input type="checkbox" className="check mt-0.5 shrink-0" checked={form.marketing_opt_in} onChange={(e) => set("marketing_opt_in", e.target.checked)} />
                <span>Send me occasional news about courses and offers (optional).</span>
              </label>
            </div>
          </>
        )}

        {state.error && (
          <p className="rounded-xl bg-rose-600/10 px-4 py-3 text-[0.92rem] font-medium text-rose-600" role="alert">
            {state.error}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
          {step > 0 ? (
            <button type="button" className="btn btn-ghost" onClick={() => goTo(step - 1)} disabled={state.sending}>
              <ArrowLeft className="size-4" aria-hidden="true" /> Back
            </button>
          ) : (
            <span className="text-[0.85rem] text-ink-faint">Takes about a minute · No payment needed</span>
          )}
          {step < STEPS.length - 1 ? (
            <button type="button" className="btn btn-primary btn-lg" onClick={next}>
              Continue <ArrowRight className="size-5" aria-hidden="true" />
            </button>
          ) : (
            <button type="submit" className="btn btn-gold btn-lg" disabled={state.sending}>
              {state.sending ? <Loader2 className="size-5 animate-spin" aria-hidden="true" /> : <CheckCircle2 className="size-5" aria-hidden="true" />}
              {state.sending ? "Sending…" : "Book my free trial"}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
