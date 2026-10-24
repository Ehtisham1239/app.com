"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronDown, Menu, ShieldCheck, X } from "@/components/site/icons";
import { clsx } from "clsx";

function isActive(pathname, href) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function SiteHeader({ menu, courses, brandName }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [coursesOpen, setCoursesOpen] = useState(false);
  const closeTimer = useRef(null);
  const dialogRef = useRef(null);
  const menuButtonRef = useRef(null);
  const coursesRef = useRef(null);
  const coursesButtonRef = useRef(null);

  useEffect(() => {
    if (!coursesOpen) return;
    const dismiss = (event) => { if (!coursesRef.current?.contains(event.target)) setCoursesOpen(false); };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [coursesOpen]);

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    const trigger = menuButtonRef.current;
    dialog?.querySelector("button")?.focus();
    const handleKey = (event) => {
      if (event.key === "Escape") { setOpen(false); return; }
      if (event.key !== "Tab") return;
      const items = [...dialog.querySelectorAll("a[href], button:not([disabled]), summary")].filter(item => item.getClientRects().length);
      const first = items[0], last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener("keydown", handleKey);
    return () => { document.removeEventListener("keydown", handleKey); trigger?.focus(); };
  }, [open]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setCoursesOpen(false);
  }, [pathname]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    if (open) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1280px)");
    const onResize = () => { if (desktop.matches) setOpen(false); };
    desktop.addEventListener("change", onResize);
    return () => desktop.removeEventListener("change", onResize);
  }, []);

  const openCourses = () => {
    clearTimeout(closeTimer.current);
    setCoursesOpen(true);
  };
  const closeCoursesSoon = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setCoursesOpen(false), 120);
  };

  return (
    <>
    <header
      className={clsx(
        "site-header sticky top-0 z-40 transition-[background-color,box-shadow,border-color] duration-200",
        scrolled ? "border-b border-line bg-white/90 shadow-[0_8px_30px_-18px_rgb(13_58_43/0.35)] backdrop-blur-md" : "border-b border-transparent bg-white/90 backdrop-blur-sm",
      )}
    >
      <div className="page-wrap flex h-[4.5rem] items-center gap-3 sm:gap-6">
        <Link href="/" className="group flex shrink-0 items-center gap-3" aria-label={`${brandName} — home`}>
          <img src="/brand/logo-160.webp" alt={brandName} width={160} height={64} className="h-14 w-auto max-w-[8rem] object-contain sm:max-w-[10rem]" />
        </Link>

        <nav className="ml-auto hidden items-center gap-1 xl:flex" aria-label="Main">
          {menu.map((item) =>
            item.href === "/courses" && courses.length > 0 ? (
              <div key={item.href} ref={coursesRef} className="relative" onMouseEnter={openCourses} onMouseLeave={closeCoursesSoon}
                onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setCoursesOpen(false); }}
                onKeyDown={(event) => { if (event.key === "Escape") { event.preventDefault(); clearTimeout(closeTimer.current); setCoursesOpen(false); coursesButtonRef.current?.focus(); } }}>
                <button
                  type="button"
                  ref={coursesButtonRef}
                  className={clsx(
                    "flex items-center gap-1 rounded-full px-3.5 py-2 text-[0.95rem] font-medium transition-colors",
                    isActive(pathname, item.href) ? "text-leaf-700" : "text-ink-soft hover:text-ink",
                  )}
                  aria-expanded={coursesOpen}
                  aria-controls="desktop-course-links"
                  onClick={() => setCoursesOpen((v) => !v)}
                >
                  {item.label}
                  <ChevronDown className={clsx("size-4 transition-transform", coursesOpen && "rotate-180")} aria-hidden="true" />
                </button>
                <div
                  id="desktop-course-links"
                  hidden={!coursesOpen}
                  className="absolute left-1/2 top-full w-[34rem] -translate-x-1/2 pt-3"
                >
                  <div className="surface overflow-hidden p-2 shadow-[var(--shadow-float)]">
                    <div className="grid grid-cols-2 gap-1">
                      {courses.map((c) => (
                        <Link
                          key={c.slug}
                          href={`/courses/${c.slug}`}
                          className="rounded-xl px-3.5 py-3 transition-colors hover:bg-leaf-50"
                          onFocus={openCourses}
                        >
                          <span className="block text-[0.95rem] font-semibold text-ink">{c.title}</span>
                          <span className="mt-0.5 block text-[0.8rem] leading-snug text-ink-faint">{c.age_group}</span>
                        </Link>
                      ))}
                    </div>
                    <Link
                      href="/courses"
                      className="mt-1 flex items-center justify-between rounded-xl bg-mushaf-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-mushaf-800"
                    >
                      Compare all courses
                      <ArrowRight className="size-4 text-gold-400" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                target={item.opens_new_tab ? "_blank" : undefined}
                className={clsx(
                  "rounded-full px-3.5 py-2 text-[0.95rem] font-medium transition-colors",
                  isActive(pathname, item.href) ? "text-leaf-700" : "text-ink-soft hover:text-ink",
                )}
                aria-current={isActive(pathname, item.href) ? "page" : undefined}
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <div className="ml-auto flex items-center gap-2 xl:ml-2">
          {/* A full document navigation removes the public third-party chat runtime before staff sign-in. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/admin" className="btn portal-button header-portal whitespace-nowrap px-3 text-xs sm:px-5 sm:text-sm"><ShieldCheck className="size-4" aria-hidden="true" />Portal</a>
          <Link href="/free-trial" className="btn btn-primary hidden sm:inline-flex">
            Free trial
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <button
            type="button"
            className="mobile-menu-trigger flex size-11 items-center justify-center rounded-full border border-line-strong text-ink xl:hidden"
            onClick={() => setOpen(true)}
            ref={menuButtonRef}
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="mobile-navigation"
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>
        </div>
      </div>

    </header>
      {/* Mobile menu */}
      <div className={clsx("fixed inset-0 z-50 overflow-hidden xl:hidden", open ? "visible" : "invisible")} aria-hidden={!open}>
        <div
          className={clsx("absolute inset-0 bg-mushaf-950/50 backdrop-blur-sm transition-opacity", open ? "opacity-100" : "opacity-0")}
          onClick={() => setOpen(false)}
        />
        <div
          className={clsx(
            "absolute inset-y-0 right-0 flex max-h-[100dvh] w-[min(22rem,88vw)] flex-col bg-paper shadow-2xl transition-transform duration-300",
            open ? "translate-x-0" : "translate-x-full",
          )}
          ref={dialogRef}
          id="mobile-navigation"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <div className="flex h-[4.5rem] shrink-0 items-center justify-between gap-2 border-b border-line px-5">
            <span className="font-display text-lg text-mushaf-900">{brandName}</span>
            <button type="button" className="flex size-10 items-center justify-center rounded-full hover:bg-leaf-50" onClick={() => setOpen(false)} aria-label="Close menu">
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Mobile">
            {menu.map((item) => (
              <div key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  target={item.opens_new_tab ? "_blank" : undefined}
                  rel={item.opens_new_tab ? "noopener noreferrer" : undefined}
                  aria-current={isActive(pathname, item.href) ? "page" : undefined}
                  className={clsx(
                    "flex items-center justify-between rounded-xl px-4 py-3 text-[1.02rem] font-medium",
                    isActive(pathname, item.href) ? "bg-leaf-50 text-leaf-700" : "text-ink hover:bg-leaf-50",
                  )}
                >
                  {item.label}
                </Link>
                {item.href === "/courses" && courses.length > 0 && (
                  <details className="mb-2 ml-4 border-l-2 border-gold-300 pl-3">
                    <summary className="cursor-pointer rounded-lg px-3 py-3 text-sm font-semibold text-leaf-700">View individual courses</summary>
                    {courses.map((c) => (
                      <Link key={c.slug} href={`/courses/${c.slug}`} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-3 text-[0.92rem] text-ink-soft hover:text-leaf-700">
                        {c.title}
                      </Link>
                    ))}
                  </details>
                )}
              </div>
            ))}
          </nav>
          <div className="shrink-0 space-y-2 border-t border-line p-5">
            {/* Full document navigation keeps public chat isolated from staff sign-in. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/admin" className="btn portal-button w-full sm:hidden"><ShieldCheck className="size-4" aria-hidden="true" />Portal</a>
            <Link href="/free-trial" onClick={() => setOpen(false)} className="btn btn-primary w-full">
              Book a 7-day free trial
            </Link>

          </div>
        </div>
      </div>
    </>
  );
}
