"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { ImagePlus, Images, Loader2, Upload, X } from "lucide-react";
import { clsx } from "clsx";
import { db, notifyError, useLoad } from "@/lib/admin/db";
import { MEDIA_BUCKET } from "@/lib/config";
import { slugify } from "@/lib/format";
import { Modal, EmptyState, Loading } from "@/components/admin/ui";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif", "application/pdf"];

function imageSize(file) {
  return new Promise((resolve) => {
    if (!file.type.startsWith("image/")) return resolve({});
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => resolve({});
    img.src = url;
  });
}

// Uploads a file to the public "media" bucket and records it in the media library.
export async function uploadMedia(file, userId) {
  if (!ALLOWED.includes(file.type)) throw new Error("Only JPG, PNG, WebP, GIF, AVIF images or PDF files can be uploaded.");
  if (file.size > 10 * 1024 * 1024) throw new Error("Files must be smaller than 10 MB.");
  const ext = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
  const base = slugify(file.name.replace(/\.[^.]+$/, "")) || "file";
  const now = new Date();
  const path = `uploads/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${base}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const supabase = db();
  const { error: upErr } = await supabase.storage.from(MEDIA_BUCKET).upload(path, await file.arrayBuffer(), { contentType: file.type, upsert: false });
  if (upErr) throw upErr;
  const { data: pub } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  const dims = await imageSize(file);
  const { data, error } = await supabase
    .from("media_assets")
    .insert({ bucket: MEDIA_BUCKET, path, public_url: pub.publicUrl, file_name: file.name, mime_type: file.type, size_bytes: file.size, uploaded_by: userId, alt_text: base.replace(/-/g, " "), ...dims })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export function MediaPicker({ open, onClose, onPick, userId }) {
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);
  const media = useLoad(
    () => (open ? db().from("media_assets").select("id, public_url, file_name, mime_type, alt_text").order("created_at", { ascending: false }).limit(60) : { data: [] }),
    [open],
  );
  const onFiles = async (files) => {
    setBusy(true);
    try {
      let last;
      for (const f of files) last = await uploadMedia(f, userId);
      toast.success(files.length > 1 ? `${files.length} files uploaded` : "File uploaded");
      if (files.length === 1 && last) onPick(last.public_url, last);
      else media.reload();
    } catch (e) {
      notifyError(e);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Choose an image"
      size="lg"
      footer={
        <>
          <input ref={inputRef} type="file" accept={ALLOWED.join(",")} multiple hidden onChange={(e) => e.target.files?.length && onFiles([...e.target.files])} />
          <button type="button" className="btn btn-primary btn-sm" onClick={() => inputRef.current?.click()} disabled={busy}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />} Upload new
          </button>
        </>
      }
    >
      {media.loading ? (
        <Loading rows={3} />
      ) : !media.data?.length ? (
        <EmptyState icon={Images} title="No images yet" text="Upload a photo or graphic to use it on the website." />
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {media.data.map((m) => (
            <button key={m.id} type="button" onClick={() => onPick(m.public_url, m)} className="group overflow-hidden rounded-xl border border-line text-left hover:border-leaf-600">
              {m.mime_type?.startsWith("image/") ? (
                <img src={m.public_url} alt={m.alt_text || ""} className="aspect-square w-full object-cover" loading="lazy" />
              ) : (
                <span className="flex aspect-square items-center justify-center bg-paper text-xs font-semibold text-ink-soft">PDF</span>
              )}
              <span className="block truncate px-2 py-1.5 text-[0.75rem] text-ink-soft group-hover:text-ink">{m.file_name}</span>
            </button>
          ))}
        </div>
      )}
    </Modal>
  );
}

// URL input with a preview and a "choose from media" button.
export function ImageField({ id, value, onChange, userId }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex items-start gap-3">
      <div className={clsx("flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line bg-paper", !value && "text-ink-faint")}>
        {value ? <img src={value} alt="" className="size-full object-cover" /> : <ImagePlus className="size-6" aria-hidden="true" />}
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <input id={id} className="adm-input" value={value || ""} onChange={(e) => onChange(e.target.value || null)} placeholder="https://… or choose from media" />
        <div className="flex gap-2">
          <button type="button" className="btn btn-outline btn-sm" onClick={() => setOpen(true)}>
            <Images className="size-4" /> Media library
          </button>
          {value && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => onChange(null)}>
              <X className="size-4" /> Remove
            </button>
          )}
        </div>
      </div>
      <MediaPicker
        open={open}
        onClose={() => setOpen(false)}
        userId={userId}
        onPick={(url) => {
          onChange(url);
          setOpen(false);
        }}
      />
    </div>
  );
}
