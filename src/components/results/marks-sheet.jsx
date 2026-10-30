import { Award } from "lucide-react";
import { formatDate } from "@/lib/format";

// Board-style "Detailed Marks Certificate": one sheet per student and period, each
// published assessment as a row, with the grand total and percentage. Server-safe.
export function MarksSheet({ student, period, results, certificateHref }) {
  const total = results.reduce((sum, r) => sum + Number(r.total || 0), 0);
  const obtained = results.reduce((sum, r) => sum + Number(r.marks || 0), 0);
  const percent = total > 0 ? Math.round((obtained * 1000) / total) / 10 : 0;
  const latest = results.reduce((d, r) => (r.published_at && r.published_at > d ? r.published_at : d), "");
  const remarks = results.filter((r) => r.remarks);
  return (
    <article className="marks-sheet relative overflow-hidden rounded-[1.4rem] border-2 border-gold-400 bg-[#fffdf6] shadow-[0_22px_60px_-34px_rgba(13,74,28,0.7)]" aria-label={`Marks for ${student.name}, ${period}`}>
      <div className="pattern-girih pointer-events-none absolute inset-0 opacity-[0.05]" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-2 rounded-[1.1rem] border border-gold-300/70" aria-hidden="true" />

      <header className="relative bg-linear-to-br from-mushaf-900 via-mushaf-800 to-mushaf-700 px-5 py-5 text-center text-white sm:px-8">
        <div className="pattern-girih absolute inset-0 opacity-[0.14]" aria-hidden="true" />
        <div className="relative flex items-center justify-center gap-3">
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-white shadow ring-2 ring-gold-300"><span className="brand-mark block size-9 text-leaf-700" aria-hidden="true" /></span>
          <div className="text-left leading-tight">
            <p className="font-display text-lg sm:text-xl">Online Quran College</p>
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.22em] text-gold-300">Parent result portal</p>
          </div>
        </div>
        <p className="relative mt-3 font-arabic text-xl text-gold-300" lang="ar" dir="rtl">بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</p>
        <h3 className="relative mt-2 inline-block rounded-full bg-gold-400 px-4 py-1 text-xs font-bold uppercase tracking-[0.18em] text-mushaf-950">Detailed marks certificate · {period}</h3>
      </header>

      <div className="relative px-4 py-5 sm:px-8 sm:py-6">
        <dl className="grid gap-x-6 gap-y-2 rounded-xl border border-line bg-white/80 p-4 text-sm sm:grid-cols-2">
          <div className="flex gap-2"><dt className="w-28 shrink-0 font-semibold text-ink-faint">Student code</dt><dd className="font-mono font-bold text-mushaf-900">{student.code}</dd></div>
          <div className="flex gap-2"><dt className="w-28 shrink-0 font-semibold text-ink-faint">Student name</dt><dd className="font-bold uppercase tracking-wide text-mushaf-900">{student.name}</dd></div>
          <div className="flex gap-2"><dt className="w-28 shrink-0 font-semibold text-ink-faint">Session</dt><dd className="text-ink">{period}</dd></div>
          <div className="flex gap-2"><dt className="w-28 shrink-0 font-semibold text-ink-faint">Declared on</dt><dd className="text-ink">{latest ? formatDate(latest) : "—"}</dd></div>
        </dl>

        <ol className="mt-5 space-y-2 sm:hidden" aria-label="Marks by subject">
          {results.map((r, i) => (
            <li key={r.id} className="rounded-xl border border-line bg-white p-3">
              <p className="font-semibold text-mushaf-900"><span className="text-ink-faint">{i + 1}. </span>{r.assessment}</p>
              {(r.course || r.date) && <p className="text-xs text-ink-faint">{[r.course, r.date && formatDate(r.date)].filter(Boolean).join(" · ")}</p>}
              <dl className="mt-2 grid grid-cols-3 gap-2 text-center text-sm">
                <div className="rounded-lg bg-paper py-1.5"><dt className="text-[0.65rem] font-semibold uppercase text-ink-faint">Marks</dt><dd className="font-bold text-mushaf-900">{num(r.marks)}/{num(r.total)}</dd></div>
                <div className="rounded-lg bg-paper py-1.5"><dt className="text-[0.65rem] font-semibold uppercase text-ink-faint">%</dt><dd className="font-bold text-mushaf-900">{num(r.percentage)}</dd></div>
                <div className="rounded-lg bg-gold-50 py-1.5"><dt className="text-[0.65rem] font-semibold uppercase text-ink-faint">Grade</dt><dd className="font-bold text-gold-700">{r.grade || "—"}{r.grade_label && <span className="block text-[0.65rem] font-normal text-ink-faint">{r.grade_label}</span>}</dd></div>
              </dl>
            </li>
          ))}
          <li className="flex items-center justify-between rounded-xl bg-gold-50 px-3 py-2.5 font-bold text-mushaf-900"><span className="uppercase tracking-wide">Grand total</span><span>{num(obtained)} / {num(total)}</span></li>
        </ol>

        <div className="mt-5 hidden overflow-x-auto rounded-xl border border-mushaf-900/20 sm:block">
          <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
            <caption className="sr-only">Marks by subject</caption>
            <thead className="bg-mushaf-900 text-xs uppercase tracking-wide text-white">
              <tr>
                <th scope="col" className="px-3 py-2.5 font-semibold">Sr.</th>
                <th scope="col" className="px-3 py-2.5 font-semibold">Subject / assessment</th>
                <th scope="col" className="px-3 py-2.5 text-center font-semibold">Total</th>
                <th scope="col" className="px-3 py-2.5 text-center font-semibold">Obtained</th>
                <th scope="col" className="px-3 py-2.5 text-center font-semibold">%</th>
                <th scope="col" className="px-3 py-2.5 text-center font-semibold">Grade</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={r.id} className="border-t border-line odd:bg-white even:bg-leaf-50/50">
                  <td className="px-3 py-2.5 text-ink-faint">{i + 1}</td>
                  <th scope="row" className="px-3 py-2.5 font-semibold text-mushaf-900">
                    {r.assessment}
                    <span className="block text-xs font-normal text-ink-faint">{[r.course, r.date && formatDate(r.date)].filter(Boolean).join(" · ")}</span>
                  </th>
                  <td className="px-3 py-2.5 text-center">{num(r.total)}</td>
                  <td className="px-3 py-2.5 text-center font-bold text-mushaf-900">{num(r.marks)}</td>
                  <td className="px-3 py-2.5 text-center">{num(r.percentage)}</td>
                  <td className="px-3 py-2.5 text-center">
                    {r.grade ? <span className="inline-flex min-w-9 justify-center rounded-md bg-gold-100 px-2 py-0.5 font-bold text-gold-700" title={r.grade_label || undefined}>{r.grade}</span> : "—"}
                    {r.grade_label && <span className="block text-[0.7rem] text-ink-faint">{r.grade_label}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-mushaf-900/30 bg-gold-50 font-bold text-mushaf-900">
                <td className="px-3 py-3" />
                <th scope="row" className="px-3 py-3 uppercase tracking-wide">Grand total</th>
                <td className="px-3 py-3 text-center">{num(total)}</td>
                <td className="px-3 py-3 text-center">{num(obtained)}</td>
                <td className="px-3 py-3 text-center">{num(percent)}</td>
                <td className="px-3 py-3" />
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
          <div className="mx-auto grid size-28 place-content-center rounded-full border-4 border-double border-gold-500 bg-white text-center shadow-inner sm:mx-0">
            <span className="font-display text-3xl leading-none text-mushaf-900">{num(percent)}<span className="text-base">%</span></span>
            <span className="mt-1 text-[0.62rem] font-bold uppercase tracking-wider text-gold-700">Overall</span>
          </div>
          {remarks.length > 0 ? (
            <div className="rounded-xl border-l-4 border-gold-400 bg-white/80 px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-wide text-gold-700">Teacher’s remarks</p>
              <ul className="mt-1.5 space-y-1.5 text-[0.95rem] leading-relaxed text-ink">
                {remarks.map((r) => <li key={r.id}>{remarks.length > 1 && <b className="text-mushaf-900">{r.assessment}: </b>}<span className="whitespace-pre-line">{r.remarks}</span></li>)}
              </ul>
            </div>
          ) : <p className="text-sm text-ink-soft">May Allah bless {student.name.split(" ")[0]}’s learning.</p>}
        </div>

        {results.some((r) => r.certificate_id) && certificateHref && (
          <div className="mt-5 flex flex-wrap gap-2">
            {results.filter((r) => r.certificate_id).map((r) => (
              <a key={r.id} href={certificateHref(r.certificate_id)} className="inline-flex items-center gap-2 rounded-full bg-leaf-700 px-4 py-2 text-sm font-semibold text-white hover:bg-leaf-800"><Award className="size-4" aria-hidden="true" /> Certificate — {r.assessment}</a>
            ))}
          </div>
        )}

        <p className="mt-5 border-t border-dashed border-gold-300 pt-3 text-center text-[0.72rem] text-ink-faint">
          Issued by Online Quran College for the parent’s information. Errors and omissions excepted; contact the coordinator about any mark.
        </p>
      </div>
    </article>
  );
}

function num(value) {
  const n = Number(value);
  return Number.isFinite(n) ? String(parseFloat(n.toFixed(2))) : "—";
}

// Groups a child's published results into sheets by period label (newest first).
export function groupByPeriod(results) {
  const groups = new Map();
  for (const r of results || []) {
    const key = r.period || (r.date ? String(r.date).slice(0, 4) : "Assessments");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(r);
  }
  return [...groups.entries()].map(([period, list]) => ({ period, results: list }));
}
