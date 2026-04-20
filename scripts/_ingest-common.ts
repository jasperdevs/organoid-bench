import { prisma } from "../lib/db-node";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

if (!process.env.DATABASE_URL) {
  const envPath = path.join(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
    }
  }
}

export { prisma };

export type IngestTarget = "local" | "remote";

export type IngestOptions = {
  target: IngestTarget;
  dryRun: boolean;
  sqlOut?: string;
};

export function parseIngestOptions(argv: string[]): IngestOptions {
  const rawTarget = optArg(argv, "--target");
  if (rawTarget !== "local" && rawTarget !== "remote") {
    console.error("Missing required --target=local or --target=remote.");
    process.exit(2);
  }
  return {
    target: rawTarget,
    dryRun: argv.includes("--dry-run"),
    sqlOut: optArg(argv, "--sql-out"),
  };
}

export function requireRemoteConfirmation(options: IngestOptions) {
  if (options.target === "remote" && !options.dryRun) {
    console.warn("WARNING: applying changes to the remote production Cloudflare D1 database.");
  }
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || `rec-${Date.now()}`;
}

export async function uniqueSlug(base: string, check: (slug: string) => Promise<boolean>): Promise<string> {
  let slug = base;
  let i = 2;
  while (await check(slug)) {
    slug = `${base}-${i++}`;
  }
  return slug;
}

export async function fetchJson<T = unknown>(url: string, headers: Record<string, string> = {}): Promise<T> {
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "OrganoidBench-Ingester/1.0 (+https://organoidbench.org)",
      ...headers,
    },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} fetching ${url}: ${await res.text().catch(() => "")}`);
  }
  return (await res.json()) as T;
}

export function requireArg(argv: string[], flag: string): string {
  const i = argv.indexOf(flag);
  if (i < 0 || !argv[i + 1]) {
    console.error(`Missing required argument: ${flag}`);
    process.exit(2);
  }
  return argv[i + 1];
}

export function optArg(argv: string[], flag: string): string | undefined {
  const exact = argv.find((arg) => arg.startsWith(`${flag}=`));
  if (exact) return exact.slice(flag.length + 1);
  const i = argv.indexOf(flag);
  if (i < 0) return undefined;
  return argv[i + 1];
}

export function parseBytes(v: unknown): bigint | null {
  if (v == null) return null;
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n) || n < 0) return null;
  return BigInt(Math.floor(n));
}

export function sqlString(value: unknown): string {
  if (value == null) return "NULL";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "NULL";
  if (typeof value === "bigint") return String(value);
  if (typeof value === "boolean") return value ? "1" : "0";
  return `'${String(value).replaceAll("'", "''")}'`;
}

export function jsonStringify(value: unknown, space = 2): string {
  return JSON.stringify(
    value,
    (_key, raw) => (typeof raw === "bigint" ? raw.toString() : raw),
    space,
  );
}

export function sqlDate(date = new Date()): string {
  return sqlString(date.toISOString());
}

export function stableId(prefix: string, value: string): string {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const suffix = (hash >>> 0).toString(36);
  const base = slugify(value).replaceAll("-", "_").slice(0, 72).replace(/_+$/g, "");
  return `${prefix}_${base}_${suffix}`;
}

export function writeSqlArtifact(sql: string, label: string, options: IngestOptions): string {
  const outPath =
    options.sqlOut ??
    path.join(".wrangler", "sql", `${label}-${new Date().toISOString().replace(/[:.]/g, "-")}.sql`);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, sql, "utf8");
  return outPath;
}

export function applyRemoteSql(sql: string, label: string, options: IngestOptions) {
  const outPath = writeSqlArtifact(sql, label, options);
  console.log(`SQL written to ${outPath}`);
  if (options.dryRun) {
    console.log("Dry run: no database changes were applied.");
    return;
  }
  requireRemoteConfirmation(options);
  if (process.platform === "win32") {
    execFileSync("cmd.exe", ["/c", "npx", "wrangler", "d1", "execute", "organoidbench", "--remote", "--file", outPath], { stdio: "inherit" });
    return;
  }
  execFileSync("npx", ["wrangler", "d1", "execute", "organoidbench", "--remote", "--file", outPath], { stdio: "inherit" });
}

