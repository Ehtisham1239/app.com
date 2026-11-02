"use client";
import { usePathname } from "next/navigation";
import { Star } from "lucide-react";

// Bottom-left Trustpilot review button for parents and students (CMS: Settings →
// Trustpilot button). The chat widget sits bottom-right; on phones the button
// stays above the trial/WhatsApp action bar so the two never overlap.
export function ReviewsButton({ config }) {
  const pathname = usePathname();
  if (!config || !(config.everyPage || pathname === "/")) return null;
  return (
    <a
      href={config.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${config.label}${config.sublabel ? ` — ${config.sublabel}` : ""} (opens Trustpilot in a new tab)`}
      data-reviews-button=""
      className="fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom))] left-3 z-30 inline-flex min-h-11 max-w-[calc(100vw-7rem)] items-center gap-2.5 rounded-full border border-leaf-100 bg-white/95 py-1.5 pl-1.5 pr-4 text-left shadow-[0_6px_20px_rgb(13_74_28/0.16)] backdrop-blur hover:border-leaf-200 hover:bg-leaf-50 lg:bottom-5 lg:left-5"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-leaf-700 text-white" aria-hidden="true">
        <Star className="size-[1.1rem] fill-current" />
      </span>
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="truncate text-sm font-semibold text-mushaf-900">{config.label}</span>
        {config.sublabel && <span className="truncate text-xs text-leaf-800">{config.sublabel}</span>}
      </span>
    </a>
  );
}
