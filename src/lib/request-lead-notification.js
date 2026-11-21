// A failed notification must never turn a saved form into a failed submission.
export function requestLeadNotification(result, email) {
  if (!result?.notification_token) return;
  void fetch("/api/lead-notification", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      reference: result.reference,
      email,
      notification_token: result.notification_token,
    }),
    keepalive: true,
  }).catch(() => {});
}
