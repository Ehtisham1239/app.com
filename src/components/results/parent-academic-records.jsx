import { Award, BookOpen, GraduationCap } from "lucide-react";
import { formatDate } from "@/lib/format";
import { periodLabel } from "@/lib/progress/constants";
import { MarksSheet, groupByPeriod } from "./marks-sheet";
import { ProgressCertificate } from "./progress-certificate";
import { ProgressDmc } from "./progress-dmc";
import { SyllabusCard } from "./syllabus-card";
const VIEWS = [{ key: "results", label: "Results", icon: GraduationCap }, { key: "plans", label: "Syllabus", icon: BookOpen }, { key: "certificates", label: "Certificates", icon: Award }];
export function parentRecordHref(view, report, student) {
  const query = new URLSearchParams({ view });
  if (report) query.set("report", report);
  return `/parents?${query}${student ? `#student-${encodeURIComponent(student)}` : ""}`;
}
function Empty({ title, text }) {
  return <div className="rounded-2xl border border-dashed border-line-strong bg-white p-7"><p className="font-semibold text-mushaf-900">{title}</p>{text && <p className="mt-1 text-sm text-ink-soft">{text}</p>}</div>;
}
function MonthPicker({ kid, current, view }) {
  if (kid.progress.length < 2) return null;
  return <nav aria-label={`${kid.name} months`} className="flex flex-wrap gap-2">{kid.progress.map(report => <a key={report.id} href={parentRecordHref(view, report.id, kid.id)} aria-current={report.id === current.id ? "page" : undefined} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${report.id === current.id ? "bg-mushaf-900 text-white" : "border border-line bg-white text-mushaf-900 hover:border-leaf-700"}`}>{periodLabel(report.period)}</a>)}</nav>;
}
function Certificates({ kid, progressUnavailable }) {
  return <div className="space-y-6">
    {kid.progress.length > 0 && <div className="rounded-2xl border border-gold-300 bg-white p-5"><h3 className="font-display text-xl text-mushaf-900">Monthly result certificates</h3><ul className="mt-4 grid gap-3 sm:grid-cols-2">{kid.progress.map(report => <li key={report.id}><a href={parentRecordHref("results", report.id, kid.id)} className="flex items-center gap-3 rounded-xl bg-gold-50 p-4 hover:bg-gold-100"><Award className="size-5 shrink-0 text-gold-600" /><span><span className="block font-semibold text-mushaf-900">{periodLabel(report.period)}</span><span className="text-xs text-ink-soft">View approved result card</span></span></a></li>)}</ul></div>}
    {kid.certificates.length > 0 && <div className="rounded-2xl border border-line bg-white p-5"><h3 className="font-display text-xl text-mushaf-900">Issued certificates</h3><ul className="mt-4 grid gap-3 sm:grid-cols-2">{kid.certificates.map(cert => <li key={cert.id}><a href={`/parents/certificates/${cert.id}`} className="flex items-center justify-between gap-3 rounded-xl bg-leaf-50 p-4 hover:bg-leaf-100"><span className="font-semibold text-mushaf-900">{cert.title}</span><span className="text-xs text-ink-soft">{formatDate(cert.issued_on)}</span></a></li>)}</ul></div>}
    {!kid.progress.length && !kid.certificates.length && !progressUnavailable && <Empty title="No certificates published yet" text="Approved result cards and issued certificates will appear here." />}
  </div>;
}
// Receives only the scoped published records returned by the verified parent session RPCs.
export function ParentAcademicRecords({ kids, chosen, view = "results", progressUnavailable = false }) {
  const selected = VIEWS.some(item => item.key === view) ? view : "results";
  return <>
    <nav aria-label="Parent academic records" className="mb-7 grid grid-cols-3 gap-2 rounded-2xl border border-line bg-white p-2">{VIEWS.map(({ key, label, icon: Icon }) => <a key={key} href={parentRecordHref(key, chosen)} aria-current={selected === key ? "page" : undefined} className={`flex flex-col items-center justify-center gap-2 rounded-xl px-2 py-3 text-center text-sm font-semibold sm:flex-row ${selected === key ? "bg-mushaf-900 text-white" : "text-ink-soft hover:bg-paper"}`}><Icon className="size-5 shrink-0" />{label}</a>)}</nav>
    {progressUnavailable && <p role="alert" className="mb-5 rounded-xl bg-gold-50 p-4 text-sm text-gold-700">Monthly results and lesson plans are temporarily unavailable. Please try again shortly.</p>}
    {kids.length > 1 && <nav aria-label="Children" className="mb-6 flex flex-wrap gap-2">{kids.map(kid => <a key={kid.id} href={`#student-${kid.id}`} className="rounded-full border border-line bg-white px-4 py-1.5 text-sm font-semibold text-mushaf-900 hover:border-leaf-700">{kid.name}</a>)}</nav>}
    {!kids.length && <Empty title="No children are linked to this account yet" text="Please ask the coordinator to link your child to your Client ID." />}
    <div className="space-y-12">{kids.map(kid => {
      const current = kid.progress.find(report => report.id === chosen) || kid.progress[0];
      return <section key={kid.id} id={`student-${kid.id}`} aria-labelledby={`name-${kid.id}`} className="scroll-mt-6"><h2 id={`name-${kid.id}`} className="mb-4 flex items-center gap-2 font-display text-2xl text-mushaf-900"><GraduationCap className="size-6 text-leaf-700" />{kid.name}</h2>
        {selected === "results" && <>{current && <div className="mb-8"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h3 className="font-display text-xl text-mushaf-900">Monthly e-DMC & certificate</h3><MonthPicker kid={kid} current={current} view="results" /></div><div className="mb-8"><ProgressDmc report={current} studentName={kid.name} clientId={kid.clientId} clientName={kid.clientName} studentOfMonth={current.student_of_month} /></div><ProgressCertificate report={current} studentName={kid.name} studentCode={kid.code} clientId={kid.clientId} clientName={kid.clientName} studentOfMonth={current.student_of_month} /></div>}{kid.results.length > 0 && <div className="space-y-8">{groupByPeriod(kid.results).map(group => <MarksSheet key={group.period} student={kid} period={group.period} results={group.results} certificateHref={id => `/parents/certificates/${id}`} />)}</div>}{!current && !kid.results.length && !progressUnavailable && <Empty title="Nothing published yet" text="Your approved results will appear here after the college publishes them." />}</>}
        {selected === "plans" && (current ? <div className="space-y-4"><MonthPicker kid={kid} current={current} view="plans" /><SyllabusCard report={current} studentName={kid.name} actions={<a href={parentRecordHref("results", current.id, kid.id)} className="btn btn-outline btn-sm">View e-DMC & certificate</a>} /></div> : !progressUnavailable && <Empty title="No syllabus published yet" text="The teacher’s syllabus and plan will appear after the college reviews and publishes the monthly report." />)}
        {selected === "certificates" && <Certificates kid={kid} progressUnavailable={progressUnavailable} />}
      </section>;
    })}</div>
  </>;
}
