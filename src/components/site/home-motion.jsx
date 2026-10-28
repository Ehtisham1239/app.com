"use client";
import { useEffect } from "react";

// One-time reveals: server-rendered content remains visible without JavaScript.
export function HomeMotion() {
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const root = document.querySelector("[data-home-motion]");
    if (!root || !("IntersectionObserver" in window)) return;
    let observer;
    const nodes = [...root.querySelectorAll("section:not(.home-hero) h2, section .surface, section figure, [data-motion-item]")];
    const targets = nodes.filter(node => !node.parentElement.closest(".surface, [data-motion-item]"));
    function setup() {
      observer?.disconnect();
      nodes.forEach(node => { node.classList.remove("home-reveal"); node.style.removeProperty("--reveal-delay"); });
      if (media.matches) return;
      const initial = new WeakSet();
      observer = new IntersectionObserver(entries => {
        const visible = entries.filter(entry => {
          if (!initial.has(entry.target)) {
            initial.add(entry.target);
            // IntersectionObserver supplies layout snapshots without a forced
            // synchronous measurement after the class/style writes above.
            // Content already on screen must never replay its entrance.
            if (entry.boundingClientRect.top < (entry.rootBounds?.bottom ?? window.innerHeight)) {
              observer.unobserve(entry.target);
              return false;
            }
          }
          return entry.isIntersecting;
        });
        visible.forEach((entry, index) => {
          entry.target.style.setProperty("--reveal-delay", `${Math.min(index, 4) * 65}ms`);
          entry.target.classList.add("home-reveal");
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.12 });
      // Avoid re-animating the first screen or nesting two transforms on one card.
      targets.forEach(node => observer.observe(node));
    }
    setup();
    media.addEventListener("change", setup);
    return () => { observer?.disconnect(); media.removeEventListener("change", setup); };
  }, []);
  return null;
}
