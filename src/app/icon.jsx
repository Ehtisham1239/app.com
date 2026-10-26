import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// 96px is a multiple of 48 (Google Search favicon rule) and keeps the file small.
export const size = { width: 96, height: 96 };
export const contentType = "image/png";

// Favicon generated at build time from the brand mark
export default async function Icon() {
  const mark = await readFile(join(process.cwd(), "public/brand/mark.png"), "base64");
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#ffffff", borderRadius: 21 }}>
        <img src={`data:image/png;base64,${mark}`} width={81} height={81} alt="" />
      </div>
    ),
    size,
  );
}
