"use client";
import { useAccess } from "@/lib/admin/access";
import { db, notifyError, useLoad } from "@/lib/admin/db";
import { formatDateTime } from "@/lib/format";
import { Card, ConfirmButton, EmptyState, ErrorState, Loading } from "@/components/admin/ui";
export function ParentAccessRequests({ onReveal }) {
  const {can}=useAccess();
  const requests=useLoad(()=>db().from("parent_access_requests").select("id,kind,requested_at,guardians(id,full_name,client_id,email,phone)").eq("status","pending").order("requested_at",{ascending:false}).limit(50),[]);
  const resolve=async(id)=>{
    try {
      const {data,error}=await db().rpc("guardian_resolve_access_request",{p_request_id:id});
      if(error)throw error;
      onReveal(data);requests.reload();
    } catch(error) { notifyError(error); }
  };
  return <Card title="Parent access requests" className="mb-6"><p className="mb-3 text-sm text-ink-soft">Latest 50 pending recovery/activation requests. Verify the parent through the registered contact before issuing a replacement code. Delivery is handled by the coordinator.</p>{requests.loading?<Loading rows={2}/>:requests.error?<ErrorState error={requests.error} onRetry={requests.reload}/>:!requests.data?.length?<EmptyState title="No access requests waiting"/>:<ul className="divide-y divide-line">{requests.data.map(r=><li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><div><p className="font-semibold text-mushaf-900">{r.guardians?.full_name} · {r.guardians?.client_id}</p><p className="text-sm text-ink-soft">{r.guardians?.email||r.guardians?.phone||"Check the parent record"}</p><p className="text-xs text-ink-faint">{r.kind} · {formatDateTime(r.requested_at)}</p></div>{can("guardians:update")&&<ConfirmButton danger={false} title="Registered contact verified?" message="Only give the new code to the verified parent through the registered channel. The old code and existing sessions will stop working." confirmLabel="Issue replacement code" onConfirm={()=>resolve(r.id)}>Verify & reset access</ConfirmButton>}</li>)}</ul>}</Card>;
}
