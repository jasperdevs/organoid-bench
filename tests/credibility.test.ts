import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { CANONICAL_SUBMISSION_EXAMPLE, normalizeSubmissionInput, parseSubmissionInput } from "../lib/submissions";
import { cachedJson, noStoreJson } from "../lib/http-cache";
import { ISSUE_TEMPLATES, buildIssueUrl } from "../lib/github-issues";
import { getGithubRepo } from "../lib/github-config";
import {
  canCreateScoreCalculation,
  canPublishMetricValue,
  canPublishSystem,
  isPublicRunStatus,
  PRIVATE_RUN_STATUSES,
  PUBLIC_RUN_STATUSES,
} from "../lib/status-guards";
import { parseChecksum } from "../scripts/_ingest-common";

const root = process.cwd();

function read(rel: string) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

function listFiles(dir: string, matcher: RegExp) {
  return fs
    .readdirSync(path.join(root, dir), { recursive: true })
    .filter((file): file is string => typeof file === "string" && matcher.test(file))
    .map((file) => path.join(dir, file));
}

test("no production page imports mock scientific data", () => {
  const appFiles = listFiles("app", /\.(tsx|ts)$/);

  for (const file of appFiles) {
    const body = read(file);
    assert.doesNotMatch(body, /mockScientific|fakeScore|demoBenchmark|placeholderRows/i, file);
  }
});

test("leaderboard empty DB shows serious empty state", () => {
  const body = read("app/leaderboards/page.tsx");
  assert.match(body, /No verified benchmark runs are available yet\./);
  assert.match(body, /Source-backed datasets and systems will appear after curator review/);
  assert.doesNotMatch(body, /placeholder rows|fake/i);
});

test("leaderboard API returns entries array without fake fallback", () => {
  const body = read("app/api/v1/leaderboard/route.ts");
  assert.match(body, /entries/);
  assert.doesNotMatch(body, /fallback|mock|demo|fake/i);
});

test("docs canonical submission example validates against Zod schema", () => {
  const parsed = parseSubmissionInput(CANONICAL_SUBMISSION_EXAMPLE);
  assert.equal(parsed.success, true);
});

test("submit page sends users to GitHub issues, not a local submission form", () => {
  const page = read("app/submit/page.tsx");
  const intake = read("app/submit/github-intake.tsx");
  assert.match(page, /GitHubIntake/);
  assert.doesNotMatch(page + intake, /fetch\("\/api\/v1\/submissions"|<form|API submission|Prefill a GitHub issue/);
  assert.match(intake, /buildIssueUrl/);
});

test("snake_case submission payload is normalized and accepted", () => {
  const normalized = normalizeSubmissionInput({
    submitter_email: "researcher@example.org",
    proposed_system_name: "System name",
    benchmark_track: "signal-quality",
    task: "baseline-recording",
    source_url: "https://doi.org/10.0000/example",
  });
  const parsed = parseSubmissionInput(normalized);
  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal(parsed.data.proposedTrackSlug, "signal-quality");
    assert.equal(parsed.data.sourceUrl, "https://doi.org/10.0000/example");
  }
});

test("invalid submission returns useful validation errors", () => {
  const parsed = parseSubmissionInput({ submitterEmail: "not-email" });
  assert.equal(parsed.success, false);
  if (!parsed.success) {
    assert.ok(parsed.error.issues.length > 0);
    assert.ok(parsed.error.issues.some((issue) => issue.path.length > 0));
  }
});

test("metrics without source/provenance cannot be published", () => {
  assert.equal(canPublishMetricValue({ sourceId: null, provenanceEventCount: 1 }), false);
  assert.equal(canPublishMetricValue({ sourceId: "source_1", provenanceEventCount: 0 }), false);
  assert.equal(canPublishMetricValue({ sourceId: "source_1", provenanceEventCount: 1 }), true);
});

test("scoreCalculation requires methodologyVersionId", () => {
  assert.equal(canCreateScoreCalculation({ methodologyVersionId: null }), false);
  assert.equal(canCreateScoreCalculation({ methodologyVersionId: "methodology_1" }), true);
});

