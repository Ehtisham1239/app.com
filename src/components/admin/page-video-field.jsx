"use client";

import { useState } from "react";
import { uploadMedia } from "@/components/admin/media";
import { notifyError } from "@/lib/admin/db";
import { pageVideo } from "@/lib/page-video";

export function PageVideoField({ value, onChange, userId, canUpload }) {
  const [uploading, setUploading] = useState(false);
  const draft = value || {};
  const set = (key, next) => onChange({ ...draft, [key]: next });
  const valid = pageVideo(draft);

  async function upload(file) {
    setUploading(true);
    try {
      const asset = await uploadMedia(file, userId, { video: true });
      set("url", asset.public_url);
    } catch (error) {
      notifyError(error);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-ink-soft">Use a public YouTube video or an MP4 you have permission to publish. Uploaded files become publicly accessible immediately. Add an accessible summary or transcript in the page content.</p>
      <fieldset disabled={uploading} className="grid gap-3 sm:grid-cols-2">
        <label className="sm:col-span-2">YouTube or OQC MP4 URL
          <input className="adm-input mt-1" value={draft.url || ""} onChange={(event) => set("url", event.target.value)} />
        </label>
        {canUpload && <label className="sm:col-span-2">Upload MP4 (up to 10 MB)
          <input type="file" accept="video/mp4,.mp4" className="adm-input mt-1" onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void upload(file);
          }} />
        </label>}
        <label>Video title
          <input className="adm-input mt-1" maxLength={100} value={draft.title || ""} onChange={(event) => set("title", event.target.value)} />
        </label>
        <label>Original upload date
          <input type="date" className="adm-input mt-1" value={draft.uploadDate || ""} onChange={(event) => set("uploadDate", event.target.value)} />
        </label>
        <label className="sm:col-span-2">Description
          <textarea className="adm-input mt-1" rows={2} maxLength={1000} value={draft.description || ""} onChange={(event) => set("description", event.target.value)} />
        </label>
        <label className="sm:col-span-2">Thumbnail URL (required for MP4)
          <input className="adm-input mt-1" placeholder="Paste an image URL from Media Library" value={draft.thumbnail || ""} onChange={(event) => set("thumbnail", event.target.value)} />
        </label>
        <label className="flex items-center gap-2 sm:col-span-2"><input type="checkbox" className="check" checked={draft.primary === true} onChange={(event) => set("primary", event.target.checked)} /> This is the main video on a dedicated watch page</label>
        {value && <button type="button" className="btn btn-outline btn-sm justify-self-start" onClick={() => onChange(null)}>Remove video</button>}
      </fieldset>
      {uploading && <p role="status">Uploading video…</p>}
      {valid && <p role="status" className="text-sm text-leaf-700">Video details are ready. Save the page to apply them.</p>}
    </div>
  );
}
