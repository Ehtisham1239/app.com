"use client";

import { ParentAccessRequest } from "./request-access-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { KeyRound, Loader2, Search } from "lucide-react";
import { getPublicBrowserClient } from "@/lib/supabase/public";

const GENERIC = "We could not open the results. Check the Client ID and access code. After 5 wrong tries the account is locked for 15 minutes.";

// Board-style result search: Client ID + access code, one button.
export function ParentSignInForm({ expired = false }) {
  const router = useRouter();
  const [clientId, setClientId] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState(expired ? "Your session ended. Please enter your details again." : "");
  const [busy, setBusy] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    if (busy) return;
    setError("");
    if (clientId.trim().length < 3 || code.replace(/[^A-Za-z0-9]/g, "").length !== 12) return setError("Enter your Client ID and the 12-character access code from the coordinator.");
    setBusy(true);
    try {
      const { data, error: rpcError } = await getPublicBrowserClient().rpc("parent_sign_in", { p_client_id: clientId.trim(), p_code: code });
      if (rpcError || !data?.ok || !data.token) throw new Error(GENERIC);
      const response = await fetch("/api/parent-session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: data.token }), signal: AbortSignal.timeout(15000) });
      if (!response.ok) throw new Error(GENERIC);
      setCode("");
      router.refresh();
    } catch (e) {
      setError(e.message === GENERIC ? GENERIC : "The portal could not be reached. Check your connection and try again.");
      setBusy(false);
    }
  };
  return (
    <><form onSubmit={submit} className="space-y-4" noValidate>
      <div>
        <label htmlFor="client-id" className="field-label">Client ID</label>
        <input id="client-id" className="input font-mono" autoComplete="username" inputMode="text" spellCheck={false} value={clientId} onChange={(e) => setClientId(e.target.value)} placeholder="e.g. C-10245" maxLength={64} required />
      </div>
      <div>
        <label htmlFor="access-code" className="field-label">Access code</label>
        <input id="access-code" type="password" className="input font-mono uppercase tracking-[0.15em]" autoComplete="current-password" spellCheck={false} value={code} onChange={(e) => setCode(e.target.value)} placeholder="XXXX-XXXX-XXXX" maxLength={20} required />
        <p className="mt-1.5 text-xs text-ink-faint">Given to you by the OQC coordinator. Never share it.</p>
      </div>
      {error && <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>}
      <button type="submit" className="btn btn-primary w-full" disabled={busy}>
        {busy ? <Loader2 className="size-5 animate-spin" aria-hidden="true" /> : <Search className="size-5" aria-hidden="true" />} View result
      </button>
      <p className="flex items-start gap-2 text-xs text-ink-faint"><KeyRound className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" /> No Client ID or code yet? Ask the coordinator on WhatsApp or through the contact page.</p>
    </form><ParentAccessRequest clientId={clientId}/></>
  );
}

export function ParentSignOut() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const signOut = async () => {
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/parent-session", { method: "DELETE", signal: AbortSignal.timeout(15000) });
      if (!response.ok) throw Error("Sign-out failed");
      router.refresh();
    } catch { setError("We could not sign you out. Check your connection and try again."); }
    finally { setBusy(false); }
  };
  return (
    <div className="flex flex-col items-end gap-2">
    <button type="button" className="btn btn-outline btn-sm" disabled={busy} onClick={signOut}>
      {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />} Sign out
    </button>
    {error && <p role="alert" className="max-w-xs text-sm text-rose-800">{error}</p>}
    </div>
  );
}
