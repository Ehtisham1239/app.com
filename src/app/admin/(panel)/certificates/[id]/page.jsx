"use client";

import Link from "next/link";
import { use } from "react";
import { toast } from "sonner";
import { Ban, BadgeCheck, Printer } from "lucide-react";
import { useAccess } from "@/lib/admin/access";
import { db, notifyError, useLoad } from "@/lib/admin/db";
import { CERTIFICATE_STATUSES } from "@/lib/constants";
import { SITE_URL } from "@/lib/config";
import { CertificateArtwork } from "@/components/results/certificate-artwork";
import { Card, ConfirmButton, ErrorState, Loading, PageHeader, StatusBadge } from "@/components/admin/ui";

function LinkedResults({ certificateId }) {
  const results = useLoad(() => db().from("student_results").select("id, marks_obtained, total_marks, percentage, grade, status, assessments(title, code)").eq("certificate_id", certificateId), [certificateId]);
  if (!results.data?.length) return null;
  return (
    <div className="no-print mt-5">
      <Card title="Linked results">
        <ul className="divide-y divide-line text-sm">
          {results.data.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
              <Link href={`/admin/results/published?result=${r.id}`} className="font-semibold text-mushaf-900 hover:text-leaf-700">{r.assessments?.title} <span className="font-normal text-ink-faint">· {r.assessments?.code}</span></Link>
              <span className="text-ink-soft">{Number(r.marks_obtained)} / {Number(r.total_marks)} · {Number(r.percentage)}%{r.grade ? ` · ${r.grade}` : ""}{r.status === "withdrawn" ? " · withdrawn" : ""}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

export default function CertificatePage({ params }) {
  const { id } = use(params);
  const { can } = useAccess();
  const cert = useLoad(() => db().from("certificates").select("*, students(full_name, student_code), courses(title)").eq("id", id).maybeSingle(), [id]);
  if (cert.loading && !cert.data) return <Loading rows={6} />;
  if (cert.error) return <ErrorState error={cert.error} onRetry={cert.reload} />;
  const c = cert.data;
  if (!c) return <PageHeader title="Certificate not found" back={{ href: "/admin/certificates", label: "Certificates" }} />;
  const setStatus = async (status) => {
    const { error } = await db().from("certificates").update({ status }).eq("id", c.id);
    if (error) return notifyError(error);
    toast.success(status === "issued" ? "Certificate issued" : "Certificate revoked");
    cert.reload();
  };
  const origin = SITE_URL.includes("localhost") && typeof window !== "undefined" ? window.location.origin : SITE_URL;
  const verifyUrl = `${origin}/verify-certificate?number=${encodeURIComponent(c.number)}`;
  return (
    <>
      <div className="no-print">
        <PageHeader
          title={c.number}
          back={{ href: "/admin/certificates", label: "Certificates" }}
          actions={
            <>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => window.print()}>
                <Printer className="size-4" /> Print / save PDF
              </button>
              {can("certificates:update") && c.status !== "issued" && (
                <button type="button" className="btn btn-primary btn-sm" onClick={() => setStatus("issued")}>
                  <BadgeCheck className="size-4" /> Issue
                </button>
              )}
              {can("certificates:update") && c.status === "issued" && (
                <ConfirmButton onConfirm={() => setStatus("revoked")} title="Revoke this certificate?" message="The Verify page will no longer confirm it." confirmLabel="Revoke" className="btn btn-ghost btn-sm text-rose-700">
                  <Ban className="size-4" /> Revoke
                </ConfirmButton>
              )}
            </>
          }
        >
          <div className="mt-2 flex items-center gap-2 text-sm text-ink-faint">
            <StatusBadge list={CERTIFICATE_STATUSES} value={c.status} /> {c.status === "issued" && <a href={verifyUrl} target="_blank" rel="noopener noreferrer" className="text-leaf-700 hover:underline">Check on the Verify page</a>}
          </div>
        </PageHeader>
      </div>
      <Card bodyClass="p-0 print:border-0">
        <CertificateArtwork title={c.title} studentName={c.students?.full_name} achievement={c.achievement} courseTitle={c.courses?.title} issuedOn={c.issued_on} number={c.number} signedBy={c.signed_by} status={c.status} verifyText={`Verify at ${verifyUrl.replace(/^https?:\/\//, "")}`} />
      </Card>
      {can("results:read") && <LinkedResults certificateId={c.id} />}
      <style>{`@media print { @page { size: A4 landscape; margin: 0; } body * { visibility: hidden; } .certificate, .certificate * { visibility: visible; } .certificate { position: fixed; inset: 0; max-width: none; width: 100vw; height: 100vh; aspect-ratio: auto; } }`}</style>
    </>
  );
}
