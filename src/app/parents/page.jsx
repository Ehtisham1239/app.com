import { cookies } from "next/headers";
import { ShieldCheck } from "lucide-react";
import { publicDb } from "@/lib/supabase/public";
import { PARENT_COOKIE, validToken } from "@/lib/results/parent-session";
import { ParentAcademicRecords } from "@/components/results/parent-academic-records";
import { ParentSessionGuard } from "@/components/results/parent-session-guard";
import { ParentSignInForm, ParentSignOut } from "./sign-in-form";

export const metadata = { title: "Parent portal", robots: { index: false, follow: false } };

async function loadChildren() {
  const token = (await cookies()).get(PARENT_COOKIE)?.value;
  if (!validToken(token) || !publicDb) return { signedIn: false, expired: false };
  const { data, error } = await publicDb.rpc("parent_results", { p_token: token });
  if (error) return { signedIn: false, expired: false, unavailable: true };
  if (data === null) return { signedIn: false, expired: true };
  // Monthly progress reports are optional: the results page still works without them.
  const progress = await publicDb.rpc("parent_progress", { p_token: token });
  const reports = Object.fromEntries((Array.isArray(progress.data) ? progress.data : []).map((p) => [p.student_id, p]));
  return { signedIn: true, progressUnavailable: !!progress.error, children: (Array.isArray(data) ? data : []).map((k) => ({ ...k, progress: reports[k.id]?.reports || [], clientId: reports[k.id]?.client_id, clientName: reports[k.id]?.client_name })) };
}

export default async function ParentsPage({ searchParams }) {
  const query = await searchParams;
  const chosen = typeof query.report === "string" ? query.report : undefined;
  const view = typeof query.view === "string" ? query.view : "results";
  const state = await loadChildren();
  if (!state.signedIn) return <SignIn expired={state.expired} unavailable={state.unavailable} />;
  const kids = state.children;
  return (
    <ParentSessionGuard><div className="page-wrap max-w-5xl py-8 sm:py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">Assalamu alaikum</p>
          <h1 className="mt-1 font-display text-3xl text-mushaf-900">Your children’s progress</h1>
          <p className="mt-1 text-sm text-ink-soft">Only reports and results that Online Quran College has checked and published are shown here.</p>
        </div>
        <ParentSignOut />
      </div>

      <ParentAcademicRecords kids={kids} chosen={chosen} view={view} progressUnavailable={state.progressUnavailable} />
      <p className="mt-10 text-center text-xs text-ink-faint">For your privacy you are signed out after 30 minutes without activity. Please do not share this page.</p>
    </div></ParentSessionGuard>
  );
}

function SignIn({ expired, unavailable }) {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-br from-mushaf-900 via-mushaf-800 to-mushaf-700" aria-hidden="true">
        <div className="pattern-girih absolute inset-0 opacity-[0.15]" />
      </div>
      <div className="page-wrap relative max-w-xl py-10 sm:py-14">
        <div className="text-center text-white">
          <p className="font-arabic text-2xl text-gold-300" lang="ar" dir="rtl">بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</p>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl">Parent portal</h1>
          <p className="mt-2 text-sm text-white/80">Enter your Client ID and access code to see your child’s approved e-DMC, certificates and syllabus.</p>
        </div>
        <div className="mt-8 rounded-[1.4rem] border-2 border-gold-300 bg-white p-6 shadow-[0_24px_60px_-30px_rgba(13,74,28,0.6)] sm:p-8">
          {unavailable && <p role="alert" className="mb-4 rounded-xl bg-gold-50 px-4 py-3 text-sm text-gold-700">The results service is not available right now. Please try again shortly.</p>}
          <ParentSignInForm expired={expired} />
        </div>
        <ul className="mt-6 grid gap-3 text-sm text-ink-soft sm:grid-cols-3">
          {["Only published results", "Only your own children", "Code kept private"].map((t) => (
            <li key={t} className="flex items-center gap-2 rounded-xl bg-white px-3 py-2"><ShieldCheck className="size-4 shrink-0 text-leaf-700" aria-hidden="true" /> {t}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
