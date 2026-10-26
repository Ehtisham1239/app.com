"use client";
import { useEffect } from "react";

const WIDGET_SRC = "https://app.hatchium.ai/widget.js?v=1784525654";
const EVENTS = ["pointerdown", "keydown", "touchstart", "scroll"];
const IDLE_FALLBACK_MS = 6000;

// Widget keys are public embed identifiers, not server-to-server API credentials.
// The widget is loaded on the first interaction (or after a short idle delay)
// so its script does not compete with the page's first paint.
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
    };
    EVENTS.forEach((name) => window.addEventListener(name, load, { once: true, passive: true }));
    timer = setTimeout(load, IDLE_FALLBACK_MS);
    return () => { EVENTS.forEach((name) => window.removeEventListener(name, load)); clearTimeout(timer); };
  }, [valid, widgetKey]);
  return null;
}
