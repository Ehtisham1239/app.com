import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { enabledHighLevelConfig } from "@/lib/server/highlevel";
import { processLeadSyncBatch } from "@/lib/server/lead-outbox";
import { getServiceClient } from "@/lib/supabase/admin";
import { SITE_URL } from "@/lib/config";
import { notificationConfig } from "@/lib/usa-lead-notification";

export const dynamic = "force-dynamic";
const reply = (body, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex" } });

// A scheduler (Vercel Cron, Hostinger cron or any HTTP caller) calls this every
// few minutes with `Authorization: Bearer <CRON_SECRET>`. It carries no lead
// data in or out, only counts.
function authorised(request) {
  const secret = String(process.env.CRON_SECRET || "");
  const given = String(request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (secret.length < 24) return null;
  const a = Buffer.from(given);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function run(request) {
  const ok = authorised(request);
  if (ok === null) return reply({ ok: false, error: "not_configured" }, 503);
  if (!ok) return reply({ ok: false, error: "unauthorized" }, 401);
  const db = getServiceClient();
  if (!db) return reply({ ok: false, error: "not_configured" }, 503);
  try {
    const summary = await processLeadSyncBatch({
      db, siteUrl: SITE_URL, highLevel: enabledHighLevelConfig(), emailConfig: notificationConfig(),
      log: (level, entry) => console[level](JSON.stringify(entry)),
    });
    return reply({ ok: true, ...summary });
  } catch {
    console.error(JSON.stringify({ event: "lead_sync", outcome: "batch_failed" }));
    return reply({ ok: false, error: "unavailable" }, 503);
  }
}

export const GET = run;
export const POST = run;
