import { Award, BookOpen, CalendarDays, Quote } from "lucide-react";
import { formatDate } from "@/lib/format";

// One published result in OQC branding. Server-safe (no hooks), shared by the
// parent portal and the staff preview. Text is rendered as text, never as HTML.
// `certificateHref` links to the parent's view-only certificate page.
export function ResultCard({ studentName, result, certificateHref, preview = false }) {
  const percent = clampPercent(result.percentage ?? (Number(result.marks) * 100) / Number(result.total));
  const tone = percent >= 80 ? TONES.high : percent >= 60 ? TONES.mid : TONES.base;
  const marks = trimNumber(result.marks), total = trimNumber(result.total);
  return (
    <article className="result-card @container relative overflow-hidden rounded-[1.6rem] border border-gold-300/70 bg-white shadow-[0_18px_50px_-28px_rgba(13,74,28,0.55)]" aria-label={`${result.assessment} result for ${studentName}`}>
      <header className="relative overflow-hidden bg-linear-to-br from-mushaf-900 via-mushaf-800 to-mushaf-700 px-5 pb-12 pt-5 text-white sm:px-7">
        <div className="pattern-girih absolute inset-0 opacity-[0.16]" aria-hidden="true" />
        <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-gold-500 via-gold-300 to-gold-500" aria-hidden="true" />
        <div className="relative flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/95 shadow-sm">
              <span className="brand-mark block size-8 text-leaf-700" aria-hidden="true" />
            </span>
            <div className="leading-tight">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-gold-300">Online Quran College</p>
              <p className="mt-0.5 text-sm text-white/80">Result card{preview ? " · staff preview" : ""}</p>
            </div>
          </div>
          <p className="font-arabic text-xl text-gold-300 sm:text-2xl" lang="ar" dir="rtl" aria-hidden="true">بَارَكَ ٱللَّٰهُ فِيكَ</p>
        </div>
        <h3 className="relative mt-5 font-display text-2xl leading-tight text-white sm:text-[1.75rem]">{result.assessment}</h3>
        <p className="relative mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/80">
          {result.course && <span className="inline-flex items-center gap-1.5"><BookOpen className="size-4 text-gold-300" aria-hidden="true" />{result.course}</span>}
          {result.period && <span>{result.period}</span>}
          {result.date && <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-4 text-gold-300" aria-hidden="true" />{formatDate(result.date)}</span>}
        </p>
      </header>

      <div className="relative -mt-8 px-4 sm:px-6">
        <div className="rounded-2xl border border-line bg-white p-5 shadow-[0_10px_30px_-22px_rgba(13,74,28,0.6)] sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-faint">Student</p>
          <p className="mt-1 font-display text-2xl text-mushaf-900">{studentName}</p>

          <div className="mt-5 grid items-center gap-5 @lg:grid-cols-[auto_1fr]">
            <ScoreRing percent={percent} tone={tone} />
            <dl className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-paper px-4 py-3">
                <dt className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Marks</dt>
                <dd className="mt-1 font-display text-2xl text-mushaf-900">{marks}<span className="text-base text-ink-faint"> / {total}</span></dd>
              </div>
              <div className={`rounded-xl px-4 py-3 ${tone.panel}`}>
                <dt className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Grade</dt>
                <dd className="mt-1 flex items-baseline gap-2">
                  <span className={`font-display text-2xl ${tone.text}`}>{result.grade || "—"}</span>
                  {result.grade_label && <span className="text-sm font-semibold text-ink-soft">{result.grade_label}</span>}
                </dd>
              </div>
            </dl>
          </div>

          {result.remarks && (
            <figure className="mt-5 rounded-xl border-l-4 border-gold-400 bg-gold-50/70 px-4 py-3">
              <figcaption className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gold-700"><Quote className="size-3.5" aria-hidden="true" />Teacher’s remarks</figcaption>
              <blockquote className="mt-1.5 whitespace-pre-line text-[0.95rem] leading-relaxed text-ink">{result.remarks}</blockquote>
            </figure>
          )}
        </div>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-3 px-5 pb-5 pt-4 text-sm text-ink-soft sm:px-7">
        <span>{result.published_at ? `Published ${formatDate(result.published_at)}` : "Not published yet"}</span>
        {result.certificate_id && certificateHref ? (
          <a href={certificateHref} className="inline-flex items-center gap-2 rounded-full bg-leaf-700 px-4 py-2 font-semibold text-white transition-colors hover:bg-leaf-800">
            <Award className="size-4" aria-hidden="true" /> View certificate
          </a>
        ) : result.certificate_id ? (
          <span className="inline-flex items-center gap-1.5 font-semibold text-leaf-700"><Award className="size-4" aria-hidden="true" /> Certificate issued</span>
        ) : null}
      </footer>
    </article>
  );
}

const TONES = {
  high: { stroke: "var(--color-leaf-500)", text: "text-leaf-700", panel: "bg-leaf-50" },
  mid: { stroke: "var(--color-gold-500)", text: "text-gold-700", panel: "bg-gold-50" },
  base: { stroke: "var(--color-mushaf-700)", text: "text-mushaf-900", panel: "bg-paper" },
};

function ScoreRing({ percent, tone }) {
  const r = 52, c = 2 * Math.PI * r;
  return (
    <div className="relative mx-auto size-36 @lg:mx-0" role="img" aria-label={`${trimNumber(percent)} percent`}>
      <svg viewBox="0 0 120 120" className="size-full -rotate-90" aria-hidden="true">
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--color-line)" strokeWidth="10" />
        <circle cx="60" cy="60" r={r} fill="none" stroke={tone.stroke} strokeWidth="10" strokeLinecap="round" strokeDasharray={`${(c * percent) / 100} ${c}`} />
        <circle cx="60" cy="60" r="42" fill="none" stroke="var(--color-gold-300)" strokeWidth="1" strokeDasharray="2 4" />
      </svg>
      <div className="absolute inset-0 grid place-content-center text-center" aria-hidden="true">
        <span className="font-display text-3xl text-mushaf-900">{trimNumber(percent)}<span className="text-lg">%</span></span>
        <span className="text-[0.68rem] font-semibold uppercase tracking-wide text-ink-faint">Score</span>
      </div>
    </div>
  );
}

function clampPercent(value) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.min(100, Math.max(0, Math.round(n * 10) / 10)) : 0;
}

function trimNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? String(parseFloat(n.toFixed(2))) : "—";
}
