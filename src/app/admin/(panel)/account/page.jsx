"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { KeyRound, Loader2, Save, ShieldAlert } from "lucide-react";
import { useAccess } from "@/lib/admin/access";
import { db, notifyError } from "@/lib/admin/db";
import { Card, Field, PageHeader } from "@/components/admin/ui";

function Account() {
  const { access, reload } = useAccess();
  const router = useRouter();
  const params = useSearchParams();
  const forced = access?.must_change_password || params.get("first") === "1";
  const [profile, setProfile] = useState({ full_name: "", phone: "", job_title: "" });
  const [pw, setPw] = useState({ next: "", again: "" });
  const [busy, setBusy] = useState("");
  useEffect(() => {
    if (!access?.id) return;
    db().from("profiles").select("full_name, phone, job_title").eq("id", access.id).single().then(({ data }) => data && setProfile({ full_name: data.full_name || "", phone: data.phone || "", job_title: data.job_title || "" }));
  }, [access?.id]);

  const saveProfile = async (e) => {
    e.preventDefault();
    setBusy("profile");
    const { error } = await db().from("profiles").update({ full_name: profile.full_name.trim(), phone: profile.phone.trim() || null, job_title: profile.job_title.trim() || null }).eq("id", access.id);
    setBusy("");
    if (error) return notifyError(error);
    toast.success("Profile saved");
    reload();
  };
  const changePassword = async (e) => {
    e.preventDefault();
    if (pw.next.length < 10) return toast.error("Use at least 10 characters.");
    if (pw.next !== pw.again) return toast.error("The two passwords do not match.");
    setBusy("pw");
    const { error } = await db().auth.updateUser({ password: pw.next });
    if (error) {
      setBusy("");
      return notifyError(error);
    }
    await db().from("profiles").update({ must_change_password: false }).eq("id", access.id);
    setBusy("");
    setPw({ next: "", again: "" });
    toast.success("Password changed");
    await reload();
    if (forced) router.replace("/admin");
  };

  return (
    <>
      <PageHeader title="My account" subtitle={access?.email} />
      {forced && (
        <p className="mb-6 flex items-start gap-3 rounded-2xl border border-gold-300 bg-gold-50 p-4 text-[0.95rem] text-ink">
          <ShieldAlert className="mt-0.5 size-5 shrink-0 text-gold-700" aria-hidden="true" /> Welcome! You signed in with a temporary password. Choose your own password to continue.
        </p>
      )}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Change password">
          <form onSubmit={changePassword} className="space-y-4">
            <Field label="New password" hint="At least 10 characters. Use a phrase only you know.">
              <input type="password" autoComplete="new-password" className="adm-input" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />
            </Field>
            <Field label="Type it again">
              <input type="password" autoComplete="new-password" className="adm-input" value={pw.again} onChange={(e) => setPw({ ...pw, again: e.target.value })} />
            </Field>
            <button type="submit" className="btn btn-primary" disabled={busy === "pw"}>
              {busy === "pw" ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />} Change password
            </button>
          </form>
        </Card>
        {!forced && (
          <Card title="Profile">
            <form onSubmit={saveProfile} className="space-y-4">
              <Field label="Full name"><input className="adm-input" value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} required /></Field>
              <Field label="Job title"><input className="adm-input" value={profile.job_title} onChange={(e) => setProfile({ ...profile, job_title: e.target.value })} /></Field>
              <Field label="Phone"><input className="adm-input" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /></Field>
              <p className="text-sm text-ink-faint">Role: {access?.role_name}</p>
              <button type="submit" className="btn btn-outline" disabled={busy === "profile"}>
                {busy === "profile" ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save profile
              </button>
            </form>
          </Card>
        )}
      </div>
    </>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={null}>
      <Account />
    </Suspense>
  );
}
