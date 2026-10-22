"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronDown, Menu, MessageCircle, X } from "lucide-react";
import { clsx } from "clsx";

function isActive(pathname, href) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function SiteHeader({ menu, courses, whatsappHref, brandName }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [coursesOpen, setCoursesOpen] = useState(false);
  const closeTimer = useRef(null);

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
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

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
        "sticky top-0 z-40 transition-[background-color,box-shadow,border-color] duration-200",
        scrolled ? "border-b border-line bg-white/90 shadow-[0_8px_30px_-18px_rgb(13_58_43/0.35)] backdrop-blur-md" : "border-b border-transparent bg-white/90 backdrop-blur-sm",
      )}
    >
      <div className="page-wrap flex h-[4.5rem] items-center gap-6">
        <Link href="/" className="group flex shrink-0 items-center gap-3" aria-label={`${brandName} — home`}>
          <img src="/brand/logo.webp" alt={brandName} width={160} height={64} className="h-14 w-auto max-w-[8rem] object-contain sm:max-w-[10rem]" />
        </Link>

        <nav className="ml-auto hidden items-center gap-1 xl:flex" aria-label="Main">
          {menu.map((item) =>
            item.href === "/courses" && courses.length > 0 ? (
              <div key={item.href} className="relative" onMouseEnter={openCourses} onMouseLeave={closeCoursesSoon}>
                <button
                  type="button"
                  className={clsx(
                    "flex items-center gap-1 rounded-full px-3.5 py-2 text-[0.95rem] font-medium transition-colors",
                    isActive(pathname, item.href) ? "text-leaf-700" : "text-ink-soft hover:text-ink",
                  )}
                  aria-expanded={coursesOpen}
                  aria-haspopup="true"
                  onClick={() => setCoursesOpen((v) => !v)}
                  onFocus={openCourses}
                >
                  {item.label}
                  <ChevronDown className={clsx("size-4 transition-transform", coursesOpen && "rotate-180")} aria-hidden="true" />
                </button>
                <div
                  className={clsx(
                    "absolute left-1/2 top-full w-[34rem] -translate-x-1/2 pt-3 transition-all duration-150",
                    coursesOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0",
                  )}
                >
                  <div className="surface overflow-hidden p-2 shadow-[var(--shadow-float)]">
                    <div className="grid grid-cols-2 gap-1">
                      {courses.map((c) => (
                        <Link
                          key={c.slug}
                          href={`/courses/${c.slug}`}
                          className="rounded-xl px-3.5 py-3 transition-colors hover:bg-leaf-50"
                          onBlur={closeCoursesSoon}
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
          <Link href="/admin" className="btn btn-outline whitespace-nowrap text-xs sm:text-sm">CMS Portal</Link>
          {whatsappHref && (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden size-11 items-center justify-center rounded-full border border-line-strong text-leaf-700 transition-colors hover:border-leaf-600 hover:bg-leaf-50 sm:flex"
              aria-label="Chat with us on WhatsApp"
            >
              <MessageCircle className="size-5" aria-hidden="true" />
            </a>
          )}
          <Link href="/free-trial" className="btn btn-primary hidden sm:inline-flex">
            Free trial
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <button
            type="button"
            className="flex size-11 items-center justify-center rounded-full border border-line-strong text-ink xl:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
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
            "absolute inset-y-0 right-0 flex w-[min(22rem,88vw)] flex-col bg-paper shadow-2xl transition-transform duration-300",
            open ? "translate-x-0" : "translate-x-full",
          )}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <div className="flex h-[4.5rem] items-center justify-between border-b border-line px-5">
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
                  className={clsx(
                    "flex items-center justify-between rounded-xl px-4 py-3 text-[1.02rem] font-medium",
                    isActive(pathname, item.href) ? "bg-leaf-50 text-leaf-700" : "text-ink hover:bg-leaf-50",
                  )}
                >
                  {item.label}
                </Link>
                {item.href === "/courses" && courses.length > 0 && (
                  <div className="mb-2 ml-4 border-l-2 border-gold-300 pl-3">
                    {courses.map((c) => (
                      <Link key={c.slug} href={`/courses/${c.slug}`} className="block rounded-lg px-3 py-2 text-[0.92rem] text-ink-soft hover:text-leaf-700">
                        {c.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
          <div className="space-y-2 border-t border-line p-5">
            <Link href="/locations" className="btn btn-outline w-full">Countries & cities</Link>
            <Link href="/free-trial" className="btn btn-primary w-full">
              Book a 7-day free trial
            </Link>
            {whatsappHref && (
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn btn-outline w-full">
                <MessageCircle className="size-4" aria-hidden="true" />
                WhatsApp us
              </a>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
