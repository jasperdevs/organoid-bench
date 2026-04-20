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

type SourcePlatformRow = {
  label: string;
  value: number;
};

type FileInventoryRow = {
  label: string;
  slug: string;
  fileCount: number;
  totalBytes: number;
};

type TrackRow = {
  slug: string;
  name: string;
  taskCount: number;
  provisionalRunCount: number;
};

type SourceRow = {
  id: string;
  title: string;
  url: string | null;
  doi: string | null;
  repositoryType: string | null;
  datasetCount: number;
};

export function HomeDashboard({
  scores,
  availability,
  sourcePlatforms,
  fileInventory,
  tracks,
  sources,
}: {
  scores: ScoreRow[];
  availability: AvailabilityRow[];
  sourcePlatforms: SourcePlatformRow[];
  fileInventory: FileInventoryRow[];
  tracks: TrackRow[];
  sources: SourceRow[];
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

  const platformBars: Bar[] = sourcePlatforms.map((row, i) => ({
    label: titleCase(row.label),
    value: row.value,
    color: ["var(--chart-3)", "var(--chart-5)", "var(--chart-2)", "var(--chart-8)"][i] ?? "var(--chart-4)",
  }));

  const fileBars: Bar[] = fileInventory.map((row, i) => ({
    label: row.label,
    value: row.fileCount,
    color: i % 2 === 0 ? "var(--chart-3)" : "var(--chart-4)",
    sublabel: formatBytes(row.totalBytes),
  }));

  return (
    <div className="space-y-4 pb-10">
      <section className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] overflow-hidden min-h-[430px]">
        <div className="flex items-center justify-between gap-3 border-b border-[color:var(--border)] px-5 py-4">
          <div>
            <h2 className="font-serif text-2xl leading-tight">Highlights</h2>
            <p className="mt-1 text-sm text-[color:var(--foreground-muted)]">Provisional scores only. More rows appear when more datasets are scored.</p>
          </div>
          <Link href="/leaderboards" className="text-sm font-medium underline underline-offset-4">
            Leaderboard
          </Link>
        </div>
        <div className="p-4">
          <BarChart bars={scoreBars} height={350} minLabelWidth={180} maxOverride={100} valueFormat={(v) => v.toFixed(1)} />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-[color:var(--border)] px-5 py-4">
            <h2 className="font-serif text-xl leading-tight">Data coverage</h2>
            <Link href="/datasets" className="text-sm font-medium underline underline-offset-4">
              Datasets
            </Link>
          </div>
          <div className="p-4">
            <BarChart bars={availabilityBars} height={270} minLabelWidth={110} valueFormat={(v) => String(Math.round(v))} />
          </div>
        </section>

        <section className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-[color:var(--border)] px-5 py-4">
            <h2 className="font-serif text-xl leading-tight">Sources by platform</h2>
            <Link href="/sources" className="text-sm font-medium underline underline-offset-4">
              Sources
            </Link>
          </div>
          <div className="p-4">
            <BarChart bars={platformBars} height={270} minLabelWidth={120} valueFormat={(v) => String(Math.round(v))} />
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-4">
        <section className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] overflow-hidden">
          <div className="border-b border-[color:var(--border)] px-5 py-4">
            <h2 className="font-serif text-xl leading-tight">Dataset files</h2>
            <p className="mt-1 text-sm text-[color:var(--foreground-muted)]">Remote files indexed from public records. Blobs are not stored in D1.</p>
          </div>
          <div className="p-4">
            <BarChart bars={fileBars} height={300} minLabelWidth={150} valueFormat={(v) => String(Math.round(v))} />
          </div>
        </section>

        <section className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] overflow-hidden">
          <div className="border-b border-[color:var(--border)] px-5 py-4">
            <h2 className="font-serif text-xl leading-tight">Tracks</h2>
          </div>
          <div className="divide-y divide-[color:var(--border)]">
            {tracks.map((track) => (
              <Link
                key={track.slug}
                href={`/benchmarks/${track.slug}`}
                className="grid grid-cols-[1fr_auto] gap-4 px-5 py-4 hover:bg-[color:var(--surface-alt)]"
              >
                <div>
                  <div className="font-medium">{track.name}</div>
                  <div className="mt-1 text-xs text-[color:var(--foreground-muted)]">
                    {track.taskCount} tasks
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-lg">{track.provisionalRunCount}</div>
                  <div className="text-xs text-[color:var(--foreground-muted)]">scored</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--surface)] overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-[color:var(--border)] px-5 py-4">
          <h2 className="font-serif text-xl leading-tight">Recent sources</h2>
          <a
            href="https://github.com/jasperdevs/organoid-bench/issues/new/choose"
            className="inline-flex rounded-full bg-[color:var(--foreground)] px-4 py-2 text-sm font-medium text-[color:var(--background)]"
          >
            Submit entry
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[color:var(--border)]">
          {sources.slice(0, 6).map((source) => (
            <a
              key={source.id}
              href={source.url ?? `/sources/${source.id}`}
              className="min-h-[132px] px-5 py-4 hover:bg-[color:var(--surface-alt)]"
            >
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-[color:var(--foreground-muted)]">
                <span>{titleCase(source.repositoryType ?? "source")}</span>
                {source.doi && <span className="normal-case tracking-normal">DOI</span>}
              </div>
              <div className="mt-3 line-clamp-2 font-medium leading-snug">{source.title}</div>
              <div className="mt-3 text-xs text-[color:var(--foreground-muted)]">
                {source.datasetCount} linked dataset{source.datasetCount === 1 ? "" : "s"}
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}

function titleCase(value: string) {
  return value
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatBytes(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return "Size unavailable";
  }
  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = value;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }
  return `${size >= 10 ? size.toFixed(0) : size.toFixed(1)} ${units[unit]}`;
}
