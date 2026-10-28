import localFont from "next/font/local";
import { SITE_URL } from "@/lib/config";
import "./globals.css";

const inter = localFont({
  src: [{ path: "../../public/fonts/oqc-inter-text-v1.woff2", weight: "300 900", style: "normal" }],
  variable: "--font-inter",
  display: "swap",
  adjustFontFallback: false,
});

// Uncommon Latin characters retain the original design without downloading
// its complete face on every English page.
const interLatin = localFont({
  src: [
    { path: "../../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2", weight: "300 900", style: "normal" },
  ],
  variable: "--font-inter-latin",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
});

// Keep extended Latin available for international names without preloading an
// 85KB subset on every English page. Missing glyphs select this family on demand.
const interExtended = localFont({
  src: [{ path: "../../node_modules/@fontsource-variable/inter/files/inter-latin-ext-wght-normal.woff2", weight: "300 900", style: "normal" }],
  variable: "--font-inter-extended",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
});

const outfit = localFont({
  src: [{ path: "../../public/fonts/oqc-outfit-text-v1.woff2", weight: "100 900", style: "normal" }],
  variable: "--font-outfit",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
});

const outfitLatin = localFont({
  src: [{ path: "../../node_modules/@fontsource-variable/outfit/files/outfit-latin-wght-normal.woff2", weight: "100 900", style: "normal" }],
  variable: "--font-outfit-latin",
  display: "swap",
  // Headings swap in after first paint; not preloading keeps early bandwidth for the hero image.
  preload: false,
});

const amiri = localFont({
  src: [
    { path: "../../node_modules/@fontsource/amiri/files/amiri-arabic-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../node_modules/@fontsource/amiri/files/amiri-arabic-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-amiri",
  display: "swap",
  preload: false,
});

// Small display faces retain the original shaping and metrics. Uncommon CMS
// characters still fall back to the complete Amiri fonts above.
const amiriDisplay = localFont({
  src: [
    { path: "../../public/fonts/oqc-arabic-display-400.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/oqc-arabic-display-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-amiri-display",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
});

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Online Quran College — Live 1-on-1 Online Quran Classes",
    template: "%s · Online Quran College",
  },
  description:
    "Learn Quran online with live one-to-one classes: Noorani Qaida, Tajweed, Hifz, Arabic and Islamic studies for kids and adults. Female & male teachers. 3-day free trial.",
  applicationName: "Online Quran College",
  robots: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  alternates: { types: { "application/rss+xml": [{ url: "/blog/feed.xml", title: "Online Quran College articles" }] } },
  openGraph: { type: "website", siteName: "Online Quran College", locale: "en_GB" },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false },
};

export const viewport = {
  themeColor: "#0c6c0c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-GB" data-scroll-behavior="smooth" className={`${inter.variable} ${interLatin.variable} ${interExtended.variable} ${outfit.variable} ${outfitLatin.variable} ${amiri.variable} ${amiriDisplay.variable}`} suppressHydrationWarning>
      <body>
        {children}
      </body>
    </html>
  );
}
