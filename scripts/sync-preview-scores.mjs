import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { runWrangler } from "./run-wrangler.mjs";

const db = new Database("dev.db", { readonly: true });
const out = path.join(".wrangler", "sql", "local-preview-scores.sql");
fs.mkdirSync(path.dirname(out), { recursive: true });

function q(value) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "NULL";
  return `'${String(value).replaceAll("'", "''")}'`;
}

function rows(table) {
  return db.prepare(`SELECT * FROM ${table}`).all();
}

const deleteOrder = [
  "RunControl",
  "ScoreCalculation",
  "MetricValue",
  "BenchmarkRun",
  "System",
  "DatasetFile",
  "Dataset",
  "Source",
  "Submission",
  "Control",
  "Metric",
  "Task",
  "BenchmarkTrack",
  "MethodologyVersion",
  "Organization",
  "OrganoidPreparation",
  "RecordingSetup",
  "StimulationProtocol",
  "ProvenanceEvent",
];
const insertOrder = [
  "Organization",
  "OrganoidPreparation",
  "RecordingSetup",
  "StimulationProtocol",
  "MethodologyVersion",
  "BenchmarkTrack",
  "Task",
  "Metric",
  "Control",
  "Source",
  "Dataset",
  "DatasetFile",
  "Submission",
  "System",
  "BenchmarkRun",
  "MetricValue",
  "ScoreCalculation",
  "RunControl",
  "ProvenanceEvent",
];
const statements = [];
for (const table of deleteOrder) {
  statements.push(`DELETE FROM "${table}";`);
}
for (const table of insertOrder) {
  for (const row of rows(table)) {
    const cols = Object.keys(row);
    const vals = cols.map((col) => q(row[col]));
    statements.push(`INSERT OR REPLACE INTO "${table}" (${cols.map((col) => `"${col}"`).join(",")}) VALUES (${vals.join(",")});`);
  }
}
fs.writeFileSync(out, statements.join("\n"), "utf8");
console.log(`Wrote ${out}`);
runWrangler(["d1", "execute", "organoidbench", "--file", out]);
