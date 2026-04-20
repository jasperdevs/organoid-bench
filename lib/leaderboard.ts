import { prisma } from "@/lib/db";
import { PUBLIC_RUN_STATUSES } from "@/lib/status-guards";

/**
 * leaderboard_entries_v (logical view).
 *
 * Implemented as a Prisma query because SQLite materialized views aren't
 * supported and we want this to work identically on Postgres later. When
 * the site moves to Postgres, swap this for a real CREATE MATERIALIZED
 * VIEW and a $queryRaw call.
 *
 * A row appears only when the system has a benchmark run whose run_status
 * is one of: published, provisional, scored. Disputed and deprecated rows
 * are excluded from the default leaderboard and surfaced on detail pages
 * only.
 */

export type LeaderboardEntry = {
  systemId: string;
  systemSlug: string;
  systemName: string;
  organizationId: string | null;
  organizationName: string | null;
  trackSlug: string;
  trackName: string;
  taskSlug: string | null;
  taskName: string | null;
  datasetId: string | null;
  datasetName: string | null;
  datasetSlug: string | null;
  sourceId: string | null;
  sourceTitle: string | null;
  sourceUrl: string | null;
  sourceDoi: string | null;
  peerReviewStatus: string | null;
  rawDataAvailable: boolean;
  processedDataAvailable: boolean;
  codeAvailable: boolean;
  nOrganoids: number | null;
  nSessions: number | null;
  nBatches: number | null;
  nLabs: number | null;
  controlsPassedCount: number;
  controlsTotalCount: number;
  signalScore: number | null;
  responseScore: number | null;
  plasticityScore: number | null;
  learningScore: number | null;
  retentionScore: number | null;
  reproducibilityScore: number | null;
  trackScore: number | null;
  compositeScore: number | null;
  confidenceGrade: string | null;
  verificationStatus: string;
  runStatus: string;
  methodologyVersion: string | null;
  lastUpdated: string;
};

export type LeaderboardFilter = {
  trackSlug?: string;
  organizationId?: string;
  verificationStatus?: string;
  runStatus?: string;
  limit?: number;
};

export async function getLeaderboardEntries(
  filter: LeaderboardFilter = {},
): Promise<LeaderboardEntry[]> {
  const runs = await prisma.benchmarkRun.findMany({
    where: {
      runStatus: filter.runStatus
        ? filter.runStatus
        : { in: [...PUBLIC_RUN_STATUSES] },
      track: filter.trackSlug ? { slug: filter.trackSlug } : undefined,
      system: filter.organizationId
        ? { organizationId: filter.organizationId }
        : filter.verificationStatus
          ? { verificationStatus: filter.verificationStatus }
          : undefined,
    },
    include: {
      system: {
        include: {
          organization: true,
          dataset: true,
          source: true,
        },
      },
      track: true,
      task: true,
      methodologyVersion: true,
      scoreCalculations: true,
      runControls: true,
    },
    orderBy: { updatedAt: "desc" },
    take: filter.limit ?? 200,
  });

  return runs.map((r): LeaderboardEntry => {
    const scoreByType = new Map(
      r.scoreCalculations.map((sc) => [sc.scoreType, sc.score ?? null] as const),
    );
    const confidenceByType = new Map(
      r.scoreCalculations.map((sc) => [sc.scoreType, sc.confidenceGrade ?? null] as const),
    );
    const composite = r.scoreCalculations.find((sc) => sc.scoreType === "composite");
    const trackScoreType =
      r.track.slug === "signal-quality"
        ? "signal"
        : r.track.slug === "responsiveness"
          ? "response"
          : r.track.slug === "plasticity"
            ? "plasticity"
            : r.track.slug === "closed-loop-learning"
              ? "learning"
              : r.track.slug === "retention"
                ? "retention"
                : r.track.slug === "reproducibility"
                  ? "repro"
                  : "composite";
    const trackScore = scoreByType.get(trackScoreType) ?? null;
    const controlsPassedCount = r.runControls.filter((rc) => rc.passed === true).length;
    const controlsTotalCount = r.runControls.length;

    return {
      systemId: r.system.id,
      systemSlug: r.system.slug,
      systemName: r.system.name,
      organizationId: r.system.organizationId,
      organizationName: r.system.organization?.name ?? null,
      trackSlug: r.track.slug,
      trackName: r.track.name,
      taskSlug: r.task?.slug ?? null,
      taskName: r.task?.name ?? null,
      datasetId: r.system.datasetId,
      datasetName: r.system.dataset?.name ?? null,
      datasetSlug: r.system.dataset?.slug ?? null,
      sourceId: r.system.sourceId,
      sourceTitle: r.system.source?.title ?? null,
      sourceUrl: r.system.source?.url ?? null,
      sourceDoi: r.system.source?.doi ?? null,
      peerReviewStatus: r.system.source?.reviewStatus ?? null,
      rawDataAvailable: r.system.dataset?.rawDataAvailable ?? false,
      processedDataAvailable: r.system.dataset?.processedDataAvailable ?? false,
      codeAvailable: r.system.dataset?.codeAvailable ?? false,
      nOrganoids: r.nOrganoids,
      nSessions: r.nSessions,
      nBatches: r.nBatches,
      nLabs: r.nLabs,
      controlsPassedCount,
      controlsTotalCount,
      signalScore: scoreByType.get("signal") ?? null,
      responseScore: scoreByType.get("response") ?? null,
      plasticityScore: scoreByType.get("plasticity") ?? null,
      learningScore: scoreByType.get("learning") ?? null,
      retentionScore: scoreByType.get("retention") ?? null,
      reproducibilityScore: scoreByType.get("repro") ?? null,
      trackScore,
      compositeScore: composite?.score ?? null,
      confidenceGrade: confidenceByType.get(trackScoreType) ?? composite?.confidenceGrade ?? null,
      verificationStatus: r.system.verificationStatus,
      runStatus: r.runStatus,
      methodologyVersion: r.methodologyVersion?.version ?? null,
      lastUpdated: r.updatedAt.toISOString(),
    };
  });
}

export async function getLeaderboardFacets() {
  const [tracks, tasks, organizations, prepLines, setups] = await Promise.all([
    prisma.benchmarkTrack.findMany({
      orderBy: { sortOrder: "asc" },
      select: { slug: true, name: true },
    }),
    prisma.task.findMany({
      orderBy: { name: "asc" },
      select: { slug: true, name: true, track: { select: { slug: true } } },
    }),
    prisma.organization.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.organoidPreparation.findMany({
      distinct: ["cellLine"],
      where: { cellLine: { not: null } },
      select: { cellLine: true },
    }),
    prisma.recordingSetup.findMany({
      distinct: ["platform"],
      where: { platform: { not: null } },
      select: { platform: true },
    }),
  ]);

  return {
    tracks,
    tasks,
    organizations,
    organoidTypes: prepLines.map((p) => p.cellLine).filter(Boolean) as string[],
    recordingPlatforms: setups.map((s) => s.platform).filter(Boolean) as string[],
    modalities: ["MEA", "calcium_imaging", "patch_clamp", "EEG", "mixed", "other"],
    accessStatuses: ["open", "restricted", "request_required", "embargoed", "closed", "unknown"],
    verificationStatuses: [
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
    ],
    reviewStatuses: ["none", "preprint", "in_review", "peer_reviewed", "retracted"],
    dataAvailability: ["raw", "processed", "metadata", "code"],
    controlStatuses: ["passed", "failed", "not_applicable", "not_reported"],
  };
}
