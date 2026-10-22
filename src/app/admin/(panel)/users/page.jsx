"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Copy, KeyRound, Loader2, Pencil, Trash2, UserPlus } from "lucide-react";
import { useAccess } from "@/lib/admin/access";
import { db, errorMessage, useLoad } from "@/lib/admin/db";
import { initials } from "@/lib/format";
import { Badge, Card, ConfirmButton, ErrorState, Field, Loading, Modal, PageHeader, Toggle, When } from "@/components/admin/ui";

const PANEL_ROLES = ["super_admin", "admin", "admissions", "content_editor"];

async function callAdmin(body) {
  const { data, error } = await db().functions.invoke("admin-users", { body });
  if (error) {
    let msg = error.message;
    try {
      msg = (await error.context.json()).error || msg;
    } catch {}
    throw new Error(msg);
  }
  if (data?.error) throw new Error(data.error);
  return data;
}

function PasswordReveal({ result, onClose }) {
  return (
    <Modal open={!!result} onClose={onClose} title="Temporary password" size="sm" footer={<button type="button" className="btn btn-primary btn-sm" onClick={onClose}>Done</button>}>
      {result && (
        <div className="space-y-4">
          <p className="text-sm text-ink-soft">
            Share these details privately with <strong>{result.name}</strong>. They will be asked to choose their own password when they first sign in. This password is shown only once.
          </p>
          <div className="rounded-xl bg-paper p-4 text-sm">
            <p className="text-ink-faint">Sign in at</p>
            <p className="font-semibold text-ink">{typeof window !== "undefined" ? `${window.location.origin}/admin/login` : "/admin/login"}</p>
            <p className="mt-2 text-ink-faint">Email</p>
            <p className="font-semibold text-ink">{result.email}</p>
            <p className="mt-2 text-ink-faint">Temporary password</p>
            <p className="font-mono text-lg font-bold tracking-wide text-mushaf-900">{result.password}</p>
          </div>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => navigator.clipboard.writeText(`Admin panel: ${window.location.origin}/admin/login\nEmail: ${result.email}\nTemporary password: ${result.password}`).then(() => toast.success("Copied"))}
          >
            <Copy className="size-4" /> Copy details
          </button>
        </div>
      )}
    </Modal>
  );
}

