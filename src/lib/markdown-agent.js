import TurndownService from "turndown";

// Markdown copy of public pages for AI agents that send `Accept: text/markdown`.
// next.config.mjs rewrites those requests to /md/<path>; the route fetches the page's own HTML and converts it.
const BLOCKED = /^\/(?:admin|api|auth|parents|login|md|_next|gone)(?:\/|$)/;

/** Only plain public page paths: letters, digits, "-", "_" and "/", no file extensions, no staff or API areas. */
export function markdownPathAllowed(path) {
  return typeof path === "string"
    && path.length <= 200
    && /^\/[A-Za-z0-9/_-]*$/.test(path)
    && !path.includes("//")
    && !BLOCKED.test(path);
}

const service = new TurndownService({ headingStyle: "atx", bulletListMarker: "-", codeBlockStyle: "fenced" });
service.remove(["script", "style", "noscript", "svg", "iframe", "form", "button", "nav", "template"]);

/** Converts a page's HTML to Markdown: the <main> content, links made absolute, no scripts, nav or forms. */
export function htmlToMarkdown(html, { url, origin }) {
  const title = (/<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1] || "").replace(/\s+/g, " ").replace(/&amp;/g, "&").trim();
  const main = /<main[^>]*>([\s\S]*?)<\/main>/i.exec(html)?.[1] ?? /<body[^>]*>([\s\S]*?)<\/body>/i.exec(html)?.[1] ?? html;
  const absolute = main.replace(/(href|src)="\/(?!\/)([^"]*)"/g, (_m, attr, rest) => `${attr}="${origin}/${rest}"`);
  const body = service.turndown(absolute).replace(/\n{3,}/g, "\n\n").trim();
  return `${title ? `# ${title}\n\n` : ""}Source: ${url}\n\n${body}\n`.slice(0, 400000);
}
