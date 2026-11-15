"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ExternalLink, Loader2, Plus, Save, Trash2, Wand2 } from "lucide-react";
import { useAccess } from "@/lib/admin/access";
import { db, notifyError, refreshSite } from "@/lib/admin/db";
import { SITE_URL } from "@/lib/config";
import { HEAD_CODE_KEY, HEAD_CODE_PERMISSION, LIMITS, SCHEMA_KEY, customCodeErrors, normalizeCustomCode, normalizePagePath, parseHeadCode } from "@/lib/custom-code";
import { Card, Field, Toggle } from "@/components/admin/ui";

const mono = "adm-input font-mono text-[0.82rem] leading-relaxed";
const validatorLinks = (path) => {
  const url = `${SITE_URL}${path === "/" ? "/" : path}`;
  return [
    ["Rich Results Test", `https://search.google.com/test/rich-results?url=${encodeURIComponent(url)}`],
    ["Schema Markup Validator", `https://validator.schema.org/#url=${encodeURIComponent(url)}`],
  ];
};

function Errors({ items }) {
  if (!items.length) return <p role="status" className="rounded-xl bg-leaf-50 p-3 text-sm text-leaf-700">No problems found.</p>;
  return (
    <ul role="alert" className="list-disc space-y-1 rounded-xl bg-rose-50 p-3 pl-7 text-sm text-rose-800">
      {items.map((e, i) => <li key={i}>{e}</li>)}
    </ul>
  );
}

function pretty(text) {
  try { return JSON.stringify(JSON.parse(text), null, 2); } catch { return text; }
}

