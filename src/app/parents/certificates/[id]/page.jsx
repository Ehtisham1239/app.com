import Link from "next/link";
import { cookies } from "next/headers";
import { ArrowLeft } from "lucide-react";
import { publicDb } from "@/lib/supabase/public";
import { PARENT_COOKIE, validToken } from "@/lib/results/parent-session";
import { CertificateArtwork } from "@/components/results/certificate-artwork";

export const metadata = { title: "Certificate", robots: { index: false, follow: false } };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// View only: no print, download or share controls (this does not prevent screenshots).
export default async function ParentCertificatePage({ params }) {
  const { id } = await params;
  const token = (await cookies()).get(PARENT_COOKIE)?.value;
  let cert = null, signedIn = false;
  if (validToken(token) && UUID.test(id) && publicDb) {
    const session = await publicDb.rpc("parent_results", { p_token: token });
    signedIn = !session.error && session.data !== null;
    if (signedIn) cert = (await publicDb.rpc("parent_certificate", { p_token: token, p_certificate_id: id })).data ?? null;
  }
  return (
    <div className="page-wrap max-w-5xl py-8">
      <Link href="/parents" className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-leaf-700 hover:underline"><ArrowLeft className="size-4" aria-hidden="true" /> Back to results</Link>
      {!signedIn ? (
        <p className="rounded-2xl bg-white p-8 text-center text-ink-soft">Please <Link href="/parents" className="font-semibold text-leaf-700 underline">sign in</Link> to see this certificate.</p>
      ) : !cert ? (
        <p className="rounded-2xl bg-white p-8 text-center text-ink-soft">This certificate is not available.</p>
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border border-gold-300 bg-white shadow-[0_24px_60px_-34px_rgba(13,74,28,0.6)]">
            <CertificateArtwork title={cert.title} studentName={cert.student} achievement={cert.achievement} courseTitle={cert.course} issuedOn={cert.issued_on} number={cert.number} signedBy={cert.signed_by} verifyText={`Certificate number ${cert.number} can be checked on the Verify page of our website.`} />
          </div>
          <p className="mt-4 text-center text-xs text-ink-faint">For an official copy please contact the coordinator.</p>
        </>
      )}
    </div>
  );
}
