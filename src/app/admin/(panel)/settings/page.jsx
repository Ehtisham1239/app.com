"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { clsx } from "clsx";
import { useAccess } from "@/lib/admin/access";
import { db, notifyError, refreshSite, useLoad } from "@/lib/admin/db";
import { DEFAULT_SETTINGS } from "@/lib/site-data";
import { CONTENT_ICONS, ContentIcon } from "@/components/icon";
import { Card, ErrorState, Field, Loading, PageHeader, TagInput, Toggle } from "@/components/admin/ui";

const t = (name, label, extra = {}) => ({ name, label, type: "text", ...extra });
const area = (name, label, extra = {}) => ({ name, label, type: "textarea", ...extra });
const SECTIONS = [
  { key: "site.contact", title: "Contact details", text: "Shown in the header, footer, contact page and WhatsApp buttons.", fields: [t("email", "Email"), t("phone", "Phone"), t("whatsapp", "WhatsApp number", { hint: "Digits with country code, no + or spaces — e.g. 447864710821" }), t("location", "Registered in"), t("hours", "Hours")] },
  { key: "site.identity", title: "Brand", text: "Name and short description used across the website.", fields: [t("name", "Name"), t("legal_name", "Legal name"), area("tagline", "Tagline"), t("established", "Established (year)"), area("description", "Description")] },
  { key: "site.announcement", title: "Top bar", text: "The thin banner above the header.", fields: [{ name: "enabled", label: "Show the banner", type: "bool" }, t("text", "Text"), t("link_label", "Button text"), t("link", "Button link")] },
  { key: "site.hero", title: "Home page hero", text: "The main message at the top of the home page.", fields: [t("eyebrow", "Small heading"), t("title", "Headline"), area("subtitle", "Text"), t("primary_label", "Main button"), t("secondary_label", "Second button"), { name: "badges", label: "Ticks under the buttons", type: "tags" }] },
  { key: "site.stats", title: "Numbers", text: "Short facts shown under the hero.", list: [t("value", "Number"), t("label", "Label")] },
  { key: "site.benefits", title: "Why choose us", text: "Benefits on the home page.", list: [{ name: "icon", label: "Icon", type: "icon" }, t("title", "Title"), area("text", "Text")] },
  { key: "site.steps", title: "How it works", text: "Three steps on the home page.", list: [t("title", "Title"), area("text", "Text")] },
  { key: "site.social", title: "Social links", text: "Leave a link empty to hide it.", fields: [t("facebook", "Facebook"), t("instagram", "Instagram"), t("x", "X (Twitter)"), t("youtube", "YouTube"), t("tiktok", "TikTok")] },
  { key: "site.forms", title: "Forms", text: "Consent wording and thank-you messages.", fields: [area("consent_text", "Consent text"), t("consent_version", "Consent version", { hint: "Change this date when you change the consent text." }), area("trial_success", "Free-trial thank-you"), area("contact_success", "Contact thank-you")] },
  { key: "site.seo", title: "Search engines", text: "Default title and description for Google.", fields: [t("title", "Title"), area("description", "Description"), t("google_verification", "Google Search Console verification code", { hint: "Paste only the content value from the HTML meta tag, not the whole tag." }), t("bing_verification", "Bing Webmaster verification code", { hint: "Paste only the verification code. These codes are public, not account passwords." })] },
];

function Input({ id, f, value, onChange, disabled }) {
  if (f.type === "bool") return <Toggle id={id} checked={!!value} onChange={onChange} label={value ? "On" : "Off"} disabled={disabled} />;
  if (f.type === "tags") return <TagInput id={id} value={value} onChange={onChange} />;
  if (f.type === "textarea") return <textarea id={id} className="adm-input" rows={3} value={value ?? ""} onChange={(e) => onChange(e.target.value)} disabled={disabled} />;
  if (f.type === "icon")
    return (
      <div className="flex items-center gap-2">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-mushaf-900 text-gold-300"><ContentIcon name={value} className="size-5" /></span>
        <select id={id} className="adm-input" value={value || ""} onChange={(e) => onChange(e.target.value)} disabled={disabled}>
          {Object.keys(CONTENT_ICONS).map((k) => <option key={k} value={k}>{k.replace(/-/g, " ")}</option>)}
        </select>
      </div>
    );
  return <input id={id} className="adm-input" value={value ?? ""} onChange={(e) => onChange(e.target.value)} disabled={disabled} />;
}