test("published systems require at least one source", () => {
  assert.equal(canPublishSystem({ sourceId: null }), false);
  assert.equal(canPublishSystem({ sourceId: "source_1" }), true);
});

test("leaderboard public and private statuses are explicit", () => {
  for (const status of PUBLIC_RUN_STATUSES) assert.equal(isPublicRunStatus(status), true);
  for (const status of PRIVATE_RUN_STATUSES) assert.equal(isPublicRunStatus(status), false);
});

test("filters and facets come from the database", () => {
  const body = read("lib/leaderboard.ts");
  assert.match(body, /prisma\.benchmarkTrack\.findMany/);
  assert.match(body, /prisma\.organization\.findMany/);
});

test("ingestion dry-run does not write data directly", () => {
  const common = read("scripts/_ingest-common.ts");
  assert.match(common, /Dry run: no database changes were applied/);
  assert.match(common, /parseIngestOptions/);
});

test("remote ingestion requires explicit target", () => {
  const common = read("scripts/_ingest-common.ts");
  assert.match(common, /Missing required --target=local or --target=remote/);
});

test("every public API route declares cache or no-store behavior", () => {
  const routeFiles = listFiles(path.join("app", "api", "v1"), /route\.ts$/);
  const allowedManual = new Set(["app/api/v1/leaderboard/export.csv/route.ts"]);
  for (const file of routeFiles) {
    const normalizedFile = file.replaceAll("\\", "/");
    const body = read(file);
    const hasGet = /export async function GET/.test(body);
    if (!hasGet) continue;
    const hasCacheHelper = /cachedJson|noStoreJson/.test(body);
    const hasManualHeaders =
      /new Response/.test(body) &&
      (/cacheHeaders/.test(body) || (/Cache-Control/.test(body) && /X-OrganoidBench-Data-Source/.test(body)));
    assert.ok(
      hasCacheHelper || (allowedManual.has(normalizedFile) && hasManualHeaders),
      `${normalizedFile} must use cachedJson/noStoreJson or documented manual cache headers`,
    );
  }
});

test("no runtime child_process import in app-facing GitHub config", () => {
  assert.doesNotMatch(read("lib/github-config.ts"), /child_process|execFileSync|git config/);
});

test("GET leaderboard has cache headers", async () => {
  const response = cachedJson({ entries: [] }, { profile: "short" });
  assert.equal(response.headers.get("X-OrganoidBench-Cache-Profile"), "short");
  assert.equal(response.headers.get("X-OrganoidBench-Data-Source"), "d1");
  assert.equal(response.headers.get("X-Robots-Tag"), "noindex");
  assert.equal(
    response.headers.get("Cache-Control"),
    "public, max-age=30, s-maxage=120, stale-while-revalidate=600",
  );
  assert.deepEqual(await response.json(), { entries: [] });
});

test("GET methodology has long cache profile", () => {
  const response = cachedJson({ methodology: { version: "1.0.0" } }, { profile: "long" });
  assert.equal(response.headers.get("X-OrganoidBench-Cache-Profile"), "long");
  assert.equal(
    response.headers.get("Cache-Control"),
    "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
  );
});

test("POST submissions uses no-store semantics", () => {
  const body = read("app/api/v1/submissions/route.ts");
  assert.match(body, /noStoreJson/);
  const response = noStoreJson({ ok: true }, { status: 201 });
  assert.equal(response.headers.get("Cache-Control"), "no-store");
});

test("errors are not cached", () => {
  const response = cachedJson({ error: "not_found" }, { status: 404, profile: "long" });
  assert.equal(response.headers.get("Cache-Control"), "no-store");
  assert.equal(response.headers.get("X-OrganoidBench-Cache-Profile"), "no-store");
  assert.equal(response.headers.get("X-Robots-Tag"), "noindex");
});

test("robots disallows API crawling", () => {
  const body = read("app/robots.ts");
  assert.match(body, /disallow: \["\/api\/"\]/);
});

