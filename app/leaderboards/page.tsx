import Link from "next/link";
import { Container, PageHeader, Section } from "@/components/ui/section";
import { EmptyState, StatusBadge } from "@/components/ui/empty-state";
import { getLeaderboardEntries, getLeaderboardFacets } from "@/lib/leaderboard";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function LeaderboardsPage(props: {
  searchParams: Promise<{ track?: string; status?: string; organization?: string }>;
}) {
  const sp = await props.searchParams;
  const [entries, facets, methodology] = await Promise.all([
    getLeaderboardEntries({
      trackSlug: sp.track,
      organizationId: sp.organization,
      verificationStatus: sp.status,
      limit: 500,
    }),
    getLeaderboardFacets(),
    prisma.methodologyVersion.findFirst({ where: { isCurrent: true } }),
  ]);

  const activeTrack = facets.tracks.find((t) => t.slug === sp.track);

  return (
    <>
      <PageHeader
        eyebrow="Leaderboard"
        title={activeTrack ? activeTrack.name : "All tracks"}
        description={
          methodology
            ? "Reviewed benchmark runs only."
            : "No current methodology is loaded."
        }
        right={
          <div className="flex gap-2 flex-wrap justify-end">
            <Link
              href="/api/v1/leaderboard/export.csv"
              className="inline-flex items-center rounded-full border border-[color:var(--border-strong)] px-4 py-2 text-sm font-medium hover:bg-[color:var(--surface-alt)]"
              prefetch={false}
            >
              Download CSV
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
        <div className="flex flex-wrap gap-2 pb-6 border-b border-[color:var(--border)]">
          <FacetLink href="/leaderboards" active={!sp.track} label="All tracks" />
          {facets.tracks.map((t) => (
            <FacetLink
              key={t.slug}
              href={`/leaderboards?track=${t.slug}`}
              active={sp.track === t.slug}
              label={t.name}
            />
          ))}
        </div>
      </Container>

      <Section>
        {entries.length === 0 ? (
          <EmptyState
            title="No verified benchmark runs are available yet."
            body={
              <>
                Source-backed datasets and systems will appear after curator review.
              </>
            }
            primaryHref="/submit"
            primaryLabel="Submit"
            secondaryHref="/methodology"
            secondaryLabel="Methodology"
          />
        ) : (
          <div className="w-full overflow-x-auto rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)]">
            <table className="w-full text-sm">
              <thead className="text-left bg-[color:var(--surface-alt)]">
                <tr>
                  <th className="px-4 py-3 font-medium w-10">#</th>
                  <th className="px-4 py-3 font-medium">System</th>
                  <th className="px-4 py-3 font-medium">Lab</th>
                  <th className="px-4 py-3 font-medium">Track</th>
                  <th className="px-4 py-3 font-medium">Source</th>
                  <th className="px-4 py-3 font-medium">Controls</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Score</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e, i) => (
                  <tr key={e.systemId + e.trackSlug} className="border-t border-[color:var(--border)]">
                    <td className="px-4 py-3 font-mono text-xs">{i + 1}</td>
                    <td className="px-4 py-3">
                      <Link href={`/runs/${e.runId}`} className="font-medium hover:underline">
                        {e.systemName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-[color:var(--foreground-muted)]">
                      {e.organizationName ?? "-"}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/benchmarks/${e.trackSlug}`} className="hover:underline">
                        {e.trackName}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      {e.sourceTitle ? (
                        e.sourceUrl ? (
                          <a className="hover:underline" href={e.sourceUrl} target="_blank" rel="noopener noreferrer">
                            {e.sourceTitle.slice(0, 40)}
                            {e.sourceTitle.length > 40 ? "..." : ""}
                          </a>
                        ) : (
                          e.sourceTitle.slice(0, 40)
                        )
                      ) : (
                        <span className="text-[color:var(--foreground-muted)]">no source</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {e.controlsPassedCount}/{e.controlsTotalCount}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={e.runStatus} />
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-right">
                      {e.trackScore != null ? e.trackScore.toFixed(2) : "unscored"}
                      {e.confidenceGrade ? (
                        <span className="ml-2 text-[color:var(--foreground-muted)]">{e.confidenceGrade}</span>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>
    </>
  );
}

function FacetLink({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center rounded-full px-3.5 py-1.5 text-sm font-medium ${
        active
          ? "bg-[color:var(--foreground)] text-[color:var(--background)]"
          : "border border-[color:var(--border-strong)] hover:bg-[color:var(--surface-alt)]"
      }`}
    >
      {label}
    </Link>
  );
}
