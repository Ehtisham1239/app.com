"use client";

import { clsx } from "clsx";
import { RATINGS } from "@/lib/progress/constants";

const ON = {
  excellent: "border-leaf-700 bg-leaf-700 text-white",
  good: "border-leaf-600 bg-leaf-100 text-leaf-800",
  satisfactory: "border-gold-500 bg-gold-100 text-gold-700",
  needs_improvement: "border-rose-400 bg-rose-50 text-rose-700",
};

// Large tap targets for one rating: a radio group styled as pills (keyboard: arrow keys).
export function RatingPicker({ name, label, hint, value, onChange, disabled }) {
  return (
    <fieldset className="rounded-2xl border border-line bg-white px-4 py-3.5" disabled={disabled}>
      <legend className="sr-only">{label}</legend>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5">
        <div aria-hidden="true">
          <p className="font-semibold text-mushaf-900">{label}</p>
          {hint && <p className="text-xs text-ink-faint">{hint}</p>}
        </div>
        <div className="grid w-full grid-cols-2 gap-1.5 sm:flex sm:w-auto sm:flex-wrap">
          {RATINGS.map((r) => (
            <label key={r.value} className={clsx(
              "flex cursor-pointer items-center justify-center rounded-full border px-3 py-2 text-center text-sm font-semibold transition-colors focus-within:ring-2 focus-within:ring-leaf-600 focus-within:ring-offset-1",
              value === r.value ? ON[r.value] : "border-line bg-paper text-ink-soft hover:border-leaf-600 hover:text-ink",
              disabled && "cursor-not-allowed opacity-70",
            )}>
              <input type="radio" className="sr-only" name={name} value={r.value} checked={value === r.value} onChange={() => onChange(r.value)} />
              {r.label}
            </label>
          ))}
        </div>
      </div>
    </fieldset>
  );
}
