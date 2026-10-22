"use client";

import { validCanonical } from "@/lib/seo";
import { SeoPreview } from "@/components/admin/seo-preview";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ExternalLink, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { clsx } from "clsx";
import { RESOURCES } from "@/lib/admin/resources";
import { useAccess } from "@/lib/admin/access";
import { db, fromLocalInput, notifyError, refreshSite, toLocalInput, useLoad } from "@/lib/admin/db";
import { CONTENT_STATUSES, CURRENCIES } from "@/lib/constants";
import { fromMinor, slugify, toMinor } from "@/lib/format";
import { ContentIcon } from "@/components/icon";
import { RichText } from "@/components/admin/rich-text";
import { ImageField } from "@/components/admin/media";
import { Card, ConfirmButton, ErrorState, Field, Loading, PageHeader, StatusBadge, TagInput, Toggle, When } from "@/components/admin/ui";

function RelationSelect({ id, table, labelField, value, onChange }) {
  const opts = useLoad(() => db().from(table).select(`id, ${labelField}`).is("deleted_at", null).order(labelField), [table]);
  return (
    <select id={id} className="adm-input" value={value || ""} onChange={(e) => onChange(e.target.value || null)}>
      <option value="">— None —</option>
      {(opts.data || []).map((o) => (
        <option key={o.id} value={o.id}>
          {o[labelField]}
        </option>
      ))}
    </select>
  );
}

