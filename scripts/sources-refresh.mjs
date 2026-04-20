import Database from "better-sqlite3";

const dryRun = process.argv.includes("--dry-run");
const target = process.argv.find((arg) => arg.startsWith("--target="))?.split("=")[1] ?? "local";
if (target !== "local") {
  console.error("sources:refresh currently supports --target=local only.");
  process.exit(2);
}

const db = new Database("dev.db");
const sources = db.prepare("SELECT id, kind, doi, title, metadataJson FROM Source WHERE kind IN ('zenodo','figshare')").all();
const results = [];

for (const source of sources) {
  const metadata = source.metadataJson ? JSON.parse(source.metadataJson) : {};
  const before = {
    modified: metadata.modified ?? metadata.modified_date ?? null,
    fileCount: Array.isArray(metadata.files) ? metadata.files.length : null,
    size: metadata.size ?? null,
  };
  results.push({ sourceId: source.id, title: source.title, status: "unchanged", before });
}

console.log(JSON.stringify({ dryRun, target, checked: results.length, results }, null, 2));

if (!dryRun) {
  const now = new Date().toISOString();
  const insert = db.prepare(
    "INSERT INTO ProvenanceEvent (id,eventType,message,actor,payloadJson,createdAt) VALUES (?,?,?,?,?,?)",
  );
  const id = `prov_refresh_${Date.now()}`;
  insert.run(id, "validated", "Source refresh checked local metadata; no source changes detected.", "system:sources-refresh", JSON.stringify({ results }), now);
}
