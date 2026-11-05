"use client";

import { useMemo, useState } from "react";
import { calculateHifzPlan } from "@/lib/hifz-planner";

const FIELDS = [
  { key: "remainingPages", label: "Pages still to memorise", min: 1, max: 10000, hint: "Use the page count in your own Mushaf." },
  { key: "studyDaysPerWeek", label: "New memorisation days each week", min: 1, max: 7, hint: "How many days your teacher has agreed you can study." },
  { key: "revisionPages", label: "Pages in your current revision cycle", min: 0, max: 10000, hint: "Enter 0 if you are not setting a revision target yet." },
  { key: "revisionDaysPerWeek", label: "Revision days each week", min: 1, max: 7, hint: "Days available for your existing revision." },
];

const EMPTY = { remainingPages: "", studyDaysPerWeek: "", revisionPages: "", revisionDaysPerWeek: "" };

export function HifzPlanner() {
  const [values, setValues] = useState(EMPTY);
  const ready = Object.values(values).every((value) => value !== "");
  const result = useMemo(() => ready
    ? calculateHifzPlan(Object.fromEntries(Object.entries(values).map(([key, value]) => [key, Number(value)])))
    : null, [ready, values]);

  return (
    <div className="grid gap-8 lg:grid-cols-[1.05fr_.95fr]">
      <form className="surface space-y-5 p-6 sm:p-8" onSubmit={(event) => event.preventDefault()}>
        {FIELDS.map(({ key, label, min, max, hint }) => (
          <div key={key}>
            <label htmlFor={`hifz-${key}`} className="block text-sm font-semibold text-mushaf-900">{label}</label>
            <input
              id={`hifz-${key}`}
              name={key}
              type="number"
              inputMode="numeric"
              min={min}
              max={max}
              step="1"
              required
              value={values[key]}
              onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.value }))}
              className="mt-2 min-h-12 w-full rounded-xl border border-line bg-white px-4 text-base text-ink focus-visible:outline-2 focus-visible:outline-leaf-700"
            />
            <p className="mt-1.5 text-xs text-ink-soft">{hint}</p>
          </div>
        ))}
        <button type="button" onClick={() => setValues(EMPTY)} className="btn btn-outline">Clear planner</button>
      </form>

      <section className="rounded-3xl border border-leaf-100 bg-leaf-50/60 p-6 sm:p-8" aria-live="polite" aria-labelledby="hifz-result-title">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-leaf-700">Your calculation</p>
        <h2 id="hifz-result-title" className="mt-2 text-2xl text-mushaf-900">A simple weekly target</h2>
        {!ready ? (
          <p className="mt-4 leading-relaxed text-ink-soft">Enter your own page counts and available days to calculate a simple weekly plan.</p>
        ) : result?.error ? (
          <p className="mt-4 rounded-xl border border-rose-200 bg-white p-4 text-sm text-rose-700">{result.error}</p>
        ) : (
          <dl className="mt-6 space-y-4">
            <div className="rounded-2xl bg-white p-4">
              <dt className="text-sm text-ink-soft">New memorisation target</dt>
              <dd className="mt-1 text-3xl font-bold text-mushaf-900">{result.newPagesPerStudyDay} <span className="text-base font-medium">pages per study day</span></dd>
            </div>
            <div className="rounded-2xl bg-white p-4">
              <dt className="text-sm text-ink-soft">Estimated time at that target</dt>
              <dd className="mt-1 text-2xl font-bold text-mushaf-900">{result.estimatedWeeks} {result.estimatedWeeks === 1 ? "week" : "weeks"}</dd>
              <p className="mt-1 text-xs text-ink-soft">About {result.estimatedStudyDays} study days; assumes the same number of study days each week.</p>
            </div>
            <div className="rounded-2xl bg-white p-4">
              <dt className="text-sm text-ink-soft">Revision target</dt>
              <dd className="mt-1 text-2xl font-bold text-mushaf-900">{result.revisionPagesPerDay} <span className="text-base font-medium">pages per revision day</span></dd>
              <p className="mt-1 text-xs text-ink-soft">{result.revisionPagesPerDay === 0 ? "No revision pages entered." : "Based on the revision pages and days you entered."}</p>
            </div>
          </dl>
        )}
        <p className="mt-5 text-xs leading-relaxed text-ink-soft">This is an arithmetic planning aid, not a memorisation recommendation or assessment. Ask your Quran teacher to set a suitable new-lesson and revision load, check recitation and adjust the plan to your learner. Different Mushaf layouts have different page counts.</p>
      </section>
    </div>
  );
}
