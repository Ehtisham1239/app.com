"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Adds gentle, one-time reveals to non-home public pages. Content is never
// hidden before JavaScript runs; the hero/LCP area and forms stay untouched.
export function SiteMotion() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.querySelector("main[data-site-motion]");
    if (!root || root.querySelector("[data-home-motion]")) return;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches || !("IntersectionObserver" in window)) return;

    const candidates = [
      ...root.querySelectorAll(
        "section h1, section h2, section > .page-wrap > h3, section a.surface, section figure"
      ),
    ];
    const targets = candidates.filter((node) => !node.closest("form, a.surface *"));
    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const element = entry.target;
          // Keep the initial viewport and likely LCP content completely still.
          if (element.getBoundingClientRect().top < window.innerHeight * 0.82) {
            observer.unobserve(element);
            return;
          }
          element.style.setProperty("--site-reveal-delay", "0ms");
          element.classList.add("site-reveal");
          observer.unobserve(element);
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -6% 0px" }
    );

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