export function buildSourceUpsertSql(input: {
  id: string;
  kind: string;
  title: string;
  doi: string;
  url: string | null;
  authors?: string | null;
  year?: number | null;
  venue?: string | null;
  licenseName?: string | null;
  licenseUrl?: string | null;
  repositoryType?: string | null;
  abstractText?: string | null;
  reviewStatus?: string | null;
  organizationId?: string | null;
  metadataJson?: string | null;
}) {
  const now = sqlDate();
  return `INSERT INTO "Source" ("id","kind","title","url","doi","authors","year","venue","licenseName","licenseUrl","repositoryType","abstractText","reviewStatus","lastCheckedAt","organizationId","metadataJson","createdAt","updatedAt")
VALUES (${sqlString(input.id)},${sqlString(input.kind)},${sqlString(input.title)},${sqlString(input.url)},${sqlString(input.doi)},${sqlString(input.authors ?? null)},${sqlString(input.year ?? null)},${sqlString(input.venue ?? null)},${sqlString(input.licenseName ?? null)},${sqlString(input.licenseUrl ?? null)},${sqlString(input.repositoryType ?? null)},${sqlString(input.abstractText ?? null)},${sqlString(input.reviewStatus ?? "none")},${now},${sqlString(input.organizationId ?? null)},${sqlString(input.metadataJson ?? null)},${now},${now})
ON CONFLICT("doi") DO UPDATE SET "kind"=excluded."kind","title"=excluded."title","url"=excluded."url","authors"=excluded."authors","year"=excluded."year","venue"=excluded."venue","licenseName"=excluded."licenseName","licenseUrl"=excluded."licenseUrl","repositoryType"=excluded."repositoryType","abstractText"=excluded."abstractText","reviewStatus"=excluded."reviewStatus","lastCheckedAt"=excluded."lastCheckedAt","organizationId"=excluded."organizationId","metadataJson"=excluded."metadataJson","updatedAt"=excluded."updatedAt";`;
}

export function buildOrganizationUpsertSql(id: string, name: string) {
  const now = sqlDate();
  return `INSERT INTO "Organization" ("id","name","createdAt","updatedAt") VALUES (${sqlString(id)},${sqlString(name)},${now},${now}) ON CONFLICT("name") DO UPDATE SET "updatedAt"=excluded."updatedAt";`;
}

export function buildProvenanceSql(input: {
  id: string;
  eventType: string;
  message: string;
  actor: string;
  sourceId?: string | null;
  datasetId?: string | null;
  systemId?: string | null;
  benchmarkRunId?: string | null;
  payloadJson?: string | null;
}) {
  return `INSERT INTO "ProvenanceEvent" ("id","eventType","message","actor","sourceId","datasetId","systemId","benchmarkRunId","payloadJson","createdAt") VALUES (${sqlString(input.id)},${sqlString(input.eventType)},${sqlString(input.message)},${sqlString(input.actor)},${sqlString(input.sourceId ?? null)},${sqlString(input.datasetId ?? null)},${sqlString(input.systemId ?? null)},${sqlString(input.benchmarkRunId ?? null)},${sqlString(input.payloadJson ?? null)},${sqlDate()});`;
}

