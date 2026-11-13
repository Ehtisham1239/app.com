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
        "section h1, section h2, section > .page-wrap > h3, section a.surface, section div.surface, section article.surface, section li.surface, section figure"
      ),
    ];
    const targets = candidates.filter(
      (node) => !node.closest("form, a.surface *, [role='dialog'], [aria-live]") && !node.querySelector("form")
    );
    // Cards that share a parent (a grid or list row) arrive in a short stagger.
    const siblingIndex = new Map();
    const revealSteps = new WeakMap();
    targets.forEach((node) => {
      const parent = node.parentElement;
      const index = siblingIndex.get(parent) ?? 0;
      siblingIndex.set(parent, index + 1);
      revealSteps.set(node, Math.min(index, 5));
    });
    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const initialViewportCutoff = window.innerHeight * 0.82;
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const element = entry.target;
          // Keep the initial viewport and likely LCP content completely still.
          // Use the observer's layout snapshot so earlier reveal writes cannot force a layout read.
          if (entry.boundingClientRect.top < initialViewportCutoff) {
            observer.unobserve(element);
            return;
          }
          const step = revealSteps.get(element) ?? 0;
          element.style.setProperty("--site-reveal-delay", `${step * 70}ms`);
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
