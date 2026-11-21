"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Copy, Mail, MessageCircle } from "lucide-react";
import { db, useLoad } from "@/lib/admin/db";
import { SITE_URL } from "@/lib/config";
import { DEFAULT_INVITE_MESSAGE, REVIEWS_BUTTON_DEFAULTS, reviewInviteMessage, reviewShortPath, trustpilotUrl } from "@/lib/reviews-button";

// Staff send the same neutral invitation to every family after a PTM or class review.
// Nothing here filters by rating; selective inviting breaks Trustpilot and Google rules.
export function ReviewInvite() {
  const settings = useLoad(() => db().from("settings").select("value").eq("key", "site.reviews_button").maybeSingle(), []);
  const [target, setTarget] = useState("site");
  const value = settings.data?.value || {};
  const shortLink = `${SITE_URL}${reviewShortPath(value.page_url) || "/reviews"}`;
  const trustpilot = trustpilotUrl(value.url) || REVIEWS_BUTTON_DEFAULTS.url;
  const link = target === "trustpilot" ? trustpilot : shortLink;
  const message = reviewInviteMessage(value.invite_message || DEFAULT_INVITE_MESSAGE, link);

  async function copy() {
    try {
      await navigator.clipboard.writeText(message);
      toast.success("Invitation copied");
    } catch {
      toast.error("Copy was blocked by the browser. Select the text and copy it manually.");
    }
  }

  return (
    <details className="mb-4 rounded-2xl border border-line bg-white px-5 py-4 text-sm text-ink-soft">
      <summary className="cursor-pointer font-semibold text-ink">Invite a family to review</summary>
      <div className="mt-3 space-y-3">
        <p>Send this after every PTM to <strong>all</strong> eligible parents, whatever their feedback. Do not ask for a star rating, offer rewards or only invite happy families.</p>
        <fieldset className="flex flex-wrap gap-2" aria-label="Link in the invitation">
          {[
            ["site", "Website short link", shortLink],
            ["trustpilot", "Trustpilot directly", trustpilot],
          ].map(([key, label, href]) => (
            <label key={key} className={`flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 ${target === key ? "border-leaf-600 bg-leaf-50 text-ink" : "border-line"}`} title={href}>
              <input type="radio" name="invite-target" value={key} checked={target === key} onChange={() => setTarget(key)} className="accent-leaf-700" />
              {label}
            </label>
          ))}
        </fieldset>
        <textarea readOnly value={message} rows={4} aria-label="Invitation message" className="input w-full resize-y font-sans text-sm" onFocus={(e) => e.target.select()} />
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn btn-primary btn-sm" onClick={copy}>
            <Copy className="size-4" aria-hidden="true" /> Copy message
          </button>
          <a className="btn btn-outline btn-sm" href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="size-4" aria-hidden="true" /> WhatsApp
          </a>
          <a className="btn btn-outline btn-sm" href={`mailto:?subject=${encodeURIComponent("Your feedback on Online Quran College")}&body=${encodeURIComponent(message)}`}>
            <Mail className="size-4" aria-hidden="true" /> Email
          </a>
        </div>
        <p className="text-xs">Edit the wording under Settings → Reviews button → Review invitation message. The website short link opens the review page, which also links to Trustpilot.</p>
      </div>
    </details>
  );
}
