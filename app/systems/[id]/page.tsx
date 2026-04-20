import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, PageHeader } from "@/components/ui/section";
import { LineChart } from "@/components/line-chart";
import { SYSTEMS, systemById, trackById, datasetById } from "@/lib/data";

export function generateStaticParams() {
  return SYSTEMS.map((s) => ({ id: s.id }));
}

const METRIC_LABELS: [keyof System["metrics"], string][] = [
  ["signal", "Signal"],
  ["response", "Response"],
  ["plasticity", "Plasticity"],
  ["learning", "Learning"],
  ["retention", "Retention"],
  ["repro", "Reproducibility"],
];

type System = NonNullable<ReturnType<typeof systemById>>;

const CONTROL_LABELS: [keyof System["controls"], string][] = [
  ["randomFeedback", "Random feedback"],
  ["shamStim", "Sham stimulation"],
  ["nullStim", "Null stimulation"],
  ["frozenDecoder", "Frozen decoder"],
  ["decoderOnly", "Decoder-only baseline"],
  ["replication", "Independent replication"],
];

const CONTROL_COLOR: Record<string, string> = {
  pass: "text-[color:var(--success)]",
  partial: "text-[color:var(--warning)]",
  missing: "text-[color:var(--foreground-muted)]",
  fail: "text-[color:var(--destructive)]",
  na: "text-[color:var(--foreground-muted)]",
};

