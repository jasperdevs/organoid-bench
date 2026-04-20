import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, PageHeader } from "@/components/ui/section";
import { BarChart } from "@/components/bar-chart";
import { TRACKS, SYSTEMS, labColor } from "@/lib/data";

export function generateStaticParams() {
  return TRACKS.map((t) => ({ track: t.id }));
}

const METRIC_BY_TRACK: Record<string, keyof (typeof SYSTEMS)[number]["metrics"]> = {
  "signal-quality": "signal",
  "responsiveness": "response",
  "plasticity": "plasticity",
  "closed-loop-learning": "learning",
  "retention": "retention",
  "reproducibility": "repro",
};

export default async function TrackPage({
  params,
}: {
  params: Promise<{ track: string }>;
}) {
  const { track: id } = await params;
  const track = TRACKS.find((t) => t.id === id);
  if (!track) notFound();

  const metricKey = METRIC_BY_TRACK[track.id];
  const systemsInTrack = SYSTEMS.filter((s) => s.track === track.id);
  const ranked = [...systemsInTrack].sort((a, b) => b.metrics[metricKey] - a.metrics[metricKey]);
  const top = ranked[0];
  const lastUpdated = systemsInTrack
    .map((s) => s.lastUpdated)
    .sort()
    .at(-1);

  const chartData = ranked.slice(0, 12).map((s) => ({
    label: s.name.length > 22 ? s.name.slice(0, 20) + "..." : s.name,
    sublabel: s.source,
    value: s.metrics[metricKey],
    color: labColor(s.source),
  }));

  return (
    <>
      <PageHeader
        eyebrow="Benchmark track"
        title={track.name}
        description={track.description}
        right={
          <Link
            href="/about#methodology"
            className="inline-flex items-center rounded-full border border-[color:var(--border-strong)] px-4 py-2 text-sm font-medium hover:bg-[color:var(--surface-alt)]"
          >
            Methodology
          </Link>
        }
      />

      <Container>
        <div className="flex flex-col gap-10">
          <section>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-[12px] overflow-hidden border border-[color:var(--border)] bg-[color:var(--border)]">
              <Stat label="Systems evaluated" value={String(systemsInTrack.length)} />
              <Stat label="Top system" value={top ? top.name.slice(0, 22) : "-"} mono={false} />
              <Stat label="Top score" value={top ? top.metrics[metricKey].toFixed(2) : "-"} />
              <Stat label="Last updated" value={lastUpdated ?? "-"} mono />
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl mb-4">Leaderboard</h2>
            <div className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
              <BarChart bars={chartData} maxOverride={1} height={360} />
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <Panel title="What this track measures">
              <ul className="text-sm space-y-1.5 list-disc pl-5">
                {track.measures.map((m) => <li key={m}>{m}</li>)}
              </ul>
            </Panel>
            <Panel title="Does not measure">
              <ul className="text-sm space-y-1.5 list-disc pl-5 text-[color:var(--foreground-muted)]">
                {track.excludes.map((m) => <li key={m}>{m}</li>)}
              </ul>
            </Panel>
          </section>

          <section>
            <h2 className="font-serif text-2xl mb-4">Metric definitions</h2>
            <div className="rounded-[12px] border border-[color:var(--border)] overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[color:var(--surface-alt)] text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium">Metric</th>
                    <th className="px-4 py-3 font-medium">Description</th>
                    <th className="px-4 py-3 font-medium text-right">Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {track.metrics.map((m) => (
                    <tr key={m.name} className="border-t border-[color:var(--border)]">
                      <td className="px-4 py-3 font-medium">{m.name}</td>
                      <td className="px-4 py-3 text-[color:var(--foreground-muted)]">{m.description}</td>
                      <td className="px-4 py-3 font-mono text-xs text-right">{m.unit ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <Panel title="Required inputs">
              <ul className="text-sm space-y-1.5 list-disc pl-5">
                {track.requiredInputs.map((i) => <li key={i}>{i}</li>)}
              </ul>
            </Panel>
            <Panel title="Required controls">
              <ul className="text-sm space-y-1.5 list-disc pl-5">
                {track.requiredControls.map((i) => <li key={i}>{i}</li>)}
              </ul>
            </Panel>
            <Panel title="Common failure modes">
              <ul className="text-sm space-y-1.5 list-disc pl-5 text-[color:var(--foreground-muted)]">
                {track.failureModes.map((f) => <li key={f}>{f}</li>)}
              </ul>
            </Panel>
          </section>

          <section>
            <h2 className="font-serif text-2xl mb-4">Scoring formula</h2>
            <div className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface-alt)] p-5 text-sm">
              {track.scoringFormula}
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl mb-4">All systems on this track</h2>
            <div className="w-full overflow-x-auto rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)]">
              <table className="w-full text-sm">
                <thead className="text-left bg-[color:var(--surface-alt)]">
                  <tr>
                    <th className="px-4 py-3 font-medium w-10">#</th>
                    <th className="px-4 py-3 font-medium">System</th>
                    <th className="px-4 py-3 font-medium">Source</th>
                    <th className="px-4 py-3 font-medium text-right">{track.name} score</th>
                    <th className="px-4 py-3 font-medium text-right">Composite</th>
                    <th className="px-4 py-3 font-medium">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {ranked.map((s, i) => (
                    <tr key={s.id} className="border-t border-[color:var(--border)] hover:bg-[color:var(--surface-alt)]">
                      <td className="px-4 py-3 font-mono text-xs">{i + 1}</td>
                      <td className="px-4 py-3">
                        <Link href={`/systems/${s.id}`} className="font-medium hover:underline">{s.name}</Link>
                      </td>
                      <td className="px-4 py-3 text-[color:var(--foreground-muted)]">{s.source}</td>
                      <td className="px-4 py-3 font-mono text-xs text-right">{s.metrics[metricKey].toFixed(2)}</td>
                      <td className="px-4 py-3 font-mono text-xs text-right">{s.metrics.composite.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-[color:var(--border-strong)] font-mono text-xs">
                          {s.grade}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </Container>
      <div className="h-16" />
    </>
  );
}

function Stat({ label, value, mono = true }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="bg-[color:var(--surface)] p-4">
      <div className="text-xs text-[color:var(--foreground-muted)]">{label}</div>
      <div className={`mt-1 text-lg font-semibold ${mono ? "font-mono" : "truncate"}`}>{value}</div>
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
