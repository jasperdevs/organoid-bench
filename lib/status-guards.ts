export const PUBLIC_RUN_STATUSES = ["published", "scored", "provisional"] as const;
export const PRIVATE_RUN_STATUSES = ["draft", "unscored", "disputed", "deprecated"] as const;

export type PublicRunStatus = (typeof PUBLIC_RUN_STATUSES)[number];

export function isPublicRunStatus(status: string): status is PublicRunStatus {
  return (PUBLIC_RUN_STATUSES as readonly string[]).includes(status);
}

export function canPublishSystem(input: { sourceId?: string | null }) {
  return Boolean(input.sourceId);
}

export function canPublishMetricValue(input: {
  sourceId?: string | null;
  provenanceEventCount?: number;
}) {
  return Boolean(input.sourceId) && (input.provenanceEventCount ?? 0) > 0;
}

export function canCreateScoreCalculation(input: { methodologyVersionId?: string | null }) {
  return Boolean(input.methodologyVersionId);
}
