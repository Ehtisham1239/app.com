"use client";
import { useEffect } from "react";

const WIDGET_SRC = "https://app.hatchium.ai/widget.js?v=1784525654";
const EVENTS = ["pointerdown", "keydown", "touchstart", "scroll"];
const IDLE_FALLBACK_MS = 6000;

// Widget keys are public embed identifiers, not server-to-server API credentials.
// The widget is loaded on the first interaction (or after a short idle delay)
// so its script does not compete with the page's first paint.
// The embedded widget renders an unlabeled text box and icon-only send button. Give them accessible
// names once they exist (never overriding a label the widget sets itself); stop looking after 30 s.
const WIDGET_LABELS = { "nf-inp": "Type your message", "nf-snd": "Send message" };
function labelWidgetControls() {
  const apply = () => {
    let missing = 0;
    for (const [id, label] of Object.entries(WIDGET_LABELS)) {
      const el = document.getElementById(id);
      if (!el) { missing += 1; continue; }
      if (!el.getAttribute("aria-label") && !el.getAttribute("aria-labelledby") && !el.labels?.length && !el.textContent?.trim()) el.setAttribute("aria-label", label);
    }
    return missing === 0;
  };
  if (apply()) return;
  const observer = new MutationObserver(() => { if (apply()) observer.disconnect(); });
  observer.observe(document.body, { childList: true, subtree: true });
  setTimeout(() => observer.disconnect(), 30000);
}

export function HatchiumChat({ enabled, widgetKey }) {
  const valid = Boolean(enabled) && typeof widgetKey === "string" && /^[A-Za-z0-9_-]{10,200}$/.test(widgetKey);
  useEffect(() => {
    if (!valid) return undefined;
    let done = false;
    let timer;
    const load = () => {
      if (done) return;
      done = true;
      EVENTS.forEach((name) => window.removeEventListener(name, load));
      clearTimeout(timer);
      if (document.getElementById("oqc-hatchium-widget")) return;
      window.chatWidgetConfig = { key: widgetKey };
      const script = document.createElement("script");
      script.id = "oqc-hatchium-widget";
      script.src = WIDGET_SRC;
      script.async = true;
      document.body.appendChild(script);
      labelWidgetControls();
    };
    EVENTS.forEach((name) => window.addEventListener(name, load, { once: true, passive: true }));
    timer = setTimeout(load, IDLE_FALLBACK_MS);
    return () => { EVENTS.forEach((name) => window.removeEventListener(name, load)); clearTimeout(timer); };
  }, [valid, widgetKey]);
  return null;
}