export default function SettingsPage() {
  const { can } = useAccess();
  const canEdit = can("settings:update");
  const [active, setActive] = useState(SECTIONS[0].key);
  const rows = useLoad(() => db().from("settings").select("key, value, updated_at").like("key", "site.%"), []);
  const [value, setValue] = useState(null);
  const [busy, setBusy] = useState(false);
  const section = SECTIONS.find((s) => s.key === active);
  useEffect(() => {
    if (!rows.data) return;
    const stored = rows.data.find((r) => r.key === active)?.value;
    setValue(stored ?? structuredClone(DEFAULT_SETTINGS[active] ?? (section.list ? [] : {})));
  }, [active, rows.data, section]);

  const save = async () => {
    if (active === "site.seo") {
      for (const name of ["google_verification", "bing_verification"]) {
        if (value[name] && !/^[A-Za-z0-9_-]{1,250}$/.test(value[name].trim())) return toast.error("Paste only the verification code, not the full HTML tag.");
      }
    }
    setBusy(true);
    const exists = rows.data.some((r) => r.key === active);
    const { error } = exists
      ? await db().from("settings").update({ value }).eq("key", active)
      : await db().from("settings").insert({ key: active, value, is_public: true, label: section.title });
    setBusy(false);
    if (error) return notifyError(error);
    toast.success("Saved — the website is updated");
    refreshSite();
    rows.reload();
  };

  return (
    <>
      <PageHeader title="Website settings" subtitle="Contact details, home page text and other site-wide content." />
      {rows.loading ? (
        <Loading rows={6} />
      ) : rows.error ? (
        <ErrorState error={rows.error} onRetry={rows.reload} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[15rem_1fr]">
          <nav className="adm-card h-fit p-2" aria-label="Settings sections">
            {SECTIONS.map((s) => (
              <button key={s.key} type="button" onClick={() => setActive(s.key)} className={clsx("block w-full rounded-xl px-3 py-2 text-left text-sm font-medium", active === s.key ? "bg-mushaf-900 text-white" : "text-ink-soft hover:bg-paper hover:text-ink")}>
                {s.title}
              </button>
            ))}
          </nav>
          {value && (
            <Card
              title={section.title}
              actions={canEdit && (
                <button type="button" className="btn btn-primary btn-sm" onClick={save} disabled={busy}>
                  {busy ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save
                </button>
              )}
            >
              <p className="mb-5 text-sm text-ink-soft">{section.text}</p>
              {section.fields ? (
                <fieldset disabled={!canEdit} className="grid gap-5 sm:grid-cols-2">
                  {section.fields.map((f) => (
                    <Field key={f.name} label={f.label} hint={f.hint} className={f.type === "textarea" || f.type === "tags" ? "sm:col-span-2" : ""}>
                      <Input f={f} value={value[f.name]} onChange={(v) => setValue((x) => ({ ...x, [f.name]: v }))} />
                    </Field>
                  ))}
                </fieldset>
              ) : (
                <fieldset disabled={!canEdit} className="space-y-4">
                  {(Array.isArray(value) ? value : []).map((item, i) => (
                    <div key={i} className="grid gap-3 rounded-xl border border-line p-4 sm:grid-cols-[1fr_auto]">
                      <div className="grid gap-3 sm:grid-cols-2">
                        {section.list.map((f) => (
                          <Field key={f.name} label={f.label} className={f.type === "textarea" ? "sm:col-span-2" : ""}>
                            <Input f={f} value={item[f.name]} onChange={(v) => setValue((arr) => arr.map((x, j) => (j === i ? { ...x, [f.name]: v } : x)))} />
                          </Field>
                        ))}
                      </div>
                      {canEdit && (
                        <button type="button" className="btn btn-ghost btn-sm h-fit text-rose-700" onClick={() => setValue((arr) => arr.filter((_, j) => j !== i))} aria-label="Remove">
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  {canEdit && (
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => setValue((arr) => [...(arr || []), Object.fromEntries(section.list.map((f) => [f.name, f.type === "icon" ? "sparkles" : ""]))])}>
                      <Plus className="size-4" /> Add item
                    </button>
                  )}
                </fieldset>
              )}
            </Card>
          )}
        </div>
      )}
    </>
  );
}
