import { formatDate } from "@/lib/format";

// The certificate design shared by the staff certificate page (which can print it)
// and the parent portal (view only). `status` other than "issued" is stamped.
export function CertificateArtwork({ title, studentName, achievement, courseTitle, issuedOn, number, signedBy, status = "issued", verifyText }) {
  return (
    <div className="certificate relative mx-auto aspect-[297/210] w-full max-w-5xl overflow-hidden bg-[#fffdf6] p-[4%] text-center">
      <div className="absolute inset-[2.2%] rounded-[6px] border-[3px] border-gold-500" />
      <div className="absolute inset-[3.4%] rounded-[4px] border border-gold-400/70" />
      <div className="pattern-girih absolute inset-0 opacity-[0.06]" />
      <div className="relative flex h-full flex-col items-center justify-center">
        <span className="brand-mark block size-[11%] min-h-12 min-w-12 text-leaf-700" aria-hidden="true" />
        <p className="mt-[1.5%] text-[clamp(0.6rem,1.3vw,0.95rem)] font-bold uppercase tracking-[0.3em] text-gold-700">Online Quran College</p>
        <h2 className="mt-[2%] font-display text-[clamp(1.6rem,4.4vw,3.4rem)] leading-tight text-mushaf-900">{title}</h2>
        <p className="mt-[2%] text-[clamp(0.7rem,1.4vw,1.05rem)] italic text-ink-soft">This is proudly presented to</p>
        <p className="mt-[1.2%] border-b-2 border-gold-400 px-[6%] pb-[0.8%] font-display text-[clamp(1.4rem,3.6vw,2.8rem)] text-ink">{studentName}</p>
        <p className="mt-[2%] max-w-[70%] text-[clamp(0.7rem,1.4vw,1.05rem)] leading-relaxed text-ink-soft">
          {achievement || (courseTitle ? `for successfully completing the ${courseTitle} course.` : "")}
        </p>
        <div className="mt-[4%] grid w-[78%] grid-cols-3 items-end gap-[4%] text-[clamp(0.55rem,1.1vw,0.85rem)] text-ink-soft">
          <div><p className="font-semibold text-ink">{formatDate(issuedOn)}</p><p className="mt-1 border-t border-ink/30 pt-1">Date</p></div>
          <div><p className="font-semibold text-ink">{number}</p><p className="mt-1 border-t border-ink/30 pt-1">Certificate number</p></div>
          <div><p className="min-h-[1.2em] font-semibold text-ink">{signedBy}</p><p className="mt-1 border-t border-ink/30 pt-1">Signature</p></div>
        </div>
        {verifyText && <p className="mt-[3%] text-[clamp(0.5rem,0.9vw,0.72rem)] text-ink-faint">{verifyText}</p>}
        {status !== "issued" && <p className="absolute right-[5%] top-[6%] rotate-12 rounded border-2 border-rose-600 px-3 py-1 text-sm font-bold uppercase text-rose-600">{status}</p>}
      </div>
    </div>
  );
}
