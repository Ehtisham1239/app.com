// Honest "410 Gone" for old WordPress URLs that have no equivalent page on this site
// (quiz pages, old landing pages, wp-json, spam date permalinks). next.config.mjs rewrites
// them here. 410 tells Google to drop the URL sooner than a 404 and it is never indexable.
export const dynamic = "force-static";

const body = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Page removed | Online Quran College</title></head><body style="font-family:system-ui,sans-serif;max-width:32rem;margin:4rem auto;padding:0 1rem;line-height:1.6"><h1>This page has been removed</h1><p>It is no longer part of Online Quran College. <a href="/">Go to the home page</a> or <a href="/courses">browse our courses</a>.</p></body></html>`;

const respond = () => new Response(body, {
  status: 410,
  headers: { "Content-Type": "text/html; charset=utf-8", "X-Robots-Tag": "noindex", "Cache-Control": "public, max-age=0, s-maxage=3600" },
});
export const GET = respond;
export const HEAD = respond;
