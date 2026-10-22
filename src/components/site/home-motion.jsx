"use client";
import { useEffect } from "react";

// Progressive enhancement: content stays readable without JS and with reduced motion.
export function HomeMotion() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) if (entry.isIntersecting) {
        entry.target.classList.add("home-reveal");
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.08 });
    document.querySelectorAll("[data-home-motion] > section:not(:first-of-type)").forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);
  return null;
}