function UserModal({ user, roles, onClose, onDone, isSuper, selfId, canDelete }) {
  const isNew = user === "new";
  const [form, setForm] = useState(isNew ? { full_name: "", email: "", role: "admissions", job_title: "", phone: "" } : { ...user });
  const [busy, setBusy] = useState("");
  const [reveal, setReveal] = useState(null);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const run = async (label, body, ok) => {
    setBusy(label);
    try {
      const data = await callAdmin(body);
      if (data?.temporary_password) setReveal({ name: form.full_name || form.email, email: form.email, password: data.temporary_password });
      else {
        toast.success(ok);
        onDone();
      }
      return data;
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy("");
    }
  };
  const roleOptions = roles.filter((r) => PANEL_ROLES.includes(r.key) || r.key === form.role).filter((r) => isSuper || r.key !== "super_admin" || form.role === "super_admin");
  const self = !isNew && user.id === selfId;
  return (
    <>
      <Modal
        open={!reveal}
        onClose={onClose}
        title={isNew ? "Add an admin" : form.full_name || form.email}
        footer={
          isNew ? (
            <button type="button" className="btn btn-primary btn-sm" disabled={!!busy} onClick={() => run("create", { action: "create", ...form }, "Admin added")}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />} Create login
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              disabled={!!busy}
              onClick={() => run("save", { action: "update", user_id: user.id, full_name: form.full_name, role: form.role, job_title: form.job_title, phone: form.phone }, "Saved")}
            >
              {busy === "save" && <Loader2 className="size-4 animate-spin" />} Save
            </button>
          )
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" required>
            <input className="adm-input" value={form.full_name || ""} onChange={(e) => set("full_name", e.target.value)} />
          </Field>
          <Field label="Email" required>
            <input className="adm-input" type="email" value={form.email || ""} onChange={(e) => set("email", e.target.value)} disabled={!isNew} />
          </Field>
          <Field label="Role" className="sm:col-span-2" hint={roles.find((r) => r.key === form.role)?.description}>
            <select className="adm-input" value={form.role || ""} onChange={(e) => set("role", e.target.value)} disabled={self}>
              {roleOptions.map((r) => (
                <option key={r.key} value={r.key}>
                  {r.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Job title">
            <input className="adm-input" value={form.job_title || ""} onChange={(e) => set("job_title", e.target.value)} />
          </Field>
          <Field label="Phone">
            <input className="adm-input" value={form.phone || ""} onChange={(e) => set("phone", e.target.value)} />
          </Field>
        </div>
        {isNew ? (
          <p className="mt-5 rounded-xl bg-paper p-3 text-sm text-ink-soft">A temporary password is created and shown once. They choose their own password at first sign-in.</p>
        ) : (
          !self && (
            <div className="mt-6 space-y-3 border-t border-line pt-5">
              <Toggle checked={user.is_active} disabled={!!busy} onChange={(v) => run("active", { action: "set_active", user_id: user.id, active: v }, v ? "Login enabled" : "Login disabled")} label={user.is_active ? "Login enabled" : "Login disabled"} />
              <div className="flex flex-wrap gap-2">
                <button type="button" className="btn btn-outline btn-sm" disabled={!!busy} onClick={() => run("reset", { action: "reset_password", user_id: user.id })}>
                  {busy === "reset" ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />} Reset password
                </button>
                {canDelete && (
                  <ConfirmButton
                    title="Delete this login?"
                    message="They will no longer be able to sign in. Their past activity stays in the activity log."
                    confirmLabel="Delete"
                    className="btn btn-ghost btn-sm text-rose-700"
                    onConfirm={async () => {
                      try {
                        await callAdmin({ action: "delete", user_id: user.id });
                        toast.success("Login deleted");
                        onDone();
                      } catch (e) {
                        toast.error(errorMessage(e));
                      }
                    }}
                  >
                    <Trash2 className="size-4" /> Delete
                  </ConfirmButton>
                )}
              </div>
            </div>
          )
        )}
      </Modal>
      <PasswordReveal
        result={reveal}
        onClose={() => {
          setReveal(null);
          onDone();
        }}
      />
    </>
  );
}

export default function UsersPage() {
  const { can, isSuper, access } = useAccess();
  const users = useLoad(() => db().from("profiles").select("id, full_name, email, role, is_active, job_title, phone, last_seen_at, created_at, app_roles(name)").order("is_active", { ascending: false }).order("full_name"), []);
  const roles = useLoad(() => db().from("app_roles").select("key, name, description, sort_order").order("sort_order"), []);
  const [editing, setEditing] = useState(null);
  return (
    <>
      <PageHeader
        title="Admin users"
        subtitle="Who can sign in to this admin panel, and what they can do."
        actions={can("users:create") && (
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setEditing("new")}>
            <UserPlus className="size-4" /> Add admin
          </button>
        )}
      />
      <Card bodyClass="">
        {users.loading ? <Loading /> : users.error ? <ErrorState error={users.error} onRetry={users.reload} /> : (
          <div className="overflow-x-auto">
            <table className="adm-table">
              <thead><tr><th>Name</th><th>Role</th><th>Status</th><th>Last active</th><th /></tr></thead>
              <tbody>
                {(users.data || []).map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-mushaf-900 text-xs font-bold text-gold-300">{initials(u.full_name || u.email)}</span>
                        <div className="min-w-0">
                          <p className="font-semibold text-ink">{u.full_name} {u.id === access?.id && <Badge tone="blue">You</Badge>}</p>
                          <p className="truncate text-xs text-ink-faint">{u.email}{u.job_title ? ` · ${u.job_title}` : ""}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-ink-soft">{u.app_roles?.name || <span className="text-ink-faint">No role</span>}</td>
                    <td>{u.is_active ? <Badge tone="green">Active</Badge> : <Badge tone="muted">Disabled</Badge>}</td>
                    <td className="text-ink-soft"><When value={u.last_seen_at} /></td>
                    <td className="text-right">
                      {can("users:update") && (u.role !== "super_admin" || isSuper) && (
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(u)}>
                          <Pencil className="size-4" /> Manage
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      {editing && (
        <UserModal
          user={editing}
          roles={roles.data || []}
          isSuper={isSuper}
          selfId={access?.id}
          canDelete={can("users:delete")}
          onClose={() => setEditing(null)}
          onDone={() => {
            setEditing(null);
            users.reload();
          }}
        />
      )}
    </>
  );
}
