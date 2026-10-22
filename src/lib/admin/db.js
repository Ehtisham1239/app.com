"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { getBrowserClient } from "@/lib/supabase/browser";

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
  const [state, setState] = useState({ loading: true, data: null, count: null, error: null });
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const run = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await fnRef.current();
      if (res?.error) throw res.error;
      setState({ loading: false, data: res?.data ?? res ?? null, count: res?.count ?? null, error: null });
    } catch (error) {
      setState({ loading: false, data: null, count: null, error });
    }
  }, []);
  useEffect(() => {
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return { ...state, reload: run };
}

// Escapes user search text for PostgREST `or=(... ilike ...)` filters.
export function likeTerm(q) {
  return `%${String(q || "").replace(/[%_,()*\\]/g, " ").trim()}%`;
}

export function downloadCsv(filename, rows, columns) {
  const esc = (v) => {
    if (v === null || v === undefined) return "";
    const s = Array.isArray(v) ? v.join("; ") : typeof v === "object" ? JSON.stringify(v) : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = columns.map((c) => esc(c.label)).join(",");
  const body = rows.map((r) => columns.map((c) => esc(typeof c.value === "function" ? c.value(r) : r[c.key])).join(",")).join("\n");
  const blob = new Blob([`﻿${header}\n${body}`], { type: "text/csv;charset=utf-8" });
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
