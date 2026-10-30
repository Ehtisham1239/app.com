"use client";
import { useState } from "react";
import { Loader2, KeyRound, UserPlus } from "lucide-react";
import { getPublicBrowserClient } from "@/lib/supabase/public";
const ACK = "If these details match an enrolled parent, the Online Quran College coordinator will review the request and arrange access through your registered contact channel.";
export function ParentAccessRequest({ clientId = "" }) {
  const [kind,setKind]=useState("");const [id,setId]=useState("");const [contact,setContact]=useState("");const [busy,setBusy]=useState(false);const [message,setMessage]=useState("");const [error,setError]=useState("");
  const open=(value)=>{setKind(value);setId(clientId);setMessage("");setError("");};
  const submit=async(e)=>{e.preventDefault();if(busy)return;setBusy(true);setError("");try{const {error}=await getPublicBrowserClient().rpc("parent_request_access",{p_client_id:id.trim(),p_contact:contact.trim(),p_kind:kind});if(error)throw error;setMessage(ACK);setContact("");}catch{setError("The request could not be sent. Please try again or contact the college.");}finally{setBusy(false);}};
  return <section className="mt-5 border-t border-line pt-4" aria-label="Parent account help">
    <div className="flex flex-wrap justify-between gap-3 text-sm"><button type="button" className="inline-flex items-center gap-1.5 font-semibold text-leaf-700 underline" onClick={()=>open("recovery")}><KeyRound className="size-4"/>Forgot your access code?</button><button type="button" className="inline-flex items-center gap-1.5 font-semibold text-leaf-700 underline" onClick={()=>open("activation")}><UserPlus className="size-4"/>Request new access</button></div>
    {kind && <div className="mt-4 rounded-xl border border-line bg-paper p-4"><h2 className="font-display text-lg text-mushaf-900">{kind==="activation"?"Request parent portal access":"Recover parent access"}</h2><p className="mt-1 text-sm text-ink-soft">Use your existing Client ID and the email or phone already registered with Online Quran College. New enrolments need the coordinator to link their child first.</p>
      {message?<p role="status" className="mt-3 text-sm text-leaf-800">{message}</p>:<form onSubmit={submit} className="mt-3 space-y-3" aria-label="Parent access request"><label className="block text-sm font-semibold text-ink">Client ID<input className="input mt-1" required minLength={3} maxLength={64} value={id} onChange={e=>setId(e.target.value)} autoComplete="username"/></label><label className="block text-sm font-semibold text-ink">Registered email or phone<input className="input mt-1" required minLength={5} maxLength={254} value={contact} onChange={e=>setContact(e.target.value)} autoComplete="off"/></label>{error&&<p role="alert" className="text-sm text-rose-700">{error}</p>}<button className="btn btn-primary w-full" disabled={busy}>{busy&&<Loader2 className="size-4 animate-spin"/>}Send access request</button></form>}
      <button type="button" disabled={busy} className="mt-3 text-sm font-semibold text-ink-soft underline" onClick={()=>setKind("")}>Back to sign in</button>
    </div>}
  </section>;
}
