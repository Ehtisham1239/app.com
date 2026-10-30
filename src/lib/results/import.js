// Spreadsheet import for student results (docs/results-portal/ARCHITECTURE.md §4).
// Parsing runs in the browser for the preview only; the database re-validates every
// row (public.results_validate_batch) and is the authority. No dependencies: CSV is
// parsed per RFC 4180 and .xlsx is read from its zip with the platform's inflate.

export const MAX_FILE_BYTES = 2 * 1024 * 1024;
export const MAX_ROWS = 2000;
const MAX_XLSX_UNPACKED = 24 * 1024 * 1024;

export const TEMPLATE_COLUMNS = [
  { key: "assessment_code", label: "assessment_code", required: false, note: "Must match the assessment you choose" },
  { key: "student_code", label: "student_code", required: true, note: "For example OQC-00012. Students are never created by an import" },
  { key: "student_name", label: "student_name", required: false, note: "Checked against the student code" },
  { key: "marks_obtained", label: "marks_obtained", required: true, note: "A number from 0 to the assessment's maximum" },
  { key: "total_marks", label: "total_marks", required: false, note: "If given, must equal the assessment's maximum" },
  { key: "grade", label: "grade", required: false, note: "Leave blank to use the assessment's grade bands" },
  { key: "teacher_remarks", label: "teacher_remarks", required: false, note: "Plain text, up to 1,000 characters" },
];

const ALIASES = {
  assessment_code: ["assessment_code", "assessment", "assessment code", "exam code", "test code"],
  student_code: ["student_code", "student code", "student id", "student_id", "roll no", "roll number", "code"],
  student_name: ["student_name", "student name", "name", "full name"],
  marks_obtained: ["marks_obtained", "marks obtained", "marks", "score", "obtained"],
  total_marks: ["total_marks", "total marks", "total", "max marks", "maximum marks", "out of"],
  grade: ["grade"],
  teacher_remarks: ["teacher_remarks", "teacher remarks", "remarks", "comments", "teacher comments"],
};

// Columns that must never appear in a results sheet: parent access codes are credentials.
const FORBIDDEN = /client[\s_-]*code|access[\s_-]*code|password|pin\b/i;

const LIMITS = { assessment_code: 40, student_code: 40, student_name: 160, marks_obtained: 20, total_marks: 20, grade: 20, teacher_remarks: 1000 };

const normalizeHeader = (value) => String(value ?? "").replace(/^﻿/, "").trim().toLowerCase().replace(/[\s_]+/g, " ");

