import Database from "better-sqlite3";
import { runWrangler } from "./run-wrangler.mjs";

const target = process.argv.includes("--remote") ? "remote" : "local";
const tablesSql = "SELECT name, type FROM sqlite_master WHERE type IN ('table','view') ORDER BY name;";
const countsSql = `SELECT
 (SELECT COUNT(*) FROM BenchmarkTrack) AS tracks,
 (SELECT COUNT(*) FROM Task) AS tasks,
 (SELECT COUNT(*) FROM Metric) AS metrics,
 (SELECT COUNT(*) FROM Control) AS controls,
 (SELECT COUNT(*) FROM MethodologyVersion) AS methodologies,
 (SELECT COUNT(*) FROM Organization) AS organizations,
 (SELECT COUNT(*) FROM Source) AS sources,
 (SELECT COUNT(*) FROM Dataset) AS datasets,
 (SELECT COUNT(*) FROM System) AS systems,
 (SELECT COUNT(*) FROM BenchmarkRun) AS benchmarkRuns,
 (SELECT COUNT(*) FROM MetricValue) AS metricValues,
 (SELECT COUNT(*) FROM ScoreCalculation) AS scoreCalculations,
 (SELECT COUNT(*) FROM Submission) AS submissions,
 (SELECT COUNT(*) FROM ProvenanceEvent) AS provenanceEvents;`;

if (target === "remote") {
  console.warn("WARNING: reading the remote production Cloudflare D1 database.");
  const command = (process.argv.includes("--tables") ? tablesSql : countsSql).replace(/\s+/g, " ");
  runWrangler(["d1", "execute", "organoidbench", "--remote", "--command", command]);
} else {
  const db = new Database("dev.db", { readonly: true });
  if (process.argv.includes("--tables")) {
    console.log(JSON.stringify(db.prepare(tablesSql).all(), null, 2));
  } else {
    console.log(JSON.stringify(db.prepare(countsSql).get(), null, 2));
  }
}
