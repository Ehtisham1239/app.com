import { Check, ClipboardList, Pencil, BadgeCheck } from "lucide-react";

// The existing monthly-report state machine, shown consistently to staff.
export function ProgressWorkflow({ status = "draft" }) {
  const active = status === "published" ? 2 : status === "submitted" ? 1 : 0;
  const steps = [
    { label: "Teacher form", detail: status === "changes_requested" ? "Changes requested" : "Ratings & remarks", Icon: ClipboardList },
    { label: "Review & edit", detail: "Admin checks the certificate", Icon: Pencil },
    { label: "Approve & publish", detail: "Visible to linked parents", Icon: BadgeCheck },
  ];
  return (
    <nav aria-label="Monthly report workflow" className="no-print mb-6 rounded-2xl border border-gold-300/70 bg-white p-3 sm:p-4">
      <ol className="grid gap-2 sm:grid-cols-3">
        {steps.map(({ label, detail, Icon }, index) => (
          <li key={label} aria-current={index === active ? "step" : undefined} className={`flex items-center gap-3 rounded-xl px-3 py-3 ${index === active ? "bg-leaf-50 ring-1 ring-leaf-600/25" : "bg-paper"}`}>
            <span className={`grid size-9 shrink-0 place-items-center rounded-full ${index <= active ? "bg-leaf-700 text-white" : "bg-white text-ink-faint ring-1 ring-line"}`}>
              {index < active ? <Check className="size-4" aria-hidden="true" /> : <Icon className="size-4" aria-hidden="true" />}
            </span>
            <span><span className="block text-sm font-bold text-mushaf-900">{index + 1}. {label}</span><span className="block text-xs text-ink-soft">{detail}</span></span>
          </li>
        ))}
      </ol>
    </nav>
  );
}