// RFC 4180: quoted fields, doubled quotes, CRLF/LF/CR line ends, optional BOM.
export function parseCsv(text) {
  const source = String(text ?? "").replace(/^﻿/, "");
  const delimiter = detectDelimiter(source);
  const rows = [];
  let row = [], field = "", quoted = false, i = 0;
  while (i < source.length) {
    const ch = source[i];
    if (quoted) {
      if (ch === '"') {
        if (source[i + 1] === '"') { field += '"'; i += 2; continue; }
        quoted = false; i++; continue;
      }
      field += ch; i++; continue;
    }
    if (ch === '"' && field === "") { quoted = true; i++; continue; }
    if (ch === delimiter) { row.push(field); field = ""; i++; continue; }
    if (ch === "\r" || ch === "\n") {
      row.push(field); rows.push(row); row = []; field = "";
      i += ch === "\r" && source[i + 1] === "\n" ? 2 : 1;
      if (rows.length > MAX_ROWS + 1) throw new Error(`The file has more than ${MAX_ROWS} rows. Split it into smaller files.`);
      continue;
    }
    field += ch; i++;
  }
  if (quoted) throw new Error("The file has an unclosed quotation mark. Re-save it as CSV from Excel or Google Sheets.");
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

// Excel in some locales saves "CSV" with semicolons.
function detectDelimiter(text) {
  const firstLine = text.slice(0, text.search(/\r|\n|$/));
  const count = (ch) => firstLine.split(ch).length - 1;
  return count(";") > count(",") && count(";") > count("\t") ? ";" : count("\t") > count(",") ? "\t" : ",";
}

// ---------------------------------------------------------------------------
// .xlsx: a zip of XML parts. Reads the first worksheet's cell values only
// (no formulas are evaluated, no macros, no external links).
// ---------------------------------------------------------------------------
export async function parseXlsx(buffer) {
  const bytes = new Uint8Array(buffer);
  const entries = readZipDirectory(bytes);
  const read = async (name) => {
    const entry = entries.get(name);
    return entry ? new TextDecoder().decode(await inflateEntry(bytes, entry)) : null;
  };
  const workbook = await read("xl/workbook.xml");
  if (!workbook) throw new Error("This is not an Excel workbook (.xlsx). Save it as .xlsx or CSV and try again.");
  const firstSheet = /<(?:\w+:)?sheet\b[^>]*\br:id="([^"]+)"/.exec(workbook)?.[1] ?? /<(?:\w+:)?sheet\b[^>]*\bid="([^"]+)"/.exec(workbook)?.[1];
  const rels = (await read("xl/_rels/workbook.xml.rels")) || "";
  let target = null;
  for (const m of rels.matchAll(/<Relationship\b[^>]*>/g)) {
    if (attr(m[0], "Id") === firstSheet) target = attr(m[0], "Target");
  }
  const sheetPath = target ? (target.startsWith("/") ? target.slice(1) : `xl/${target.replace(/^\.\//, "")}`) : "xl/worksheets/sheet1.xml";
  const sheet = await read(sheetPath) ?? await read("xl/worksheets/sheet1.xml");
  if (!sheet) throw new Error("The workbook has no readable worksheet.");
  const shared = [];
  const sst = await read("xl/sharedStrings.xml");
  if (sst) for (const m of sst.matchAll(/<(?:\w+:)?si\b[^>]*>([\s\S]*?)<\/(?:\w+:)?si>/g)) shared.push(textRuns(m[1]));

  const rows = [];
  for (const rowMatch of sheet.matchAll(/<(?:\w+:)?row\b[^>]*>([\s\S]*?)<\/(?:\w+:)?row>/g)) {
    const row = [];
    let next = 0;
    for (const cell of rowMatch[1].matchAll(/<(?:\w+:)?c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/(?:\w+:)?c>)/g)) {
      const ref = attr(cell[1], "r");
      const col = ref ? columnIndex(ref) : next;
      next = col + 1;
      const type = attr(cell[1], "t");
      const inner = cell[2] ?? "";
      const raw = /<(?:\w+:)?v>([\s\S]*?)<\/(?:\w+:)?v>/.exec(inner)?.[1];
      let value = "";
      if (type === "s") value = shared[Number(raw)] ?? "";
      else if (type === "inlineStr") value = textRuns(inner);
      else if (type === "b") value = raw === "1" ? "TRUE" : "FALSE";
      else if (type === "str" || type === "e") value = decodeXml(raw ?? "");
      else if (raw !== undefined) value = numberText(decodeXml(raw));
      if (col > 200) continue;
      while (row.length < col) row.push("");
      row[col] = value;
    }
    if (row.some((v) => String(v).trim() !== "")) rows.push(row);
    if (rows.length > MAX_ROWS + 1) throw new Error(`The sheet has more than ${MAX_ROWS} rows. Split it into smaller files.`);
  }
  return rows;
}

function readZipDirectory(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let eocd = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--) {
    if (view.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error("This file is not a valid .xlsx workbook.");
  const count = view.getUint16(eocd + 10, true);
  let offset = view.getUint32(eocd + 16, true);
  const entries = new Map();
  for (let n = 0; n < count && n < 2000; n++) {
    if (offset + 46 > bytes.length || view.getUint32(offset, true) !== 0x02014b50) throw new Error("This .xlsx file is damaged.");
    const method = view.getUint16(offset + 10, true);
    const compressed = view.getUint32(offset + 20, true);
    const size = view.getUint32(offset + 24, true);
    const nameLength = view.getUint16(offset + 28, true);
    const extra = view.getUint16(offset + 30, true);
    const comment = view.getUint16(offset + 32, true);
    const local = view.getUint32(offset + 42, true);
    const name = new TextDecoder().decode(bytes.subarray(offset + 46, offset + 46 + nameLength));
    entries.set(name, { method, compressed, size, local });
    offset += 46 + nameLength + extra + comment;
  }
  return entries;
}

async function inflateEntry(bytes, entry) {
  if (entry.size > MAX_XLSX_UNPACKED) throw new Error("The workbook is too large to import.");
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (view.getUint32(entry.local, true) !== 0x04034b50) throw new Error("This .xlsx file is damaged.");
  const start = entry.local + 30 + view.getUint16(entry.local + 26, true) + view.getUint16(entry.local + 28, true);
  const data = bytes.subarray(start, start + entry.compressed);
  if (entry.method === 0) return data;
  if (entry.method !== 8) throw new Error("The workbook uses an unsupported compression. Save it again as .xlsx or CSV.");
  const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  const reader = stream.getReader();
  const chunks = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.length;
    // Guard against a declared size that understates the real one (zip bomb).
    if (total > MAX_XLSX_UNPACKED) { await reader.cancel(); throw new Error("The workbook is too large to import."); }
    chunks.push(value);
  }
  const out = new Uint8Array(total);
  let at = 0;
  for (const chunk of chunks) { out.set(chunk, at); at += chunk.length; }
  return out;
}

