"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, LockKeyhole } from "lucide-react";
import { getBrowserClient } from "@/lib/supabase/browser";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    let err;
    try {
      ({ error: err } = await getBrowserClient().auth.signInWithPassword({ email: email.trim().toLowerCase(), password }));
    } catch (cause) { err = cause; }
    if (err) {
      setBusy(false);
      setError(
        /invalid/i.test(err.message)
          ? "Email or password is not correct."
          : /banned/i.test(err.message)
            ? "This login has been disabled. Contact a Super Admin."
            : /fetch/i.test(err.message)
              ? "Cannot reach the server. Check your internet connection."
              : err.message,
      );
      return;
    }
    const next = params.get("next");
    router.replace(next && next.startsWith("/admin") ? next : "/admin");
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <label htmlFor="email" className="field-label">
          Email
        </label>
        <input id="email" type="email" autoComplete="username" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="field-label">
            Password
          </label>
          <Link href="/admin/forgot" className="mb-1.5 text-[0.85rem] font-semibold text-leaf-700 hover:underline">
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <input id="password" type={show ? "text" : "password"} autoComplete="current-password" required className="input pr-11" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-ink-faint hover:text-ink" aria-label={show ? "Hide password" : "Show password"}>
            {show ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
          </button>
        </div>
      </div>
      {error && (
        <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </p>
      )}
      <button type="submit" className="btn btn-primary btn-lg w-full" disabled={busy}>
        {busy ? <Loader2 className="size-5 animate-spin" /> : <LockKeyhole className="size-5" />} Sign in
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="grid min-h-screen bg-paper lg:grid-cols-[1.05fr_1fr]">
      <section className="relative hidden overflow-hidden bg-mushaf-950 p-12 text-white lg:flex lg:flex-col">
        <div className="pattern-girih pointer-events-none absolute inset-0 opacity-[0.08]" aria-hidden="true" />
        <div className="relative flex items-center gap-3">
          <img src="/brand/logo.webp" alt="Online Quran College" width={64} height={64} className="size-16 rounded-lg bg-white p-1" />
          <span>
            <span className="block font-display text-xl">Online Quran College</span>
            <span className="block text-[0.7rem] font-bold uppercase tracking-[0.22em] text-gold-300">CMS Portal</span>
          </span>
        </div>
        <div className="relative my-auto max-w-md">
          <p lang="ar" dir="rtl" className="arabic text-[4.5rem] leading-none text-gold-300/90">
            اقْرَأْ
          </p>
          <h1 className="mt-6 text-[2.6rem] leading-tight text-white">Manage your website and admissions in one place</h1>
          <p className="mt-4 text-white/70">Free-trial requests, messages, courses, fees, teachers, blog and every page of the website — all connected live.</p>
        </div>
        <p className="relative text-sm text-white/40">© {new Date().getFullYear()} Online Quran College LTD</p>
      </section>
      <section className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <img src="/brand/logo.webp" alt="Online Quran College" width={80} height={80} className="mb-6 size-20 lg:hidden" />
          <h2 className="font-sans text-[1.8rem] font-bold tracking-tight text-mushaf-900">Welcome back</h2>
          <p className="mb-8 mt-1 text-ink-soft">Sign in to the CMS Portal.</p>
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
          <p className="mt-8 text-center text-sm text-ink-faint">
            {/* Cross the public/staff CSP boundary with a new document. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/" className="hover:text-leaf-700">
              ← Back to the website
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
