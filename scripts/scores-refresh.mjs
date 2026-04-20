import Database from "better-sqlite3";

const dryRun = process.argv.includes("--dry-run");
const target = process.argv.find((arg) => arg.startsWith("--target="))?.split("=")[1] ?? "local";
const recompute = process.argv.includes("--recompute");
if (target !== "local") {
  console.error("scores:refresh currently supports --target=local only.");
  process.exit(2);
}

const db = new Database("dev.db");
const scores = db.prepare("SELECT id, benchmarkRunId, methodologyVersionId, status, calculationJson FROM ScoreCalculation").all();
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
  const latestMethodology = db.prepare("SELECT id FROM MethodologyVersion WHERE version='0.1'").get();
  const methodChanged = latestMethodology?.id !== score.methodologyVersionId;
  const status = changed || methodChanged || score.status === "needs_recompute" ? "needs_recompute" : "current";
  results.push({
    scoreCalculationId: score.id,
    benchmarkRunId: score.benchmarkRunId,
    status,
    inputChanged: changed,
    methodologyChanged: methodChanged,
  });
}

console.log(JSON.stringify({ dryRun, target, recompute, checked: results.length, results }, null, 2));

if (!dryRun && results.some((result) => result.status === "needs_recompute")) {
  const now = new Date().toISOString();
  const update = db.prepare("UPDATE ScoreCalculation SET status='needs_recompute' WHERE id=?");
  const insert = db.prepare(
    "INSERT INTO ProvenanceEvent (id,eventType,message,actor,payloadJson,createdAt) VALUES (?,?,?,?,?,?)",
  );
  const tx = db.transaction(() => {
    for (const result of results.filter((item) => item.status === "needs_recompute")) {
      update.run(result.scoreCalculationId);
    }
    insert.run(`prov_scores_refresh_${Date.now()}`, "validated", "Score refresh checked local score inputs.", "system:scores-refresh", JSON.stringify({ results, recompute }), now);
  });
  tx();
}
