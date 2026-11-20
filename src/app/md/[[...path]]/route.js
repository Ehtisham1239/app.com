import { SITE_URL } from "@/lib/config";
import { htmlToMarkdown, markdownPathAllowed } from "@/lib/markdown-agent";

export const dynamic = "force-dynamic";

// Never cached by a CDN: the same address also serves HTML to browsers.
const HEADERS = { "Cache-Control": "no-store", Vary: "Accept", "X-Robots-Tag": "noindex", "X-Content-Type-Options": "nosniff" };
const cache = new Map();
const TTL = 5 * 60 * 1000;

export async function GET(_request, { params }) {
  const { path = [] } = await params;
  const pathname = `/${path.filter(Boolean).join("/")}`;
  if (!markdownPathAllowed(pathname)) return new Response("Not found", { status: 404, headers: { ...HEADERS, "Content-Type": "text/plain; charset=utf-8" } });
  const hit = cache.get(pathname);
  if (hit && Date.now() - hit.at < TTL) return new Response(hit.body, { headers: { ...HEADERS, "Content-Type": "text/markdown; charset=utf-8" } });
  let upstream;
  try {
    upstream = await fetch(`${SITE_URL}${pathname}`, { headers: { Accept: "text/html", "User-Agent": "OQC-Markdown/1.0" }, redirect: "manual", signal: AbortSignal.timeout(8000) });
  } catch {
    return new Response("Markdown copy unavailable", { status: 502, headers: { ...HEADERS, "Content-Type": "text/plain; charset=utf-8" } });
  }
  const type = upstream.headers.get("content-type") || "";
  if (upstream.status !== 200 || !type.includes("text/html")) {
    return new Response("Not found", { status: upstream.status === 200 ? 502 : 404, headers: { ...HEADERS, "Content-Type": "text/plain; charset=utf-8" } });
  }
  const body = htmlToMarkdown(await upstream.text(), { url: `${SITE_URL}${pathname === "/" ? "" : pathname}`, origin: SITE_URL });
  if (cache.size > 200) cache.clear();
  cache.set(pathname, { at: Date.now(), body });
  return new Response(body, { headers: { ...HEADERS, "Content-Type": "text/markdown; charset=utf-8" } });
}
