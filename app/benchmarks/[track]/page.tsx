import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, PageHeader, Section } from "@/components/ui/section";
import { EmptyState, StatusBadge } from "@/components/ui/empty-state";
import { prisma } from "@/lib/db";
import { getLeaderboardEntries } from "@/lib/leaderboard";

export const dynamic = "force-dynamic";

export default async function TrackPage({
  params,
}: {
  params: Promise<{ track: string }>;
}) {
  const { track: slug } = await params;
  const track = await prisma.benchmarkTrack.findUnique({
    where: { slug },
    include: {
      metrics: true,
      tasks: true,
      _count: { select: { runs: true } },
    },
  });
  if (!track) notFound();

  const entries = await getLeaderboardEntries({ trackSlug: slug, limit: 200 });
  const methodology = await prisma.methodologyVersion.findFirst({ where: { isCurrent: true } });

  return (
    <>
      <PageHeader
        eyebrow="Benchmark track"
        title={track.name}
        description={track.description ?? undefined}
        right={
          <Link
            href="/methodology"
            className="inline-flex items-center rounded-full border border-[color:var(--border-strong)] px-4 py-2 text-sm font-medium hover:bg-[color:var(--surface-alt)]"
          >
            Methodology
          </Link>
        }
      />

      <Container>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-[12px] overflow-hidden border border-[color:var(--border)] bg-[color:var(--border)]">
          <Stat label="Systems evaluated" value={String(new Set(entries.map((e) => e.systemId)).size)} />
          <Stat label="Benchmark runs" value={String(track._count.runs)} />
          <Stat label="Metrics" value={String(track.metrics.length)} />
          <Stat label="Tasks" value={String(track.tasks.length)} />
        </div>
      </Container>

      {track.rationale && (
        <Section title="Why this track exists">
          <p className="text-sm text-[color:var(--foreground-muted)] max-w-3xl">{track.rationale}</p>
        </Section>
      )}

      <Section title="Leaderboard" description="Only rows with run status published, provisional, or scored appear.">
        {entries.length === 0 ? (
          <EmptyState
            title="No entries on this track yet"
            body="This track is seeded and ready to receive submissions. A source-backed benchmark run that passes review will appear here."
            primaryHref="/submit"
            primaryLabel="Submit an entry"
          />
        ) : (
          <div className="w-full overflow-x-auto rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)]">
            <table className="w-full text-sm">
              <thead className="text-left bg-[color:var(--surface-alt)]">
                <tr>
                  <th className="px-4 py-3 font-medium w-10">#</th>
                  <th className="px-4 py-3 font-medium">System</th>
                  <th className="px-4 py-3 font-medium">Lab</th>
                  <th className="px-4 py-3 font-medium">Source</th>
                  <th className="px-4 py-3 font-medium">Controls</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Track score</th>
                  <th className="px-4 py-3 font-medium text-right">Composite</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e, i) => {
                  const trackScore =
                    slug === "signal-quality"
                      ? e.signalScore
                      : slug === "responsiveness"
                        ? e.responseScore
                        : slug === "plasticity"
                          ? e.plasticityScore
                          : slug === "closed-loop-learning"
                            ? e.learningScore
                            : slug === "retention"
                              ? e.retentionScore
                              : e.reproducibilityScore;
                  return (
                    <tr key={e.systemId} className="border-t border-[color:var(--border)]">
                      <td className="px-4 py-3 font-mono text-xs">{i + 1}</td>
                      <td className="px-4 py-3">
                        <Link href={`/systems/${e.systemSlug}`} className="font-medium hover:underline">
                          {e.systemName}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-[color:var(--foreground-muted)]">{e.organizationName ?? "-"}</td>
                      <td className="px-4 py-3">
                        {e.sourceUrl ? (
                          <a className="hover:underline" href={e.sourceUrl} target="_blank" rel="noopener noreferrer">
                            {(e.sourceTitle ?? "source").slice(0, 36)}
                          </a>
                        ) : (
                          <span className="text-[color:var(--foreground-muted)]">no source</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{e.controlsPassedCount}/{e.controlsTotalCount}</td>
                      <td className="px-4 py-3"><StatusBadge status={e.runStatus} /></td>
                      <td className="px-4 py-3 font-mono text-xs text-right">
                        {trackScore != null ? trackScore.toFixed(2) : "-"}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-right">
                        {e.compositeScore != null ? e.compositeScore.toFixed(2) : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <Section title="Metric definitions">
        <div className="rounded-[12px] border border-[color:var(--border)] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[color:var(--surface-alt)] text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Metric</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium">Direction</th>
                <th className="px-4 py-3 font-medium text-right">Unit</th>
              </tr>
            </thead>
            <tbody>
              {track.metrics.map((m) => (
                <tr key={m.slug} className="border-t border-[color:var(--border)]">
                  <td className="px-4 py-3 font-medium">{m.name}</td>
                  <td className="px-4 py-3 text-[color:var(--foreground-muted)]">{m.description ?? "-"}</td>
                  <td className="px-4 py-3 font-mono text-xs">{m.direction}</td>
                  <td className="px-4 py-3 font-mono text-xs text-right">{m.unit ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {track.scoringFormula && (
        <Section title="Scoring formula">
          <div className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface-alt)] p-5 text-sm">
            {track.scoringFormula}
            {methodology && (
              <div className="mt-3 text-xs font-mono text-[color:var(--foreground-muted)]">
                Methodology v{methodology.version}
              </div>
            )}
          </div>
        </Section>
      )}

      <div className="h-16" />
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[color:var(--surface)] p-4">
      <div className="text-xs text-[color:var(--foreground-muted)]">{label}</div>
      <div className="mt-1 text-lg font-semibold font-mono">{value}</div>
    </div>
  );
}
