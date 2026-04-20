import Link from "next/link";
import { Container, PageHeader } from "@/components/ui/section";
import { prisma } from "@/lib/db";
import { getLeaderboardEntries } from "@/lib/leaderboard";
import { HomeDashboard } from "@/app/home-dashboard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [
    datasetCount,
    sourceCount,
    runCount,
    recentEntries,
    datasets,
  ] = await Promise.all([
    prisma.dataset.count(),
    prisma.source.count(),
    prisma.benchmarkRun.count(),
    getLeaderboardEntries({ limit: 6 }),
    prisma.dataset.findMany({
      select: {
        rawDataAvailable: true,
        processedDataAvailable: true,
        metadataAvailable: true,
        codeAvailable: true,
      },
    }),
  ]);

  const scoreRows = recentEntries.map((entry) => ({
    systemSlug: entry.systemSlug,
    systemName: entry.systemName,
    trackName: entry.trackName,
    runStatus: entry.runStatus,
    score: entry.trackScore,
    confidenceGrade: entry.confidenceGrade,
  }));

  const availability = [
    { label: "Raw", value: datasets.filter((d) => d.rawDataAvailable).length },
    { label: "Processed", value: datasets.filter((d) => d.processedDataAvailable).length },
    { label: "Metadata", value: datasets.filter((d) => d.metadataAvailable).length },
    { label: "Code", value: datasets.filter((d) => d.codeAvailable).length },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Brain organoid benchmarks"
        title="OrganoidBench"
        description="A benchmark for brain organoid systems."
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
          summary={{ datasetCount, sourceCount, runCount }}
        />
      </Container>
    </>
  );
}
