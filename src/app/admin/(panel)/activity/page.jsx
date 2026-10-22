"use client";

import { Fragment, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { db, likeTerm, useLoad } from "@/lib/admin/db";
import { formatDateTime } from "@/lib/format";
import { Badge, Card, EmptyState, ErrorState, Loading, PageHeader, Pagination, SearchInput } from "@/components/admin/ui";

const PAGE = 30;
const ENTITIES = {
  trial_applications: "Free trial", contact_messages: "Message", courses: "Course", course_modules: "Course outline", pricing_plans: "Package",
  pricing_plan_prices: "Package price", teachers: "Teacher", teacher_courses: "Teacher course", pages: "Page", blog_posts: "Blog article",
  faqs: "FAQ", testimonials: "Testimonial", menu_items: "Menu link", redirects: "Redirect", media_assets: "Media", settings: "Setting",
  profiles: "Admin user", app_role_permissions: "Permission", certificates: "Certificate", students: "Student", guardians: "Guardian", enrollments: "Enrolment",
};
const ACTION_TONE = { insert: "green", update: "blue", delete: "red" };
const ACTION_LABEL = { insert: "Created", update: "Changed", delete: "Deleted" };
const show = (v) => (v === null || v === undefined ? "—" : typeof v === "object" ? JSON.stringify(v) : String(v));

export default function ActivityPage() {
  const [entity, setEntity] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState(null);
  const logs = useLoad(() => {
    let query = db().from("audit_logs").select("id, created_at, actor_email, action, entity_type, entity_id, before, after", { count: "exact" });
    if (entity) query = query.eq("entity_type", entity);
    if (q) query = query.ilike("actor_email", likeTerm(q));
    return query.order("created_at", { ascending: false }).range(page * PAGE, page * PAGE + PAGE - 1);
  }, [entity, q, page]);
  return (
    <>
      <PageHeader title="Activity log" subtitle="Every change made in the admin panel and by the website forms — who, what and when." />
      <div className="mb-4 flex flex-wrap justify-end gap-3">
        <select className="adm-input w-full sm:w-56" value={entity} onChange={(e) => { setEntity(e.target.value); setPage(0); }} aria-label="Type">
          <option value="">All types</option>
          {Object.entries(ENTITIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <SearchInput value={q} onChange={(v) => { setQ(v); setPage(0); }} placeholder="Search by email…" className="w-full sm:w-64" />
      </div>
      <Card bodyClass="">
        {logs.loading ? <Loading /> : logs.error ? <ErrorState error={logs.error} onRetry={logs.reload} /> : !logs.data?.length ? <EmptyState title="Nothing recorded yet" /> : (
          <div className="overflow-x-auto">
            <table className="adm-table">
              <thead><tr><th /><th>When</th><th>Who</th><th>What</th><th>Item</th></tr></thead>
              <tbody>
                {logs.data.map((l) => {
                  const changed = l.action === "update" ? Object.keys(l.after || {}) : [];
                  return (
                    <Fragment key={l.id}>
                      <tr className="row-link" onClick={() => setOpen(open === l.id ? null : l.id)}>
                        <td className="w-8 text-ink-faint">{open === l.id ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}</td>
                        <td className="whitespace-nowrap text-ink-soft">{formatDateTime(l.created_at)}</td>
                        <td className="text-ink-soft">{l.actor_email || <span className="text-ink-faint">Website / system</span>}</td>
                        <td><Badge tone={ACTION_TONE[l.action]}>{ACTION_LABEL[l.action] || l.action}</Badge></td>
                        <td className="text-ink-soft">
                          {ENTITIES[l.entity_type] || l.entity_type}
                          {changed.length > 0 && <span className="text-ink-faint"> · {changed.slice(0, 4).join(", ")}{changed.length > 4 ? "…" : ""}</span>}
                        </td>
                      </tr>
                      {open === l.id && (
                        <tr>
                          <td />
                          <td colSpan={4} className="bg-paper">
                            <div className="max-h-80 overflow-auto text-xs">
                              {l.action === "update" ? (
                                <table className="w-full">
                                  <tbody>
                                    {changed.map((k) => (
                                      <tr key={k} className="align-top">
                                        <td className="py-1 pr-3 font-semibold text-ink">{k}</td>
                                        <td className="py-1 pr-3 text-rose-700 line-through decoration-rose-300">{show(l.before?.[k])}</td>
                                        <td className="py-1 text-leaf-800">{show(l.after?.[k])}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              ) : (
                                <pre className="whitespace-pre-wrap break-all text-ink-soft">{JSON.stringify(l.after || l.before, null, 2)}</pre>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} pageSize={PAGE} count={logs.count} onPage={setPage} />
      </Card>
    </>
  );
}
