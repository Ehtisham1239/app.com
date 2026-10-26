import localFont from "next/font/local";
import { Toaster } from "sonner";
import { SITE_URL } from "@/lib/config";
import "./globals.css";

const inter = localFont({
  src: [
    { path: "../../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2", weight: "300 900", style: "normal" },
    { path: "../../node_modules/@fontsource-variable/inter/files/inter-latin-ext-wght-normal.woff2", weight: "300 900", style: "normal" },
  ],
  variable: "--font-inter",
  display: "swap",
});

const outfit = localFont({
  src: [{ path: "../../node_modules/@fontsource-variable/outfit/files/outfit-latin-wght-normal.woff2", weight: "100 900", style: "normal" }],
  variable: "--font-outfit",
  display: "swap",
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

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Online Quran College — Live 1-on-1 Online Quran Classes",
    template: "%s · Online Quran College",
  },
  description:
    "Learn Quran online with live one-to-one classes: Noorani Qaida, Tajweed, Hifz, Arabic and Islamic studies for kids and adults. Female & male teachers. 7-day free trial.",
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
    <html lang="en-GB" data-scroll-behavior="smooth" className={`${inter.variable} ${outfit.variable} ${amiri.variable}`} suppressHydrationWarning>
      <body>
        {children}
        <Toaster position="top-center" richColors closeButton toastOptions={{ style: { fontFamily: "var(--font-sans)" } }} />
      </body>
    </html>
  );
}
