import { SubmissionSchema, type SubmissionInput } from "@/lib/validation";

const snakeToCamelMap: Record<string, string> = {
  submitter_email: "submitterEmail",
  submitter_name: "submitterName",
  submission_type: "submissionType",
  proposed_system_name: "proposedSystemName",
  proposed_track_slug: "proposedTrackSlug",
  proposed_task_slug: "proposedTaskSlug",
  benchmark_track: "benchmarkTrack",
  organization_name: "organizationName",
  source_url: "sourceUrl",
  paper_url: "paperUrl",
  dataset_url: "datasetUrl",
  code_url: "codeUrl",
  organoid_type: "organoidType",
  recording_platform: "recordingPlatform",
  organoid_preparation: "organoidPreparation",
  recording_setup: "recordingSetup",
  n_organoids: "nOrganoids",
  n_sessions: "nSessions",
  n_batches: "nBatches",
  n_labs: "nLabs",
};

function normalizeObject(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(normalizeObject);
  if (!value || typeof value !== "object") return value;

  const out: Record<string, unknown> = {};
  for (const [key, raw] of Object.entries(value)) {
    const normalizedKey = snakeToCamelMap[key] ?? key;
    out[normalizedKey] = normalizeObject(raw);
  }
  return out;
}

export function normalizeSubmissionInput(body: unknown): unknown {
  const normalized = normalizeObject(body);
  if (!normalized || typeof normalized !== "object" || Array.isArray(normalized)) {
    return normalized;
  }

  const input = { ...(normalized as Record<string, unknown>) };

  if (!input.proposedTrackSlug && typeof input.benchmarkTrack === "string") {
    input.proposedTrackSlug = input.benchmarkTrack;
  }
  if (!input.proposedTaskSlug && typeof input.task === "string") {
    input.proposedTaskSlug = input.task;
  }
  if (!input.organizationName && typeof input.affiliation === "string") {
    input.organizationName = input.affiliation;
  }
  if (!input.sourceUrl && typeof input.paperUrl === "string") {
    input.sourceUrl = input.paperUrl;
  }
  if (!input.proposedSystemName && typeof input.title === "string") {
    input.proposedSystemName = input.title;
  }

  return input;
}

export function parseSubmissionInput(body: unknown) {
  return SubmissionSchema.safeParse(normalizeSubmissionInput(body));
}

export const CANONICAL_SUBMISSION_EXAMPLE: SubmissionInput = {
  submitterEmail: "researcher@example.org",
  submitterName: "Researcher Name",
  affiliation: "Example Lab",
  submissionType: "system",
  title: "Source-backed organoid recording system",
  proposedSystemName: "Source-backed organoid recording system",
  proposedTrackSlug: "signal-quality",
  proposedTaskSlug: "baseline-recording",
  benchmarkTrack: "signal-quality",
  task: "baseline-recording",
  organizationName: "Example Lab",
  sourceUrl: "https://doi.org/10.0000/example",
  paperUrl: "https://doi.org/10.0000/example",
  datasetUrl: "https://zenodo.org/records/0000000",
  codeUrl: "https://github.com/example/repo",
  organoidType: "not reported",
  recordingPlatform: "not reported",
  notes: "Brief context for curator review.",
  limitations: "Known limitations or not reported.",
};
