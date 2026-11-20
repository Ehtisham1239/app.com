import localFont from "next/font/local";
import { SITE_URL } from "@/lib/config";
import "./globals.css";

// Fontsource's own unicode ranges. On the fallback faces they stop a symbol that none of the
// Latin files contains (for example "≈" beside converted prices) from downloading them anyway:
// 133 KB of Inter on /pricing for one glyph the system font draws (19 Nov 2026).
// The font loader needs literal values, so the ranges are written out in each call.

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
  declarations: [{ prop: "unicode-range", value: "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD" }],
  adjustFontFallback: false,
});

// Keep extended Latin available for international names without preloading an
// 85KB subset on every English page. Missing glyphs select this family on demand.
const interExtended = localFont({
  src: [{ path: "../../node_modules/@fontsource-variable/inter/files/inter-latin-ext-wght-normal.woff2", weight: "300 900", style: "normal" }],
  variable: "--font-inter-extended",
  display: "swap",
  preload: false,
  declarations: [{ prop: "unicode-range", value: "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF" }],
  adjustFontFallback: false,
});

const outfit = localFont({
  src: [{ path: "../../public/fonts/oqc-outfit-text-v1.woff2", weight: "100 900", style: "normal" }],
  variable: "--font-outfit",
  display: "swap",
  // Preloaded (24 KB) so headings paint in Outfit: with the fallback the desktop home heading wrapped
  // to 2 lines, then 3 when Outfit arrived, moving the hero portrait (CLS 0.098, 19 Nov 2026).
  preload: true,
  adjustFontFallback: false,
});

const outfitLatin = localFont({
  src: [{ path: "../../node_modules/@fontsource-variable/outfit/files/outfit-latin-wght-normal.woff2", weight: "100 900", style: "normal" }],
  variable: "--font-outfit-latin",
  display: "swap",
  declarations: [{ prop: "unicode-range", value: "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD" }],
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

// Quranic verses (Uthmani text with its marks). Below the fold only, never preloaded (19 Nov 2026).
const amiriQuran = localFont({
  src: [{ path: "../../node_modules/@fontsource/amiri-quran/files/amiri-quran-arabic-400-normal.woff2", weight: "400", style: "normal" }],
  variable: "--font-amiri-quran",
  display: "swap",
  preload: false,
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
    <html lang="en-GB" data-scroll-behavior="smooth" className={`${inter.variable} ${interLatin.variable} ${interExtended.variable} ${outfit.variable} ${outfitLatin.variable} ${amiri.variable} ${amiriDisplay.variable} ${amiriQuran.variable}`} suppressHydrationWarning>
      <head>
        <script id="oqc-clarity" dangerouslySetInnerHTML={{ __html: `
          (function(c,l,a,r,i){
            if (/^\\/(?:admin|parents|api|auth)(?:\\/|$)/.test(l.location.pathname)) return;
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            c[a]("consentv2",{analytics_Storage:"denied",ad_Storage:"denied"});
            function loadTag() {
              if (/^\\/(?:admin|parents|api|auth)(?:\\/|$)/.test(l.location.pathname)) return;
              var t=l.createElement(r);
              t.async=true;
              t.fetchPriority="low";
              t.src="https://www.clarity.ms/tag/"+i;
              l.head.appendChild(t);
            }
            function scheduleTag() {
              if (typeof c.requestIdleCallback==="function") {
                c.requestIdleCallback(loadTag,{timeout:2500});
              } else {
                c.setTimeout(loadTag,1000);
              }
            }
            if (l.readyState==="complete") scheduleTag();
            else c.addEventListener("load",scheduleTag,{once:true});
          })(window,document,"clarity","script","zdo7gxbgkn");
        ` }} />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
