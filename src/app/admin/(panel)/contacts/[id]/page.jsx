"use client";

import { use, useEffect, useState } from "react";
import { toast } from "sonner";
import { Archive, Ban, CheckCircle2, Mail, MessageCircle, Save } from "lucide-react";
import { useAccess } from "@/lib/admin/access";
import { db, notifyError, useLoad } from "@/lib/admin/db";
import { CONTACT_STATUSES } from "@/lib/constants";
import { formatDateTime, whatsappLink } from "@/lib/format";
import { Card, ErrorState, Field, Loading, PageHeader, StatusBadge, When } from "@/components/admin/ui";

export default function ContactPage({ params }) {
  const { id } = use(params);
  const { can, access } = useAccess();
  const msg = useLoad(() => db().from("contact_messages").select("*, profiles!contact_messages_replied_by_fkey(full_name)").eq("id", id).maybeSingle(), [id]);
  const [draft, setDraft] = useState({ id: null, value: "" });
  const m = msg.data;
  const note = draft.id === m?.id ? draft.value : m?.internal_note || "";
  const canEdit = can("contacts:update");

  useEffect(() => {
    if (m && m.status === "new" && canEdit) {
      db().from("contact_messages").update({ status: "read" }).eq("id", m.id).then(({ error }) => !error && msg.reload());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [m?.id, m?.status]);

  if (msg.loading && !m) return <Loading rows={6} />;
  if (msg.error) return <ErrorState error={msg.error} onRetry={msg.reload} />;
  if (!m) return <PageHeader title="Message not found" back={{ href: "/admin/contacts", label: "Messages" }} />;

  const set = async (patch, ok = "Updated") => {
    const { error } = await db().from("contact_messages").update(patch).eq("id", m.id);
    if (error) return notifyError(error);
    toast.success(ok);
    msg.reload();
  };
  const wa = m.phone ? whatsappLink(m.phone, `Assalamu alaikum ${m.name}, thank you for contacting Online Quran College about “${m.subject}”.`) : null;
  const mailto = `mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject}`)}&body=${encodeURIComponent(`Assalamu alaikum ${m.name},\n\n\n\nOnline Quran College\n\n> ${m.message.split("\n").join("\n> ")}`)}`;

  return (
    <>
      <PageHeader title={m.subject} back={{ href: "/admin/contacts", label: "Messages" }}>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-ink-faint">
          <StatusBadge list={CONTACT_STATUSES} value={m.status} />
          <span>{m.reference}</span>·<When value={m.created_at} />
        </div>
      </PageHeader>
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          <Card title={`From ${m.name}`}>
            <p className="whitespace-pre-wrap text-[0.97rem] leading-relaxed text-ink">{m.message}</p>
            <dl className="mt-5 grid gap-2 border-t border-line pt-4 text-sm sm:grid-cols-2">
              <div><dt className="text-ink-faint">Email</dt><dd><a href={`mailto:${m.email}`} className="text-leaf-700 hover:underline">{m.email}</a></dd></div>
              <div><dt className="text-ink-faint">Phone</dt><dd>{m.phone || "—"}</dd></div>
              <div><dt className="text-ink-faint">Location</dt><dd>{[m.city, m.country].filter(Boolean).join(", ") || "—"}</dd></div>
              <div><dt className="text-ink-faint">Received</dt><dd>{formatDateTime(m.created_at)}</dd></div>
            </dl>
            <div className="mt-5 flex flex-wrap gap-2">
              <a href={mailto} className="btn btn-primary btn-sm"><Mail className="size-4" /> Reply by email</a>
              {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm"><MessageCircle className="size-4" /> WhatsApp</a>}
            </div>
          </Card>
          <Card title="Internal note">
            <fieldset disabled={!canEdit}>
              <textarea className="adm-input" rows={4} value={note} onChange={(e) => setDraft({ id: m.id, value: e.target.value })} placeholder="Visible to admins only" aria-label="Internal note" />
              <button type="button" className="btn btn-outline btn-sm mt-3" disabled={note === (m.internal_note || "")} onClick={() => set({ internal_note: note || null }, "Note saved")}>
                <Save className="size-4" /> Save note
              </button>
            </fieldset>
          </Card>
        </div>
        <aside className="space-y-4">
          <Card title="Campaign attribution"><p className="text-sm">Source: {m.source || "website"}</p>{Object.entries(m.utm || {}).map(([key, value]) => <p key={key} className="mt-2 break-all text-xs text-ink-soft">{key}: {String(value)}</p>)}</Card>
          <Card title="Status">
            <fieldset disabled={!canEdit} className="space-y-2">
              <button type="button" className="btn btn-primary w-full" disabled={m.status === "replied"} onClick={() => set({ status: "replied", replied_at: new Date().toISOString(), replied_by: access?.id }, "Marked as replied")}>
                <CheckCircle2 className="size-4" /> Mark as replied
              </button>
              <button type="button" className="btn btn-outline w-full" disabled={m.status === "archived"} onClick={() => set({ status: "archived" }, "Archived")}>
                <Archive className="size-4" /> Archive
              </button>
              <button type="button" className="btn btn-ghost w-full text-rose-700" disabled={m.status === "spam"} onClick={() => set({ status: "spam" }, "Marked as spam")}>
                <Ban className="size-4" /> Spam
              </button>
            </fieldset>
            {m.replied_at && (
              <p className="mt-4 text-xs text-ink-faint">
                Replied {formatDateTime(m.replied_at)}
                {m.profiles?.full_name ? ` by ${m.profiles.full_name}` : ""}
              </p>
            )}
          </Card>
          <Field label="" hint={`Spam score: ${m.spam_score}`} />
        </aside>
      </div>
    </>
  );
}
