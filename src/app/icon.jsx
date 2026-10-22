import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = { width: 256, height: 256 };
export const contentType = "image/png";

// Favicon generated at build time from the brand mark
export default async function Icon() {
  const mark = await readFile(join(process.cwd(), "public/brand/mark.png"), "base64");
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#ffffff", borderRadius: 56 }}>
        <img src={`data:image/png;base64,${mark}`} width={216} height={216} alt="" />
      </div>
    ),
    size,
  );
}
