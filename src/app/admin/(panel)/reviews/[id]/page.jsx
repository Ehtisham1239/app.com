"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { toast } from "sonner";
import { Archive, Ban, CheckCircle2, MessageSquareQuote, Save, Star, Trash2, XCircle } from "lucide-react";
import { useAccess } from "@/lib/admin/access";
import { db, notifyError, useLoad } from "@/lib/admin/db";
import { REVIEW_STATUSES } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import { Card, ErrorState, Field, Loading, PageHeader, StatusBadge, When } from "@/components/admin/ui";

const BUCKET = "review-media";
const isVideo = (path) => /\.(mp4|mov|webm)$/i.test(path);

export default function ReviewPage({ params }) {
  const { id } = use(params);
  const { can } = useAccess();
  const review = useLoad(() => db().from("review_submissions").select("*").eq("id", id).maybeSingle(), [id]);
  const r = review.data;
  const [note, setNote] = useState({ id: null, value: "" });
  const [media, setMedia] = useState({ id: null, urls: [] });
  const [busy, setBusy] = useState(false);
  const canEdit = can("testimonials:update");
  const noteValue = note.id === r?.id ? note.value : r?.internal_note || "";

  // Private files: short-lived signed links, created only for staff viewing this review.
  useEffect(() => {
    if (!r?.media_paths?.length) return;
    let cancelled = false;
    db().storage.from(BUCKET).createSignedUrls(r.media_paths, 600).then(({ data, error }) => {
      if (cancelled) return;
      if (error) return notifyError(error);
      setMedia({ id: r.id, urls: (data || []).map((d, i) => ({ path: r.media_paths[i], url: d.signedUrl, error: d.error })) });
    });
    return () => { cancelled = true; };
  }, [r?.id, r?.media_paths]);

  if (review.loading && !r) return <Loading rows={6} />;
  if (review.error) return <ErrorState error={review.error} onRetry={review.reload} />;
  if (!r) return <PageHeader title="Review not found" back={{ href: "/admin/reviews", label: "Reviews" }} />;

  const set = async (patch, ok = "Updated") => {
    const { error } = await db().from("review_submissions").update(patch).eq("id", r.id);
    if (error) return notifyError(error);
    toast.success(ok);
    review.reload();
  };

  const makeTestimonial = async () => {
    setBusy(true);
    const { data, error } = await db().from("testimonials").insert({
      // The form promises reviewers that only their first name is shown publicly.
      name: r.name.trim().split(/\s+/)[0], relation: r.relation, country: r.country || "", quote: r.comment, rating: r.rating,
      status: "draft", source_note: `Website review ${r.reference}${r.publish_consent ? " · website permission given in the form" : ""}`,
      // Permission ticked in the review form is recorded; staff still review the text before publishing.
      consent_recorded_at: r.publish_consent ? (r.publish_consent_at || r.created_at) : null,
    }).select("id").single();
    if (error) { setBusy(false); return notifyError(error); }
    await set({ testimonial_id: data.id, status: "approved" }, "Testimonial draft created — record publishing permission before you publish it");
    setBusy(false);
  };

  const deleteMedia = async () => {
    if (!window.confirm("Delete the attached files permanently? The review text is kept.")) return;
    setBusy(true);
    const { error } = await db().storage.from(BUCKET).remove(r.media_paths);
    if (error) { setBusy(false); return notifyError(error); }
    await set({ media_paths: [] }, "Files deleted");
    setMedia({ id: null, urls: [] });
    setBusy(false);
  };

  const files = media.id === r.id ? media.urls : [];
  return (
    <>
      <PageHeader title={`Review from ${r.name}`} back={{ href: "/admin/reviews", label: "Reviews" }}>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-ink-faint">
          <StatusBadge list={REVIEW_STATUSES} value={r.status} />
          <span>{r.reference}</span>·<When value={r.created_at} />
        </div>
      </PageHeader>
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          <Card title={`${r.relation} review`}>
            <p className="flex items-center gap-0.5 text-gold-600" aria-label={`${r.rating} out of 5 stars`}>
              {Array.from({ length: 5 }, (_, i) => <Star key={i} className={`size-5 ${i < r.rating ? "fill-current" : "opacity-30"}`} aria-hidden="true" />)}
            </p>
            <p className="mt-3 whitespace-pre-wrap text-[0.97rem] leading-relaxed text-ink">{r.comment}</p>
            <dl className="mt-5 grid gap-2 border-t border-line pt-4 text-sm sm:grid-cols-2">
              <div><dt className="text-ink-faint">Email (private)</dt><dd><a href={`mailto:${r.email}`} className="text-leaf-700 hover:underline">{r.email}</a></dd></div>
              <div><dt className="text-ink-faint">Sent from page</dt><dd>{r.page_path || "—"}</dd></div>
              <div><dt className="text-ink-faint">Received</dt><dd>{formatDateTime(r.created_at)}</dd></div>
              <div><dt className="text-ink-faint">Privacy consent</dt><dd>Version {r.consent_text_version}</dd></div>
              <div><dt className="text-ink-faint">Show on website</dt><dd>{r.publish_consent ? `Yes — permission given ${formatDateTime(r.publish_consent_at || r.created_at)}` : "No permission given in the form"}</dd></div>
            </dl>
          </Card>
          {r.media_paths?.length > 0 && (
            <Card title={`Attached files (${r.media_paths.length})`}>
              <p className="mb-3 text-sm text-ink-soft">Private to staff. Do not publish photos or videos — especially of children — without written permission.</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {files.map((f) => f.url ? (
                  isVideo(f.path)
                    ? <video key={f.path} src={f.url} controls preload="metadata" className="w-full rounded-xl bg-black" />
                    // eslint-disable-next-line @next/next/no-img-element
                    : <a key={f.path} href={f.url} target="_blank" rel="noopener noreferrer"><img src={f.url} alt={`Attachment to review ${r.reference}`} className="w-full rounded-xl object-cover" /></a>
                ) : <p key={f.path} className="text-sm text-rose-700">{f.path.split("/").pop()} could not be loaded.</p>)}
              </div>
              {can("testimonials:delete") && (
                <button type="button" className="btn btn-ghost btn-sm mt-4 text-rose-700" disabled={busy} onClick={deleteMedia}>
                  <Trash2 className="size-4" /> Delete files
                </button>
              )}
            </Card>
          )}
          <Card title="Internal note">
            <fieldset disabled={!canEdit}>
              <textarea className="adm-input" rows={3} value={noteValue} onChange={(e) => setNote({ id: r.id, value: e.target.value })} placeholder="Visible to admins only" aria-label="Internal note" />
              <button type="button" className="btn btn-outline btn-sm mt-3" disabled={noteValue === (r.internal_note || "")} onClick={() => set({ internal_note: noteValue || null }, "Note saved")}>
                <Save className="size-4" /> Save note
              </button>
            </fieldset>
          </Card>
        </div>
        <aside className="space-y-4">
          {r.rating <= 2 && <Card title="Negative feedback attention">
            <p className="text-sm leading-relaxed text-ink-soft">This low-rated review is routed for staff attention. Contact the customer, investigate the issue and record the outcome in the internal note. Public review invitations must remain available to every customer.</p>
            {r.escalated_at ? <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-800">5-day escalation sent: {formatDateTime(r.escalated_at)}</p> : <p className="mt-3 text-xs text-ink-faint">If it remains in New status for five days, the system sends one escalation notification.</p>}
          </Card>}
          <Card title="Use this review">
            {r.testimonial_id ? (
              <Link href={`/admin/testimonials/${r.testimonial_id}`} className="btn btn-outline w-full"><MessageSquareQuote className="size-4" /> Open testimonial</Link>
            ) : (
              <button type="button" className="btn btn-primary w-full" disabled={busy || !can("testimonials:create")} onClick={makeTestimonial}>
                <MessageSquareQuote className="size-4" /> Create testimonial draft
              </button>
            )}
            <p className="mt-3 text-xs text-ink-faint">Creates an unpublished testimonial with the reviewer’s first name, rating and comment. {r.publish_consent ? "The reviewer gave website permission in the form; check the text, then publish." : "Before publishing, ask the reviewer for permission and record the date in the testimonial."}</p>
          </Card>
          <Card title="Status">
            <fieldset disabled={!canEdit} className="space-y-2">
              <button type="button" className="btn btn-outline w-full" disabled={r.status === "approved"} onClick={() => set({ status: "approved" }, "Marked as approved")}><CheckCircle2 className="size-4" /> Approve</button>
              <button type="button" className="btn btn-outline w-full" disabled={r.status === "rejected"} onClick={() => set({ status: "rejected" }, "Marked as not used")}><XCircle className="size-4" /> Don’t use</button>
              <button type="button" className="btn btn-outline w-full" disabled={r.status === "archived"} onClick={() => set({ status: "archived" }, "Archived")}><Archive className="size-4" /> Archive</button>
              <button type="button" className="btn btn-ghost w-full text-rose-700" disabled={r.status === "spam"} onClick={() => set({ status: "spam" }, "Marked as spam")}><Ban className="size-4" /> Spam</button>
            </fieldset>
          </Card>
          <Field label="" hint={`Spam score: ${r.spam_score}`} />
        </aside>
      </div>
    </>
  );
}