test("issue URL builder encodes template title body and labels", () => {
  const template = ISSUE_TEMPLATES.find((item) => item.key === "dataset");
  assert.ok(template);
  const url = buildIssueUrl({
    repo: "owner/repo",
    template,
    title: "Dataset: cortical MEA",
    body: "Source URL: https://doi.org/10.0000/example",
  });
  assert.ok(url);
  assert.match(url, /^https:\/\/github\.com\/owner\/repo\/issues\/new\?/);
  assert.match(url, /template=dataset-submission\.yml/);
  assert.match(url, /title=Dataset%3A\+cortical\+MEA/);
  assert.match(url, /labels=submission%2Cdataset%2Cneeds-review/);
  assert.match(url, /body=Source\+URL%3A\+https%3A%2F%2Fdoi\.org%2F10\.0000%2Fexample/);
});

test("missing NEXT_PUBLIC_GITHUB_REPO produces safe fallback behavior", () => {
  const template = ISSUE_TEMPLATES[0];
  assert.equal(buildIssueUrl({ repo: null, template }), null);
  assert.equal(buildIssueUrl({ repo: "not-a-repo", template }), null);
  assert.equal(getGithubRepo(), "jasperdevs/organoid-bench");
});

test("submit cards point to the right issue templates", () => {
  const body = read("app/submit/github-intake.tsx");
  for (const template of [
    "dataset-submission.yml",
    "system-submission.yml",
    "benchmark-result.yml",
    "correction.yml",
    "task-request.yml",
    "bug-report.yml",
  ]) {
    assert.match(read("lib/github-issues.ts"), new RegExp(template.replace(".", "\\.")));
  }
  assert.match(body, /ISSUE_TEMPLATES/);
});

test("footer links @jasperdevs", () => {
  const body = read("components/site-footer.tsx");
  assert.match(body, /https:\/\/x\.com\/jasperdevs/);
  assert.match(body, /XIcon/);
  assert.match(body, /GitHubIcon/);
});

test("email is not used as a public contact or submission path", () => {
  const files = [
    ...listFiles("app", /\.(tsx|ts)$/),
    ...listFiles("components", /\.(tsx|ts)$/),
  ];
  for (const file of files) assert.doesNotMatch(read(file), /mailto:/, file);
  assert.equal(fs.existsSync(path.join(root, "app", "contact", "page.tsx")), false);
});

test("public copy has no internal prompt language", () => {
  const publicFiles = [
    ...listFiles("app", /\.(tsx|ts)$/),
    ...listFiles("components", /\.(tsx|ts)$/),
  ];
  const banned = /do not add fake data|acceptance criteria|paste this|prompt|fake-pretty|basically|for me|builder/i;
  for (const file of publicFiles) {
    assert.doesNotMatch(read(file), banned, file);
  }
});

test("public copy avoids unsupported cognition claims except explicit exclusions", () => {
  const publicFiles = [
    ...listFiles("app", /\.(tsx|ts)$/),
    ...listFiles("components", /\.(tsx|ts)$/),
  ];
  for (const file of publicFiles) {
    const body = read(file);
    assert.doesNotMatch(body, /consciousness score|AGI|human-like intelligence ranking/i, file);
    if (/sentience/i.test(body)) {
      assert.match(body, /does not measure consciousness, sentience, or general intelligence|does not make claims about consciousness or sentience|Not a consciousness or sentience benchmark/i, file);
    }
  }
});

test("first real data plan exists and forbids scoring", () => {
  const body = read("docs/first-real-data.md");
  assert.match(body, /https:\/\/zenodo\.org\/records\/17684862/);
  assert.match(body, /https:\/\/zenodo\.org\/records\/18298694/);
  assert.match(body, /8097928/);
  assert.match(body, /Do not score yet/);
  assert.match(body, /storageStatus = remote_only/);
});

test("source-only records remain outside leaderboard by status guard", () => {
  assert.equal(isPublicRunStatus("source_verified"), false);
  assert.equal(isPublicRunStatus("data_ingested"), false);
  assert.equal(isPublicRunStatus("unscored"), false);
});

