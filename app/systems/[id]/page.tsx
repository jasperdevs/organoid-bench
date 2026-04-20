import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader, Section, Container } from "@/components/ui/section";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfidenceBadge } from "@/components/ui/confidence-badge";
import { DataAvailabilityBadges } from "@/components/ui/data-availability";
import { ControlsChecklist } from "@/components/ui/controls-checklist";
import { MetricCard, KV } from "@/components/ui/metric";
import { MiniLearningCurve } from "@/components/ui/sparkline";
import {
  SYSTEMS,
  systemById,
  labById,
  trackById,
  datasetById,
  taskById,
  paperById,
} from "@/lib/data";
import { formatDate } from "@/lib/utils";

export function generateStaticParams() {
  return SYSTEMS.map((s) => ({ id: s.id }));
}

export default async function SystemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const s = systemById(id);
  if (!s) notFound();

  const lab = labById(s.labId);
  const track = trackById(s.track);
  const task = taskById(s.taskId);
  const dataset = datasetById(s.datasetId);
  const paper = paperById(s.paperId);

  const rank =
    [...SYSTEMS]
      .filter((x) => x.track === s.track)
      .sort((a, b) => b.metrics.composite - a.metrics.composite)
      .findIndex((x) => x.id === s.id) + 1;

  return (
    <>
      <PageHeader
        eyebrow={`system · ${s.id}`}
        title={s.name}
        description={
          <span>
            {lab?.name} · rank #{rank} in {track.name} · task{" "}
            <span className="font-mono text-xs bg-[color:var(--surface-alt)] rounded-[8px] px-1.5 py-0.5">
              {s.taskId}
            </span>
          </span>
        }
        right={
          <div className="flex gap-2 flex-wrap items-center">
            <ConfidenceBadge grade={s.grade} />
            {s.availability.peerReviewed && <Badge tone="default">peer reviewed</Badge>}
            {s.availability.openDataset && <Badge tone="default">open dataset</Badge>}
          </div>
        }
      >
        <div className="mt-6">
          <DataAvailabilityBadges avail={s.availability} />
        </div>
      </PageHeader>

      <Section>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <MetricCard label="signal" value={fmt(s.metrics.signal)} />
          <MetricCard label="response" value={fmt(s.metrics.response)} />
          <MetricCard label="plasticity" value={fmt(s.metrics.plasticity)} />
          <MetricCard label="learning" value={fmt(s.metrics.learning)} />
          <MetricCard label="retention" value={fmt(s.metrics.retention)} />
          <MetricCard label="repro conf" value={fmt(s.metrics.reproducibility)} />
        </div>
        <div className="mt-3">
          <MetricCard
            label="composite (secondary)"
            value={s.metrics.composite.toFixed(2)}
            sub="Composite is informational only. Track-level scores are primary."
          />
        </div>
      </Section>

      <Section title="system overview">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader title="organoid" />
            <KV k="type" v={s.organoidType} />
            <KV k="species / source" v={s.species} />
            <KV k="age" v={`${s.ageDays} days`} mono />
            <KV k="cell composition" v={<span className="text-[color:var(--foreground-muted)]">see paper</span>} />
            <KV k="culture" v={<span className="text-right">{s.culture}</span>} />
          </Card>

          <Card>
            <CardHeader title="recording & stimulation" />
            <KV k="platform" v={s.recordingPlatform} mono />
            <KV k="stimulation" v={s.stimulation} />
            <KV k="decoder / controller" v={s.decoder} />
            <KV k="preprocessing" v={s.preprocessing} />
          </Card>

          <Card>
            <CardHeader title="sample size" />
            <KV k="organoids" v={s.nOrganoids} mono />
            <KV k="sessions" v={s.nSessions} mono />
            <KV k="batches" v={s.nBatches} mono />
            <KV k="labs" v={s.nLabs} mono />
            <KV k="last updated" v={formatDate(s.lastUpdated)} />
          </Card>
        </div>
      </Section>

      <Section title="benchmark results">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
          <Card>
            <CardHeader
              title="learning curve"
              description="Baseline-adjusted performance across sessions."
            />
            <div className="text-[color:var(--foreground)]">
              <MiniLearningCurve
                values={s.learningCurve}
                baseline={s.learningCurve[0]}
                width={800}
                height={220}
              />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs font-mono text-[color:var(--foreground-muted)]">
              <span>dashed: pre-training baseline</span>
              <span>{s.learningCurve.length} sessions</span>
            </div>
          </Card>
          <Card>
            <CardHeader title="comparison" />
            <KV
              k={`${track.name} median`}
              v={medianFor(s.track).toFixed(2)}
              mono
            />
            <KV k="this system" v={s.metrics.composite.toFixed(2)} mono />
            <KV
              k="Δ vs median"
              v={(s.metrics.composite - medianFor(s.track)).toFixed(2)}
              mono
            />
            <KV
              k="decoder-only baseline"
              v={
                <span className="font-mono text-[color:var(--foreground-muted)]">
                  {s.controls.decoder_only === "pass" ? "run" : "—"}
                </span>
              }
            />
            <KV
              k="random-feedback control"
              v={
                <span className="font-mono text-[color:var(--foreground-muted)]">
                  {s.controls.random_feedback === "pass"
                    ? "run"
                    : s.controls.random_feedback === "partial"
                      ? "partial"
                      : "missing"}
                </span>
              }
            />
          </Card>
        </div>
      </Section>

      <Section title="controls">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
          <ControlsChecklist controls={s.controls} />
          <Card>
            <CardHeader
              title="confidence effect"
              description="How each control affects the reproducibility confidence grade."
            />
            <ul className="text-sm space-y-2">
              <li className="flex justify-between">
                <span className="text-[color:var(--foreground-muted)]">controls passed</span>
                <span className="font-mono">
                  {Object.values(s.controls).filter((v) => v === "pass").length} /{" "}
                  {Object.keys(s.controls).length}
                </span>
              </li>
              <li className="flex justify-between">
                <span className="text-[color:var(--foreground-muted)]">current grade</span>
                <ConfidenceBadge grade={s.grade} compact />
              </li>
              <li className="pt-3 border-t border-[color:var(--border)] text-xs text-[color:var(--foreground-muted)]">
                Missing or failing controls lower the reproducibility confidence
                grade. See{" "}
                <Link href="/methodology" className="underline underline-offset-2">
                  methodology
                </Link>
                .
              </li>
            </ul>
          </Card>
        </div>
      </Section>

      <Section title="data & reproducibility">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader title="artifacts" />
            <ul className="divide-y divide-[color:var(--border)]">
              <LinkRow label="raw data" href="#" enabled={s.availability.raw} />
              <LinkRow
                label="processed data"
                href={dataset ? `/datasets/${dataset.id}` : "#"}
                enabled={s.availability.processed}
              />
              <LinkRow label="analysis code" href="#" enabled={s.availability.code} />
              <LinkRow label="protocol" href="#" enabled />
              <LinkRow
                label="paper"
                href={paper ? `/papers/${paper.id}` : "#"}
                enabled={!!paper}
              />
            </ul>
          </Card>
          <Card>
            <CardHeader title="reproducibility detail" />
            <KV k="organoids (N)" v={s.nOrganoids} mono />
            <KV k="sessions (N)" v={s.nSessions} mono />
            <KV k="batches (N)" v={s.nBatches} mono />
            <KV k="labs (N)" v={s.nLabs} mono />
            <KV k="license" v={dataset?.license ?? "—"} mono />
            <KV
              k="file formats"
              v={<span className="font-mono text-xs">nwb · csv · parquet</span>}
            />
            <KV
              k="data completeness"
              v={
                <span className="font-mono">
                  {Math.round(completeness(s) * 100)}%
                </span>
              }
            />
          </Card>
        </div>
      </Section>

      <Section title="experimental metadata">
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8">
            <KV k="donor / source line" v={"H1 / H9 mixed"} />
            <KV k="regional identity" v={s.organoidType} />
            <KV k="age (days)" v={s.ageDays} mono />
            <KV k="media / culture notes" v={s.culture} />
            <KV k="electrode count" v={"26 400"} mono />
            <KV k="sampling rate (hz)" v={"20 000"} mono />
            <KV k="recording duration" v={"30 min / session"} />
            <KV k="stimulation parameters" v={s.stimulation} />
            <KV k="preprocessing" v={s.preprocessing} />
            <KV k="spike detection" v={"threshold, 5σ"} />
          </div>
        </Card>
      </Section>

      <Section title="limitations">
        <Card className="bg-[color:var(--surface-alt)] border-[color:var(--border)]">
          <ul className="space-y-2 text-sm list-disc pl-5">
            {s.limitations.map((l, i) => (
              <li key={i}>{l}</li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-[color:var(--foreground-muted)]">
            This entry does not claim consciousness, sentience, or human-like
            intelligence. It claims measurable electrophysiological and adaptive
            behavior under the {task?.name ?? s.taskId} task.
          </p>
        </Card>
      </Section>

      <Section title="citation">
        <Card>
          <div className="text-xs font-mono uppercase tracking-wider text-[color:var(--foreground-muted)] mb-2">
            recommended citation
          </div>
          <pre className="font-mono text-xs whitespace-pre-wrap bg-[color:var(--surface-alt)] rounded-[12px] p-4 border border-[color:var(--border)]">
{`OrganoidBench entry ${s.id} (${formatDate(s.lastUpdated)}).
"${s.name}". ${lab?.name}. Track: ${track.name}. Task: ${s.taskId}.
Grade: ${s.grade}. https://organoidbench.org/systems/${s.id}`}
          </pre>
          {paper && (
            <div className="mt-3 text-sm text-[color:var(--foreground-muted)]">
              Source publication:{" "}
              <Link
                href={`/papers/${paper.id}`}
                className="text-[color:var(--foreground)] underline underline-offset-2"
              >
                {paper.title}
              </Link>
              {" · "}
              <span className="font-mono text-xs">{paper.authors[0]} · {paper.year} · {paper.venue}</span>
            </div>
          )}
          <div className="mt-4 flex gap-2">
            <Button href={`/datasets/${s.datasetId}`} size="sm" variant="outline">
              view dataset
            </Button>
            <Button href={`/labs/${s.labId}`} size="sm" variant="ghost">
              lab page
            </Button>
            <Button href="/submit#correction" size="sm" variant="ghost">
              submit correction
            </Button>
          </div>
        </Card>
      </Section>
    </>
  );
}

function LinkRow({
  label,
  href,
  enabled,
}: {
  label: string;
  href: string;
  enabled: boolean;
}) {
  return (
    <li className="flex items-center justify-between py-3">
      <span className="text-sm">{label}</span>
      {enabled ? (
        <Link
          href={href}
          className="text-sm font-mono underline underline-offset-2"
        >
          open →
        </Link>
      ) : (
        <span className="text-sm font-mono text-[color:var(--foreground-muted)]">
          not available
        </span>
      )}
    </li>
  );
}

function fmt(v: number) {
  return v === 0 ? "—" : v.toFixed(2);
}

function medianFor(track: string) {
  const vals = SYSTEMS.filter((s) => s.track === track).map((s) => s.metrics.composite).sort();
  return vals.length ? vals[Math.floor(vals.length / 2)] : 0;
}

function completeness(s: (typeof SYSTEMS)[number]) {
  const a = [
    s.availability.raw,
    s.availability.processed,
    s.availability.code,
    s.availability.peerReviewed,
    s.availability.openDataset,
  ];
  return a.filter(Boolean).length / a.length;
}