const attr = (tag, name) => new RegExp(`\\b${name}="([^"]*)"`).exec(tag)?.[1] ?? null;
const textRuns = (xml) => [...xml.matchAll(/<(?:\w+:)?t\b[^>]*>([\s\S]*?)<\/(?:\w+:)?t>/g)].map((m) => decodeXml(m[1])).join("");
const columnIndex = (ref) => [...ref.replace(/\d+$/, "").toUpperCase()].reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0) - 1;

function decodeXml(text) {
  return String(text).replace(/&(?:#x([0-9a-f]+)|#(\d+)|(lt|gt|amp|quot|apos));/gi, (_, hex, dec, name) => {
    if (hex) return String.fromCodePoint(parseInt(hex, 16));
    if (dec) return String.fromCodePoint(parseInt(dec, 10));
    return { lt: "<", gt: ">", amp: "&", quot: '"', apos: "'" }[name.toLowerCase()];
  });
}

// Excel stores 85.3 as 85.299999999999997; show what the teacher typed.
function numberText(raw) {
  const n = Number(raw);
  return Number.isFinite(n) ? String(parseFloat(n.toPrecision(12))) : raw;
}

// ---------------------------------------------------------------------------
// Mapping and preview checks
// ---------------------------------------------------------------------------
// Reads a .csv or .xlsx upload into rows of cell text (first row = headers).
export async function readSheet(file) {
  if (!file) throw new Error("Choose a file to upload.");
  if (file.size > MAX_FILE_BYTES) throw new Error("The file is larger than 2 MB. Split it into smaller files.");
  const name = String(file.name || "upload");
  const buffer = await file.arrayBuffer();
  const isXlsx = /\.xlsx$/i.test(name);
  if (/\.(xls|xlsm|xlsb|ods|numbers)$/i.test(name)) throw new Error("Save the sheet as .xlsx or CSV first (File → Save as).");
  if (!isXlsx && !/\.(csv|txt)$/i.test(name)) throw new Error("Upload a .csv or .xlsx file.");
  const table = isXlsx ? await parseXlsx(buffer) : parseCsv(new TextDecoder("utf-8").decode(buffer));
  return { name: name.slice(0, 200), sha256: await sha256Hex(buffer), table };
}

export async function readResultsFile(file) {
  const { name, sha256, table } = await readSheet(file);
  return { name, sha256, ...mapResultRows(table) };
}

