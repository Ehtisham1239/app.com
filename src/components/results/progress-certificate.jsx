import { Award } from "lucide-react";
import { formatDate } from "@/lib/format";
import { CATEGORIES, periodLabel, ratingLabel, ratingStars } from "@/lib/progress/constants";

const PILL = {
  excellent: "bg-leaf-700 text-white",
  good: "bg-leaf-100 text-leaf-800",
  satisfactory: "bg-gold-100 text-gold-700",
  needs_improvement: "bg-rose-50 text-rose-700",
};

// Monthly progress certificate: Online Quran College logo, deep green and soft gold.
// Server-safe; staff can print it from the CMS, parents only view it.
export function ProgressCertificate({ report, studentName, studentOfMonth = false, stamp = null }) {
  const r = report || {};
  const month = periodLabel(r.period);
  return (
    <article className="progress-certificate relative mx-auto w-full max-w-[52rem] overflow-hidden rounded-[10px] bg-[#fffdf7] text-ink shadow-[0_30px_70px_-40px_rgba(13,74,28,0.7)] print:shadow-none" aria-label={`Monthly progress certificate for ${studentName}, ${month}`}>
      <div className="pointer-events-none absolute inset-0 pattern-girih opacity-[0.045]" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-[12px] rounded-[6px] border-2 border-gold-500" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-[18px] rounded-[4px] border border-gold-300" aria-hidden="true" />
      {[["left-[12px] top-[12px]", ""], ["right-[12px] top-[12px]", "rotate-90"], ["right-[12px] bottom-[12px]", "rotate-180"], ["left-[12px] bottom-[12px]", "-rotate-90"]].map(([pos, rot]) => (
        <svg key={pos} viewBox="0 0 40 40" className={`pointer-events-none absolute size-10 text-gold-500 ${pos} ${rot}`} aria-hidden="true"><path d="M2 2h22M2 2v22M2 10h8v-8M14 2l-12 12" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
      ))}

      <div className="relative px-7 pb-10 pt-11 sm:px-16 sm:pb-12 sm:pt-12">
        <header className="text-center">
          <img src="/brand/logo.webp" alt="Online Quran College" width={96} height={96} className="mx-auto size-20 sm:size-24" />
          <p className="mt-3 font-display text-lg tracking-wide text-mushaf-900 sm:text-xl">Online Quran College</p>
          <div className="mx-auto mt-3 flex max-w-xs items-center gap-3 text-gold-500" aria-hidden="true"><span className="h-px flex-1 bg-current" /><span className="size-1.5 rotate-45 bg-current" /><span className="h-px flex-1 bg-current" /></div>
          <h2 className="mt-3 font-display text-[1.85rem] leading-tight text-mushaf-900 sm:text-[2.5rem]">Certificate of Monthly Progress</h2>
          <p className="mt-1 text-sm font-semibold uppercase tracking-[0.2em] text-gold-700">{month}</p>
        </header>

        <div className="mt-7 text-center">
          <p className="text-[0.95rem] italic text-ink-soft">This is to certify the progress of</p>
          <p className="mx-auto mt-2 inline-block min-w-[60%] border-b-2 border-gold-400 px-6 pb-1.5 font-display text-[1.9rem] text-ink sm:text-[2.3rem]">{studentName}</p>
          <p className="mx-auto mt-3 max-w-lg text-[0.95rem] leading-relaxed text-ink-soft">in Quran learning during {month}, as assessed by the class teacher and reviewed by the college.</p>
        </div>

        {studentOfMonth && (
          <div className="mx-auto mt-6 flex w-fit items-center gap-3 rounded-full border border-gold-400 bg-gold-50 py-1.5 pl-1.5 pr-5">
            <span className="grid size-10 place-items-center rounded-full bg-linear-to-br from-gold-400 to-gold-600 text-white"><Award className="size-5" aria-hidden="true" /></span>
            <span className="font-display text-lg text-mushaf-900">Student of the Month</span>
          </div>
        )}

        <table className="mt-8 w-full border-separate border-spacing-0 overflow-hidden rounded-xl border border-gold-300 bg-white/90 text-left">
          <caption className="sr-only">Ratings for {month}</caption>
          <thead>
            <tr className="bg-mushaf-900 text-xs uppercase tracking-[0.14em] text-white">
              <th scope="col" className="px-4 py-2.5 font-semibold">Area of learning</th>
              <th scope="col" className="px-4 py-2.5 text-right font-semibold">Rating</th>
            </tr>
          </thead>
          <tbody>
            {CATEGORIES.map((c, i) => {
              const v = r[c.key];
              return (
                <tr key={c.key} className={i % 2 ? "bg-paper/60" : undefined}>
                  <th scope="row" className="border-t border-line px-4 py-3 font-semibold text-mushaf-900">{c.label}</th>
                  <td className="border-t border-line px-4 py-3 text-right">
                    <span className="mr-3 hidden gap-1 align-middle sm:inline-flex" aria-hidden="true">
                      {[1, 2, 3, 4].map((n) => <span key={n} className={`size-2 rounded-full ${n <= ratingStars(v) ? "bg-gold-500" : "bg-line-strong"}`} />)}
                    </span>
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${PILL[v] || "bg-paper text-ink-faint"}`}>{ratingLabel(v)}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <figure className="mt-6 rounded-xl border border-gold-300/70 bg-white/90 px-5 py-4">
          <figcaption className="text-xs font-bold uppercase tracking-[0.16em] text-gold-700">Teacher’s remarks</figcaption>
          <blockquote className="mt-1.5 whitespace-pre-line leading-relaxed text-ink">{r.remarks || "—"}</blockquote>
        </figure>

        <footer className="mt-10 grid grid-cols-3 items-end gap-4 text-center text-xs text-ink-soft sm:gap-8">
          <div><p className="min-h-[1.3em] font-semibold text-ink">{r.teacher || ""}</p><p className="mt-1 border-t border-ink/30 pt-1.5">Class teacher</p></div>
          <div className="flex flex-col items-center">
            <span className="grid size-16 place-items-center rounded-full border-2 border-double border-gold-500 bg-white" aria-hidden="true"><img src="/brand/logo.webp" alt="" width={40} height={40} className="size-10 opacity-90" /></span>
            <p className="mt-1.5 font-semibold text-ink">{r.published_at ? formatDate(r.published_at) : "—"}</p>
            <p className="mt-1 border-t border-ink/30 px-3 pt-1.5">Date of issue</p>
          </div>
          <div><p className="min-h-[1.3em] font-semibold text-ink">&nbsp;</p><p className="mt-1 border-t border-ink/30 pt-1.5">Academic head</p></div>
        </footer>
      </div>
      {stamp && <p className="absolute right-10 top-12 rotate-12 rounded border-2 border-rose-600 px-3 py-1 text-sm font-bold uppercase text-rose-600">{stamp}</p>}
    </article>
  );
}
