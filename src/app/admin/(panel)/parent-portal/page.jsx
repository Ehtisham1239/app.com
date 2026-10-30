"use client";
import Link from "next/link";
import { Award, BookOpen, ClipboardCheck, ExternalLink, Users } from "lucide-react";
import { useAccess } from "@/lib/admin/access";
import { db, useLoad } from "@/lib/admin/db";
import { formatDate } from "@/lib/format";
import { periodLabel } from "@/lib/progress/constants";
import { ParentPortalNav } from "@/components/admin/parent-portal-nav";
import { Card, EmptyState, ErrorState, Loading, PageHeader } from "@/components/admin/ui";
export default function ParentPortalWorkspace() {
  const { can } = useAccess();
  const readProgress = can("progress:read"), readCertificates = can("certificates:read");
  const reports = useLoad(() => readProgress ? db().from("monthly_reports").select("id,published,published_at,students(full_name,student_code)").not("published", "is", null).order("published_at", { ascending: false }).limit(20) : { data: [] }, [readProgress]);
  const certificates = useLoad(() => readCertificates ? db().from("certificates").select("id,title,issued_on,students(full_name,student_code)").eq("status", "issued").order("issued_on", { ascending: false }).limit(20) : { data: [] }, [readCertificates]);
  if (!["guardians:read", "progress:read", "results:read", "certificates:read"].some(can)) return <EmptyState title="Parent portal access is not assigned" text="Ask an administrator for the relevant read permission." />;
  const tools = [
    { perm: "guardians:read", href: "/admin/results/parents", icon: Users, title: "Parent accounts", text: "Link children, create access and review recovery requests." },
    { perm: "progress:read", href: "/admin/progress", icon: ClipboardCheck, title: "Results & lesson plans", text: "Review the teacher’s report and plan, edit, then publish to parents." },
    { perm: "certificates:read", href: "/admin/certificates", icon: Award, title: "Certificates", text: "Manage certificates. Only issued certificates appear to linked parents." },
    { perm: "results:read", href: "/admin/results/published", icon: BookOpen, title: "Assessment results", text: "Review the published marks sheets available in the parent portal." },
  ];
  return <>
    <PageHeader title="Parent Portal" subtitle="One workspace for parent access, published result cards, certificates and lesson plans." actions={<a href="/parents" target="_blank" rel="noreferrer" className="btn btn-outline btn-sm"><ExternalLink className="size-4" /> Open parent portal</a>} />
    <ParentPortalNav />
    <div className="mb-6 grid gap-4 sm:grid-cols-2">{tools.filter(tool => can(tool.perm)).map(({ icon: Icon, ...tool }) => <Link key={tool.href} href={tool.href} className="adm-card flex items-start gap-4 p-5 transition-colors hover:border-leaf-600"><span className="rounded-xl bg-leaf-50 p-3 text-leaf-700"><Icon className="size-5" /></span><div><h2 className="font-display text-xl text-mushaf-900">{tool.title}</h2><p className="mt-1 text-sm text-ink-soft">{tool.text}</p></div></Link>)}</div>
    <p className="mb-6 rounded-xl border border-gold-300 bg-gold-50 p-4 text-sm text-ink-soft">Teacher form → admin review and edit → publish → parent portal. Result cards and lesson plans use the same approved snapshot; edits remain private until republished.</p>
    {readProgress && <Card title="Published result cards & lesson plans" className="mb-6"><p className="mb-4 text-sm text-ink-soft">Latest 20 published monthly records. The plan below is the version parents can see.</p>{reports.loading ? <Loading /> : reports.error ? <ErrorState error={reports.error} onRetry={reports.reload} /> : !reports.data?.length ? <EmptyState title="No monthly reports published yet" text="Review a submitted teacher report, then approve and publish it." /> : <ul className="divide-y divide-line">{reports.data.map(report => <li key={report.id} className="py-4 first:pt-0 last:pb-0"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-semibold text-mushaf-900">{report.students?.full_name} · {periodLabel(report.published?.period)}</h3><p className="text-xs text-ink-faint">{report.students?.student_code} · Published {formatDate(report.published_at)}</p></div><Link className="btn btn-outline btn-sm" href={`/admin/progress/${report.id}`}>Review record</Link></div><p className="mt-3 text-xs font-bold uppercase tracking-wide text-leaf-700">Published lesson plan</p><p className="mt-1 whitespace-pre-line break-words text-sm text-ink-soft">{report.published?.learning_plan || "No lesson plan was published for this period."}</p></li>)}</ul>}</Card>}
    {readCertificates && <Card title="Issued certificates"><p className="mb-4 text-sm text-ink-soft">Latest 20 issued certificates. Parents see certificates only for their linked children.</p>{certificates.loading ? <Loading /> : certificates.error ? <ErrorState error={certificates.error} onRetry={certificates.reload} /> : !certificates.data?.length ? <EmptyState title="No certificates issued yet" /> : <ul className="divide-y divide-line">{certificates.data.map(cert => <li key={cert.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><div><p className="font-semibold text-mushaf-900">{cert.students?.full_name} · {cert.title}</p><p className="text-xs text-ink-faint">{cert.students?.student_code} · {formatDate(cert.issued_on)}</p></div><Link href={`/admin/certificates/${cert.id}`} className="btn btn-outline btn-sm">Review certificate</Link></li>)}</ul>}</Card>}
  </>;
}
