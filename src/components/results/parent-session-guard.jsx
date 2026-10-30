"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const IDLE_MS = 30 * 60 * 1000;
const HEARTBEAT_MS = 5 * 60 * 1000;

// Remove private marks from the screen when the session expires, including a tab
// left open without navigation. Only recent user activity renews the DB session.
export function ParentSessionGuard({ children }) {
  const [expired, setExpired] = useState(false);
  const router = useRouter();
  const timing = useRef(null);
  useEffect(() => {
    let stopped = false, ended = false, pending = false;
    timing.current = { activity: Date.now(), confirmed: Date.now() };
    const end = () => {
      if (stopped || ended) return;
      ended = true;
      setExpired(true);
      void fetch("/api/parent-session", { method: "DELETE", signal: AbortSignal.timeout(15000) }).catch(() => {});
    };
    const check = async () => {
      if (stopped || ended || document.hidden || pending) return;
      const now = Date.now(), state = timing.current;
      if (now - state.activity >= IDLE_MS || now - state.confirmed >= IDLE_MS) { end(); return; }
      if (now - state.activity > 60000 || now - state.confirmed < HEARTBEAT_MS) return;
      pending = true;
      try {
        const response = await fetch("/api/parent-session", { cache: "no-store", signal: AbortSignal.timeout(15000) });
        if (!stopped && response.status === 401) end();
        else if (!stopped && response.ok) state.confirmed = Date.now();
      } catch { /* Failed renewal never extends the confirmed session. */ }
      finally { pending = false; }
    };
    const activity = () => { timing.current.activity = Date.now(); void check(); };
    const visibility = () => { void check(); };
    const events = ["pointerdown", "keydown", "scroll", "touchstart"];
    for (const event of events) window.addEventListener(event, activity, { passive: true });
    document.addEventListener("visibilitychange", visibility);
    const timer = setInterval(check, 15000);
    return () => {
      stopped = true; clearInterval(timer);
      for (const event of events) window.removeEventListener(event, activity);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  if (expired) return <div className="page-wrap max-w-xl py-16 text-center"><h1 className="font-display text-2xl text-mushaf-900">Your session has ended</h1><p className="mt-3 text-sm text-ink-soft">For your child’s privacy the result is no longer displayed. Sign in again to continue.</p><button type="button" className="btn btn-primary mt-5" onClick={() => { router.replace("/parents"); router.refresh(); }}>Sign in again</button></div>;
  return children;
}
