import sitemap from "../sitemap.js";

// Plain-text sitemap (one absolute URL per line, UTF-8), as accepted by Google
// and Bing. It lists exactly the URLs in /sitemap.xml so the two never drift.
export const revalidate = 3600;

export async function GET() {
  const urls = [...new Set((await sitemap()).map((entry) => entry.url))];
  return new Response(`${urls.join("\n")}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=0, s-maxage=3600" },
  });
}
