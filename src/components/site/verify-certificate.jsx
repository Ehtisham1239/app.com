"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { BadgeCheck, Loader2, Search, SearchX } from "lucide-react";
import { getPublicBrowserClient } from "@/lib/supabase/public";
import { formatDate } from "@/lib/format";

export function VerifyCertificate() {
  const params = useSearchParams();
  const initial = (params.get("number") || "").trim().toUpperCase();
  const [number, setNumber] = useState(initial);
  const [state, setState] = useState({ loading: initial.length >= 4, checked: initial, result: undefined, error: "" });

  const lookup = useCallback(async (n) => {
    const { data, error } = await getPublicBrowserClient().rpc("verify_certificate", { p_number: n });
    if (error) {
      setState({ loading: false, checked: n, result: undefined, error: "We could not check the certificate right now. Please try again in a moment." });
      return;
    }
    setState({ loading: false, checked: n, result: data ?? null, error: "" });
  }, []);

  const check = (value) => {
    const n = String(value || "").trim().toUpperCase();
    if (n.length < 4) {
      setState({ loading: false, checked: "", result: undefined, error: "Enter the certificate number printed on the certificate, for example OQC-CERT-2026-0001." });
      return;
    }
    setState({ loading: true, checked: n, result: undefined, error: "" });
    lookup(n);
  };

  // A link like /verify-certificate?number=OQC-CERT-2026-0001 checks straight away.
  useEffect(() => {
    if (initial.length >= 4) lookup(initial);
  }, [initial, lookup]);

  const r = state.result;

  return (
    <div className="space-y-6">
      <form
        className="surface flex flex-col gap-3 p-5 shadow-[var(--shadow-lift)] sm:flex-row sm:items-end sm:p-6"
        onSubmit={(e) => {
          e.preventDefault();
          check(number);
        }}
      >
        <div className="flex-1">
          <label htmlFor="cert-number" className="field-label">
            Certificate number
          </label>
          <input
            id="cert-number"
            className="input font-mono uppercase tracking-wide"
            placeholder="OQC-CERT-2026-0001"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            autoComplete="off"
            spellCheck={false}
            maxLength={40}
          />
        </div>
        <button type="submit" className="btn btn-primary btn-lg" disabled={state.loading}>
          {state.loading ? <Loader2 className="size-5 animate-spin" aria-hidden="true" /> : <Search className="size-5" aria-hidden="true" />}
          Check
        </button>
      </form>

      {state.error && (
        <p className="rounded-xl bg-rose-600/10 px-4 py-3 text-[0.95rem] font-medium text-rose-600" role="alert">
          {state.error}
        </p>
      )}

      {r === null && (
        <div className="surface flex gap-4 p-6" role="status">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-rose-600/10 text-rose-600">
            <SearchX className="size-6" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-sans text-[1.1rem] font-bold text-mushaf-900">No issued certificate found</h2>
            <p className="mt-1 text-[0.97rem] text-ink-soft">
              We could not find an issued certificate with the number <span className="font-mono font-semibold text-ink">{state.checked}</span>. Please check the number, or contact us
              and we will confirm it for you.
            </p>
          </div>
        </div>
      )}

      {r && (
        <div className="relative overflow-hidden rounded-[var(--radius-card)] border border-gold-300 bg-white shadow-[var(--shadow-lift)]" role="status">
          <div className="pattern-girih pointer-events-none absolute inset-0 opacity-[0.06]" aria-hidden="true" />
          <div className="relative flex items-center gap-3 border-b border-gold-100 bg-leaf-50 px-6 py-4">
            <BadgeCheck className="size-7 text-leaf-600" aria-hidden="true" />
            <div>
              <p className="font-bold text-leaf-800">Verified certificate</p>
              <p className="text-[0.85rem] text-ink-soft">Issued by Online Quran College</p>
            </div>
          </div>
          <dl className="relative grid gap-5 px-6 py-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <dt className="text-xs font-bold uppercase tracking-[0.16em] text-ink-faint">Awarded to</dt>
              <dd className="mt-1 font-display text-[2rem] leading-tight text-mushaf-900">{r.student}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-[0.16em] text-ink-faint">Certificate</dt>
              <dd className="mt-1 font-semibold text-ink">{r.title}</dd>
            </div>
            {r.course && (
              <div>
                <dt className="text-xs font-bold uppercase tracking-[0.16em] text-ink-faint">Course</dt>
                <dd className="mt-1 font-semibold text-ink">{r.course}</dd>
              </div>
            )}
            <div>
              <dt className="text-xs font-bold uppercase tracking-[0.16em] text-ink-faint">Issued on</dt>
              <dd className="mt-1 font-semibold text-ink">{formatDate(r.issued_on)}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-[0.16em] text-ink-faint">Number</dt>
              <dd className="mt-1 font-mono font-semibold text-ink">{r.number}</dd>
            </div>
            {r.signed_by && (
              <div>
                <dt className="text-xs font-bold uppercase tracking-[0.16em] text-ink-faint">Signed by</dt>
                <dd className="mt-1 font-semibold text-ink">{r.signed_by}</dd>
              </div>
            )}
          </dl>
        </div>
      )}
    </div>
  );
}
