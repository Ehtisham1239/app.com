"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-paper px-6">
      <div className="surface max-w-lg p-10 text-center">
        <img src="/brand/mark.png" alt="" className="mx-auto w-16" />
        <h1 className="mt-6 text-[2rem] text-mushaf-900">Something went wrong</h1>
        <p className="mt-3 text-ink-soft">Please try again. If the problem continues, contact us on WhatsApp.</p>
        <button type="button" onClick={() => reset()} className="btn btn-primary mt-8">
          Try again
        </button>
      </div>
    </main>
  );
}
