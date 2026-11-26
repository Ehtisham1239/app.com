import sanitizeHtml from "sanitize-html";

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
    img: ["src", "alt", "title", "width", "height", "loading"],
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
    img: (tagName, attribs) => ({ tagName, attribs: { ...attribs, loading: "lazy" } }),
  },
};

function paragraphParts(token) {
  const match = token.match(/^<p\b[^>]*>([\s\S]*?)<\/p>$/i);
  return match ? { inner: match[1] } : null;
}

function boldOnly(inner) {
  const match = inner.trim().match(/^<(strong|b)\b[^>]*>([\s\S]*?)<\/\1>$/i);
  return match ? match[2] : null;
}

function startsWithBoldLabel(inner) {
  const value = inner.trim();
  return /^<(strong|b)\b[^>]*>[\s\S]*?<\/\1>/i.test(value) && !boldOnly(value);
}

function looksLikeProse(inner) {
  const text = inner
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
  return /[.!?]["'’”)]?$/.test(text) || text.length > 160;
}

function nextMeaningfulToken(tokens, start) {
  for (let index = start; index < tokens.length; index += 1) {
    if (tokens[index].trim()) return index;
  }
  return -1;
}

// Older CMS entries sometimes contain a table pasted into the editor as a
// sequence of bold column labels followed by alternating cell paragraphs.
// Recover only unambiguous two-column blocks; leave ordinary prose untouched.
function convertLegacyParagraphTables(html) {
  const tokens = html.split(/(<p\b[^>]*>[\s\S]*?<\/p>)/gi);

  for (let index = 0; index < tokens.length; index += 1) {
    const firstHeader = paragraphParts(tokens[index]);
    if (!firstHeader) continue;
    const firstLabel = boldOnly(firstHeader.inner);
    if (!firstLabel) continue;

    const secondIndex = nextMeaningfulToken(tokens, index + 1);
    const secondHeader = secondIndex >= 0 ? paragraphParts(tokens[secondIndex]) : null;
    const secondLabel = secondHeader ? boldOnly(secondHeader.inner) : null;
    if (!secondLabel) continue;

    const cells = [];
    let lastCellIndex = secondIndex;
    let cursor = secondIndex + 1;
    while (true) {
      const cellIndex = nextMeaningfulToken(tokens, cursor);
      if (cellIndex < 0) break;
      const cell = paragraphParts(tokens[cellIndex]);
      if (!cell || startsWithBoldLabel(cell.inner) || looksLikeProse(cell.inner)) break;
      cells.push(cell.inner);
      lastCellIndex = cellIndex;
      cursor = cellIndex + 1;
    }

    if (cells.length < 4 || cells.length % 2 !== 0) continue;

    const rows = [];
    for (let cell = 0; cell < cells.length; cell += 2) {
      rows.push(`<tr><td>${cells[cell]}</td><td>${cells[cell + 1]}</td></tr>`);
    }
    const table = `<table><thead><tr><th scope="col">${firstLabel}</th><th scope="col">${secondLabel}</th></tr></thead><tbody>${rows.join("")}</tbody></table>`;
    tokens[index] = table;
    for (let clear = index + 1; clear <= lastCellIndex; clear += 1) tokens[clear] = "";
    index = lastCellIndex;
  }

  return tokens.join("");
}

function addResponsiveTableRegions(html) {
  let tableNumber = 0;
  return html.replace(/<table\b[^>]*>[\s\S]*?<\/table>/gi, (table) => {
    tableNumber += 1;
    return `<div class="article-table-scroll" role="region" aria-label="Scrollable table ${tableNumber}" tabindex="0">${table}</div>`;
  });
}

export function cleanHtml(html = "") {
  const safeHtml = sanitizeHtml(html || "", options);
  return addResponsiveTableRegions(convertLegacyParagraphTables(safeHtml));
}
