"use client";

import { use } from "react";
import { toast } from "sonner";
import { Ban, BadgeCheck, Printer } from "lucide-react";
import { useAccess } from "@/lib/admin/access";
import { db, notifyError, useLoad } from "@/lib/admin/db";
import { CERTIFICATE_STATUSES } from "@/lib/constants";
import { SITE_URL } from "@/lib/config";
import { formatDate } from "@/lib/format";
import { Card, ConfirmButton, ErrorState, Loading, PageHeader, StatusBadge } from "@/components/admin/ui";

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
        <div className="certificate relative mx-auto aspect-[297/210] w-full max-w-5xl overflow-hidden bg-[#fffdf6] p-[4%] text-center">
          <div className="absolute inset-[2.2%] rounded-[6px] border-[3px] border-gold-500" />
          <div className="absolute inset-[3.4%] rounded-[4px] border border-gold-400/70" />
          <div className="pattern-girih absolute inset-0 opacity-[0.06]" />
          <div className="relative flex h-full flex-col items-center justify-center">
            <span className="brand-mark block size-[11%] min-h-12 min-w-12 text-leaf-700" aria-hidden="true" />
            <p className="mt-[1.5%] text-[clamp(0.6rem,1.3vw,0.95rem)] font-bold uppercase tracking-[0.3em] text-gold-700">Online Quran College</p>
            <h2 className="mt-[2%] font-display text-[clamp(1.6rem,4.4vw,3.4rem)] leading-tight text-mushaf-900">{c.title}</h2>
            <p className="mt-[2%] text-[clamp(0.7rem,1.4vw,1.05rem)] italic text-ink-soft">This is proudly presented to</p>
            <p className="mt-[1.2%] border-b-2 border-gold-400 px-[6%] pb-[0.8%] font-display text-[clamp(1.4rem,3.6vw,2.8rem)] text-ink">{c.students?.full_name}</p>
            <p className="mt-[2%] max-w-[70%] text-[clamp(0.7rem,1.4vw,1.05rem)] leading-relaxed text-ink-soft">
              {c.achievement || (c.courses?.title ? `for successfully completing the ${c.courses.title} course.` : "")}
            </p>
            <div className="mt-[4%] grid w-[78%] grid-cols-3 items-end gap-[4%] text-[clamp(0.55rem,1.1vw,0.85rem)] text-ink-soft">
              <div><p className="font-semibold text-ink">{formatDate(c.issued_on)}</p><p className="mt-1 border-t border-ink/30 pt-1">Date</p></div>
              <div><p className="font-semibold text-ink">{c.number}</p><p className="mt-1 border-t border-ink/30 pt-1">Certificate number</p></div>
              <div><p className="min-h-[1.2em] font-semibold text-ink">{c.signed_by}</p><p className="mt-1 border-t border-ink/30 pt-1">Signature</p></div>
            </div>
            <p className="mt-[3%] text-[clamp(0.5rem,0.9vw,0.72rem)] text-ink-faint">Verify at {verifyUrl.replace(/^https?:\/\//, "")}</p>
            {c.status !== "issued" && <p className="absolute right-[5%] top-[6%] rotate-12 rounded border-2 border-rose-600 px-3 py-1 text-sm font-bold uppercase text-rose-600">{c.status}</p>}
          </div>
        </div>
      </Card>
      <style>{`@media print { @page { size: A4 landscape; margin: 0; } body * { visibility: hidden; } .certificate, .certificate * { visibility: visible; } .certificate { position: fixed; inset: 0; max-width: none; width: 100vw; height: 100vh; aspect-ratio: auto; } }`}</style>
    </>
  );
}
