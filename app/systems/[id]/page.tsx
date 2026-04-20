import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, PageHeader, Section } from "@/components/ui/section";
import { StatusBadge } from "@/components/ui/empty-state";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function SystemDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const system = await prisma.system.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    include: {
      organization: true,
      dataset: true,
      source: true,
      organoidPreparation: true,
      recordingSetup: true,
      stimulationProtocol: true,
      task: { include: { track: true } },
      runs: {
        include: {
          track: true,
          task: true,
          methodologyVersion: true,
          scoreCalculations: true,
          runControls: { include: { control: true } },
          metricValues: { include: { metric: { include: { track: true } }, source: true } },
        },
        orderBy: { runDate: "desc" },
      },
      provenanceEvents: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!system) notFound();

  return (
    <>
      <PageHeader
        eyebrow="System"
        title={system.name}
        description={system.description ?? undefined}
        right={<StatusBadge status={system.verificationStatus} />}
      />

      <Container>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Panel title="Organization">
            {system.organization ? (
              <Link href={`/organizations/${system.organization.id}`} className="font-medium hover:underline">
                {system.organization.name}
              </Link>
            ) : (
              <span className="text-[color:var(--foreground-muted)]">unspecified</span>
            )}
            {system.organization?.pi && (
              <div className="text-sm text-[color:var(--foreground-muted)]">PI: {system.organization.pi}</div>
            )}
          </Panel>
          <Panel title="Source">
            {system.source ? (
              <>
                <div className="font-medium">{system.source.title}</div>
                {system.source.doi && (
                  <div className="text-xs font-mono text-[color:var(--foreground-muted)] mt-0.5">DOI {system.source.doi}</div>
                )}
                {system.source.url && (
                  <a className="text-sm hover:underline" href={system.source.url} target="_blank" rel="noopener noreferrer">
                    Open source
                  </a>
                )}
              </>
            ) : (
              <span className="text-[color:var(--foreground-muted)]">no source cited. This system cannot be ranked.</span>
            )}
          </Panel>
          <Panel title="Dataset">
            {system.dataset ? (
              <>
                <Link href={`/datasets/${system.dataset.slug}`} className="font-medium hover:underline">
                  {system.dataset.name}
                </Link>
                <div className="text-xs font-mono text-[color:var(--foreground-muted)] mt-0.5">
                  access: {system.dataset.accessStatus}
                </div>
              </>
            ) : (
              <span className="text-[color:var(--foreground-muted)]">no dataset linked</span>
            )}
          </Panel>
        </div>
      </Container>

      <Section title="Experimental configuration">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Panel title="Organoid preparation">
            {system.organoidPreparation ? (
              <div className="text-sm space-y-1">
                <div>{system.organoidPreparation.name}</div>
                {system.organoidPreparation.cellLine && (
                  <div className="text-[color:var(--foreground-muted)]">cell line: {system.organoidPreparation.cellLine}</div>
                )}
                {system.organoidPreparation.brainRegion && (
                  <div className="text-[color:var(--foreground-muted)]">region: {system.organoidPreparation.brainRegion}</div>
                )}
                {system.organoidPreparation.divRange && (
                  <div className="text-[color:var(--foreground-muted)]">DIV: {system.organoidPreparation.divRange}</div>
                )}
              </div>
            ) : <Missing />}
          </Panel>
          <Panel title="Recording setup">
            {system.recordingSetup ? (
              <div className="text-sm space-y-1">
                <div>{system.recordingSetup.name}</div>
                {system.recordingSetup.platform && (
                  <div className="text-[color:var(--foreground-muted)]">platform: {system.recordingSetup.platform}</div>
                )}
                {system.recordingSetup.channelCount != null && (
                  <div className="text-[color:var(--foreground-muted)]">channels: {system.recordingSetup.channelCount}</div>
                )}
                {system.recordingSetup.samplingRateHz != null && (
                  <div className="text-[color:var(--foreground-muted)]">rate: {system.recordingSetup.samplingRateHz} Hz</div>
                )}
                {system.recordingSetup.spikeSorter && (
                  <div className="text-[color:var(--foreground-muted)]">sorter: {system.recordingSetup.spikeSorter}</div>
                )}
              </div>
            ) : <Missing />}
          </Panel>
          <Panel title="Stimulation protocol">
            {system.stimulationProtocol ? (
              <div className="text-sm space-y-1">
                <div>{system.stimulationProtocol.name}</div>
                {system.stimulationProtocol.waveform && (
                  <div className="text-[color:var(--foreground-muted)]">waveform: {system.stimulationProtocol.waveform}</div>
                )}
                {system.stimulationProtocol.amplitudeUa != null && (
                  <div className="text-[color:var(--foreground-muted)]">amplitude: {system.stimulationProtocol.amplitudeUa} uA</div>
                )}
                {system.stimulationProtocol.frequencyHz != null && (
                  <div className="text-[color:var(--foreground-muted)]">freq: {system.stimulationProtocol.frequencyHz} Hz</div>
                )}
              </div>
            ) : <Missing />}
          </Panel>
        </div>
      </Section>

      <Section title="Benchmark runs" description="One scored evaluation per row. Unscored rows show their status, not a fabricated score.">
        {system.runs.length === 0 ? (
          <div className="rounded-[12px] border border-dashed border-[color:var(--border-strong)] bg-[color:var(--surface)] p-6 text-sm text-[color:var(--foreground-muted)]">
            No benchmark runs recorded for this system yet.
          </div>
        ) : (
          <div className="space-y-3">
            {system.runs.map((r) => {
              const composite = r.scoreCalculations.find((sc) => sc.scoreType === "composite");
              return (
                <div key={r.id} className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <div className="font-medium">
                        <Link href={`/benchmarks/${r.track.slug}`} className="hover:underline">{r.track.name}</Link>
                        {r.task && <span className="text-[color:var(--foreground-muted)]"> / {r.task.name}</span>}
                      </div>
                      <div className="text-xs font-mono text-[color:var(--foreground-muted)] mt-0.5">
                        methodology {r.methodologyVersion?.version ?? "unassigned"}
                        {r.runDate && ` · ${r.runDate.toISOString().slice(0, 10)}`}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={r.runStatus} />
                      <div className="font-mono text-sm">
                        {composite?.score != null ? composite.score.toFixed(2) : "unscored"}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
                    <KV k="organoids" v={r.nOrganoids} />
                    <KV k="sessions" v={r.nSessions} />
                    <KV k="batches" v={r.nBatches} />
                    <KV k="labs" v={r.nLabs} />
                  </div>
                  {r.metricValues.length > 0 && (
                    <div className="mt-3 rounded-[8px] border border-[color:var(--border)] overflow-hidden">
                      <table className="w-full text-xs">
                        <thead className="bg-[color:var(--surface-alt)] text-left">
                          <tr>
                            <th className="px-3 py-2 font-medium">Metric</th>
                            <th className="px-3 py-2 font-medium">Derivation</th>
                            <th className="px-3 py-2 font-medium">Source</th>
                            <th className="px-3 py-2 font-medium text-right">Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          {r.metricValues.map((mv) => (
                            <tr key={mv.id} className="border-t border-[color:var(--border)]">
                              <td className="px-3 py-2">{mv.metric.name}</td>
                              <td className="px-3 py-2 font-mono">{mv.derivationMethod}</td>
                              <td className="px-3 py-2 truncate">{mv.source?.title ?? "-"}</td>
                              <td className="px-3 py-2 font-mono text-right">
                                {mv.value.toFixed(3)}
                                {mv.metric.unit && <span className="text-[color:var(--foreground-muted)]"> {mv.metric.unit}</span>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {r.runControls.length > 0 && (
                    <div className="mt-3">
                      <div className="text-xs font-mono text-[color:var(--foreground-muted)] mb-1">Controls</div>
                      <div className="flex flex-wrap gap-1.5">
                        {r.runControls.map((rc) => (
                          <span
                            key={rc.id}
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-mono border ${
                              rc.passed === true
                                ? "border-[color:var(--foreground)] text-[color:var(--foreground)]"
                                : rc.passed === false
                                  ? "border-[color:var(--border-strong)] text-[color:var(--foreground-muted)] line-through"
                                  : "border-dashed border-[color:var(--border)] text-[color:var(--foreground-muted)]"
                            }`}
                          >
                            {rc.control.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Section>

      {system.limitations && (
        <Section title="Limitations">
          <p className="text-sm text-[color:var(--foreground-muted)] max-w-3xl whitespace-pre-line">{system.limitations}</p>
        </Section>
      )}

      <Section title="Provenance history">
        {system.provenanceEvents.length === 0 ? (
          <div className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 text-sm text-[color:var(--foreground-muted)]">
            No provenance events.
          </div>
        ) : (
          <ul className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] divide-y divide-[color:var(--border)]">
            {system.provenanceEvents.map((ev) => (
              <li key={ev.id} className="px-4 py-3 text-sm flex items-start justify-between gap-4">
                <div>
                  <div className="font-mono text-xs text-[color:var(--foreground-muted)]">{ev.eventType}</div>
                  <div className="mt-0.5">{ev.message ?? "-"}</div>
                  {ev.actor && <div className="text-xs text-[color:var(--foreground-muted)] mt-0.5">{ev.actor}</div>}
                </div>
                <div className="font-mono text-xs text-[color:var(--foreground-muted)] shrink-0">
                  {ev.createdAt.toISOString().slice(0, 10)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>
      <div className="h-16" />
    </>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] p-5">
      <div className="text-sm font-semibold mb-2">{title}</div>
      {children}
    </div>
  );
}

function KV({ k, v }: { k: string; v: number | null }) {
  return (
    <div className="rounded-[8px] bg-[color:var(--surface-alt)] px-3 py-2">
      <div className="text-[10px] uppercase tracking-wide text-[color:var(--foreground-muted)]">{k}</div>
      <div className="mt-0.5">{v != null ? v : "-"}</div>
    </div>
  );
}

function Missing() {
  return <span className="text-[color:var(--foreground-muted)] text-sm">not reported</span>;
}
