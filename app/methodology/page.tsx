import Link from "next/link";
import { PageHeader, Section, Container } from "@/components/ui/section";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfidenceBadge } from "@/components/ui/confidence-badge";
import { KV } from "@/components/ui/metric";
import { TRACKS, STATUS_COUNTS } from "@/lib/data";

const toc = [
  { id: "what-measures", label: "1. what OrganoidBench measures" },
  { id: "what-does-not", label: "2. what it does not measure" },
  { id: "principles", label: "3. core scoring principles" },
  { id: "metrics", label: "4. metric definitions" },
  { id: "composite", label: "5. composite score" },
  { id: "grades", label: "6. confidence grades" },
  { id: "required-controls", label: "7. required controls" },
  { id: "data-requirements", label: "8. data requirements" },
  { id: "versioning", label: "9. versioning" },
  { id: "ethics", label: "10. ethics & interpretation" },
];

export default function MethodologyPage() {
  return (
    <>
      <PageHeader
        eyebrow={`methodology · ${STATUS_COUNTS.methodologyVersion}`}
        title="how OrganoidBench scores experimental systems"
        description="Read this before interpreting any score. The methodology is versioned, public, and change-tracked. Scores recomputed under new versions are clearly flagged."
        right={
          <div className="flex gap-2">
            <Button href="/docs" size="sm" variant="outline">
              technical docs
            </Button>
            <Button href="/governance" size="sm" variant="ghost">
              governance
            </Button>
          </div>
        }
      />

      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8">
          <aside className="lg:sticky lg:top-24 self-start">
            <div className="text-xs font-mono uppercase tracking-wider text-[color:var(--foreground-muted)] mb-2">
              contents
            </div>
            <ul className="space-y-1 text-sm">
              {toc.map((t) => (
                <li key={t.id}>
                  <a
                    href={`#${t.id}`}
                    className="text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)]"
                  >
                    {t.label}
                  </a>
                </li>
              ))}
            </ul>
          </aside>

          <div className="prose-like space-y-10">
            <section id="what-measures">
              <h2 className="text-xl font-semibold mb-3">1. what OrganoidBench measures</h2>
              <Card>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <li>electrophysiological activity</li>
                  <li>responsiveness to defined stimulation</li>
                  <li>persistent, structured plasticity</li>
                  <li>closed-loop task performance</li>
                  <li>retention of adaptive changes</li>
                  <li>reproducibility across organoids, batches, and labs</li>
                </ul>
              </Card>
            </section>

            <section id="what-does-not">
              <h2 className="text-xl font-semibold mb-3">2. what OrganoidBench does not measure</h2>
              <Card className="bg-[color:var(--surface-alt)]">
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-[color:var(--foreground-muted)]">
                  <li>consciousness</li>
                  <li>sentience</li>
                  <li>human-like intelligence</li>
                  <li>moral status</li>
                  <li>generalized cognition or transfer across unrelated tasks</li>
                  <li>subjective experience</li>
                </ul>
                <p className="mt-4 text-xs text-[color:var(--foreground-muted)]">
                  Entries making these claims are flagged in their limitations
                  section. Claims unsupported by the dataset are not used as
                  ranking inputs.
                </p>
              </Card>
            </section>

            <section id="principles">
              <h2 className="text-xl font-semibold mb-3">3. core scoring principles</h2>
              <Card>
                <ol className="list-decimal pl-5 space-y-2 text-sm">
                  <li>Benchmark systems, not isolated organoids.</li>
                  <li>Compare only within compatible task categories.</li>
                  <li>Separate raw performance from confidence.</li>
                  <li>Reward controls and reproducibility.</li>
                  <li>Penalize missing metadata.</li>
                  <li>Never rank unsupported claims above controlled results.</li>
                </ol>
              </Card>
            </section>

            <section id="metrics">
              <h2 className="text-xl font-semibold mb-3">4. metric definitions</h2>
              <p className="text-sm text-[color:var(--foreground-muted)] mb-4">
                Each track page contains full per-metric definitions including
                required input, minimum data, interpretation, and known
                limitations.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {TRACKS.map((t) => (
                  <Card key={t.id}>
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{t.name}</div>
                      <Badge tone="outline">{t.metrics.length} metrics</Badge>
                    </div>
                    <ul className="mt-2 flex flex-wrap gap-1.5">
                      {t.metrics.map((m) => (
                        <Badge key={m.name} tone="muted" mono>
                          {m.name}
                        </Badge>
                      ))}
                    </ul>
                    <Link
                      href={`/benchmarks/${t.id}`}
                      className="mt-3 inline-block text-sm underline underline-offset-4"
                    >
                      full definitions →
                    </Link>
                  </Card>
                ))}
              </div>
            </section>

            <section id="composite">
              <h2 className="text-xl font-semibold mb-3">5. composite score</h2>
              <Card>
                <p className="text-sm">
                  Composite score is <strong>optional and secondary</strong>.
                  Track-level scores are primary. Composite combines normalized
                  task score, plasticity score, retention score, reproducibility
                  confidence, and control completeness.
                </p>
                <pre className="mt-4 font-mono text-xs bg-[color:var(--surface-alt)] rounded-[12px] p-4 border border-[color:var(--border)]">
{`composite = 0.30 * task_score
          + 0.20 * plasticity_score
          + 0.15 * retention_score
          + 0.25 * reproducibility_confidence
          + 0.10 * control_completeness

# clipped to [0, 1], reported to 2 decimals
# tracks missing their primary metric contribute 0`}
                </pre>
                <p className="mt-3 text-xs text-[color:var(--foreground-muted)]">
                  Composite is useful for overview comparisons but is never the
                  basis for a specific claim about a system's behavior on a
                  particular track.
                </p>
              </Card>
            </section>

            <section id="grades">
              <h2 className="text-xl font-semibold mb-3">6. confidence grades</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Card>
                  <div className="flex items-center gap-3">
                    <ConfidenceBadge grade="A" />
                  </div>
                  <p className="mt-2 text-sm text-[color:var(--foreground-muted)]">
                    strong multi-organoid, controlled, reproducible, raw data available.
                  </p>
                </Card>
                <Card>
                  <div className="flex items-center gap-3">
                    <ConfidenceBadge grade="B" />
                  </div>
                  <p className="mt-2 text-sm text-[color:var(--foreground-muted)]">
                    controlled, public data, but limited replication.
                  </p>
                </Card>
                <Card>
                  <div className="flex items-center gap-3">
                    <ConfidenceBadge grade="C" />
                  </div>
                  <p className="mt-2 text-sm text-[color:var(--foreground-muted)]">
                    promising but missing some controls or metadata.
                  </p>
                </Card>
                <Card>
                  <div className="flex items-center gap-3">
                    <ConfidenceBadge grade="D" />
                  </div>
                  <p className="mt-2 text-sm text-[color:var(--foreground-muted)]">
                    weak evidence, limited N, missing controls.
                  </p>
                </Card>
                <Card className="md:col-span-2">
                  <div className="flex items-center gap-3">
                    <ConfidenceBadge grade="Unscored" />
                  </div>
                  <p className="mt-2 text-sm text-[color:var(--foreground-muted)]">
                    listed but not benchmarkable under the current methodology —
                    metadata insufficient or required controls missing.
                  </p>
                </Card>
              </div>
            </section>

            <section id="required-controls">
              <h2 className="text-xl font-semibold mb-3">7. required controls</h2>
              <Card>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <li>· random feedback</li>
                  <li>· sham stimulation</li>
                  <li>· null stimulation</li>
                  <li>· frozen decoder</li>
                  <li>· decoder-only baseline</li>
                  <li>· repeated-session validation</li>
                  <li>· batch replication</li>
                  <li>· independent lab replication when available</li>
                </ul>
              </Card>
            </section>

            <section id="data-requirements">
              <h2 className="text-xl font-semibold mb-3">8. data requirements</h2>
              <Card>
                <ul className="space-y-2 text-sm">
                  <li>· raw traces when possible (per-channel, with sampling rate)</li>
                  <li>· processed spike/event data</li>
                  <li>· full protocol metadata</li>
                  <li>· stimulation metadata (per-trial parameters)</li>
                  <li>· task trajectories (for closed-loop systems)</li>
                  <li>· scoring code or scoring script</li>
                  <li>· sample counts: N organoids, N sessions, N batches, N labs</li>
                  <li>· age information and culture notes</li>
                  <li>· modality details (MEA type, sampling rate, electrode count)</li>
                </ul>
              </Card>
            </section>

            <section id="versioning">
              <h2 className="text-xl font-semibold mb-3">9. versioning</h2>
              <Card padded={false}>
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase tracking-wide text-[color:var(--foreground-muted)] bg-[color:var(--surface-alt)]">
                    <tr>
                      <th className="px-4 py-3 font-medium">version</th>
                      <th className="px-4 py-3 font-medium">date</th>
                      <th className="px-4 py-3 font-medium">change</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[color:var(--border)]">
                    <VRow
                      v="v1.3.0"
                      d="2026-03-20"
                      c="adds decoder-only baseline requirement for closed-loop learning; recomputes affected scores"
                    />
                    <VRow
                      v="v1.2.0"
                      d="2025-11-02"
                      c="introduces formal confidence grades A–D and 'Unscored'"
                    />
                    <VRow
                      v="v1.1.0"
                      d="2025-06-18"
                      c="adds retention track and relearning-speed metric"
                    />
                    <VRow v="v1.0.0" d="2025-01-10" c="initial public methodology" />
                  </tbody>
                </table>
              </Card>
              <KV k="current version" v={STATUS_COUNTS.methodologyVersion} mono />
            </section>

            <section id="ethics">
              <h2 className="text-xl font-semibold mb-3">10. ethics & interpretation</h2>
              <Card className="bg-[color:var(--surface-alt)]">
                <div className="text-sm space-y-3">
                  <p>
                    OrganoidBench measures signal and behavior under controlled
                    conditions. It does not make claims about consciousness,
                    sentience, or moral status.
                  </p>
                  <p>
                    Entries that use hype framing — "intelligent organoids",
                    "sentient wetware", "brain-in-a-dish cognition" — are flagged
                    in their limitations section and are not used to compute
                    ranking.
                  </p>
                  <p>
                    Independent replication and transparent limitations are
                    valued more than headline performance. Grade{" "}
                    <span className="font-mono">A</span> requires either open raw
                    data plus strong controls, or an independent replication.
                  </p>
                </div>
              </Card>
            </section>
          </div>
        </div>
      </Section>
    </>
  );
}

function VRow({ v, d, c }: { v: string; d: string; c: string }) {
  return (
    <tr>
      <td className="px-4 py-3 font-mono text-xs">{v}</td>
      <td className="px-4 py-3 font-mono text-xs text-[color:var(--foreground-muted)]">{d}</td>
      <td className="px-4 py-3 text-sm">{c}</td>
    </tr>
  );
}
