"use client";

import Link from "next/link";
import { Fragment, cloneElement, isValidElement, useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, ArrowLeft, ChevronLeft, ChevronRight, Inbox, Loader2, Search, X } from "lucide-react";
import { clsx } from "clsx";
import { errorMessage } from "@/lib/admin/db";
import { formatDateTime, timeAgo } from "@/lib/format";
import { labelFor, toneFor } from "@/lib/constants";

export function PageHeader({ title, subtitle, actions, back, children }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {back && (
          <Link href={back.href} className="mb-2 inline-flex items-center gap-1 text-sm text-ink-faint hover:text-leaf-700">
            <ArrowLeft className="size-4" aria-hidden="true" /> {back.label}
          </Link>
        )}
        <h1 className="font-sans text-[1.65rem] font-bold leading-tight tracking-tight text-mushaf-900">{title}</h1>
        {subtitle && <p className="mt-1 text-[0.95rem] text-ink-soft">{subtitle}</p>}
        {children}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ title, actions, children, className, bodyClass = "p-5" }) {
  return (
    <section className={clsx("adm-card min-w-0", className)}>
      {(title || actions) && (
        <header className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-line px-5 py-3.5">
          <h2 className="font-sans text-[0.98rem] font-bold text-mushaf-900">{title}</h2>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={bodyClass}>{children}</div>
    </section>
  );
}

export function Badge({ tone = "neutral", children, className }) {
  return <span className={clsx("badge", `tone-${tone}`, className)}>{children}</span>;
}

export function StatusBadge({ list, value }) {
  return <Badge tone={toneFor(list, value)}>{labelFor(list, value)}</Badge>;
}

export function Spinner({ className = "size-5" }) {
  return <Loader2 className={clsx("animate-spin text-leaf-700", className)} aria-label="Loading" />;
}

export function Loading({ rows = 5 }) {
  return (
    <div className="space-y-2 p-5" aria-busy="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-10 animate-pulse rounded-lg bg-leaf-50" />
      ))}
    </div>
  );
}

export function EmptyState({ icon: Icon = Inbox, title, text, action }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-leaf-50 text-leaf-700">
        <Icon className="size-7" aria-hidden="true" />
      </span>
      <p className="mt-4 font-semibold text-mushaf-900">{title}</p>
      {text && <p className="mt-1 max-w-md text-sm text-ink-soft">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="m-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
      <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <div className="flex-1">
        <p className="font-semibold">Could not load this.</p>
        <p className="mt-0.5">{errorMessage(error)}</p>
      </div>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn btn-outline btn-sm">
          Retry
        </button>
      )}
    </div>
  );
}

export function Modal({ open, onClose, title, children, footer, size = "md" }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);
  if (!open || !mounted) return null;
  const width = { sm: "max-w-md", md: "max-w-xl", lg: "max-w-3xl", xl: "max-w-5xl" }[size];
  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-mushaf-950/50 p-4 backdrop-blur-[2px] sm:items-center" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div role="dialog" aria-modal="true" aria-label={title} className={clsx("my-8 w-full rounded-2xl bg-white shadow-[var(--shadow-float)]", width)}>
        <header className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
          <h2 className="font-sans text-[1.05rem] font-bold text-mushaf-900">{title}</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-ink-faint hover:bg-leaf-50 hover:text-ink" aria-label="Close">
            <X className="size-5" />
          </button>
        </header>
        <div className="px-5 py-5">{children}</div>
        {footer && <footer className="flex flex-wrap justify-end gap-2 border-t border-line px-5 py-3.5">{footer}</footer>}
      </div>
    </div>,
    document.body,
  );
}

// A button that asks before doing something irreversible.
export function ConfirmButton({ onConfirm, children, title = "Are you sure?", message, confirmLabel = "Confirm", className = "btn btn-outline btn-sm", danger = true, disabled }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)} disabled={disabled}>
        {children}
      </button>
      <Modal
        open={open}
        onClose={() => !busy && setOpen(false)}
        title={title}
        size="sm"
        footer={
          <>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(false)} disabled={busy}>
              Cancel
            </button>
            <button
              type="button"
              className={clsx("btn btn-sm", danger ? "btn-danger" : "btn-primary")}
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await onConfirm();
                  setOpen(false);
                } finally {
                  setBusy(false);
                }
              }}
            >
              {busy && <Loader2 className="size-4 animate-spin" />} {confirmLabel}
            </button>
          </>
        }
      >
        <p className="text-[0.95rem] text-ink-soft">{message}</p>
      </Modal>
    </>
  );
}

