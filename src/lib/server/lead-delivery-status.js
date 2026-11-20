// Whether website leads can reach email and GoHighLevel, by setting name only (never a value).
// Shown in Admin → Technical health so staff need no server logs (20 Nov 2026: the Resend key on
// Hostinger was invalid and no form email had been sent for days).
import { notificationConfigIssues } from "../usa-lead-notification.js";
import { highLevelConfig } from "./highlevel.js";

export function leadDeliveryStatus(env = process.env) {
  const emailIssues = notificationConfigIssues(env);
  const ghlOn = env.GHL_ADMISSIONS_SYNC === "true";
  const ghlMissing = [
    !String(env.GHL_PRIVATE_INTEGRATION_TOKEN || "").trim() && "GHL_PRIVATE_INTEGRATION_TOKEN missing",
    !String(env.GHL_LOCATION_ID || "").trim() && "GHL_LOCATION_ID missing",
  ].filter(Boolean);
  const ghlReady = ghlOn && Boolean(highLevelConfig(env));
  const workerSecret = String(env.CRON_SECRET || "").length >= 24;
  return {
    email: { ok: emailIssues.length === 0, issues: emailIssues },
    ghl: {
      ok: ghlReady,
      issues: ghlReady ? [] : [
        ...(ghlOn ? [] : ["GHL_ADMISSIONS_SYNC is not \"true\" (GoHighLevel delivery is off)"]),
        ...ghlMissing,
        ...(ghlOn && !ghlMissing.length && !ghlReady ? ["GHL_ADMISSIONS_PIPELINE_ID and GHL_ADMISSIONS_STAGE_ID must be set together"] : []),
      ],
    },
    worker: { ok: workerSecret, issues: workerSecret ? [] : ["CRON_SECRET missing or shorter than 24 characters (retries do not run)"] },
  };
}
