import { Award, CalendarCheck } from "lucide-react";
import { formatDate } from "@/lib/format";
import { CATEGORIES, SCORE_MAX, attendancePercent, marksSummary, periodLabel, ratingLabel } from "@/lib/progress/constants";

const PILL = {
  excellent: "bg-leaf-700 text-white",
  good: "bg-leaf-100 text-leaf-800",
  satisfactory: "bg-gold-100 text-gold-700",
  needs_improvement: "bg-rose-50 text-rose-700",
};
const num = (v) => String(parseFloat(Number(v).toFixed(1)));

// e-DMC (detailed monthly certificate) built from the published monthly report:
// every area with its rating and, when recorded, marks out of 10; attendance and remarks.
// Server-safe; parents view it on screen, staff can preview it in the CMS.
export function ProgressDmc({ report, studentName, clientId, clientName, studentOfMonth = false, stamp = null }) {
  const r = report || {};
  const d = r.details || {};
  const marks = marksSummary(d);
  const attendance = attendancePercent(d);
  const month = periodLabel(r.period);
  return (
    <article className="progress-dmc relative overflow-hidden rounded-[1.25rem] border-2 border-gold-400 bg-[#fffdf7] shadow-[0_22px_60px_-34px_rgba(13,74,28,0.7)]" aria-label={`e-DMC for ${studentName}, ${month}`}>
      <div className="pattern-girih pointer-events-none absolute inset-0 opacity-[0.045]" aria-hidden="true" />
      <header className="relative bg-linear-to-br from-mushaf-900 via-mushaf-800 to-mushaf-700 px-5 py-5 text-white sm:px-8">
        <div className="pattern-girih absolute inset-0 opacity-[0.14]" aria-hidden="true" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <img src="/brand/logo.webp" alt="Online Quran College" width={56} height={56} className="size-14 shrink-0 rounded-xl bg-white p-1 shadow" />
          <div className="min-w-0 flex-1">
            <p className="font-display text-lg leading-tight sm:text-xl">Online Quran College</p>
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-gold-300">e-DMC · Detailed Monthly Certificate</p>
          </div>
          <p className="self-start rounded-full bg-gold-400 px-4 py-1 text-xs font-bold uppercase tracking-[0.16em] text-mushaf-950 sm:self-auto">{month}</p>
        </div>
      </header>

      <div className="relative px-4 py-5 sm:px-8 sm:py-6">
        <dl className="grid gap-x-6 gap-y-2 rounded-xl border border-line bg-white/85 p-4 text-sm sm:grid-cols-2">
          <div className="flex gap-2"><dt className="w-28 shrink-0 font-semibold text-ink-faint">Student</dt><dd className="font-bold text-mushaf-900">{studentName}</dd></div>
          <div className="flex gap-2"><dt className="w-28 shrink-0 font-semibold text-ink-faint">Month</dt><dd className="text-ink">{month}</dd></div>
          {(clientId || clientName) && <div className="flex gap-2"><dt className="w-28 shrink-0 font-semibold text-ink-faint">Client</dt><dd className="text-ink">{[clientName, clientId].filter(Boolean).join(" · ")}</dd></div>}
          <div className="flex gap-2"><dt className="w-28 shrink-0 font-semibold text-ink-faint">Teacher</dt><dd className="text-ink">{r.teacher || "—"}</dd></div>
        </dl>

        {studentOfMonth && (
          <p className="mt-4 flex w-fit items-center gap-2 rounded-full border border-gold-400 bg-gold-50 py-1 pl-1 pr-4 font-display text-mushaf-900">
            <span className="grid size-8 place-items-center rounded-full bg-linear-to-br from-gold-400 to-gold-600 text-white"><Award className="size-4" aria-hidden="true" /></span>Student of the Month
          </p>
        )}

        <div className="mt-5 overflow-hidden rounded-xl border border-mushaf-900/20">
          <table className="w-full border-collapse text-left text-sm">
            <caption className="sr-only">Areas of learning for {month}</caption>
            <thead className="bg-mushaf-900 text-xs uppercase tracking-wide text-white">
              <tr>
                <th scope="col" className="hidden px-3 py-2.5 font-semibold sm:table-cell">Sr.</th>
                <th scope="col" className="px-2 py-2.5 font-semibold sm:px-3">Area</th>
                <th scope="col" className="px-2 py-2.5 text-center font-semibold sm:px-3">Marks</th>
                <th scope="col" className="px-2 py-2.5 text-center font-semibold sm:px-3">Rating</th>
              </tr>
            </thead>
            <tbody>
              {CATEGORIES.map((c, i) => {
                const score = d.scores?.[c.key];
                return (
                  <tr key={c.key} className="border-t border-line odd:bg-white even:bg-leaf-50/50">
                    <td className="hidden px-3 py-2.5 text-ink-faint sm:table-cell">{i + 1}</td>
                    <th scope="row" className="px-2 py-2.5 font-semibold text-mushaf-900 sm:px-3">{c.label}</th>
                    <td className="whitespace-nowrap px-2 py-2.5 text-center sm:px-3">{score === undefined || score === null ? <span className="text-ink-faint">—</span> : <><b className="text-mushaf-900">{num(score)}</b><span className="text-ink-faint"> / {SCORE_MAX}</span></>}</td>
                    <td className="px-2 py-2.5 text-center sm:px-3"><span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold leading-tight ${PILL[r[c.key]] || "bg-paper text-ink-faint"}`}>{ratingLabel(r[c.key])}</span></td>
                  </tr>
                );
              })}
            </tbody>
            {marks.given > 0 && (
              <tfoot>
                <tr className="border-t-2 border-mushaf-900/30 bg-gold-50 font-bold text-mushaf-900">
                  <td className="hidden px-3 py-3 sm:table-cell" />
                  <th scope="row" className="px-2 py-3 uppercase tracking-wide sm:px-3">Total</th>
                  <td className="whitespace-nowrap px-2 py-3 text-center sm:px-3">{marks.complete ? `${num(marks.obtained)} / ${marks.total}` : "—"}</td>
                  <td className="px-2 py-3 text-center sm:px-3">{marks.complete ? `${num(marks.percent)}%` : <span className="text-xs font-semibold text-ink-soft">Marks not given for every area</span>}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-[auto_1fr] sm:items-stretch">
          <div className="flex min-w-44 flex-col items-center justify-center rounded-xl border border-line bg-white/85 px-4 py-3 text-center">
            <CalendarCheck className="size-5 text-leaf-700" aria-hidden="true" />
            <p className="mt-1 text-xs font-bold uppercase tracking-wide text-ink-faint">Attendance</p>
            {attendance === null ? <p className="text-sm text-ink-soft">Not recorded</p> : <>
              <p className="font-display text-2xl text-mushaf-900">{attendance}%</p>
              <p className="text-xs text-ink-soft">{d.attendance.attended} of {d.attendance.held} classes</p>
            </>}
          </div>
          <figure className="rounded-xl border-l-4 border-gold-400 bg-white/85 px-4 py-3">
            <figcaption className="text-xs font-bold uppercase tracking-wide text-gold-700">Teacher’s remarks</figcaption>
            <blockquote className="mt-1 whitespace-pre-line break-words leading-relaxed text-ink">{r.remarks || "—"}</blockquote>
          </figure>
        </div>

        <p className="mt-5 border-t border-dashed border-gold-300 pt-3 text-center text-[0.72rem] text-ink-faint">
          Issued by Online Quran College{r.published_at ? ` on ${formatDate(r.published_at)}` : ""}{r.version ? ` · version ${r.version}` : ""}. Contact the coordinator about any entry.
        </p>
      </div>
      {stamp && <p className="absolute right-4 top-5 rotate-12 sm:right-6 sm:top-24 rounded border-2 border-rose-600 bg-white/80 px-3 py-1 text-sm font-bold uppercase text-rose-600">{stamp}</p>}
    </article>
  );
}
