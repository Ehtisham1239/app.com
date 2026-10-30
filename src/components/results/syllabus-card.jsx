import { BookOpen, BookMarked, CalendarCheck, Target } from "lucide-react";
import { formatDate } from "@/lib/format";
import { attendancePercent, periodLabel } from "@/lib/progress/constants";

// Syllabus card for a published monthly report: current level, what was covered and
// memorised this month, the teacher's plan for next month, and attendance.
export function SyllabusCard({ report, studentName, actions = null }) {
  const r = report || {};
  const s = r.details?.syllabus || {};
  const attendance = attendancePercent(r.details);
  const empty = !s.level && !s.covered && !s.memorised && !r.learning_plan;
  return (
    <article aria-label={`Syllabus card for ${studentName}, ${periodLabel(r.period)}`} className="overflow-hidden rounded-[1.25rem] border border-leaf-200 bg-white shadow-[0_22px_60px_-36px_rgba(13,74,28,0.6)]">
      <header className="relative overflow-hidden bg-linear-to-br from-mushaf-900 via-mushaf-800 to-mushaf-700 px-5 py-5 text-white sm:px-7">
        <div className="pattern-girih absolute inset-0 opacity-[0.14]" aria-hidden="true" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <span className="hidden size-12 shrink-0 place-items-center rounded-xl bg-white/15 ring-1 ring-white/25 sm:grid"><BookOpen className="size-6 text-gold-300" aria-hidden="true" /></span>
          <div className="min-w-0 flex-1">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-gold-300">Syllabus & learning plan</p>
            <h3 className="font-display text-xl leading-tight sm:text-2xl">{studentName} · {periodLabel(r.period)}</h3>
          </div>
          {s.level && <p className="self-start rounded-full bg-gold-400 px-4 py-1 text-xs font-bold text-mushaf-950 sm:self-auto">Now at: {s.level}</p>}
        </div>
      </header>

      <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-7">
        {empty ? <p className="text-ink-soft sm:col-span-2">No syllabus details were published for this month. Please ask the coordinator for guidance.</p> : <>
          <section className="rounded-xl border border-line bg-paper/60 p-4">
            <h4 className="flex items-center gap-2 text-sm font-bold text-mushaf-900"><BookOpen className="size-4 text-leaf-700" aria-hidden="true" />Covered this month</h4>
            <p className="mt-1.5 whitespace-pre-line break-words text-[0.95rem] leading-relaxed text-ink">{s.covered || "—"}</p>
          </section>
          <section className="rounded-xl border border-line bg-paper/60 p-4">
            <h4 className="flex items-center gap-2 text-sm font-bold text-mushaf-900"><BookMarked className="size-4 text-leaf-700" aria-hidden="true" />Memorised</h4>
            <p className="mt-1.5 whitespace-pre-line break-words text-[0.95rem] leading-relaxed text-ink">{s.memorised || "—"}</p>
          </section>
          <section className="rounded-xl border-l-4 border-gold-400 bg-gold-50/70 p-4 sm:col-span-2">
            <h4 className="flex items-center gap-2 text-sm font-bold text-gold-700"><Target className="size-4" aria-hidden="true" />Next month target & home practice</h4>
            <p className="mt-1.5 whitespace-pre-line break-words text-[0.95rem] leading-relaxed text-ink">{r.learning_plan || "—"}</p>
          </section>
        </>}
        <section className="rounded-xl border border-line p-4 sm:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <h4 className="flex items-center gap-2 text-sm font-bold text-mushaf-900"><CalendarCheck className="size-4 text-leaf-700" aria-hidden="true" />Attendance</h4>
            <p className="text-sm font-semibold text-ink">{attendance === null ? "Not recorded" : `${r.details.attendance.attended} of ${r.details.attendance.held} classes · ${attendance}%`}</p>
          </div>
          {attendance !== null && <div className="mt-2 h-2 overflow-hidden rounded-full bg-line" role="img" aria-label={`${attendance} percent attendance`}><div className="h-full rounded-full bg-linear-to-r from-leaf-600 to-leaf-500" style={{ width: `${attendance}%` }} /></div>}
        </section>
      </div>
      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-4 text-xs text-ink-soft sm:px-7">
        <p>{r.teacher ? `Teacher: ${r.teacher} · ` : ""}{r.published_at ? `Published ${formatDate(r.published_at)}` : "Not published yet"}{r.version ? ` · version ${r.version}` : ""}</p>
        {actions}
      </footer>
    </article>
  );
}
