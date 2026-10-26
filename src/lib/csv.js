// Staff exports are for opening in spreadsheet apps. Treat untrusted text as
// text even when it starts with a formula, whitespace, or a full-width operator.
// A quoted tab prefix is retained by Excel on save/reopen; CSV consumers will
// see that prefix as part of the value. Never apply it to actual numeric values.
export function csvCell(value) {
  if (value === null || value === undefined) return '""';
  let text = Array.isArray(value) ? value.join("; ") : typeof value === "object" ? JSON.stringify(value) : String(value);
  if (typeof value !== "number" && (/^[\t\r\n]/.test(text) || /^\s*[=+\-@＝＋－＠]/u.test(text))) text = `\t${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export function serializeCsv(rows, columns) {
  return "\uFEFF" + [
    columns.map(column => csvCell(column.label)).join(","),
    ...rows.map(row => columns.map(column => csvCell(typeof column.value === "function" ? column.value(row) : row[column.key])).join(",")),
  ].join("\r\n");
}
