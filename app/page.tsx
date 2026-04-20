import Link from "next/link";
import { Container, PageHeader, Section } from "@/components/ui/section";
import { EmptyState, StatusBadge } from "@/components/ui/empty-state";
import { prisma } from "@/lib/db";
import { getLeaderboardEntries } from "@/lib/leaderboard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [
    trackCount,
    systemCount,
    datasetCount,
    sourceCount,
    orgCount,
    runCount,
    recentEntries,
    recentEvents,
  ] = await Promise.all([
    prisma.benchmarkTrack.count(),
    prisma.system.count(),
    prisma.dataset.count(),
    prisma.source.count(),
    prisma.organization.count(),
    prisma.benchmarkRun.count(),
    getLeaderboardEntries({ limit: 6 }),
    prisma.provenanceEvent.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
  ]);

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
        <div className="grid grid-cols-2 md:grid-cols-6 gap-px rounded-[12px] overflow-hidden border border-[color:var(--border)] bg-[color:var(--border)]">
          <Stat label="Tracks" value={trackCount} />
          <Stat label="Systems" value={systemCount} />
          <Stat label="Datasets" value={datasetCount} />
          <Stat label="Sources" value={sourceCount} />
          <Stat label="Labs" value={orgCount} />
          <Stat label="Benchmark runs" value={runCount} />
        </div>
      </Container>

      <Section
        title="Published runs"
        right={
          <Link href="/leaderboards" className="text-sm font-medium underline underline-offset-4">
            Full leaderboard
          </Link>
        }
      >
        {recentEntries.length === 0 ? (
          <EmptyState
            title="No verified benchmark runs are available yet."
            body="Reviewed benchmark runs will appear here."
            primaryHref="/submit"
            primaryLabel="Submit"
          />
        ) : (
          <div className="w-full overflow-x-auto rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)]">
            <table className="w-full text-sm">
              <thead className="text-left bg-[color:var(--surface-alt)]">
                <tr>
                  <th className="px-4 py-3 font-medium">System</th>
                  <th className="px-4 py-3 font-medium">Lab</th>
                  <th className="px-4 py-3 font-medium">Track</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Composite</th>
                </tr>
              </thead>
              <tbody>
                {recentEntries.map((e) => (
                  <tr key={e.systemId} className="border-t border-[color:var(--border)]">
                    <td className="px-4 py-3">
                      <Link href={`/systems/${e.systemSlug}`} className="font-medium hover:underline">
                        {e.systemName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-[color:var(--foreground-muted)]">{e.organizationName ?? "-"}</td>
                    <td className="px-4 py-3">
                      <Link href={`/benchmarks/${e.trackSlug}`} className="hover:underline">
                        {e.trackName}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={e.runStatus} />
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-right">
                      {e.compositeScore != null ? e.compositeScore.toFixed(2) : "insufficient data"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <Section title="Provenance">
        {recentEvents.length === 0 ? (
          <div className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 text-sm text-[color:var(--foreground-muted)]">
            No provenance events yet.
          </div>
        ) : (
          <ul className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] divide-y divide-[color:var(--border)] max-h-[360px] overflow-y-auto">
            {recentEvents.map((ev) => (
              <li key={ev.id} className="px-4 py-3 text-sm flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-mono text-xs text-[color:var(--foreground-muted)]">{ev.eventType}</div>
                  <div className="mt-0.5 truncate">{ev.message ?? "-"}</div>
                </div>
                <div className="font-mono text-xs text-[color:var(--foreground-muted)] shrink-0">
                  {ev.createdAt.toISOString().slice(0, 10)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-[color:var(--surface)] p-4">
      <div className="text-xs text-[color:var(--foreground-muted)]">{label}</div>
      <div className="mt-1 text-xl font-semibold font-mono">{value}</div>
    </div>
  );
}
