"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { clsx } from "clsx";
import {
  Activity, Award, Bell, ClipboardCheck, GraduationCap, PenLine, BookOpen, ChevronDown, CircleDollarSign, ExternalLink, FileText, HelpCircle, Images, Inbox,
  LayoutDashboard, LineChart, Link2, LogOut, Menu, MessageSquareQuote, Newspaper, Search, Settings, Shield, UserRound,
  UserRoundCheck, Users, X,
} from "lucide-react";
import { useAccess, signOut } from "@/lib/admin/access";
import { db } from "@/lib/admin/db";
import { initials, timeAgo } from "@/lib/format";
import { Spinner } from "@/components/admin/ui";

export const NAV = [
  { group: "Overview", items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }] },
  {
    group: "Admissions",
    items: [
      { href: "/admin/trials", label: "Free trials", icon: UserRoundCheck, perm: "trials:read" },
      { href: "/admin/contacts", label: "Messages", icon: Inbox, perm: "contacts:read" },
    ],
  },
  {
    group: "Parent Portal",
    items: [
      { href: "/admin/parent-portal", label: "Portal overview", icon: GraduationCap, perm: ["guardians:read", "progress:read", "results:read", "certificates:read"] },
      { href: "/admin/results/parents", label: "Parent accounts", icon: Users, perm: "guardians:read" },
    ],
  },
  {
    group: "Website",
    items: [
      { href: "/admin/courses", label: "Courses", icon: BookOpen, perm: "courses:read" },
      { href: "/admin/fees", label: "Fees & packages", icon: CircleDollarSign, perm: "pricing:read" },
      { href: "/admin/teachers", label: "Teachers", icon: Users, perm: "teachers:read" },
      { href: "/admin/pages", label: "Pages", icon: FileText, perm: "pages:read" },
      { href: "/admin/blog", label: "Blog", icon: Newspaper, perm: "blog:read" },
      { href: "/admin/faqs", label: "FAQs", icon: HelpCircle, perm: "faqs:read" },
      { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote, perm: "testimonials:read" },
      { href: "/admin/menus", label: "Menus", icon: Menu, perm: "menus:read" },
      { href: "/admin/seo", label: "SEO tools", icon: Search, perm: "pages:read" },
      { href: "/admin/growth", label: "SEO growth", icon: LineChart, perm: "pages:read" },
      { href: "/admin/growth-tasks", label: "Growth plan", icon: FileText, perm: "pages:read" },
      { href: "/admin/growth-metrics", label: "SEO baselines", icon: LineChart, perm: "pages:read" },
      { href: "/admin/redirects", label: "Redirects", icon: Link2, perm: "redirects:read" },
      { href: "/admin/media", label: "Media", icon: Images, perm: "media:read" },
    ],
  },
  {
    group: "Monthly progress",
    items: [
      { href: "/admin/progress/form", label: "Teacher form", icon: PenLine, perm: ["progress:submit", "progress:review"] },
      { href: "/admin/progress", label: "Review & publish", icon: ClipboardCheck, perm: "progress:read" },
    ],
  },
  {
    group: "Records",
    items: [
      { href: "/admin/results", label: "Results", icon: GraduationCap, perm: ["results:read", "certificates:read"] },
      { href: "/admin/certificates", label: "Certificates", icon: Award, perm: "certificates:read" },
      { href: "/admin/reports", label: "Reports", icon: LineChart, perm: "reports:read" },
      { href: "/admin/campaigns", label: "Campaigns & leads", icon: LineChart, perm: "reports:read" },
    ],
  },
  {
    group: "Administration",
    items: [
      { href: "/admin/settings", label: "Website settings", icon: Settings, perm: "settings:read" },
      { href: "/admin/users", label: "Admin users", icon: Shield, perm: "users:read" },
      { href: "/admin/activity", label: "Activity log", icon: Activity, perm: "audit:read" },
    ],
  },
];

function isActive(path, href) {
  return href === "/admin" ? path === "/admin" : path === href || path.startsWith(href + "/");
}

