import { cookies } from "next/headers";
import { Award, GraduationCap, ShieldCheck } from "lucide-react";
import { publicDb } from "@/lib/supabase/public";
import { formatDate } from "@/lib/format";
import { PARENT_COOKIE, validToken } from "@/lib/results/parent-session";
import { MarksSheet, groupByPeriod } from "@/components/results/marks-sheet";
import { ProgressCertificate } from "@/components/results/progress-certificate";
import { periodLabel } from "@/lib/progress/constants";
import { ParentSessionGuard } from "@/components/results/parent-session-guard";
import { ParentSignInForm, ParentSignOut } from "./sign-in-form";

export const metadata = { title: "Student results", robots: { index: false, follow: false } };

async function loadChildren() {
  const token = (await cookies()).get(PARENT_COOKIE)?.value;
  if (!validToken(token) || !publicDb) return { signedIn: false, expired: false };
  const { data, error } = await publicDb.rpc("parent_results", { p_token: token });
  if (error) return { signedIn: false, expired: false, unavailable: true };
  if (data === null) return { signedIn: false, expired: true };
  // Monthly progress reports are optional: the results page still works without them.
  const progress = await publicDb.rpc("parent_progress", { p_token: token });
  const reports = Object.fromEntries((Array.isArray(progress.data) ? progress.data : []).map((p) => [p.student_id, p]));
  return { signedIn: true, children: (Array.isArray(data) ? data : []).map((k) => ({ ...k, progress: reports[k.id]?.reports || [], clientId: reports[k.id]?.client_id, clientName: reports[k.id]?.client_name })) };
}

export default async function ParentsPage({ searchParams }) {
  const { report: chosen } = await searchParams;
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

      {kids.length > 1 && (
        <nav aria-label="Children" className="mb-6 flex flex-wrap gap-2">
          {kids.map((k) => <a key={k.id} href={`#student-${k.id}`} className="rounded-full border border-line bg-white px-4 py-1.5 text-sm font-semibold text-mushaf-900 hover:border-leaf-700">{k.name}</a>)}
        </nav>
      )}

      {!kids.length && <Empty title="No children are linked to this account yet" text="Please ask the coordinator to link your child to your Client ID." />}

      <div className="space-y-12">
        {kids.map((k) => (
          <section key={k.id} id={`student-${k.id}`} aria-labelledby={`name-${k.id}`} className="scroll-mt-6">
            <h2 id={`name-${k.id}`} className="mb-4 flex items-center gap-2 font-display text-2xl text-mushaf-900"><GraduationCap className="size-6 text-leaf-700" aria-hidden="true" /> {k.name}</h2>
            {k.progress.length > 0 && <ProgressSection kid={k} chosen={chosen} />}
            {k.results.length ? (
              <div className="space-y-8">
                {groupByPeriod(k.results).map((g) => (
                  <MarksSheet key={g.period} student={k} period={g.period} results={g.results} certificateHref={(id) => `/parents/certificates/${id}`} />
                ))}
              </div>
            ) : !k.progress.length && <Empty title="Nothing published yet" text="Monthly reports and results appear here as soon as the college checks and publishes them." />}
            {k.certificates.length > 0 && (
              <div className="mt-6 rounded-2xl border border-line bg-white p-5">
                <h3 className="flex items-center gap-2 font-bold text-mushaf-900"><Award className="size-5 text-gold-600" aria-hidden="true" /> Certificates</h3>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {k.certificates.map((c) => (
                    <li key={c.id}><a href={`/parents/certificates/${c.id}`} className="flex items-center justify-between gap-3 rounded-xl bg-gold-50 px-4 py-3 hover:bg-gold-100"><span className="font-semibold text-mushaf-900">{c.title}</span><span className="text-xs text-ink-soft">{formatDate(c.issued_on)}</span></a></li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        ))}
      </div>
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
          <h1 className="mt-2 font-display text-3xl sm:text-4xl">Student result</h1>
          <p className="mt-2 text-sm text-white/80">Enter your Client ID and access code to see your child’s marks sheet.</p>
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

function Empty({ title, text }) {
  return (
    <div className="rounded-2xl border border-dashed border-line-strong bg-white p-8 text-center">
      <p className="font-semibold text-mushaf-900">{title}</p>
      <p className="mt-1 text-sm text-ink-soft">{text}</p>
    </div>
  );
}

// Latest monthly progress certificate for a child, with chips for earlier months.
function ProgressSection({ kid, chosen }) {
  const current = kid.progress.find((p) => p.id === chosen) || kid.progress[0];
  return (
    <div className="mb-8">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-xl text-mushaf-900">Monthly progress</h3>
        {kid.progress.length > 1 && (
          <nav aria-label={`${kid.name} months`} className="flex flex-wrap gap-1.5">
            {kid.progress.map((p) => (
              <a key={p.id} href={`?report=${p.id}#student-${kid.id}`} aria-current={p.id === current.id ? "page" : undefined}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${p.id === current.id ? "bg-mushaf-900 text-white" : "border border-line bg-white text-mushaf-900 hover:border-leaf-700"}`}>{periodLabel(p.period)}</a>
            ))}
          </nav>
        )}
      </div>
      <ProgressCertificate report={current} studentName={kid.name} studentCode={kid.code} clientId={kid.clientId} clientName={kid.clientName} studentOfMonth={current.student_of_month} />
    </div>
  );
}
