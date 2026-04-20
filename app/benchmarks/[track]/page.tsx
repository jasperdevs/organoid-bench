import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader, Section } from "@/components/ui/section";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BenchmarkChart } from "@/components/benchmark-chart";
import { Leaderboard } from "@/components/leaderboard";
import {
  TRACKS,
  SYSTEMS,
  DATASETS,
  trackById,
  datasetById,
  labById,
  type Track,
} from "@/lib/data";
import { formatDate } from "@/lib/utils";

export function generateStaticParams() {
  return TRACKS.map((t) => ({ track: t.id }));
}

export default async function TrackPage({
  params,
}: {
  params: Promise<{ track: string }>;
}) {
  const { track: id } = await params;
  const track = TRACKS.find((t) => t.id === id);
  if (!track) notFound();

  const systemsInTrack = SYSTEMS.filter((s) => s.track === track.id);
  const top = [...systemsInTrack].sort(
    (a, b) => b.metrics.composite - a.metrics.composite,
  )[0];
  const lastUpdated = systemsInTrack
    .map((s) => new Date(s.lastUpdated).getTime())
    .sort()
    .at(-1);

  const isClosedLoop = track.id === "closed-loop-learning";

  return (
    <>
      <PageHeader
        eyebrow="benchmark track"
        title={track.name}
        description={track.description}
        right={
          <div className="flex gap-2">
            <Button href="/submit" size="sm" variant="primary">
              submit result
            </Button>
            <Button href="/methodology" size="sm" variant="outline">
              methodology
            </Button>
          </div>
        }
      >
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-px rounded-[16px] overflow-hidden border border-[color:var(--border)] bg-[color:var(--border)]">
          <Stat label="systems evaluated" value={systemsInTrack.length} />
          <Stat
            label="top system"
            value={top ? top.name.slice(0, 22) : "—"}
            mono={false}
          />
          <Stat
            label="top composite"
            value={top ? top.metrics.composite.toFixed(2) : "—"}
          />
          <Stat
            label="last updated"
            value={lastUpdated ? formatDate(new Date(lastUpdated).toISOString()) : "—"}
            mono={false}
          />
        </div>
      </PageHeader>

      <Section title="track leaderboard">
        <Leaderboard initialTrack={track.id} compact showAdvancedFilters={false} />
      </Section>

      <Section title="track-specific chart">
        <BenchmarkChart
          systems={systemsInTrack}
          defaultX="learning"
          defaultY="reproducibility"
          trackFilter={track.id}
        />
      </Section>

      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="p-6">
            <div className="text-xs font-mono uppercase tracking-wider text-[color:var(--foreground-muted)] mb-2">
              metric definitions
            </div>
            <ul className="divide-y divide-[color:var(--border)]">
              {track.metrics.map((m) => (
                <li key={m.name} className="py-3">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm">{m.name}</div>
                    {m.unit && (
                      <span className="font-mono text-[11px] text-[color:var(--foreground-muted)]">
                        {m.unit}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-[color:var(--foreground-muted)] mt-0.5">
                    {m.description}
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <div className="grid grid-cols-1 gap-4">
            <Card>
              <div className="text-xs font-mono uppercase tracking-wider text-[color:var(--foreground-muted)] mb-2">
                required inputs
              </div>
              <ul className="text-sm space-y-1.5 list-disc pl-5">
                {track.requiredInputs.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </Card>
            <Card>
              <div className="text-xs font-mono uppercase tracking-wider text-[color:var(--foreground-muted)] mb-2">
                required controls
              </div>
              <ul className="text-sm space-y-1.5 list-disc pl-5">
                {track.requiredControls.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </Card>
            <Card>
              <div className="text-xs font-mono uppercase tracking-wider text-[color:var(--foreground-muted)] mb-2">
                scoring formula
              </div>
              <p className="text-sm text-[color:var(--foreground-muted)]">
                {track.scoringFormula}
              </p>
            </Card>
          </div>
        </div>
      </Section>

      {isClosedLoop && <ClosedLoopControls track={track} />}

      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <div className="text-xs font-mono uppercase tracking-wider text-[color:var(--foreground-muted)] mb-2">
              example datasets
            </div>
            <ul className="divide-y divide-[color:var(--border)]">
              {track.exampleDatasets.map((d) => {
                const ds = datasetById(d);
                if (!ds) return null;
                return (
                  <li key={d} className="py-3 first:pt-0 last:pb-0">
                    <Link href={`/datasets/${d}`} className="font-medium hover:underline">
                      {ds.name}
                    </Link>
                    <div className="text-xs text-[color:var(--foreground-muted)]">
                      {ds.modality} · {ds.nOrganoids} organoids · {ds.license} ·{" "}
                      {labById(ds.labId)?.name}
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
          <Card>
            <div className="text-xs font-mono uppercase tracking-wider text-[color:var(--foreground-muted)] mb-2">
              common failure modes
            </div>
            <ul className="text-sm space-y-1.5 list-disc pl-5 text-[color:var(--foreground-muted)]">
              {track.failureModes.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </Card>
        </div>
      </Section>

      <Section>
        <Card className="bg-[color:var(--surface-alt)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-[color:var(--foreground-muted)]">
                submission requirements
              </div>
              <p className="text-sm mt-1 max-w-[540px] text-[color:var(--foreground)]">
                Results on the {track.name} track must include all required
                inputs, pass minimum control conditions, and declare limitations
                explicitly.
              </p>
            </div>
            <div className="flex gap-2">
              <Button href="/submit" variant="primary" size="sm">
                submit result
              </Button>
              <Button href="/methodology" variant="outline" size="sm">
                methodology
              </Button>
            </div>
          </div>
        </Card>
      </Section>
    </>
  );
}

function Stat({
  label,
  value,
  mono = true,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="bg-[color:var(--surface)] p-4">
      <div className="text-xs font-mono uppercase tracking-wider text-[color:var(--foreground-muted)]">
        {label}
      </div>
      <div className={mono ? "mt-1 text-lg font-mono" : "mt-1 text-lg font-medium truncate"}>
        {value}
      </div>
    </div>
  );
}

function ClosedLoopControls({ track }: { track: (typeof TRACKS)[number] }) {
  const items = [
    {
      label: "random feedback",
      detail: "replace real feedback with trial-shuffled feedback; task improvement must exceed this baseline.",
    },
    {
      label: "sham feedback",
      detail: "identical-shape stimulation carrying no task signal; effect size must exceed sham.",
    },
    {
      label: "frozen decoder",
      detail: "decoder weights fixed during evaluation; improvement cannot come from decoder adaptation.",
    },
    {
      label: "decoder-only baseline",
      detail: "run decoder + controller on surrogate input; measures task-solvability without organoid.",
    },
    {
      label: "null stimulation",
      detail: "omit stimulation while logging controller output.",
    },
    {
      label: "retention",
      detail: "post-rest performance required when retention claims are made.",
    },
  ];
  return (
    <Section
      title="closed-loop specific controls"
      description="Additional control conditions required for closed-loop learning entries."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((i) => (
          <Card key={i.label}>
            <div className="text-sm font-medium">{i.label}</div>
            <p className="mt-1 text-sm text-[color:var(--foreground-muted)]">
              {i.detail}
            </p>
          </Card>
        ))}
      </div>
    </Section>
  );
}