function Sidebar({ onNavigate }) {
  const path = usePathname();
  const { can } = useAccess();
  return (
    <nav className="scrollbar-thin relative flex h-full flex-col overflow-y-auto bg-linear-to-b from-mushaf-950 via-[#0b2a14] to-mushaf-900 px-3 pb-6 text-white" aria-label="Admin">
      <div className="pattern-girih pointer-events-none absolute inset-0 opacity-[0.06]" aria-hidden="true" />
      <Link href="/admin" onClick={onNavigate} className="relative mx-1 mb-2 mt-4 flex items-center gap-3 rounded-2xl border border-gold-400/25 bg-white/[0.06] px-3 py-3 shadow-[inset_0_1px_0_rgb(255_255_255/0.06)]">
        <img src="/brand/logo.webp" alt="" width={44} height={44} className="size-11 shrink-0 rounded-xl bg-white p-1 shadow" />
        <span className="leading-tight">
          <span className="block font-display text-[0.95rem] leading-snug text-white">Online Quran College</span>
          <span className="block text-[0.66rem] font-bold uppercase tracking-[0.22em] text-gold-300">CMS Portal</span>
        </span>
      </Link>
      {NAV.map((g) => {
        const items = g.items.filter((i) => !i.perm || [].concat(i.perm).some(can));
        if (!items.length) return null;
        return (
          <div key={g.group} className="relative mt-4">
            <p className="flex items-center gap-2 px-3 pb-1.5 text-[0.66rem] font-bold uppercase tracking-[0.18em] text-gold-300/60"><span className="h-px w-3 bg-gold-400/50" aria-hidden="true" />{g.group}</p>
            <ul className="space-y-0.5">
              {items.map(({ href, label, icon: Icon }) => {
                // The most specific matching link wins (e.g. /admin/progress/form over /admin/progress).
                const active = isActive(path, href) && !NAV.some((ng) => ng.items.some((i) => i.href.length > href.length && isActive(path, i.href)));
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={clsx(
                        "group flex items-center gap-3 rounded-xl px-3 py-2 text-[0.92rem] font-medium transition-all",
                        active ? "bg-linear-to-r from-white/[0.14] to-white/[0.04] text-white shadow-[inset_3px_0_0_var(--color-gold-400)]" : "text-white/70 hover:translate-x-0.5 hover:bg-white/[0.06] hover:text-white",
                      )}
                    >
                      <Icon className={clsx("size-[1.1rem]", active ? "text-gold-300" : "text-white/50 group-hover:text-white/80")} aria-hidden="true" />
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
      <a href="/" target="_blank" rel="noopener noreferrer" className="relative mt-auto flex items-center gap-2 rounded-xl px-3 py-2 pt-6 text-[0.85rem] text-white/50 hover:text-gold-300">
        <ExternalLink className="size-4" aria-hidden="true" /> View website
      </a>
    </nav>
  );
}

function GlobalSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      setBusy(true);
      const { data } = await db().rpc("global_search", { q });
      setResults((data || []).filter((r) => ["trial", "teacher", "course"].includes(r.type)));
      setBusy(false);
    }, 300);
    return () => clearTimeout(t);
  }, [q]);
  const label = { trial: "Free trial", teacher: "Teacher", course: "Course" };
  return (
    <div className="relative w-full max-w-md">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint" aria-hidden="true" />
      <input
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Search trials, teachers, courses…"
        className="adm-input bg-paper pl-9"
        aria-label="Search the admin panel"
      />
      {open && q.trim().length >= 2 && (
        <div className="absolute inset-x-0 top-full z-40 mt-1.5 overflow-hidden rounded-xl border border-line bg-white shadow-[var(--shadow-lift)]">
          {busy ? (
            <div className="flex justify-center p-4">
              <Spinner />
            </div>
          ) : results.length === 0 ? (
            <p className="p-4 text-sm text-ink-soft">No matches.</p>
          ) : (
            <ul className="max-h-80 overflow-y-auto py-1">
              {results.map((r) => (
                <li key={`${r.type}-${r.id}`}>
                  <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { setOpen(false); setQ(""); router.push(r.href); }} className="flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-paper">
                    <span className="w-20 shrink-0 text-[0.7rem] font-bold uppercase tracking-wider text-gold-700">{label[r.type]}</span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-ink">{r.title}</span>
                      <span className="block truncate text-xs text-ink-faint">{r.subtitle}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function Notifications({ userId }) {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const load = useCallback(async () => {
    const { data } = await db().from("notifications").select("id, title, body, link, read_at, created_at").order("created_at", { ascending: false }).limit(8);
    setItems(data || []);
  }, []);
  useEffect(() => {
    if (!userId) return;
    load();
    const t = setInterval(load, 60000);
    const channel = db()
      .channel(`notifications-${userId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` }, load)
      .subscribe();
    return () => {
      clearInterval(t);
      db().removeChannel(channel);
    };
  }, [userId, load]);
  useEffect(() => {
    const close = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  const unread = items.filter((n) => !n.read_at).length;
  const markAll = async () => {
    await db().rpc("mark_all_notifications_read");
    load();
  };
  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen((v) => !v)} className="relative rounded-xl p-2 text-ink-soft hover:bg-paper hover:text-ink" aria-label={`Notifications${unread ? ` (${unread} new)` : ""}`}>
        <Bell className="size-5" />
        {unread > 0 && <span className="absolute right-1 top-1 flex min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[0.62rem] font-bold leading-4 text-white">{unread}</span>}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-40 mt-2 w-80 overflow-hidden rounded-2xl border border-line bg-white shadow-[var(--shadow-lift)]">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="font-semibold text-mushaf-900">Notifications</p>
            {unread > 0 && (
              <button type="button" onClick={markAll} className="text-xs font-semibold text-leaf-700 hover:underline">
                Mark all read
              </button>
            )}
          </div>
          {items.length === 0 ? (
            <p className="p-5 text-sm text-ink-soft">Nothing new.</p>
          ) : (
            <ul className="max-h-96 divide-y divide-line overflow-y-auto">
              {items.map((n) => (
                <li key={n.id}>
                  <Link
                    href={n.link || "/admin/notifications"}
                    onClick={async () => {
                      setOpen(false);
                      if (!n.read_at) await db().from("notifications").update({ read_at: new Date().toISOString() }).eq("id", n.id);
                      load();
                    }}
                    className={clsx("block px-4 py-3 hover:bg-paper", !n.read_at && "bg-leaf-50/60")}
                  >
                    <p className="text-sm font-semibold text-ink">{n.title}</p>
                    {n.body && <p className="mt-0.5 line-clamp-2 text-xs text-ink-soft">{n.body}</p>}
                    <p className="mt-1 text-[0.7rem] text-ink-faint">{timeAgo(n.created_at)}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link href="/admin/notifications" onClick={() => setOpen(false)} className="block border-t border-line px-4 py-2.5 text-center text-sm font-semibold text-leaf-700 hover:bg-paper">
            See all
          </Link>
        </div>
      )}
    </div>
  );
}

function UserMenu({ access }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const close = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex items-center gap-2 rounded-xl py-1 pl-1 pr-2 hover:bg-paper" aria-haspopup="menu" aria-expanded={open}>
        <span className="flex size-9 items-center justify-center rounded-full bg-mushaf-900 text-sm font-bold text-gold-300">{initials(access?.full_name || access?.email || "?")}</span>
        <span className="hidden text-left leading-tight md:block">
          <span className="block max-w-40 truncate text-sm font-semibold text-ink">{access?.full_name || access?.email}</span>
          <span className="block text-[0.72rem] text-ink-faint">{access?.role_name}</span>
        </span>
        <ChevronDown className="hidden size-4 text-ink-faint md:block" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full z-40 mt-2 w-56 overflow-hidden rounded-2xl border border-line bg-white py-1 shadow-[var(--shadow-lift)]">
          <p className="truncate px-4 py-2 text-xs text-ink-faint">{access?.email}</p>
          <Link href="/admin/account" role="menuitem" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-paper">
            <UserRound className="size-4" /> My account
          </Link>
          <button type="button" role="menuitem" onClick={() => signOut(router)} className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-rose-700 hover:bg-rose-50">
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}

export function Shell({ children }) {
  const { access, loading } = useAccess();
  const router = useRouter();
  const path = usePathname();
  const [drawer, setDrawer] = useState(false);

  useEffect(() => {
    if (access?.id) db().rpc("touch_last_seen").then(() => {});
  }, [access?.id]);
  useEffect(() => {
    if (access?.must_change_password && path !== "/admin/account") router.replace("/admin/account?first=1");
  }, [access?.must_change_password, path, router]);
  useEffect(() => setDrawer(false), [path]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <Spinner className="size-8" />
      </div>
    );
  }
  if (!access || !access.is_active || !access.role) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper p-6">
        <div className="adm-card max-w-md p-8 text-center">
          <span className="brand-mark mx-auto block size-14 text-leaf-700" aria-hidden="true" />
          <h1 className="mt-4 font-sans text-xl font-bold text-mushaf-900">No admin access</h1>
          <p className="mt-2 text-sm text-ink-soft">Your login is not active for the admin panel. Ask a Super Admin to give you access.</p>
          <button type="button" onClick={() => signOut(router)} className="btn btn-primary mt-6">
            Sign out
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="adm-shell min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">
        <Sidebar />
      </aside>
      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-mushaf-950/50" onClick={() => setDrawer(false)} />
          <div className="absolute inset-y-0 left-0 w-72">
            <Sidebar onNavigate={() => setDrawer(false)} />
            <button type="button" onClick={() => setDrawer(false)} className="absolute right-3 top-5 rounded-lg p-1.5 text-white/70 hover:text-white" aria-label="Close menu">
              <X className="size-5" />
            </button>
          </div>
        </div>
      )}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-white/85 px-4 shadow-[0_6px_20px_-18px_rgb(13_74_28/0.6)] backdrop-blur sm:px-6">
          <span className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-leaf-700 via-gold-400 to-leaf-700" aria-hidden="true" />
          <button type="button" onClick={() => setDrawer(true)} className="rounded-lg p-2 text-ink-soft hover:bg-paper lg:hidden" aria-label="Open menu">
            <Menu className="size-5" />
          </button>
          <GlobalSearch />
          <div className="ml-auto flex items-center gap-1">
            <Notifications userId={access.id} />
            <UserMenu access={access} />
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
