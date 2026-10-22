"use client";
import { CheckCircle2, CircleAlert } from "lucide-react";
import { analyzeSeo, canonicalUrl } from "@/lib/seo";
import { SITE_URL } from "@/lib/config";
import { Card } from "@/components/admin/ui";
export function SeoPreview({ record, path = "/" }) {
  const audit = analyzeSeo(record);
  return <Card title="Search preview & content checklist"><div className="rounded-xl border border-line bg-white p-4"><p className="truncate text-xs text-ink-soft">{canonicalUrl(record.canonical_url, path, SITE_URL)}</p><p className="mt-1 line-clamp-2 text-xl text-blue-800">{audit.title}</p><p className="mt-1 line-clamp-3 text-sm text-ink-soft">{audit.description || "Add a search description to help readers understand this page."}</p></div><p className="mt-3 text-xs text-ink-faint">Illustrative preview. Google may display a different title or snippet.</p><p className="mt-4 rounded-lg bg-paper p-3 text-sm font-medium">{record.seo_noindex ? "Noindex: search engines are asked to leave this page out of results." : "Indexable when published. Inclusion in search results is not guaranteed."}</p><ul className="mt-4 space-y-3">{audit.checks.map((check) => <li key={check.id} className="flex gap-2 text-sm">{check.pass ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-leaf-700" /> : <CircleAlert className="mt-0.5 size-4 shrink-0 text-amber-600" />}<span><span className="font-semibold">{check.label}</span>{!check.pass && <span className="mt-1 block text-xs text-ink-soft">{check.advice}</span>}</span></li>)}</ul></Card>;
}
