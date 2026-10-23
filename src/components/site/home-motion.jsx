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
    function setup() {
      observer?.disconnect();
      nodes.forEach(node => { node.classList.remove("home-reveal"); node.style.removeProperty("--reveal-delay"); });
      if (media.matches) return;
      observer = new IntersectionObserver(entries => {
        const visible = entries.filter(entry => entry.isIntersecting);
        visible.forEach((entry, index) => {
          entry.target.style.setProperty("--reveal-delay", `${Math.min(index, 4) * 65}ms`);
          entry.target.classList.add("home-reveal");
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.12 });
      // Avoid re-animating the first screen or nesting two transforms on one card.
      nodes.filter(node => !node.parentElement.closest(".surface, [data-motion-item]") && node.getBoundingClientRect().top >= innerHeight).forEach(node => observer.observe(node));
    }
    setup();
    media.addEventListener("change", setup);
    return () => { observer?.disconnect(); media.removeEventListener("change", setup); };
  }, []);
  return null;
}
