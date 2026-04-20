import { z } from "zod";

export const VerificationStatus = z.enum([
  "draft",
  "source_verified",
  "data_ingested",
  "unscored",
  "provisional",
  "scored",
  "curator_reviewed",
  "published",
  "disputed",
  "deprecated",
]);
export type VerificationStatus = z.infer<typeof VerificationStatus>;

export const RunStatus = z.enum([
  "draft",
  "unscored",
  "provisional",
  "scored",
  "curator_reviewed",
  "published",
  "disputed",
  "deprecated",
]);

export const AccessStatus = z.enum([
  "open",
  "restricted",
  "request_required",
  "embargoed",
  "closed",
  "unknown",
]);

export const DerivationMethod = z.enum([
  "computed",
  "extracted_from_paper",
  "submitted",
  "curator_estimated",
]);

export const SourceKind = z.enum([
  "paper",
  "preprint",
  "zenodo",
  "figshare",
  "dandi",
  "github",
  "lab_submission",
  "webpage",
  "other",
]);

export const ReviewStatus = z.enum([
  "none",
  "preprint",
  "in_review",
  "peer_reviewed",
  "retracted",
]);

export const SubmissionSchema = z.object({
  submitterEmail: z.string().email(),
  submitterName: z.string().min(1).max(200).optional(),
  proposedSystemName: z.string().min(2).max(200),
  proposedTrackSlug: z.string().optional(),
  proposedTaskSlug: z.string().optional(),
  organizationName: z.string().optional(),
  sourceUrl: z.string().url().optional(),
  datasetUrl: z.string().url().optional(),
  codeUrl: z.string().url().optional(),
  description: z.string().max(8000).optional(),
  organoidPreparation: z
    .object({
      cellLine: z.string().optional(),
      brainRegion: z.string().optional(),
      divRange: z.string().optional(),
      protocolReference: z.string().optional(),
    })
    .optional(),
  recordingSetup: z
    .object({
      platform: z.string().optional(),
      channelCount: z.number().int().positive().optional(),
      samplingRateHz: z.number().int().positive().optional(),
      spikeSorter: z.string().optional(),
    })
    .optional(),
  metrics: z
    .array(
      z.object({
        metricSlug: z.string(),
        value: z.number().finite(),
        ciLow: z.number().finite().optional(),
        ciHigh: z.number().finite().optional(),
        derivationMethod: DerivationMethod,
        derivationNotes: z.string().max(2000).optional(),
      }),
    )
    .optional(),
  nOrganoids: z.number().int().positive().optional(),
  nSessions: z.number().int().positive().optional(),
  nBatches: z.number().int().positive().optional(),
  nLabs: z.number().int().positive().optional(),
  controls: z
    .array(
      z.object({
        controlSlug: z.string(),
        passed: z.boolean(),
        notes: z.string().max(1000).optional(),
      }),
    )
    .optional(),
  limitations: z.string().max(4000).optional(),
});
export type SubmissionInput = z.infer<typeof SubmissionSchema>;

export const CorrectionSchema = z.object({
  submitterEmail: z.string().email(),
  targetType: z.enum(["system", "dataset", "source", "metric_value", "benchmark_run"]),
  targetId: z.string().min(1),
  field: z.string().min(1).max(200),
  proposedValue: z.string().max(4000),
  rationale: z.string().min(10).max(4000),
  sourceUrl: z.string().url().optional(),
});
export type CorrectionInput = z.infer<typeof CorrectionSchema>;
