"use client";

import { useState } from "react";

export default function CourseFinder({ goals, entries }) {
  const [goal, setGoal] = useState("");
  const visible = goal ? entries.filter((entry) => entry.goal === goal) : entries;

  return (
    <>
      <div className="surface mb-6 px-4 py-4 sm:px-6">
        <fieldset>
          <legend className="mb-3 font-semibold text-mushaf-900">What would you like to learn?</legend>
          <div className="flex flex-wrap gap-2">
            {[{ id: "", label: "All courses" }, ...goals].map(({ id, label }) => (
              <button
                key={id}
                type="button"
                aria-pressed={goal === id}
                onClick={() => setGoal(id)}
                className="min-h-11 rounded-full border border-line bg-white px-4 text-sm font-semibold text-mushaf-900 hover:border-leaf-700 aria-pressed:border-mushaf-900 aria-pressed:bg-mushaf-900 aria-pressed:text-white"
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>
        <p className="mt-3 text-sm text-ink-soft" role="status">
          {visible.length} {visible.length === 1 ? "course" : "courses"}
        </p>
      </div>
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map(({ slug, card }) => <li key={slug}>{card}</li>)}
      </ul>
    </>
  );
}
