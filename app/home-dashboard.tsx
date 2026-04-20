"use client";

import Link from "next/link";
import { BarChart, type Bar } from "@/components/bar-chart";

type ScoreRow = {
  runId: string;
  systemSlug: string;
  systemName: string;
  trackName: string;
  runStatus: string;
  score: number | null;
  confidenceGrade: string | null;
};

type AvailabilityRow = {
  label: string;
  value: number;
};

export function HomeDashboard({
  scores,
  availability,
  summary,
}: {
  scores: ScoreRow[];
  availability: AvailabilityRow[];
  summary: {
    datasetCount: number;
    sourceCount: number;
    runCount: number;
  };
}) {
  const scoreBars: Bar[] = scores
    .filter((row) => row.score != null)
    .map((row, i) => ({
      label: row.systemName,
      value: row.score ?? 0,
      color: i % 2 === 0 ? "var(--chart-3)" : "var(--chart-2)",
      sublabel: `${row.trackName}${row.confidenceGrade ? ` · ${row.confidenceGrade}` : ""}`,
    }));

  const availabilityBars: Bar[] = availability.map((row, i) => ({
    label: row.label,
    value: row.value,
    color: ["var(--chart-2)", "var(--chart-4)", "var(--chart-5)", "var(--chart-8)"][i] ?? "var(--chart-3)",
  }));

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1.35fr_0.9fr] gap-4">
      <section className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] overflow-hidden min-h-[390px]">
        <div className="flex items-center justify-between gap-3 border-b border-[color:var(--border)] px-5 py-4">
          <div>
            <h2 className="font-serif text-2xl leading-tight">Highlights</h2>
            <p className="mt-1 text-sm text-[color:var(--foreground-muted)]">Provisional track scores from reviewed local data.</p>
          </div>
          <Link href="/leaderboards" className="text-sm font-medium underline underline-offset-4">
            Leaderboard
          </Link>
        </div>
        <div className="p-4">
          <BarChart bars={scoreBars} height={320} minLabelWidth={120} maxOverride={100} valueFormat={(v) => v.toFixed(1)} />
        </div>
      </section>

      <aside className="flex flex-col gap-4">
        <section className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] p-5">
          <div className="grid grid-cols-3 gap-px overflow-hidden rounded-[8px] border border-[color:var(--border)] bg-[color:var(--border)]">
            <MiniStat label="Datasets" value={summary.datasetCount} />
            <MiniStat label="Sources" value={summary.sourceCount} />
            <MiniStat label="Runs" value={summary.runCount} />
          </div>
        </section>

        <section className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] overflow-hidden">
          <div className="border-b border-[color:var(--border)] px-5 py-4">
            <h2 className="font-serif text-xl leading-tight">Data coverage</h2>
          </div>
          <div className="p-4">
            <BarChart bars={availabilityBars} height={240} minLabelWidth={72} valueFormat={(v) => String(Math.round(v))} />
          </div>
        </section>

        <section className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] p-5">
          <h2 className="font-serif text-xl leading-tight">Submit data</h2>
          <p className="mt-2 text-sm text-[color:var(--foreground-muted)]">
            Add datasets, systems, benchmark results, or corrections through GitHub Issues.
          </p>
          <a
            href="https://github.com/jasperdevs/organoid-bench/issues/new/choose"
            className="mt-5 inline-flex rounded-full bg-[color:var(--foreground)] px-4 py-2 text-sm font-medium text-[color:var(--background)]"
          >
            Open issue templates
          </a>
        </section>
      </aside>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-[color:var(--surface)] p-3">
      <div className="text-[11px] text-[color:var(--foreground-muted)]">{label}</div>
      <div className="mt-1 font-mono text-lg">{value}</div>
    </div>
  );
}
