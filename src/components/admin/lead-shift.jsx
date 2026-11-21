"use client";

import { useEffect, useState } from "react";
import { Clock3 } from "lucide-react";
import { db, useLoad } from "@/lib/admin/db";
import { formatDate, formatDateTime } from "@/lib/format";
import {
  LEAD_SHIFTS, PENDING_CONTACT_STATUSES, PENDING_TRIAL_STATUSES, SHIFT_TIME_ZONE, currentShiftInfo, shiftLabel,
} from "@/lib/lead-shift";
import { Badge } from "@/components/admin/ui";

// OQC lead shifts: Day 08:00–19:59 PKT, Night 20:00–07:59 PKT. See src/lib/lead-shift.js.

const QUEUES = {
  trial_applications: { pending: PENDING_TRIAL_STATUSES, countKey: "trials_count", noun: "free-trial request" },
  contact_messages: { pending: PENDING_CONTACT_STATUSES, countKey: "contacts_count", noun: "message" },
};

export const SHIFT_FILTERS = [
  { value: "all", label: "All shifts" },
  { value: "queue", label: "Current follow-up queue" },
  ...LEAD_SHIFTS.map((s) => ({ value: s.value, label: `${s.label} leads (${s.hours})` })),
];

/** Applies the shift filter to a Supabase query on trial_applications or contact_messages. */
export function applyShiftFilter(query, table, shift) {
  if (shift === "queue") return query.in("status", QUEUES[table].pending);
  if (shift === "day" || shift === "night") return query.eq("lead_shift", shift);
  return query;
}

export function ShiftBadge({ shift, date }) {
  if (!shift) return null;
  const tone = LEAD_SHIFTS.find((s) => s.value === shift)?.tone ?? "neutral";
  return (
    <Badge tone={tone}>
      {shiftLabel(shift)}
      {date ? ` · ${formatDate(date)}` : ""}
    </Badge>
  );
}

export function ShiftFilter({ value, onChange }) {
  return (
    <select className="adm-input w-full sm:w-64" value={value} onChange={(e) => onChange(e.target.value)} aria-label="Shift">
      {SHIFT_FILTERS.map((f) => (
        <option key={f.value} value={f.value}>{f.label}</option>
      ))}
    </select>
  );
}

function useNow(intervalMs = 60_000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

/** Which shift is on now, how many leads are waiting for it, and the last hand-over. */
export function ShiftQueueBanner({ table }) {
  const cfg = QUEUES[table];
  const now = useNow();
  const info = currentShiftInfo(now);
  const startedIso = info.startedAt.toISOString();
  const queue = useLoad(async () => {
    const pending = () => db().from(table).select("id", { count: "exact", head: true }).is("deleted_at", null).in("status", cfg.pending);
    const [all, carried, last] = await Promise.all([
      pending(),
      pending().lt("created_at", startedIso),
      db().from("lead_shift_handovers").select(`handover_at, from_shift, to_shift, ${cfg.countKey}`).order("handover_at", { ascending: false }).limit(1).maybeSingle(),
    ]);
    const error = all.error || carried.error;
    if (error) return { error };
    return { data: { waiting: all.count ?? 0, carried: carried.count ?? 0, last: last.error ? null : last.data } };
  }, [table, startedIso]);

  const q = queue.data;
  return (
    <div className="mb-4 flex flex-wrap items-start gap-3 rounded-xl border border-line bg-white px-4 py-3 text-sm" role="status">
      <Clock3 className="mt-0.5 size-5 shrink-0 text-leaf-700" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-mushaf-900">
          Now: {info.label} <span className="font-normal text-ink-soft">({info.hours})</span>
          {" · "}next hand-over {formatDateTime(info.endsAt, SHIFT_TIME_ZONE)} PKT
        </p>
        {queue.error ? (
          <p className="text-ink-soft">The follow-up queue is not available yet.</p>
        ) : q ? (
          <p className="text-ink-soft">
            {q.waiting} {cfg.noun}{q.waiting === 1 ? "" : "s"} awaiting follow-up
            {q.carried ? `, including ${q.carried} handed over from before ${formatDateTime(info.startedAt, SHIFT_TIME_ZONE)}` : ""}.
            {q.last ? ` Last hand-over: ${shiftLabel(q.last.from_shift)} → ${shiftLabel(q.last.to_shift)} at ${formatDateTime(q.last.handover_at, SHIFT_TIME_ZONE)} (${q.last[cfg.countKey]} carried).` : ""}
          </p>
        ) : null}
        <p className="mt-0.5 text-[0.78rem] text-ink-faint">Lead forms stay open in both shifts. Each lead keeps the shift it arrived in; only follow-up ownership passes at 08:00 and 20:00 PKT.</p>
      </div>
    </div>
  );
}
