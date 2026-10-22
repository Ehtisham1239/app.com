import { readdirSync, readFileSync, mkdirSync, writeFileSync } from "node:fs";
const directory = new URL("../supabase/migrations/", import.meta.url);
const files = readdirSync(directory).filter((file) => file.endsWith(".sql")).sort();
const output = new URL("../artifacts/", import.meta.url);
mkdirSync(output, { recursive: true });
writeFileSync(new URL("app-com-database.sql", output), "-- Fresh app.com project only. Review before executing. Do not rerun on an initialized database.\nBEGIN;\nCREATE SCHEMA IF NOT EXISTS extensions;\nCREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;\n" + files.map((file) => `\n-- ${file}\n${readFileSync(new URL(file, directory), "utf8")}`).join("\n") + "\nCOMMIT;\n");
console.log("Created artifacts/app-com-database.sql. This does not apply any live changes.");