export default async function SystemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const s = systemById(id);
  if (!s) notFound();

  const track = trackById(s.track);
  const dataset = s.datasetId ? datasetById(s.datasetId) : undefined;

  const rank =
    [...SYSTEMS]
      .filter((x) => x.track === s.track)
      .sort((a, b) => b.metrics.composite - a.metrics.composite)
      .findIndex((x) => x.id === s.id) + 1;

  const curveSeries = [
    {
      id: "perf",
      label: "Performance",
      color: "#D97757",
      points: s.learningCurve.map((p) => ({ x: p.x, y: p.y })),
    },
    {
      id: "base",
      label: "Baseline",
      color: "#9A9A9A",
      points: s.learningCurve.map((p) => ({ x: p.x, y: p.baseline })),
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow={`System · ${s.id}`}
        title={s.name}
        description={`${s.source} · Rank #${rank} in ${track.name} · ${s.task}`}
        right={
          <div className="flex flex-col items-end gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border-strong)] px-3 py-1 text-sm">
              <span className="h-6 w-6 grid place-items-center rounded-full border border-[color:var(--border-strong)] font-mono text-xs">
                {s.grade}
              </span>
              <span>Confidence</span>
            </div>
            <Link href="/about#confidence" className="text-sm text-[color:var(--foreground-muted)] underline underline-offset-4">
              What do grades mean?
            </Link>
          </div>
        }
      />

      <Container>
        <div className="flex flex-col gap-10">
          <section>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-px rounded-[12px] overflow-hidden border border-[color:var(--border)] bg-[color:var(--border)]">
              {METRIC_LABELS.map(([k, label]) => (
                <Stat key={k} label={label} value={fmt(s.metrics[k])} />
              ))}
              <Stat label="Composite" value={s.metrics.composite.toFixed(2)} highlight />
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <Panel title="Organoid">
              <KV k="Type" v={s.organoidType} />
              <KV k="Species" v={s.species} />
              <KV k="Cell line" v={s.cellLine} />
              <KV k="Age" v={`${s.ageDays} days`} mono />
              <KV k="Culture" v={s.culture} />
            </Panel>
            <Panel title="Recording & stimulation">
              <KV k="Platform" v={s.platform} />
              <KV k="Stimulation" v={s.stimMethod} />
              <KV k="Decoder" v={s.decoder ?? "-"} />
              <KV k="Preprocessing" v={s.preprocessing} />
            </Panel>
            <Panel title="Sample size">
              <KV k="Organoids" v={s.nOrganoids} mono />
              <KV k="Sessions" v={s.nSessions} mono />
              <KV k="Batches" v={s.nBatches} mono />
              <KV k="Labs" v={s.nLabs} mono />
              <KV k="Last updated" v={s.lastUpdated} mono />
            </Panel>
          </section>

          <section>
            <h2 className="font-serif text-2xl mb-4">Learning curve</h2>
            <div className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
              <LineChart series={curveSeries} xLabels={s.learningCurve.map((_, i) => `S${i + 1}`)} yLabel="Performance (0–1)" height={260} />
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <Panel title="Controls">
              <ul className="flex flex-col divide-y divide-[color:var(--border)] -mt-2">
                {CONTROL_LABELS.map(([k, label]) => {
                  const v = s.controls[k];
                  return (
                    <li key={k} className="flex items-center justify-between py-2.5 text-sm">
                      <span>{label}</span>
                      <span className={`font-mono text-xs ${CONTROL_COLOR[v] ?? ""}`}>{v}</span>
                    </li>
                  );
                })}
              </ul>
            </Panel>

            <Panel title="Data availability">
              <ul className="flex flex-col divide-y divide-[color:var(--border)] -mt-2">
                {[
                  ["Raw data", s.availability.raw],
                  ["Processed data", s.availability.processed],
                  ["Analysis code", s.availability.code],
                  ["Peer reviewed", s.availability.peerReviewed],
                  ["Open dataset", s.availability.openDataset],
                ].map(([label, avail]) => (
                  <li key={label as string} className="flex items-center justify-between py-2.5 text-sm">
                    <span>{label}</span>
                    <span className={`font-mono text-xs ${avail ? "text-[color:var(--success)]" : "text-[color:var(--foreground-muted)]"}`}>
                      {avail ? "present" : "not available"}
                    </span>
                  </li>
                ))}
              </ul>
            </Panel>
          </section>

          <section>
            <h2 className="font-serif text-2xl mb-4">Limitations</h2>
            <div className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface-alt)] p-5">
              <ul className="space-y-2 text-sm list-disc pl-5">
                {s.limitations.map((l, i) => (
                  <li key={i}>{l}</li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-[color:var(--foreground-muted)]">
                This entry does not claim consciousness, sentience, or human-like intelligence. It claims measurable electrophysiological and adaptive behavior under the {s.task} task.
              </p>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl mb-4">Source publication</h2>
            <div className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] p-5">
              <div className="font-medium">{s.paper.title}</div>
              <div className="text-sm text-[color:var(--foreground-muted)] mt-1">
                {s.paper.authors.join(", ")} · {s.paper.venue} · {s.paper.year} · {s.paper.peerReviewed ? "Peer reviewed" : "Preprint"}
              </div>
              {s.paper.doi && (
                <div className="text-xs font-mono text-[color:var(--foreground-muted)] mt-2">DOI: {s.paper.doi}</div>
              )}
              <div className="mt-4 flex gap-2 flex-wrap">
                {dataset && (
                  <Link
                    href={`/datasets/${dataset.id}`}
                    className="inline-flex items-center rounded-full border border-[color:var(--border-strong)] px-4 py-2 text-sm font-medium hover:bg-[color:var(--surface-alt)]"
                  >
                    View dataset
                  </Link>
                )}
                <Link
                  href={`/benchmarks/${s.track}`}
                  className="inline-flex items-center rounded-full border border-[color:var(--border-strong)] px-4 py-2 text-sm font-medium hover:bg-[color:var(--surface-alt)]"
                >
                  Open {track.name} track
                </Link>
                <Link
                  href="/submit"
                  className="inline-flex items-center rounded-full border border-[color:var(--border-strong)] px-4 py-2 text-sm font-medium hover:bg-[color:var(--surface-alt)]"
                >
                  Submit correction
                </Link>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl mb-4">Citation</h2>
            <pre className="font-mono text-xs whitespace-pre bg-[color:var(--surface-alt)] rounded-[12px] p-4 border border-[color:var(--border)] overflow-x-auto">
{`OrganoidBench entry ${s.id} (${s.lastUpdated}).
"${s.name}". ${s.source}. Track: ${track.name}. Task: ${s.task}.
Grade: ${s.grade}. https://organoidbench.org/systems/${s.id}`}
            </pre>
          </section>
        </div>
      </Container>
      <div className="h-16" />
    </>
  );
}

function Stat({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`p-4 ${highlight ? "bg-[color:var(--foreground)] text-[color:var(--background)]" : "bg-[color:var(--surface)]"}`}>
      <div className={`text-xs ${highlight ? "opacity-75" : "text-[color:var(--foreground-muted)]"}`}>{label}</div>
      <div className="mt-1 text-lg font-mono font-semibold">{value}</div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] p-5">
      <div className="text-sm font-semibold mb-3">{title}</div>
      {children}
    </div>
  );
}

function KV({ k, v, mono }: { k: string; v: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-[color:var(--border)] last:border-0">
      <div className="text-sm text-[color:var(--foreground-muted)]">{k}</div>
      <div className={`text-sm text-right ${mono ? "font-mono text-xs" : ""}`}>{v}</div>
    </div>
  );
}

function fmt(v: number) {
  return v === 0 ? "-" : v.toFixed(2);
}