/** Website settings → SEO code & schema. Rows: site.custom_schema and site.head_code. */
export function SeoCodeSettings({ rows, seo, onSaved }) {
  const { can } = useAccess();
  const canSchema = can("settings:update");
  const canHead = can(HEAD_CODE_PERMISSION);
  const stored = useMemo(() => normalizeCustomCode({ ...(rows?.find((r) => r.key === SCHEMA_KEY)?.value || {}), head_code: rows?.find((r) => r.key === HEAD_CODE_KEY)?.value?.head_code }), [rows]);
  const [head, setHead] = useState(stored.head_code);
  const [schema, setSchema] = useState(stored.schema);
  const [pages, setPages] = useState(stored.page_schemas);
  const [busy, setBusy] = useState("");

  const headErrors = useMemo(() => parseHeadCode(head, seo).errors, [head, seo]);
  const schemaErrors = useMemo(() => customCodeErrors({ schema, page_schemas: pages }, { siteUrl: SITE_URL }), [schema, pages]);

  const write = async (key, value, label) => {
    const exists = rows.some((r) => r.key === key);
    const { error } = exists
      ? await db().from("settings").update({ value }).eq("key", key)
      : await db().from("settings").insert({ key, value, is_public: true, label });
    return error;
  };

  const saveHead = async () => {
    if (headErrors.length) return toast.error("Fix the header code problems listed before saving.");
    setBusy("head");
    const error = await write(HEAD_CODE_KEY, { head_code: head.trim() }, "Header custom code");
    setBusy("");
    if (error) return notifyError(error);
    toast.success("Header code saved — the website is updated");
    refreshSite();
    onSaved();
  };

  const saveSchema = async () => {
    if (schemaErrors.length) return toast.error("Fix the schema problems listed before saving.");
    setBusy("schema");
    const value = { schema: schema.trim() ? pretty(schema.trim()) : "", page_schemas: pages.map((p) => ({ path: normalizePagePath(p.path), schema: pretty(p.schema.trim()), enabled: p.enabled !== false, note: (p.note || "").trim() })) };
    const error = await write(SCHEMA_KEY, value, "Schema markup");
    setBusy("");
    if (error) return notifyError(error);
    toast.success("Schema saved — the website is updated");
    refreshSite();
    onSaved();
  };

  const setPage = (index, patch) => setPages((list) => list.map((p, i) => (i === index ? { ...p, ...patch } : p)));

  return (
    <div className="space-y-6">
      <Card
        title="Header custom code"
        actions={canHead && (
          <button type="button" className="btn btn-primary btn-sm" onClick={saveHead} disabled={busy === "head"}>
            {busy === "head" ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save header code
          </button>
        )}
      >
        <div className="mb-4 space-y-2 text-sm text-ink-soft">
          <p>Verification meta tags (Pinterest, Yandex, Facebook domain, Ahrefs…), <code>&lt;link rel=&quot;preconnect&quot;&gt;</code> hints and approved scripts for every public page. Meta and link tags and async scripts are placed in the page <code>&lt;head&gt;</code>; inline scripts run at the very start of the page. Nothing here loads on the admin panel or parent portal.</p>
          <p>Allowed: <code>&lt;meta name|property content&gt;</code>, <code>&lt;link rel=&quot;preconnect | dns-prefetch | me | author | publisher | alternate&quot;&gt;</code> and <code>&lt;script&gt;</code> (external scripts must use https and <code>async</code> or <code>defer</code>). Google and Bing verification codes go in Search engines; GA4, Tag Manager and Clarity are already installed. JSON-LD goes in the schema fields below.</p>
          {!canHead && <p className="rounded-xl bg-gold-50 p-3 text-gold-800">Only Super Admins and Administrators can change header code because scripts run on every public page.</p>}
        </div>
        <Field label="Code for the <head>" hint={`${head.length.toLocaleString("en-GB")} / ${LIMITS.headCode.toLocaleString("en-GB")} characters`}>
          <textarea className={mono} rows={8} spellCheck={false} value={head} onChange={(e) => setHead(e.target.value)} disabled={!canHead} placeholder={'<meta name="p:domain_verify" content="..." />'} />
        </Field>
        <div className="mt-3"><Errors items={headErrors} /></div>
      </Card>

      <Card
        title="Schema markup (JSON-LD)"
        actions={canSchema && (
          <button type="button" className="btn btn-primary btn-sm" onClick={saveSchema} disabled={busy === "schema"}>
            {busy === "schema" ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save schema
          </button>
        )}
      >
        <div className="mb-4 space-y-2 text-sm text-ink-soft">
          <p>Every page already publishes a <strong>WebSite</strong> and an <strong>EducationalOrganization</strong> (name, logo, contact, areas served, social profiles) in one graph, plus each page&apos;s WebPage and, where relevant, FAQPage, BreadcrumbList, Course or BlogPosting markup. Everything is in the initial HTML.</p>
          <p><strong>Site-wide schema</strong> extends that graph: an Organization, EducationalOrganization or WebSite object here is <em>merged</em> into the existing one (your values win; lists such as sameAs are combined), so nothing is duplicated. Other types (for example a Service or an OfferCatalog) are added once.</p>
          <p>In the Schema Markup Validator the Organization appears nested inside WebPage (under <em>isPartOf → publisher</em> and <em>about</em>) because the nodes are linked by @id; Google&apos;s Rich Results Test lists it separately. Both are correct.</p>
        </div>
        <Field label="Site-wide schema" hint="Paste a JSON object, an array of objects or {&quot;@graph&quot;: [...]}. No <script> tag.">
          <textarea className={mono} rows={10} spellCheck={false} value={schema} onChange={(e) => setSchema(e.target.value)} disabled={!canSchema} placeholder={'{\n  "@type": "EducationalOrganization",\n  "foundingDate": "2019"\n}'} />
        </Field>
        {canSchema && <button type="button" className="btn btn-ghost btn-sm mt-2" onClick={() => setSchema((s) => pretty(s))}><Wand2 className="size-4" /> Format JSON</button>}

        <h3 className="mb-2 mt-8 text-[0.95rem] font-bold text-mushaf-900">Page schema</h3>
        <p className="mb-4 text-sm text-ink-soft">Extra JSON-LD for one page (<code>/pricing</code>) or a whole section (<code>/blog/*</code>). Before adding FAQPage or BreadcrumbList, test the page: many pages already publish one, and only one of each is allowed per page.</p>
        <fieldset disabled={!canSchema} className="space-y-4">
          {pages.map((page, index) => {
            const path = normalizePagePath(page.path);
            return (
              <div key={index} className="space-y-3 rounded-xl border border-line p-4">
                <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                  <Field label="Page path"><input className="adm-input" value={page.path} onChange={(e) => setPage(index, { path: e.target.value })} placeholder="/pricing" /></Field>
                  <Field label="Note (optional)"><input className="adm-input" value={page.note || ""} onChange={(e) => setPage(index, { note: e.target.value })} placeholder="Why this schema was added" /></Field>
                  <div className="flex items-center gap-3 pb-1">
                    <Toggle checked={page.enabled !== false} onChange={(v) => setPage(index, { enabled: v })} label={page.enabled !== false ? "On" : "Off"} />
                    <button type="button" className="btn btn-ghost btn-sm text-rose-700" onClick={() => setPages((list) => list.filter((_, i) => i !== index))} aria-label={`Remove page schema ${index + 1}`}><Trash2 className="size-4" /></button>
                  </div>
                </div>
                <Field label="JSON-LD">
                  <textarea className={mono} rows={8} spellCheck={false} value={page.schema} onChange={(e) => setPage(index, { schema: e.target.value })} placeholder={'{\n  "@type": "Service",\n  "name": "Online Tajweed classes"\n}'} />
                </Field>
                {path && !path.endsWith("/*") && (
                  <p className="flex flex-wrap gap-4 text-sm">
                    {validatorLinks(path).map(([label, href]) => <a key={label} className="inline-flex items-center gap-1 font-semibold text-leaf-700 hover:underline" href={href} target="_blank" rel="noopener noreferrer">{label} <ExternalLink className="size-3.5" /></a>)}
                  </p>
                )}
              </div>
            );
          })}
          {canSchema && pages.length < LIMITS.pageEntries && (
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setPages((list) => [...list, { path: "", schema: "", enabled: true, note: "" }])}>
              <Plus className="size-4" /> Add page schema
            </button>
          )}
        </fieldset>
        <div className="mt-4"><Errors items={schemaErrors} /></div>
        <p className="mt-4 flex flex-wrap gap-4 text-sm">
          {validatorLinks("/").map(([label, href]) => <a key={label} className="inline-flex items-center gap-1 font-semibold text-leaf-700 hover:underline" href={href} target="_blank" rel="noopener noreferrer">Home page in {label} <ExternalLink className="size-3.5" /></a>)}
        </p>
      </Card>
    </div>
  );
}
