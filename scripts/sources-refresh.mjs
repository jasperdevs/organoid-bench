import Database from "better-sqlite3";

const dryRun = process.argv.includes("--dry-run");
const target = process.argv.find((arg) => arg.startsWith("--target="))?.split("=")[1] ?? "local";
if (target !== "local") {
  console.error("sources:refresh currently supports --target=local only.");
  process.exit(2);
}

const db = new Database("dev.db");
const sources = db.prepare("SELECT id, kind, doi, title, metadataJson FROM Source WHERE kind IN ('zenodo','figshare')").all();

function compactMeta(source, metadata) {
  if (source.kind === "zenodo") {
    return {
      title: metadata.metadata?.title ?? metadata.title ?? null,
      doi: metadata.metadata?.doi ?? metadata.doi ?? null,
      modified: metadata.modified ?? metadata.updated ?? null,
      license: metadata.metadata?.license?.id ?? null,
      files: (metadata.files ?? []).map((file) => ({
        name: file.key ?? file.filename ?? null,
        size: file.size ?? null,
        checksum: file.checksum ?? null,
      })),
    };
  }
  return {
    title: metadata.title ?? null,
    doi: metadata.doi ?? null,
    modified: metadata.modified_date ?? null,
    license: metadata.license?.name ?? null,
    files: (metadata.files ?? []).map((file) => ({
      name: file.name ?? null,
      size: file.size ?? null,
      checksum: file.computed_md5 ? `md5:${file.computed_md5}` : null,
    })),
  };
}

async function fetchCurrent(source) {
  if (source.kind === "zenodo") {
    const record = source.doi?.split(".").pop();
    const res = await fetch(`https://zenodo.org/api/records/${record}`);
    if (!res.ok) throw new Error(`Zenodo ${source.doi} returned ${res.status}`);
    return await res.json();
  }
  const articleId = source.doi?.match(/\/(\d+)(?:\.v\d+)?$/)?.[1];
  if (!articleId) throw new Error(`Could not parse Figshare article id from ${source.doi}`);
  const res = await fetch(`https://api.figshare.com/v2/articles/${articleId}`);
  if (!res.ok) throw new Error(`Figshare ${source.doi} returned ${res.status}`);
  return await res.json();
}

const results = [];
for (const source of sources) {
  const previousRaw = source.metadataJson ? JSON.parse(source.metadataJson) : {};
  const currentRaw = await fetchCurrent(source);
  const previous = compactMeta(source, previousRaw);
  const current = compactMeta(source, currentRaw);
  const changed = JSON.stringify(previous) !== JSON.stringify(current);
  results.push({
    sourceId: source.id,
    title: source.title,
    status: changed ? "changed" : "unchanged",
    previous,
    current,
  });
}

console.log(JSON.stringify({ dryRun, target, checked: results.length, results }, null, 2));

if (!dryRun) {
  const changed = results.filter((result) => result.status === "changed");
  if (changed.length > 0) {
    const now = new Date().toISOString();
    const updateScore = db.prepare(
      `UPDATE ScoreCalculation
       SET status='needs_recompute'
       WHERE benchmarkRunId IN (
         SELECT BenchmarkRun.id
         FROM BenchmarkRun
         JOIN System ON System.id = BenchmarkRun.systemId
         WHERE System.sourceId = ?
       )`,
    );
    const insert = db.prepare(
      "INSERT INTO ProvenanceEvent (id,eventType,message,actor,sourceId,payloadJson,createdAt) VALUES (?,?,?,?,?,?,?)",
    );
    const tx = db.transaction(() => {
      for (const result of changed) {
        updateScore.run(result.sourceId);
        insert.run(
          `prov_source_refresh_${result.sourceId}_${Date.now()}`,
          "validated",
          "Source refresh detected changed metadata.",
          "system:sources-refresh",
          result.sourceId,
          JSON.stringify(result),
          now,
        );
      }
    });
    tx();
  }
}
