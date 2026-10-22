"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Copy, Images, Loader2, Save, Trash2, Upload } from "lucide-react";
import { clsx } from "clsx";
import { useAccess } from "@/lib/admin/access";
import { db, likeTerm, notifyError, useLoad } from "@/lib/admin/db";
import { MEDIA_BUCKET } from "@/lib/config";
import { uploadMedia } from "@/components/admin/media";
import { Card, ConfirmButton, EmptyState, ErrorState, Field, Loading, PageHeader, SearchInput, When } from "@/components/admin/ui";

const kb = (n) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

export default function MediaPage() {
  const { can, access } = useAccess();
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(null);
  const [alt, setAlt] = useState("");
  const [busy, setBusy] = useState(false);
  const input = useRef(null);
  const media = useLoad(() => {
    let query = db().from("media_assets").select("*").order("created_at", { ascending: false }).limit(200);
    if (q) query = query.or(`file_name.ilike.${likeTerm(q)},alt_text.ilike.${likeTerm(q)}`);
    return query;
  }, [q]);
  const pick = (m) => {
    setSel(m);
    setAlt(m.alt_text || "");
  };
  const upload = async (files) => {
    setBusy(true);
    try {
      for (const f of files) await uploadMedia(f, access?.id);
      toast.success(files.length > 1 ? `${files.length} files uploaded` : "Uploaded");
      media.reload();
    } catch (e) {
      notifyError(e);
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };
  const saveAlt = async () => {
    const { error } = await db().from("media_assets").update({ alt_text: alt }).eq("id", sel.id);
    if (error) return notifyError(error);
    toast.success("Saved");
    media.reload();
  };
  const remove = async () => {
    const { error: sErr } = await db().storage.from(MEDIA_BUCKET).remove([sel.path]);
    if (sErr) return notifyError(sErr);
    const { error } = await db().from("media_assets").delete().eq("id", sel.id);
    if (error) return notifyError(error);
    toast.success("Deleted");
    setSel(null);
    media.reload();
  };
  return (
    <>
      <PageHeader
        title="Media library"
        subtitle="Images and PDFs used on the website. Upload here, then pick them in any page, course or article."
        actions={
          can("media:create") && (
            <>
              <input ref={input} type="file" hidden multiple accept="image/jpeg,image/png,image/webp,image/gif,image/avif,application/pdf" onChange={(e) => e.target.files?.length && upload([...e.target.files])} />
              <button type="button" className="btn btn-primary btn-sm" disabled={busy} onClick={() => input.current?.click()}>
                {busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />} Upload
              </button>
            </>
          )
        }
      />
      <div className="mb-4 flex justify-end">
        <SearchInput value={q} onChange={setQ} placeholder="Search files…" className="w-full sm:w-72" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <Card bodyClass="p-4">
          {media.loading ? (
            <Loading />
          ) : media.error ? (
            <ErrorState error={media.error} onRetry={media.reload} />
          ) : !media.data?.length ? (
            <EmptyState icon={Images} title="No files yet" text="Upload photos for courses, teachers and blog articles (JPG, PNG, WebP up to 10 MB)." />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {media.data.map((m) => (
                <button key={m.id} type="button" onClick={() => pick(m)} className={clsx("overflow-hidden rounded-xl border text-left transition-shadow hover:shadow-[var(--shadow-lift)]", sel?.id === m.id ? "border-leaf-600 ring-2 ring-leaf-600/30" : "border-line")}>
                  {m.mime_type?.startsWith("image/") ? (
                    <img src={m.public_url} alt={m.alt_text || ""} className="aspect-[4/3] w-full bg-paper object-cover" loading="lazy" />
                  ) : (
                    <span className="flex aspect-[4/3] items-center justify-center bg-paper text-sm font-bold text-ink-soft">PDF</span>
                  )}
                  <span className="block truncate px-3 py-2 text-xs text-ink-soft">{m.file_name}</span>
                </button>
              ))}
            </div>
          )}
        </Card>
        <aside>
          {sel ? (
            <Card title="File details">
              {sel.mime_type?.startsWith("image/") && <img src={sel.public_url} alt="" className="mb-4 w-full rounded-xl border border-line" />}
              <dl className="mb-4 space-y-1 text-sm text-ink-soft">
                <div>{sel.file_name}</div>
                <div>
                  {kb(sel.size_bytes)}
                  {sel.width ? ` · ${sel.width}×${sel.height}` : ""} · <When value={sel.created_at} />
                </div>
              </dl>
              <Field label="Description (alt text)" hint="Describes the image for screen readers and Google.">
                <input className="adm-input" value={alt} onChange={(e) => setAlt(e.target.value)} disabled={!can("media:update")} />
              </Field>
              <div className="mt-3 flex flex-wrap gap-2">
                {can("media:update") && (
                  <button type="button" className="btn btn-outline btn-sm" onClick={saveAlt} disabled={alt === (sel.alt_text || "")}>
                    <Save className="size-4" /> Save
                  </button>
                )}
                <button type="button" className="btn btn-outline btn-sm" onClick={() => navigator.clipboard.writeText(sel.public_url).then(() => toast.success("Link copied"))}>
                  <Copy className="size-4" /> Copy link
                </button>
                {can("media:delete") && (
                  <ConfirmButton onConfirm={remove} title="Delete this file?" message="Pages that still use this image will show a broken picture." confirmLabel="Delete" className="btn btn-ghost btn-sm text-rose-700">
                    <Trash2 className="size-4" /> Delete
                  </ConfirmButton>
                )}
              </div>
            </Card>
          ) : (
            <p className="adm-card p-5 text-sm text-ink-faint">Select a file to see its details, copy its link or delete it.</p>
          )}
        </aside>
      </div>
    </>
  );
}
