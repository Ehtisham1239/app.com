import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Online Quran College — live one-to-one online Quran classes";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const [marcellus, mark] = await Promise.all([
    readFile(join(process.cwd(), "node_modules/@fontsource/marcellus/files/marcellus-latin-400-normal.woff")),
    readFile(join(process.cwd(), "public/brand/mark.png"), "base64"),
  ]);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#06261b", color: "#fff", fontFamily: "Marcellus", position: "relative" }}>
        <div style={{ position: "absolute", inset: 28, border: "2px solid rgba(213,184,116,0.45)", borderRadius: 28, display: "flex" }} />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 90px", width: 760 }}>
          <div style={{ fontSize: 24, letterSpacing: 6, color: "#d5b874", display: "flex" }}>ONLINE QURAN COLLEGE</div>
          <div style={{ fontSize: 66, lineHeight: 1.08, marginTop: 24, display: "flex" }}>Live 1-on-1 online Quran classes for every age</div>
          <div style={{ fontSize: 28, marginTop: 30, color: "rgba(255,255,255,0.75)", display: "flex" }}>Noorani Qaida · Tajweed · Hifz · Arabic · 7-day free trial</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 400 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 330, height: 330, borderRadius: 999, background: "#fbf6e9", border: "6px solid #c7a35a" }}>
            <img src={`data:image/png;base64,${mark}`} width={250} height={250} alt="" />
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Marcellus", data: marcellus, style: "normal", weight: 400 }] },
  );
}
