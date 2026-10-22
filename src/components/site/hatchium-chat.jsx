import Script from "next/script";
import { safeJsonLd } from "@/lib/seo";

// Widget keys are public embed identifiers, not server-to-server API credentials.
export function HatchiumChat({ enabled, widgetKey }) {
  if (!enabled || typeof widgetKey !== "string" || !/^[A-Za-z0-9_-]{10,200}$/.test(widgetKey)) return null;
  return <>
    <Script id="oqc-hatchium-config" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: `window.chatWidgetConfig = ${safeJsonLd({ key: widgetKey })};` }} />
    <Script id="oqc-hatchium-widget" src="https://app.hatchium.ai/widget.js?v=1784525654" strategy="afterInteractive" async />
  </>;
}
