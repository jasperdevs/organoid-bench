import Link from "next/link";
import { Container, PageHeader } from "@/components/ui/section";
import { prisma } from "@/lib/db";
import { getLeaderboardEntries } from "@/lib/leaderboard";
import { HomeDashboard } from "@/app/home-dashboard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [
    leaderboardEntries,
    datasets,
    sources,
    tracks,
    datasetCount,
    sourceCount,
    runCount,
  ] = await Promise.all([
    getLeaderboardEntries({ limit: 120 }),
    prisma.dataset.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        sizeBytes: true,
        rawDataAvailable: true,
        processedDataAvailable: true,
        metadataAvailable: true,
        codeAvailable: true,
        updatedAt: true,
        files: {
          select: {
            id: true,
            sizeBytes: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.source.findMany({
      select: {
        id: true,
        title: true,
        url: true,
        doi: true,
        repositoryType: true,
        updatedAt: true,
        datasets: {
          select: {
            id: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 12,
    }),
    prisma.benchmarkTrack.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        tasks: { select: { id: true } },
        runs: { select: { id: true, runStatus: true } },
      },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.dataset.count(),
    prisma.source.count(),
    prisma.benchmarkRun.count(),
  ]);

  const scoreRows = leaderboardEntries.map((entry) => ({
    runId: entry.runId,
    systemSlug: entry.systemSlug,
    systemName: entry.systemName,
    organizationName: entry.organizationName,
    trackSlug: entry.trackSlug,
    trackName: entry.trackName,
    runStatus: entry.runStatus,
    score: entry.trackScore,
    confidenceGrade: entry.confidenceGrade,
    controlsPassed: entry.controlsPassedCount,
    controlsTotal: entry.controlsTotalCount,
    nOrganoids: entry.nOrganoids,
    nSessions: entry.nSessions,
    nLabs: entry.nLabs,
    lastUpdated: entry.lastUpdated,
  }));

  const availability = [
    { label: "Raw", value: datasets.filter((d) => d.rawDataAvailable).length },
    { label: "Processed", value: datasets.filter((d) => d.processedDataAvailable).length },
    { label: "Metadata", value: datasets.filter((d) => d.metadataAvailable).length },
    { label: "Code", value: datasets.filter((d) => d.codeAvailable).length },
  ];

  const sourcePlatformMap = new Map<string, number>();
  for (const source of sources) {
    const key = source.repositoryType ?? "other";
    sourcePlatformMap.set(key, (sourcePlatformMap.get(key) ?? 0) + 1);
  }

  const sourcePlatforms = Array.from(sourcePlatformMap.entries()).map(([label, value]) => ({
    label,
    value,
  }));

  const fileInventory = datasets
    .map((dataset) => ({
      label: dataset.name,
      slug: dataset.slug,
      fileCount: dataset.files.length,
      totalBytes: dataset.files.reduce(
        (sum, file) => sum + Number(file.sizeBytes ?? 0),
        0,
      ),
    }))
    .sort((a, b) => b.fileCount - a.fileCount)
    .slice(0, 10);

  const trackRows = tracks.map((track) => ({
    slug: track.slug,
    name: track.name,
    taskCount: track.tasks.length,
    provisionalRunCount: track.runs.filter((run) => run.runStatus === "provisional").length,
    statusCounts: {
      published: track.runs.filter((r) => r.runStatus === "published").length,
      provisional: track.runs.filter((r) => r.runStatus === "provisional").length,
      scored: track.runs.filter((r) => r.runStatus === "scored").length,
      other: track.runs.filter(
        (r) => !["published", "provisional", "scored"].includes(r.runStatus),
      ).length,
    },
  }));

  const sourceRows = sources.map((source) => ({
    id: source.id,
    title: source.title,
    url: source.url,
    doi: source.doi,
    repositoryType: source.repositoryType,
    datasetCount: source.datasets.length,
    updatedAt: source.updatedAt.toISOString(),
  }));

  const datasetRows = datasets.slice(0, 8).map((d) => ({
    slug: d.slug,
    name: d.name,
    updatedAt: d.updatedAt.toISOString(),
    fileCount: d.files.length,
  }));

  return (
    <>
      <PageHeader
        eyebrow="Brain organoid benchmark"
        title="OrganoidBench"
        description="Compare brain organoid systems with source-backed data and provisional track scores."
        right={
          <div className="flex gap-2 flex-wrap justify-end">
            <Link
              href="/leaderboards"
              className="inline-flex items-center rounded-full bg-[color:var(--foreground)] text-[color:var(--background)] px-4 py-2 text-sm font-medium"
            >
              Browse leaderboard
            </Link>
            <Link href="/datasets" className="inline-flex items-center rounded-full border border-[color:var(--border-strong)] px-4 py-2 text-sm font-medium hover:bg-[color:var(--surface-alt)]">
              Browse data
            </Link>
          </div>
        }
      />

      <Container>
        <HomeDashboard
          scores={scoreRows}
          availability={availability}
          sourcePlatforms={sourcePlatforms}
          fileInventory={fileInventory}
          tracks={trackRows}
          sources={sourceRows}
          datasets={datasetRows}
          summary={{ datasetCount, sourceCount, runCount }}
        />
      </Container>
    </>
  );
}
