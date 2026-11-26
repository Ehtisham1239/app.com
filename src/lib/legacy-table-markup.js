// Shared legacy table recovery for both the CMS editor and public HTML renderer.
// It only promotes two-column blocks with bold-only headers and paired cell paragraphs.
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
export function restoreLegacyParagraphTables(html) {
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