test("ingestion creates provenance but not metrics or scores", () => {
  for (const file of [
    "scripts/ingest-zenodo.ts",
    "scripts/ingest-figshare.ts",
    "scripts/ingest-source.ts",
    "scripts/ingest-github.ts",
  ]) {
    const body = read(file);
    assert.match(body, /provenanceEvent\.create|buildProvenanceSql/, file);
    assert.doesNotMatch(body, /metricValue\.create|scoreCalculation\.create|MetricValue|ScoreCalculation/, file);
  }
});

test("Zenodo and Figshare checksums are preserved when present", () => {
  assert.deepEqual(parseChecksum("md5:abc123"), {
    checksumSha256: null,
    checksumAlgorithm: "md5",
    checksumValue: "abc123",
  });
  assert.deepEqual(parseChecksum("sha256:def456"), {
    checksumSha256: "def456",
    checksumAlgorithm: "sha256",
    checksumValue: "def456",
  });
});

test("dataset file storage status remains remote only in ingesters", () => {
  const zenodo = read("scripts/ingest-zenodo.ts");
  const figshare = read("scripts/ingest-figshare.ts");
  assert.match(zenodo, /storageStatus: "remote_only"/);
  assert.match(figshare, /storageStatus: "remote_only"/);
});

test("computed local score rows include CI and input-file provenance when local db has scores", () => {
  if (!fs.existsSync(path.join(root, "dev.db"))) return;
  const Database = require("better-sqlite3");
  const db = new Database(path.join(root, "dev.db"), { readonly: true });
  const scoreCount = db.prepare("SELECT COUNT(*) count FROM ScoreCalculation").get().count;
  if (scoreCount === 0) return;
  const rows = db
    .prepare(
      `SELECT MetricValue.derivationMethod, MetricValue.ciLow, MetricValue.ciHigh, ScoreCalculation.methodologyVersionId, ScoreCalculation.calculationJson
       FROM ScoreCalculation JOIN MetricValue ON MetricValue.benchmarkRunId = ScoreCalculation.benchmarkRunId`,
    )
    .all();
  assert.ok(rows.length > 0);
  for (const row of rows) {
    assert.equal(row.derivationMethod, "computed");
    assert.ok(row.ciLow != null);
    assert.ok(row.ciHigh != null);
    assert.ok(row.methodologyVersionId);
    const calc = JSON.parse(row.calculationJson);
    assert.ok(Array.isArray(calc.inputFiles));
    assert.ok(calc.inputFiles.length > 0);
    assert.ok(calc.inputFiles[0].checksumValue);
    assert.ok(calc.scriptName);
    assert.equal(calc.methodologyVersion, "0.1");
  }
});

test("refresh commands exist and default to local dry-run capable behavior", () => {
  assert.match(read("package.json"), /sources:refresh/);
  assert.match(read("package.json"), /scores:refresh/);
  assert.match(read("scripts/sources-refresh.mjs"), /--target=local/);
  assert.match(read("scripts/scores-refresh.mjs"), /needs_recompute/);
});

test("source and dataset pages expose source-backed unscored states", () => {
  const dataset = read("app/datasets/[id]/page.tsx");
  const source = read("app/sources/[id]/page.tsx");
  assert.match(dataset, /StatusBadge/);
  assert.match(dataset, /No systems reference this dataset yet/);
  assert.match(dataset, /not reported/);
  assert.match(source, /StatusBadge|source/);
  assert.doesNotMatch(source + dataset, /ScoreCalculation|compositeScore/);
});

test("docs explain GitHub Issues and D1 source of truth", () => {
  const docs = read("app/docs/page.tsx");
  assert.match(read("README.md"), /Production source of truth: the remote Cloudflare D1 database/);
  assert.match(docs, /Public submissions use GitHub Issues/);
  assert.match(docs, /The API endpoint is for structured intake/);
});

test("no fake benchmark rows scores or placeholder datasets", () => {
  const all = [
    read("app/page.tsx"),
    read("app/leaderboards/page.tsx"),
    read("app/datasets/page.tsx"),
    read("lib/leaderboard.ts"),
  ].join("\n");
  assert.doesNotMatch(all, /fake|demo score|placeholder dataset|placeholder row/i);
});
