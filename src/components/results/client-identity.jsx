export function ClientIdentity({ clientId, clientName }) {
  return <dl className="grid gap-3 rounded-xl border border-gold-300 bg-gold-50/60 p-4 text-sm sm:grid-cols-2" aria-label="Linked client">
    <div><dt className="text-xs font-bold uppercase tracking-wide text-ink-faint">Client ID</dt><dd className="mt-1 break-words font-mono font-semibold text-mushaf-900">{clientId || "Not linked"}</dd></div>
    <div><dt className="text-xs font-bold uppercase tracking-wide text-ink-faint">Client name</dt><dd className="mt-1 break-words font-semibold text-mushaf-900">{clientName || "Ask the admin to link the client"}</dd></div>
  </dl>;
}
