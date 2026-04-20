import Database from "better-sqlite3";

const dryRun = process.argv.includes("--dry-run");
const target = process.argv.find((arg) => arg.startsWith("--target="))?.split("=")[1] ?? "local";
const recompute = process.argv.includes("--recompute");
if (target !== "local") {
  console.error("scores:refresh currently supports --target=local only.");
  process.exit(2);
}

const db = new Database("dev.db");
const scores = db.prepare("SELECT id, benchmarkRunId, calculationJson FROM ScoreCalculation").all();
const results = [];

for (const score of scores) {
  const calc = score.calculationJson ? JSON.parse(score.calculationJson) : {};
  const files = calc.inputFiles ?? [];
  let changed = false;
  for (const file of files) {
    const current = db.prepare("SELECT checksumAlgorithm, checksumValue FROM DatasetFile WHERE id=?").get(file.datasetFileId);
    if (!current || current.checksumAlgorithm !== file.checksumAlgorithm || current.checksumValue !== file.checksumValue) {
      changed = true;
    }
  }
  results.push({ scoreCalculationId: score.id, benchmarkRunId: score.benchmarkRunId, status: changed ? "needs_recompute" : "unchanged" });
}

console.log(JSON.stringify({ dryRun, target, recompute, checked: results.length, results }, null, 2));

if (!dryRun && results.some((result) => result.status === "needs_recompute")) {
  const now = new Date().toISOString();
  const insert = db.prepare(
    "INSERT INTO ProvenanceEvent (id,eventType,message,actor,payloadJson,createdAt) VALUES (?,?,?,?,?,?)",
  );
  insert.run(`prov_scores_refresh_${Date.now()}`, "validated", "Score refresh detected changed inputs.", "system:scores-refresh", JSON.stringify({ results }), now);
}
