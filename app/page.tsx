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
    methodology,
    recentEntries,
    recentEvents,
  ] = await Promise.all([
    prisma.benchmarkTrack.count(),
    prisma.system.count(),
    prisma.dataset.count(),
    prisma.source.count(),
    prisma.organization.count(),
    prisma.benchmarkRun.count(),
    prisma.methodologyVersion.findFirst({ where: { isCurrent: true } }),
    getLeaderboardEntries({ limit: 6 }),
    prisma.provenanceEvent.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Registry, not a demo"
        title="OrganoidBench"
        description="An open benchmark registry for brain organoid electrophysiology and closed-loop systems. Every row on this site is backed by a cited source in the database. Rows without sources do not appear."
        right={
          <div className="flex gap-2 flex-wrap justify-end">
            <Link
              href="/leaderboards"
              className="inline-flex items-center rounded-full bg-[color:var(--foreground)] text-[color:var(--background)] px-4 py-2 text-sm font-medium"
            >
              Browse leaderboard
            </Link>
            <Link
              href="/methodology"
              className="inline-flex items-center rounded-full border border-[color:var(--border-strong)] px-4 py-2 text-sm font-medium hover:bg-[color:var(--surface-alt)]"
            >
              Methodology
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
        {methodology && (
          <p className="mt-3 text-xs font-mono text-[color:var(--foreground-muted)]">
            Methodology v{methodology.version}, released {new Date(methodology.releasedAt).toISOString().slice(0, 10)}.
          </p>
        )}
      </Container>

      <Section
        title="Same data, from the API"
        description="The numbers above are read from the database. The API returns the exact same values. If this page is empty, the API is empty."
        right={
          <Link href="/docs" className="text-sm font-medium underline underline-offset-4">
            API reference
          </Link>
        }
      >
        <div className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-[color:var(--border)] bg-[color:var(--surface-alt)]">
            <span className="inline-block h-2 w-2 rounded-full bg-[color:var(--foreground)]" aria-hidden />
            <span className="inline-block h-2 w-2 rounded-full bg-[color:var(--border-strong)]" aria-hidden />
            <span className="inline-block h-2 w-2 rounded-full bg-[color:var(--border-strong)]" aria-hidden />
            <code className="ml-3 font-mono text-[11px] text-[color:var(--foreground-muted)]">GET /api/v1/health</code>
          </div>
          <pre className="font-mono text-xs whitespace-pre overflow-x-auto p-4 leading-relaxed">
{JSON.stringify(
  {
    ok: true,
    tracks: trackCount,
    systems: systemCount,
    datasets: datasetCount,
    sources: sourceCount,
    organizations: orgCount,
    benchmark_runs: runCount,
    methodology: methodology
      ? {
          version: methodology.version,
          released_at: methodology.releasedAt.toISOString().slice(0, 10),
          is_current: true,
        }
      : null,
    generated_at: new Date().toISOString(),
  },
  null,
  2,
)}
          </pre>
        </div>
      </Section>

      <Section
        title="Recently published entries"
        description="Entries appear only once a source, dataset, and benchmark run exist in the database. If this list is empty, no rows have reached that threshold yet."
        right={
          <Link href="/leaderboards" className="text-sm font-medium underline underline-offset-4">
            Full leaderboard
          </Link>
        }
      >
        {recentEntries.length === 0 ? (
          <EmptyState
            title="No published systems yet"
            body="OrganoidBench is live but has zero verified systems in the registry. The six benchmark tracks are seeded; runs, scores, and leaderboard rows will populate as labs submit source-backed entries."
            primaryHref="/submit"
            primaryLabel="Submit an entry"
            secondaryHref="/methodology"
            secondaryLabel="Methodology"
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

      <Section
        title="Provenance log"
        description="Every ingestion, validation, and correction appears here. If nothing has happened yet, the log is empty."
      >
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
