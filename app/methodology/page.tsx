import { Container, PageHeader, Section } from "@/components/ui/section";
import { EmptyState } from "@/components/ui/empty-state";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function MethodologyPage() {
  const [versions, tracks] = await Promise.all([
    prisma.methodologyVersion.findMany({
      orderBy: { releasedAt: "desc" },
    }),
    prisma.benchmarkTrack.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        metrics: { orderBy: { name: "asc" } },
        tasks: { orderBy: { name: "asc" } },
      },
    }),
  ]);

  const current = versions.find((v) => v.isCurrent) ?? versions[0];

  return (
    <>
      <PageHeader
        eyebrow="Methodology"
        title={current ? `Methodology ${current.version}` : "Methodology"}
        description={
          current
            ? `Released ${current.releasedAt.toISOString().slice(0, 10)}. ${current.summary ?? ""}`
            : "No methodology version has been published yet."
        }
      />

      {!current && (
        <Container>
          <EmptyState
            title="No methodology versions"
            body="Methodology has not been loaded."
          />
        </Container>
      )}

      {current?.formulaJson && (
        <Section title="Current scoring formula">
          <pre className="font-mono text-xs whitespace-pre bg-[color:var(--surface-alt)] rounded-[12px] p-4 border border-[color:var(--border)] overflow-x-auto">
            {prettyJson(current.formulaJson)}
          </pre>
        </Section>
      )}

      <Section title="Tracks and metrics">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {tracks.map((t) => (
            <div key={t.id} className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{t.name}</div>
                  <div className="text-xs font-mono text-[color:var(--foreground-muted)] mt-0.5">{t.slug}</div>
                </div>
              </div>
              {t.description && (
                <p className="mt-3 text-sm text-[color:var(--foreground-muted)]">{t.description}</p>
              )}
              {t.rationale && (
                <p className="mt-2 text-xs text-[color:var(--foreground-muted)] italic">{t.rationale}</p>
              )}
              {t.scoringFormula && (
                <pre className="mt-3 font-mono text-xs whitespace-pre-wrap bg-[color:var(--surface-alt)] rounded-[8px] p-3 border border-[color:var(--border)]">
                  {t.scoringFormula}
                </pre>
              )}
              {t.metrics.length > 0 && (
                <div className="mt-3">
                  <div className="text-xs font-mono text-[color:var(--foreground-muted)] mb-1">Metrics</div>
                  <ul className="text-sm space-y-1">
                    {t.metrics.map((m) => (
                      <li key={m.id} className="flex items-start justify-between gap-3">
                        <span>{m.name}</span>
                        <span className="font-mono text-xs text-[color:var(--foreground-muted)] shrink-0">
                          {m.unit ?? "-"} · {m.direction === "higher_better" ? "↑" : "↓"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {t.tasks.length > 0 && (
                <div className="mt-3">
                  <div className="text-xs font-mono text-[color:var(--foreground-muted)] mb-1">Tasks</div>
                  <div className="flex flex-wrap gap-1.5">
                    {t.tasks.map((tk) => (
                      <span key={tk.id} className="inline-flex items-center rounded-full border border-[color:var(--border)] px-2.5 py-0.5 text-xs font-mono">
                        {tk.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Section>

      <Section title="Changelog" description="Every methodology revision is versioned. Scores on affected runs are recomputed on release.">
        {versions.length === 0 ? (
          <div className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 text-sm text-[color:var(--foreground-muted)]">
            No methodology rows in the database.
          </div>
        ) : (
          <div className="rounded-[12px] border border-[color:var(--border)] overflow-hidden">
            <div className="max-h-[420px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-[color:var(--surface-alt)] text-left">
                  <tr>
                    <th className="px-3 py-2 font-medium text-xs w-24">Version</th>
                    <th className="px-3 py-2 font-medium text-xs w-28">Released</th>
                    <th className="px-3 py-2 font-medium text-xs">Summary</th>
                  </tr>
                </thead>
                <tbody>
                  {versions.map((v) => (
                    <tr key={v.id} className="border-t border-[color:var(--border)] align-top">
                      <td className="px-3 py-2 font-mono text-xs">
                        {v.version}
                        {v.isCurrent && <span className="ml-1 text-[10px] text-[color:var(--foreground-muted)]">(current)</span>}
                      </td>
                      <td className="px-3 py-2 font-mono text-xs text-[color:var(--foreground-muted)]">
                        {v.releasedAt.toISOString().slice(0, 10)}
                      </td>
                      <td className="px-3 py-2 text-sm">
                        <div>{v.summary ?? "-"}</div>
                        {v.changelog && (
                          <pre className="mt-1 font-mono text-xs whitespace-pre-wrap text-[color:var(--foreground-muted)]">{v.changelog}</pre>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Section>

      <div className="h-16" />
    </>
  );
}

function prettyJson(raw: string): string {
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
}