function Input({ id, field, value, onChange, form, setSlugTouched, canPublish, userId }) {
  switch (field.type) {
    case "slug":
      return (
        <div className="flex items-center overflow-hidden rounded-[0.65rem] border-[1.5px] border-line-strong bg-white focus-within:border-leaf-600">
          <span className="bg-paper px-3 py-2 text-sm text-ink-faint">{field.prefix}</span>
          <input
            id={id}
            className="min-w-0 flex-1 px-2 py-2 text-[0.92rem] outline-none"
            value={value || ""}
            onChange={(e) => {
              setSlugTouched(true);
              onChange(slugify(e.target.value));
            }}
            required={field.required}
          />
        </div>
      );
    case "textarea":
      return <textarea id={id} className="adm-input" rows={field.rows || 4} value={value || ""} onChange={(e) => onChange(e.target.value)} required={field.required} />;
    case "rich":
      return <RichText value={value} onChange={onChange} placeholder={field.label} />;
    case "number":
      return (
        <input
          id={id}
          type="number"
          className="adm-input"
          min={field.min}
          max={field.max}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
          required={field.required}
        />
      );
    case "bool":
      return <Toggle id={id} checked={!!value} onChange={onChange} label={value ? "Yes" : "No"} />;
    case "select":
      return (
        <select id={id} className="adm-input" value={value ?? ""} onChange={(e) => onChange(field.number ? Number(e.target.value) : e.target.value || null)} required={field.required}>
          {field.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
    case "icon":
      return (
        <div className="flex items-center gap-2">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-mushaf-900 text-gold-300">
            <ContentIcon name={value} className="size-5" />
          </span>
          <select id={id} className="adm-input" value={value || ""} onChange={(e) => onChange(e.target.value)}>
            {field.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      );
    case "relation":
      return <RelationSelect id={id} table={field.table} labelField={field.labelField} value={value} onChange={onChange} />;
    case "tags":
      return <TagInput id={id} value={value} onChange={onChange} />;
    case "datetime":
      return <input id={id} type="datetime-local" className="adm-input" value={toLocalInput(value)} onChange={(e) => onChange(fromLocalInput(e.target.value))} />;
    case "image":
      return <ImageField id={id} value={value} onChange={onChange} userId={userId} />;
    case "status":
      return (
        <div className="space-y-2">
          <select id={id} className="adm-input" value={value || "draft"} onChange={(e) => onChange(e.target.value)}>
            {CONTENT_STATUSES.map((s) => (
              <option key={s.value} value={s.value} disabled={!canPublish && ["published", "scheduled"].includes(s.value) && form.status !== s.value}>
                {s.label}
              </option>
            ))}
          </select>
          {!canPublish && <p className="field-hint">You can save drafts and send for review. An editor with publish rights will publish it.</p>}
        </div>
      );
    default:
      return <input id={id} className="adm-input" dir={field.dir} value={value ?? ""} onChange={(e) => onChange(e.target.value)} required={field.required} />;
  }
}

export function ResourceForm({ rkey, id }) {
  const cfg = RESOURCES[rkey];
  const router = useRouter();
  const { can, access } = useAccess();
  const isNew = id === "new";
  const [form, setForm] = useState(isNew ? { ...cfg.defaults } : null);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const record = useLoad(() => (isNew ? { data: null } : db().from(cfg.table).select("*").eq("id", id).maybeSingle()), [rkey, id]);

  useEffect(() => {
    if (!isNew && record.data) setForm(record.data);
  }, [isNew, record.data]);
  useEffect(() => {
    const warn = (e) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const canEdit = can(`${cfg.module}:${isNew ? "create" : "update"}`);
  const canPublish = can(`${cfg.module}:publish`);
  const canDelete = !isNew && can(`${cfg.module}:delete`);
  const groups = useMemo(() => {
    const out = {};
    for (const f of cfg.fields) {
      if (f.type === "status") continue;
      (out[f.group || "Details"] ||= []).push(f);
    }
    return out;
  }, [cfg]);

  if (!isNew && record.loading) return <Loading rows={8} />;
  if (!isNew && record.error) return <ErrorState error={record.error} onRetry={record.reload} />;
  if (!isNew && !record.data)
    return (
      <PageHeader title="Not found" subtitle="This item may have been deleted." back={{ href: `/admin/${rkey}`, label: cfg.label }} />
    );
  if (!form) return <Loading rows={8} />;

  const set = (name, value) => {
    setDirty(true);
    setForm((f) => {
      const next = { ...f, [name]: value };
      const slugField = cfg.fields.find((x) => x.type === "slug");
      if (slugField && slugField.source === name && !slugTouched) next.slug = slugify(value || "");
      return next;
    });
  };

  const save = async (e) => {
    e?.preventDefault();
    for (const f of cfg.fields) {
      const v = form[f.name];
      if (f.required && (v === null || v === undefined || v === "" || (Array.isArray(v) && !v.length))) {
        toast.error(`Please fill in “${f.label}”.`);
        return;
      }
    }
    if (cfg.fields.some((f) => f.name === "canonical_url") && !validCanonical(form.canonical_url)) return toast.error("Enter a valid canonical URL or leave it empty.");
    const problem = cfg.validate?.(form);
    if (problem) return toast.error(problem);
    if (form.status === "scheduled" && !form.scheduled_at) return toast.error("Choose when to publish.");
    const payload = {};
    for (const f of cfg.fields) {
      if (form[f.name] === undefined) continue;
      payload[f.name] = form[f.name] === "" && f.type !== "text" ? null : form[f.name];
    }
    if (cfg.statusField) payload.scheduled_at = form.status === "scheduled" ? form.scheduled_at : null;
    if (cfg.defaults.locale) payload.locale = form.locale || cfg.defaults.locale;
    setSaving(true);
    try {
      if (isNew) {
        const { data, error } = await db().from(cfg.table).insert(payload).select("id").single();
        if (error) throw error;
        setDirty(false);
        toast.success("Saved");
        refreshSite();
        router.replace(`/admin/${rkey}/${data.id}`);
      } else {
        let q = db().from(cfg.table).update(payload).eq("id", id);
        if (form.version !== undefined) q = q.eq("version", form.version);
        const { data, error } = await q.select("*");
        if (error) throw error;
        if (!data?.length) throw new Error("Someone else changed this item while you were editing. Reload the page to see the latest version.");
        setForm(data[0]);
        setDirty(false);
        toast.success("Saved");
        refreshSite();
      }
    } catch (err) {
      notifyError(err);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    const q = cfg.softDelete ? db().from(cfg.table).update({ deleted_at: new Date().toISOString() }).eq("id", id) : db().from(cfg.table).delete().eq("id", id);
    const { error } = await q;
    if (error) return notifyError(error);
    toast.success("Deleted");
    refreshSite();
    setDirty(false);
    router.replace(`/admin/${rkey}`);
  };

  const title = form[cfg.columns[0].key] || `New ${cfg.singular}`;
  const viewUrl = !isNew && cfg.publicPath && (!cfg.statusField || form.status === "published") ? cfg.publicPath(form) : null;
  const field = (f) => (
    <Field key={f.name} label={f.label} hint={f.hint} required={f.required} className={clsx(f.half ? "sm:col-span-1" : "sm:col-span-2")}>
      <Input field={f} value={form[f.name]} onChange={(v) => set(f.name, v)} form={form} setSlugTouched={setSlugTouched} canPublish={canPublish} userId={access?.id} />
    </Field>
  );
  const statusField = cfg.fields.find((f) => f.type === "status");

  return (
    <form onSubmit={save}>
      <PageHeader
        title={title}
        back={{ href: `/admin/${rkey}`, label: cfg.label }}
        actions={
          <>
            {viewUrl && (
              <a href={viewUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
                <ExternalLink className="size-4" /> View on website
              </a>
            )}
            {canEdit && (
              <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save
              </button>
            )}
          </>
        }
      >
        {!isNew && cfg.statusField && (
          <div className="mt-2 flex items-center gap-3 text-sm text-ink-faint">
            <StatusBadge list={CONTENT_STATUSES} value={form.status} />
            <span>
              Updated <When value={form.updated_at} />
            </span>
          </div>
        )}
      </PageHeader>
      {!canEdit && <p className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">You can view this, but you do not have permission to change it.</p>}
      <div className="grid gap-6 lg:grid-cols-[1fr_19rem]">
        <div className="min-w-0 space-y-6">
          {Object.entries(groups).map(([name, fields]) => (
            <Card key={name} title={name}>
              <fieldset disabled={!canEdit} className="grid gap-5 sm:grid-cols-2">
                {fields.map(field)}
              </fieldset>
            </Card>
          ))}
          {!isNew && cfg.children?.includes("modules") && <ModulesEditor courseId={id} canEdit={canEdit} />}
          {!isNew && cfg.children?.includes("prices") && <PricesEditor planId={id} canEdit={canEdit} />}
          {!isNew && cfg.children?.includes("teacherCourses") && <TeacherCoursesEditor teacherId={id} canEdit={canEdit} />}
          {isNew && cfg.children?.length > 0 && <p className="text-sm text-ink-faint">Save first to add {cfg.children.includes("modules") ? "the course outline" : cfg.children.includes("prices") ? "prices" : "courses"}.</p>}
        </div>
        <aside className="space-y-6">
          {cfg.fields.some((f) => f.name === "seo_title") && <SeoPreview record={form} path={cfg.publicPath?.(form) || "/"} />}
          {statusField && (
            <Card title="Publishing">
              <fieldset disabled={!canEdit} className="space-y-4">
                <Field label="Status">
                  <Input field={statusField} value={form.status} onChange={(v) => set("status", v)} form={form} canPublish={canPublish} />
                </Field>
                {form.status === "scheduled" && (
                  <Field label="Publish on">
                    <input type="datetime-local" className="adm-input" value={toLocalInput(form.scheduled_at)} onChange={(e) => set("scheduled_at", fromLocalInput(e.target.value))} />
                  </Field>
                )}
              </fieldset>
            </Card>
          )}
          {canEdit && (
            <button type="submit" className="btn btn-primary w-full" disabled={saving}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save {cfg.singular}
            </button>
          )}
          {canDelete && (
            <ConfirmButton onConfirm={remove} title={`Delete this ${cfg.singular}?`} message={`“${title}” will be removed${cfg.softDelete ? " from the website" : ""}. This cannot be undone from the admin panel.`} confirmLabel="Delete" className="btn btn-ghost w-full text-rose-700">
              <Trash2 className="size-4" /> Delete {cfg.singular}
            </ConfirmButton>
          )}
        </aside>
      </div>
    </form>
  );
}

function ChildRows({ title, rows, render, onAdd, canEdit, addLabel, empty }) {
  return (
    <Card
      title={title}
      actions={
        canEdit && (
          <button type="button" className="btn btn-outline btn-sm" onClick={onAdd}>
            <Plus className="size-4" /> {addLabel}
          </button>
        )
      }
    >
      {rows.length === 0 ? <p className="text-sm text-ink-faint">{empty}</p> : <div className="space-y-4">{rows.map(render)}</div>}
    </Card>
  );
}

function ModulesEditor({ courseId, canEdit }) {
  const mods = useLoad(() => db().from("course_modules").select("*").eq("course_id", courseId).order("sort_order"), [courseId]);
  const [rows, setRows] = useState([]);
  useEffect(() => setRows(mods.data || []), [mods.data]);
  const update = (i, k, v) => setRows((r) => r.map((x, j) => (j === i ? { ...x, [k]: v, _dirty: true } : x)));
  const saveRow = async (row) => {
    const payload = { course_id: courseId, title: row.title, objectives: row.objectives || "", topics: row.topics || [], sort_order: Number(row.sort_order) || 0 };
    const { error } = row.id ? await db().from("course_modules").update(payload).eq("id", row.id) : await db().from("course_modules").insert(payload);
    if (error) return notifyError(error);
    toast.success("Outline saved");
    refreshSite();
    mods.reload();
  };
  const removeRow = async (row) => {
    if (row.id) {
      const { error } = await db().from("course_modules").delete().eq("id", row.id);
      if (error) return notifyError(error);
      refreshSite();
      return mods.reload();
    }
    setRows((r) => r.filter((x) => x !== row));
  };
  return (
    <ChildRows
      title="Course outline"
      rows={rows}
      canEdit={canEdit}
      addLabel="Add stage"
      empty="No stages yet."
      onAdd={() => setRows((r) => [...r, { title: "", objectives: "", topics: [], sort_order: r.length + 1, _dirty: true }])}
      render={(row, i) => (
        <fieldset key={row.id || `new-${i}`} disabled={!canEdit} className="grid items-start gap-3 rounded-xl border border-line p-4 sm:grid-cols-[4.25rem_1fr]">
          <label className="block">
            <span className="mb-1 block text-center text-[0.68rem] font-bold uppercase tracking-wider text-ink-faint">Stage</span>
            <input className="adm-input text-center font-semibold" type="number" min="0" value={row.sort_order ?? ""} onChange={(e) => update(i, "sort_order", e.target.value)} aria-label="Stage order" />
          </label>
          <div className="space-y-2">
            <input className="adm-input font-semibold" value={row.title || ""} onChange={(e) => update(i, "title", e.target.value)} placeholder="Stage title" />
            <textarea className="adm-input" rows={2} value={row.objectives || ""} onChange={(e) => update(i, "objectives", e.target.value)} placeholder="What the student learns" />
            <TagInput value={row.topics} onChange={(v) => update(i, "topics", v)} placeholder="Topics — press Enter after each" />
            {canEdit && (
              <div className="flex justify-end gap-2">
                <button type="button" className="btn btn-ghost btn-sm text-rose-700" onClick={() => removeRow(row)}>
                  <Trash2 className="size-4" /> Remove
                </button>
                <button type="button" className="btn btn-primary btn-sm" disabled={!row._dirty || !row.title} onClick={() => saveRow(row)}>
                  <Save className="size-4" /> Save stage
                </button>
              </div>
            )}
          </div>
        </fieldset>
      )}
    />
  );
}

function PricesEditor({ planId, canEdit }) {
  const prices = useLoad(() => db().from("pricing_plan_prices").select("*").eq("plan_id", planId).order("currency"), [planId]);
  const [rows, setRows] = useState([]);
  useEffect(() => setRows((prices.data || []).map((p) => ({ ...p, amount: fromMinor(p.amount_minor) }))), [prices.data]);
  const update = (i, k, v) => setRows((r) => r.map((x, j) => (j === i ? { ...x, [k]: v, _dirty: true } : x)));
  const saveRow = async (row) => {
    const payload = { plan_id: planId, currency: row.currency, amount_minor: toMinor(row.amount), is_public: row.is_public !== false };
    const { error } = row.id ? await db().from("pricing_plan_prices").update(payload).eq("id", row.id) : await db().from("pricing_plan_prices").insert(payload);
    if (error) return notifyError(error);
    toast.success("Price saved");
    refreshSite();
    prices.reload();
  };
  const removeRow = async (row) => {
    if (row.id) {
      const { error } = await db().from("pricing_plan_prices").delete().eq("id", row.id);
      if (error) return notifyError(error);
      refreshSite();
      return prices.reload();
    }
    setRows((r) => r.filter((x) => x !== row));
  };
  return (
    <ChildRows
      title="Monthly fee by currency"
      rows={rows}
      canEdit={canEdit}
      addLabel="Add currency"
      empty="No prices yet — add at least one so the package shows a fee."
      onAdd={() => setRows((r) => [...r, { currency: CURRENCIES.find((c) => !r.some((x) => x.currency === c)) || "USD", amount: "", is_public: true, _dirty: true }])}
      render={(row, i) => (
        <fieldset key={row.id || `new-${i}`} disabled={!canEdit} className="flex flex-wrap items-center gap-3">
          <select className="adm-input w-28" value={row.currency} onChange={(e) => update(i, "currency", e.target.value)} aria-label="Currency">
            {CURRENCIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <input className="adm-input w-36" inputMode="decimal" value={row.amount} onChange={(e) => update(i, "amount", e.target.value)} placeholder="Amount" aria-label="Amount" />
          <Toggle checked={row.is_public !== false} onChange={(v) => update(i, "is_public", v)} label="Show" />
          {canEdit && (
            <span className="ml-auto flex gap-2">
              <button type="button" className="btn btn-ghost btn-sm text-rose-700" onClick={() => removeRow(row)} aria-label="Remove price">
                <Trash2 className="size-4" />
              </button>
              <button type="button" className="btn btn-primary btn-sm" disabled={!row._dirty || row.amount === ""} onClick={() => saveRow(row)}>
                <Save className="size-4" /> Save
              </button>
            </span>
          )}
        </fieldset>
      )}
    />
  );
}

function TeacherCoursesEditor({ teacherId, canEdit }) {
  const data = useLoad(async () => {
    const [courses, links] = await Promise.all([
      db().from("courses").select("id, title").is("deleted_at", null).order("sort_order"),
      db().from("teacher_courses").select("course_id").eq("teacher_id", teacherId),
    ]);
    if (courses.error) throw courses.error;
    return { data: { courses: courses.data, linked: new Set((links.data || []).map((l) => l.course_id)) } };
  }, [teacherId]);
  const toggle = async (courseId, on) => {
    const q = on
      ? db().from("teacher_courses").insert({ teacher_id: teacherId, course_id: courseId })
      : db().from("teacher_courses").delete().eq("teacher_id", teacherId).eq("course_id", courseId);
    const { error } = await q;
    if (error) return notifyError(error);
    refreshSite();
    data.reload();
  };
  return (
    <Card title="Courses this teacher teaches">
      {data.loading ? (
        <Loading rows={2} />
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {(data.data?.courses || []).map((c) => (
            <label key={c.id} className="flex items-center gap-2.5 rounded-xl border border-line px-3 py-2 text-sm">
              <input type="checkbox" className="check" disabled={!canEdit} checked={data.data.linked.has(c.id)} onChange={(e) => toggle(c.id, e.target.checked)} />
              {c.title}
            </label>
          ))}
        </div>
      )}
    </Card>
  );
}