export function Tabs({ tabs, value, onChange }) {
  return (
    <div className="scrollbar-thin -mx-1 flex gap-1 overflow-x-auto px-1 pb-1" role="tablist">
      {tabs.map((t) => (
        <button
          key={t.value}
          type="button"
          role="tab"
          aria-selected={value === t.value}
          onClick={() => onChange(t.value)}
          className={clsx(
            "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors",
            value === t.value ? "bg-mushaf-900 text-white" : "text-ink-soft hover:bg-white hover:text-ink",
          )}
        >
          {t.label}
          {t.count !== undefined && t.count !== null && (
            <span className={clsx("rounded-full px-1.5 text-xs", value === t.value ? "bg-white/20" : "bg-leaf-50 text-leaf-800")}>{t.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder = "Search…", className }) {
  const [text, setText] = useState(value ?? "");
  useEffect(() => setText(value ?? ""), [value]);
  useEffect(() => {
    const t = setTimeout(() => text !== (value ?? "") && onChange(text), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);
  return (
    <label className={clsx("relative block", className)}>
      <span className="sr-only">Search</span>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint" aria-hidden="true" />
      <input value={text} onChange={(e) => setText(e.target.value)} placeholder={placeholder} className="adm-input pl-9" type="search" />
    </label>
  );
}

export function Pagination({ page, pageSize, count, onPage }) {
  if (!count || count <= pageSize) return null;
  const pages = Math.ceil(count / pageSize);
  return (
    <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-3 text-sm text-ink-soft">
      <span>
        {page * pageSize + 1}–{Math.min(count, (page + 1) * pageSize)} of {count}
      </span>
      <div className="flex gap-1">
        <button type="button" className="btn btn-outline btn-sm" disabled={page === 0} onClick={() => onPage(page - 1)} aria-label="Previous page">
          <ChevronLeft className="size-4" />
        </button>
        <button type="button" className="btn btn-outline btn-sm" disabled={page >= pages - 1} onClick={() => onPage(page + 1)} aria-label="Next page">
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}

export function StatCard({ label, value, hint, icon: Icon, href, tone = "green" }) {
  const body = (
    <div className="adm-card flex h-full items-start gap-4 p-5 transition-shadow hover:shadow-[var(--shadow-lift)]">
      {Icon && (
        <span className={clsx("flex size-11 shrink-0 items-center justify-center rounded-xl", `tone-${tone}`)}>
          <Icon className="size-5" aria-hidden="true" />
        </span>
      )}
      <div className="min-w-0">
        <p className="text-[0.8rem] font-semibold uppercase tracking-wider text-ink-faint">{label}</p>
        <p className="mt-1 font-display text-[2rem] leading-none text-mushaf-900 tabular">{value ?? "—"}</p>
        {hint && <p className="mt-1.5 text-[0.82rem] text-ink-soft">{hint}</p>}
      </div>
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

export function Field({ label, hint, error, required, children, className }) {
  // The label points at the control: native controls get the id directly, field components pass it on.
  const autoId = useId();
  const single = isValidElement(children) && children.type !== Fragment ? children : null;
  const id = single?.props.id || autoId;
  const content = single ? cloneElement(single, { id }) : children;
  return (
    <div className={className}>
      {label &&
        (single ? (
          <label htmlFor={id} className="field-label">
            {label} {required && <span className="text-rose-600">*</span>}
          </label>
        ) : (
          <span className="field-label">
            {label} {required && <span className="text-rose-600">*</span>}
          </span>
        ))}
      {content}
      {error ? <p className="mt-1 text-[0.8rem] text-rose-600">{error}</p> : hint ? <p className="field-hint">{hint}</p> : null}
    </div>
  );
}

export function Toggle({ id, checked, onChange, label, disabled }) {
  return (
    <label className={clsx("inline-flex cursor-pointer items-center gap-2.5 text-[0.92rem]", disabled && "opacity-60")}>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={!!checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={clsx("relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf-600", checked ? "bg-leaf-700" : "bg-line-strong")}
      >
        <span className={clsx("absolute left-0 top-0.5 size-5 rounded-full bg-white shadow transition-transform", checked ? "translate-x-[1.375rem]" : "translate-x-0.5")} />
      </button>
      {label}
    </label>
  );
}

export function TagInput({ id, value, onChange, placeholder = "Type and press Enter" }) {
  const list = Array.isArray(value) ? value : [];
  const [text, setText] = useState("");
  const add = () => {
    const parts = text.split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
    if (parts.length) onChange([...list, ...parts.filter((p) => !list.includes(p))]);
    setText("");
  };
  return (
    <div className="adm-input flex min-h-[2.6rem] flex-wrap items-center gap-1.5 py-1.5">
      {list.map((t) => (
        <span key={t} className="inline-flex items-center gap-1 rounded-full bg-leaf-50 px-2.5 py-0.5 text-[0.82rem] text-leaf-800">
          {t}
          <button type="button" onClick={() => onChange(list.filter((x) => x !== t))} aria-label={`Remove ${t}`} className="text-leaf-700 hover:text-rose-600">
            <X className="size-3.5" />
          </button>
        </span>
      ))}
      <input
        id={id}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            add();
          } else if (e.key === "Backspace" && !text && list.length) onChange(list.slice(0, -1));
        }}
        onBlur={add}
        placeholder={list.length ? "" : placeholder}
        className="min-w-[8rem] flex-1 bg-transparent py-0.5 text-[0.92rem] outline-none"
      />
    </div>
  );
}

export function When({ value }) {
  if (!value) return <span className="text-ink-faint">—</span>;
  return (
    <time dateTime={value} title={formatDateTime(value)} className="whitespace-nowrap">
      {timeAgo(value)}
    </time>
  );
}