export async function sha256Hex(buffer) {
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function mapResultRows(table) {
  if (!table.length) throw new Error("The file is empty.");
  const headers = table[0].map(normalizeHeader);
  const forbidden = table[0].find((h) => FORBIDDEN.test(String(h)));
  if (forbidden) throw new Error(`Remove the “${String(forbidden).trim()}” column. Parent access codes must never be put in a results sheet.`);
  const index = {};
  for (const [key, names] of Object.entries(ALIASES)) {
    const at = headers.findIndex((h) => names.includes(h));
    if (at >= 0) index[key] = at;
  }
  const missing = TEMPLATE_COLUMNS.filter((c) => c.required && index[c.key] === undefined).map((c) => c.label);
  if (missing.length) throw new Error(`The first row must contain the column ${missing.join(" and ")}. Download the template to see the layout.`);
  const body = table.slice(1);
  if (!body.length) throw new Error("The file has a header row but no results.");
  if (body.length > MAX_ROWS) throw new Error(`The file has more than ${MAX_ROWS} rows. Split it into smaller files.`);
  const rows = body.map((cells, i) => {
    const row = { row_number: i + 1 };
    for (const key of Object.keys(ALIASES)) {
      const value = index[key] === undefined ? "" : String(cells[index[key]] ?? "").replace(/\s+/g, " ").trim();
      row[key] = value.slice(0, LIMITS[key]);
      if (value.length > LIMITS[key]) row.truncated = [...(row.truncated || []), key];
    }
    row.student_code = row.student_code.toUpperCase();
    return row;
  });
  return { rows, columns: Object.keys(index) };
}

// Fast feedback for the preview. The database repeats these checks and also
// matches student codes, names, duplicates and existing results.
export function previewIssues(row, assessment) {
  const issues = [];
  if (!row.student_code) issues.push("Student code is missing");
  if (!/^[0-9]{1,5}(\.[0-9]{1,2})?$/.test(row.marks_obtained)) issues.push("Marks must be a number");
  else if (assessment && Number(row.marks_obtained) > Number(assessment.total_marks)) issues.push("Marks exceed the maximum for this assessment");
  if (assessment && row.assessment_code && row.assessment_code.toUpperCase() !== assessment.code) issues.push(`Assessment code is not ${assessment.code}`);
  if (assessment && row.total_marks && Number(row.total_marks) !== Number(assessment.total_marks)) issues.push(`Total marks must be ${Number(assessment.total_marks)}`);
  const bands = (assessment?.grade_bands || []).map((b) => String(b.grade).toUpperCase());
  if (row.grade && bands.length && !bands.includes(row.grade.toUpperCase())) issues.push("Grade is not in the approved scheme");
  if (row.truncated?.length) issues.push(`Shortened: ${row.truncated.join(", ")}`);
  return issues;
}

// Rows sent to the database: only the columns it stores.
export function toImportRows(rows, batchId) {
  return rows.map((r) => ({
    batch_id: batchId,
    row_number: r.row_number,
    student_code: r.student_code,
    student_name: r.student_name,
    marks_text: r.marks_obtained,
    grade: r.grade.toUpperCase(),
    teacher_remarks: r.teacher_remarks,
  }));
}

export function templateRows(assessment) {
  return [
    { assessment_code: assessment?.code ?? "TAJWEED-T1-2026", student_code: "OQC-00001", student_name: "Example Student", marks_obtained: "86", total_marks: String(Number(assessment?.total_marks ?? 100)), grade: "", teacher_remarks: "Clear makharij; keep practising the rules of noon sakinah." },
  ];
}

// Grade bands: [{grade, min_percent}] sorted high to low; validated before saving.
export function normalizeGradeBands(bands) {
  const list = (Array.isArray(bands) ? bands : [])
    .map((b) => ({ grade: String(b.grade ?? "").trim().toUpperCase(), min_percent: Number(b.min_percent), label: String(b.label ?? "").trim() }))
    .filter((b) => b.grade !== "" || b.label !== "");
  for (const b of list) {
    if (!/^[A-Z0-9+\-*]{1,6}$/.test(b.grade)) throw new Error("Each grade needs a short name such as A+, A or B.");
    if (!Number.isFinite(b.min_percent) || b.min_percent < 0 || b.min_percent > 100) throw new Error(`Grade ${b.grade}: the minimum percentage must be between 0 and 100.`);
    if (b.label.length > 40) throw new Error(`Grade ${b.grade}: keep the description under 40 characters.`);
  }
  if (new Set(list.map((b) => b.grade)).size !== list.length) throw new Error("Each grade can appear only once.");
  return list.sort((a, b) => b.min_percent - a.min_percent).map((b) => (b.label ? b : { grade: b.grade, min_percent: b.min_percent }));
}

export function gradeFor(bands, percent) {
  const band = (bands || []).filter((b) => Number(percent) >= Number(b.min_percent)).sort((a, b) => b.min_percent - a.min_percent)[0];
  return band ? band.grade : "";
}

export function gradeLabel(bands, grade) {
  return (bands || []).find((b) => String(b.grade).toUpperCase() === String(grade || "").toUpperCase())?.label || "";
}
