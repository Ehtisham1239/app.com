import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
export const alt = "Online Quran College — live one-to-one online Quran classes";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default async function OpengraphImage() {
  const logo = await readFile(join(process.cwd(), "public/brand/college-logo.png"), "base64");
  return new ImageResponse(<div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", background: "#f5faf1", color: "#0c6c0c", fontFamily: "sans-serif", padding: 70 }}><div style={{ display: "flex", flexDirection: "column", width: 740 }}><div style={{ fontSize: 24, color: "#0c6c0c", display: "flex" }}>ONLINE QURAN COLLEGE</div><div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.15, marginTop: 28, display: "flex" }}>Live 1-on-1 Quran classes for every age</div><div style={{ fontSize: 28, marginTop: 32, color: "#4b5563", display: "flex" }}>Noorani Qaida · Tajweed · Hifz · Arabic</div><div style={{ fontSize: 25, color: "#0c6c0c", marginTop: 28, display: "flex" }}>Learn from home. Grow with confidence.</div></div><img src={`data:image/png;base64,${logo}`} width={270} height={270} alt="Online Quran College" /></div>, size);
}
