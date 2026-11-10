"use client";

import { db, useLoad } from "@/lib/admin/db";
import { formatDateTime } from "@/lib/format";
import { Badge } from "@/components/admin/ui";

// HighLevel delivery status for website leads, recorded by the notification
// routes and readable only by staff with trials:read or contacts:read.
const REASONS = {
  missing_custom_fields: "a required GHL field is missing",
  provider_rejected: "GHL rejected the request",
  provider_unavailable: "GHL did not respond",
  invalid_provider_response: "GHL sent an unexpected reply",
  invalid_contact: "the email address was not accepted",
  not_configured: "GHL is not configured",
};

export function useCrmStatus(references) {
  const refs = (references || []).filter(Boolean);
  const key = refs.join(",");
  const result = useLoad(async () => {
    if (!refs.length) return { data: {} };
    const { data, error } = await db().from("lead_crm_sync").select("reference, status, detail, updated_at").in("reference", refs);
    if (error) return { data: {} };
    return { data: Object.fromEntries((data || []).map((row) => [row.reference, row])) };
  }, [key]);
  return result.data || {};
}

export function CrmBadge({ status }) {
  if (!status) return null;
  return status.status === "synced"
    ? <Badge tone="green">In GHL</Badge>
    : <Badge tone="red">GHL failed</Badge>;
}

export function CrmDetail({ status }) {
  if (!status) return <span className="text-ink-faint">Not recorded (leads before 9 Nov 2026, or GHL sync was off)</span>;
  const when = formatDateTime(status.updated_at, "Asia/Karachi");
  return status.status === "synced"
    ? <span><Badge tone="green">In GHL</Badge> <span className="text-ink-faint">sent {when} PKT</span></span>
    : <span><Badge tone="red">GHL failed</Badge> <span className="text-ink-faint">{REASONS[status.detail] || "unknown reason"} · {when} PKT</span></span>;
}
