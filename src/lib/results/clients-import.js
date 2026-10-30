// Bulk upload of parents (clients) and their children from a CSV/.xlsx sheet.
// One row per child; a parent with several children repeats their Client ID.
// The database (public.guardians_bulk_import) re-checks every row and saves all
// rows or none.
import { MAX_ROWS } from "./import.js";

export const CLIENT_COLUMNS = [
  { key: "client_id", label: "client_id", required: true, note: "The ERP Client ID, e.g. C-10245" },
  { key: "parent_name", label: "parent_name", required: true, note: "Parent or guardian's full name" },
  { key: "relationship", label: "relationship", required: false, note: "Mother, Father, Guardian… (default Parent)" },
  { key: "email", label: "email", required: false, note: "Optional" },
  { key: "phone", label: "phone", required: false, note: "Optional, with country code" },
  { key: "student_code", label: "student_code", required: false, note: "Existing child's code, e.g. OQC-00012" },
  { key: "student_name", label: "student_name", required: false, note: "Child's name; creates the student when there is no code" },
];

const ALIASES = {
  client_id: ["client_id", "client id", "clientid", "client", "erp id", "erp client id", "family id"],
  parent_name: ["parent_name", "parent name", "parent", "guardian", "guardian name", "father name", "mother name", "name"],
  relationship: ["relationship", "relation"],
  email: ["email", "e-mail", "email address", "parent email"],
  phone: ["phone", "mobile", "whatsapp", "phone number", "contact"],
  student_code: ["student_code", "student code", "student id", "roll no", "roll number"],
  student_name: ["student_name", "student name", "child", "child name", "student"],
};
const LIMITS = { client_id: 64, parent_name: 120, relationship: 40, email: 160, phone: 40, student_code: 40, student_name: 120 };
const FORBIDDEN = /client[\s_-]*code|access[\s_-]*code|password|\bpin\b/i;
export const CLIENT_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{2,63}$/;

const normalizeHeader = (value) => String(value ?? "").replace(/^﻿/, "").trim().toLowerCase().replace(/[\s_]+/g, " ");

export function mapClientRows(table) {
  if (!table?.length) throw new Error("The file is empty.");
  const headers = table[0].map(normalizeHeader);
  const forbidden = table[0].find((h) => FORBIDDEN.test(String(h)));
  if (forbidden) throw new Error(`Remove the “${String(forbidden).trim()}” column. Access codes are issued by the system, never uploaded.`);
  const index = {};
  for (const [key, names] of Object.entries(ALIASES)) {
    if (headers.filter((h) => names.includes(h)).length > 1) throw new Error(`The file has more than one ${key} column. Keep one column for each field.`);
    const at = headers.findIndex((h, i) => names.includes(h) && !Object.values(index).includes(i));
    if (at >= 0) index[key] = at;
  }
  const missing = CLIENT_COLUMNS.filter((c) => c.required && index[c.key] === undefined).map((c) => c.label);
  if (missing.length) throw new Error(`The first row must contain the column ${missing.join(" and ")}. Download the template to see the layout.`);
  const body = table.slice(1);
  if (!body.length) throw new Error("The file has a header row but no parents.");
  if (body.length > MAX_ROWS) throw new Error(`The file has more than ${MAX_ROWS} rows. Split it into smaller files.`);
  return body.map((cells, i) => {
    const row = { row_number: i + 1 };
    for (const key of Object.keys(ALIASES)) {
      const value = (index[key] === undefined ? "" : String(cells[index[key]] ?? "")).replace(/\s+/g, " ").trim();
      if (value.length > LIMITS[key]) throw new Error(`Row ${i + 1}: ${key} is longer than ${LIMITS[key]} characters. Shorten it in the original file; no text has been removed.`);
      row[key] = value;
    }
    row.email = row.email.toLowerCase();
    row.student_code = row.student_code.toUpperCase();
    return row;
  });
}

// Quick checks for the preview; the database repeats them and checks student codes.
export function clientRowIssues(row) {
  const issues = [];
  if (!CLIENT_ID_PATTERN.test(row.client_id)) issues.push(row.client_id ? "Client ID: 3–64 letters, numbers, dots, dashes or underscores" : "Client ID is missing");
  if (row.parent_name.length < 2) issues.push("Parent name is missing");
  if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) issues.push("Email is not valid");
  if (row.student_name && row.student_name.length < 2 && !row.student_code) issues.push("Student name is too short");
  return issues;
}

// Payload for public.guardians_bulk_import: only the stored fields.
export function toClientPayload(rows) {
  return rows.map(({ row_number, client_id, parent_name, relationship, email, phone, student_code, student_name }) => ({ row_number, client_id, parent_name, relationship, email, phone, student_code, student_name }));
}

export function clientTemplateRows() {
  return [
    { client_id: "C-10245", parent_name: "Example Parent", relationship: "Mother", email: "parent@example.com", phone: "+44 7700 900123", student_code: "", student_name: "Example Child One" },
    { client_id: "C-10245", parent_name: "Example Parent", relationship: "Mother", email: "parent@example.com", phone: "+44 7700 900123", student_code: "OQC-00001", student_name: "" },
  ];
}
