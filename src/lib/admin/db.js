"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { getBrowserClient } from "@/lib/supabase/browser";
import { serializeCsv } from "@/lib/csv";

export const db = () => getBrowserClient();

// Turns Supabase/Postgres errors into short, human messages.
export function errorMessage(error) {
  if (!error) return "Something went wrong.";
  const msg = error.message || String(error);
  if (error.code === "42501" || /row-level security|permission denied/i.test(msg)) return "You do not have permission to do this.";
  if (error.code === "23505" || /duplicate key/i.test(msg)) {
    if (/slug/i.test(msg)) return "That web address (slug) is already used. Choose another.";
    return "This already exists. Use a different value.";
  }
  if (error.code === "23503") return "This item is linked to other records, so it cannot be removed.";
  if (error.code === "23514" || /check constraint/i.test(msg)) return "One of the values is not allowed. Please check the form.";
  if (/Failed to fetch|NetworkError|fetch failed/i.test(msg)) return "Cannot reach the server. Check your internet connection.";
  if (/JWT|session/i.test(msg)) return "Your session has expired. Please sign in again.";
  return msg;
}

export function notifyError(error) {
  toast.error(errorMessage(error));
}

// Asks the server to rebuild the public pages now (otherwise they refresh within 5 minutes).
export function refreshSite() {
  fetch("/api/revalidate", { method: "POST" }).catch(() => {});
}

// Small data hook: runs `fn` (which returns { data, error, count }) and tracks loading/error.
export function useLoad(fn, deps = []) {
  const [state, setState] = useState({ inputs: deps, loading: true, data: null, count: null, error: null });
  const loadRef = useRef({ fn, deps });
  const version = useRef(0);
  const mounted = useRef(false);
  const invalidate = useCallback(() => { version.current++; }, []);
  // Update after commit, never during render (which React can abandon).
  useEffect(() => { loadRef.current = { fn, deps }; });
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; invalidate(); };
  }, [invalidate]);
  const run = useCallback(async () => {
    if (!mounted.current) return;
    const request = ++version.current;
    const { fn: load, deps: inputs } = loadRef.current;
    setState(s => ({ ...s, inputs, loading: true, error: null, ...(sameInputs(s.inputs, inputs) ? {} : { data: null, count: null }) }));
    try {
      const res = await load();
      if (res?.error) throw res.error;
      if (mounted.current && request === version.current) {
        // A valid empty Supabase response must stay null, not become {data:null}.
        const data = res && Object.hasOwn(res, "data") ? res.data : res ?? null;
        setState({ inputs, loading: false, data, count: res?.count ?? null, error: null });
      }
    } catch (error) {
      if (mounted.current && request === version.current) setState({ inputs, loading: false, data: null, count: null, error });
    }
  }, []);
  useEffect(() => {
    let canceled = false;
    // Begin after commit; cancel Strict Mode's discarded setup before any query.
    Promise.resolve().then(() => { if (!canceled) return run(); });
    return () => { canceled = true; invalidate(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  const { inputs, ...result } = state;
  // Never briefly show the previous record under a newly selected record URL.
  return { ...(sameInputs(inputs, deps) ? result : { loading: true, data: null, count: null, error: null }), reload: run };
}

function sameInputs(a, b) { return a.length === b.length && a.every((value, index) => Object.is(value, b[index])); }

// Escapes user search text for PostgREST `or=(... ilike ...)` filters.
export function likeTerm(q) {
  return `%${String(q || "").replace(/[%_,()*\\]/g, " ").trim()}%`;
}

export function downloadCsv(filename, rows, columns) {
  const blob = new Blob([serializeCsv(rows, columns)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), { href: url, download: filename });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// datetime-local <-> ISO, shown in the browser's own time zone
export function toLocalInput(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fromLocalInput(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}
