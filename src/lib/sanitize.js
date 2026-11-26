import sanitizeHtml from "sanitize-html";
import { restoreLegacyParagraphTables } from "./legacy-table-markup.js";

// Admin-written HTML is cleaned before it is rendered on the public site.
// Keep table structure and a narrow, safe set of presentation attributes so the
// public page preserves the rows, columns, widths and alignment authored in CMS.
const tableLength = /^(?:\d+(?:\.\d+)?(?:px|%|em|rem)|auto)$/i;
const tableAlignment = /^(?:left|center|right|justify|start|end)$/i;
const verticalAlignment = /^(?:top|middle|bottom)$/i;
const safeColour = /^(?:#[0-9a-f]{3,8}|(?:rgb|rgba|hsl|hsla)\([\d\s.,%]+\)|transparent)$/i;

const options = {
  allowedTags: [
    "p", "br", "h2", "h3", "h4", "strong", "b", "em", "i", "u", "s", "a", "ul", "ol", "li",
    "blockquote", "hr", "img", "figure", "figcaption", "span", "code", "pre", "table", "caption",
    "colgroup", "col", "thead", "tbody", "tfoot", "tr", "th", "td",
  ],
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
    img: ["src", "alt", "title", "width", "height", "loading", "decoding"],
    span: ["lang", "dir", "class"],
    p: ["dir", "lang"],
    table: ["style"],
    col: ["style", "width"],
    caption: ["style"],
    th: ["colspan", "rowspan", "style", { name: "scope", values: ["col", "row", "colgroup", "rowgroup"] }],
    td: ["colspan", "rowspan", "style"],
  },
  allowedStyles: {
    table: {
      width: [tableLength],
      "border-collapse": [/^(?:collapse|separate)$/i],
    },
    col: {
      width: [tableLength],
    },
    caption: {
      "text-align": [tableAlignment],
    },
    th: {
      width: [tableLength],
      "text-align": [tableAlignment],
      "vertical-align": [verticalAlignment],
      "background-color": [safeColour],
      color: [safeColour],
      "font-weight": [/^(?:normal|bold|[1-9]00)$/i],
      "font-style": [/^(?:normal|italic)$/i],
      "text-decoration": [/^(?:none|underline|line-through)$/i],
    },
    td: {
      width: [tableLength],
      "text-align": [tableAlignment],
      "vertical-align": [verticalAlignment],
      "background-color": [safeColour],
      color: [safeColour],
      "font-weight": [/^(?:normal|bold|[1-9]00)$/i],
      "font-style": [/^(?:normal|italic)$/i],
      "text-decoration": [/^(?:none|underline|line-through)$/i],
    },
  },
  allowedClasses: { span: ["arabic"] },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  transformTags: {
    a: (tagName, attribs) => {
      const external = /^https?:\/\//i.test(attribs.href || "");
      return {
        tagName,
        attribs: external ? { ...attribs, target: "_blank", rel: "noopener noreferrer" } : attribs,
      };
    },
    img: (tagName, attribs) => ({ tagName, attribs: { ...attribs, alt: attribs.alt ?? "", loading: "lazy", decoding: "async" } }),
  },
};

function addResponsiveTableRegions(html) {
  let depth = 0;
  let tableStart = 0;
  let copiedUntil = 0;
  let tableNumber = 0;
  let result = "";

  for (const tag of html.matchAll(/<(\/?)table\b[^>]*>/gi)) {
    if (!tag[1]) {
      if (depth === 0) tableStart = tag.index;
      depth += 1;
    } else if (depth > 0) {
      depth -= 1;
      if (depth !== 0) continue;

      const end = tag.index + tag[0].length;
      result += html.slice(copiedUntil, tableStart);
      result += '<div class="article-table-scroll" role="region" aria-label="Scrollable table ' + ++tableNumber + '" tabindex="0">' + html.slice(tableStart, end) + "</div>";
      copiedUntil = end;
    }
  }

  return result + html.slice(copiedUntil);
}

export function cleanHtml(html = "") {
  const safeHtml = sanitizeHtml(html || "", options);
  return addResponsiveTableRegions(restoreLegacyParagraphTables(safeHtml));
}