export function buildDatasetUpsertSql(input: {
  id: string;
  sourceId: string;
  organizationId?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  modality?: string | null;
  accessStatus?: string | null;
  licenseName?: string | null;
  licenseUrl?: string | null;
  rawDataAvailable?: boolean;
  processedDataAvailable?: boolean;
  metadataAvailable?: boolean;
  codeAvailable?: boolean;
  dataUrl?: string | null;
  externalId?: string | null;
  sizeBytes?: bigint | null;
  nRecordings?: number | null;
  verificationStatus?: string | null;
  limitations?: string | null;
}) {
  const now = sqlDate();
  return `INSERT INTO "Dataset" ("id","sourceId","organizationId","name","slug","description","modality","accessStatus","licenseName","licenseUrl","rawDataAvailable","processedDataAvailable","metadataAvailable","codeAvailable","dataUrl","externalId","sizeBytes","nRecordings","lastCheckedAt","verificationStatus","limitations","createdAt","updatedAt")
VALUES (${sqlString(input.id)},${sqlString(input.sourceId)},${sqlString(input.organizationId ?? null)},${sqlString(input.name)},${sqlString(input.slug)},${sqlString(input.description ?? null)},${sqlString(input.modality ?? null)},${sqlString(input.accessStatus ?? "unknown")},${sqlString(input.licenseName ?? null)},${sqlString(input.licenseUrl ?? null)},${sqlString(input.rawDataAvailable ?? false)},${sqlString(input.processedDataAvailable ?? false)},${sqlString(input.metadataAvailable ?? false)},${sqlString(input.codeAvailable ?? false)},${sqlString(input.dataUrl ?? null)},${sqlString(input.externalId ?? null)},${sqlString(input.sizeBytes ?? null)},${sqlString(input.nRecordings ?? null)},${now},${sqlString(input.verificationStatus ?? "draft")},${sqlString(input.limitations ?? null)},${now},${now})
ON CONFLICT("slug") DO UPDATE SET "sourceId"=excluded."sourceId","organizationId"=excluded."organizationId","name"=excluded."name","description"=excluded."description","modality"=excluded."modality","accessStatus"=excluded."accessStatus","licenseName"=excluded."licenseName","licenseUrl"=excluded."licenseUrl","rawDataAvailable"=excluded."rawDataAvailable","processedDataAvailable"=excluded."processedDataAvailable","metadataAvailable"=excluded."metadataAvailable","codeAvailable"=excluded."codeAvailable","dataUrl"=excluded."dataUrl","externalId"=excluded."externalId","sizeBytes"=excluded."sizeBytes","nRecordings"=excluded."nRecordings","lastCheckedAt"=excluded."lastCheckedAt","verificationStatus"=excluded."verificationStatus","limitations"=excluded."limitations","updatedAt"=excluded."updatedAt";`;
}

export function buildDatasetFileReplaceSql(
  datasetId: string,
  files: Array<{
    id: string;
    path: string;
    format?: string | null;
    sizeBytes?: bigint | null;
    checksumSha256?: string | null;
    checksumAlgorithm?: string | null;
    checksumValue?: string | null;
    url?: string | null;
  }>,
) {
  const statements = [`DELETE FROM "DatasetFile" WHERE "datasetId"=${sqlString(datasetId)};`];
  for (const file of files) {
    statements.push(
      `INSERT INTO "DatasetFile" ("id","datasetId","path","format","sizeBytes","checksumSha256","checksumAlgorithm","checksumValue","url","storageStatus","createdAt") VALUES (${sqlString(file.id)},${sqlString(datasetId)},${sqlString(file.path)},${sqlString(file.format ?? null)},${sqlString(file.sizeBytes ?? null)},${sqlString(file.checksumSha256 ?? null)},${sqlString(file.checksumAlgorithm ?? null)},${sqlString(file.checksumValue ?? null)},${sqlString(file.url ?? null)},'remote_only',${sqlDate()});`,
    );
  }
  return statements.join("\n");
}

export function parseChecksum(raw: string | null | undefined) {
  if (!raw) return { checksumSha256: null, checksumAlgorithm: null, checksumValue: null };
  const [algorithm, ...rest] = raw.includes(":") ? raw.split(":") : ["", raw];
  const value = rest.join(":").trim();
  const normalized = algorithm.trim().toLowerCase();
  if (!normalized || !value) {
    return { checksumSha256: null, checksumAlgorithm: null, checksumValue: raw };
  }
  return {
    checksumSha256: normalized === "sha256" ? value : null,
    checksumAlgorithm: normalized,
    checksumValue: value,
  };
}
